/**
 * Todoist Smart Backup & AI-Export Script (Bun + TypeScript)
 *
 * 1. Downloads full Sync API v9 data (Projects, Items, Labels, Filters).
 * 2. Restructures data into a hierarchical tree (Tasks and Projects).
 * 3. Exports global definitions for Labels and Filters.
 */

const API_TOKEN = process.env.TODOIST_API_TOKEN;
const SYNC_URL = "https://api.todoist.com/sync/v9/sync";

if (!API_TOKEN) {
  console.error("Error: TODOIST_API_TOKEN environment variable is not set.");
  process.exit(1);
}

interface CleanTask {
  content: string;
  description?: string;
  priority: string;
  due?: string;
  is_completed: boolean;
  labels: string[];
  subtasks: CleanTask[];
}

interface CleanSection {
  name: string;
  tasks: CleanTask[];
}

interface CleanProject {
  project: string;
  is_archived: boolean;
  view_style: string;
  sections: CleanSection[];
  tasks: CleanTask[];
  sub_projects: CleanProject[];
}

interface CleanFilter {
  name: string;
  query: string;
}

interface FullExport {
  meta: {
    generated_at: string;
    stats: {
      total_projects: number;
      total_tasks: number;
      total_labels: number;
      total_filters: number;
    };
  };
  global_definitions: {
    available_labels: string[];
    available_filters: CleanFilter[];
  };
  projects_tree: CleanProject[];
}

async function performBackup() {
  console.log("🚀 Starting Todoist download...");

  try {
    const response = await fetch(SYNC_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        sync_token: "*",
        resource_types:
          '["projects", "items", "sections", "labels", "filters"]',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const rawData = await response.json();
    console.log(
      `✅ Download complete. Processing ${rawData.items.length} items...`,
    );

    const aiReadyData = processForAI(rawData);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const cleanFilename = `todoist_ai_export_${timestamp}.txt`;
    await Bun.write(cleanFilename, JSON.stringify(aiReadyData, null, 2));

    console.log(`✅ Export successful!`);
    console.log(`📂 AI Context File: ${cleanFilename}`);

    console.table(aiReadyData.meta.stats);
  } catch (error) {
    console.error("❌ Backup failed:", error);
  }
}

function processForAI(data: any): FullExport {
  const labelMap = new Map<string, string>();
  const allLabelNames: string[] = [];

  data.labels
    .sort((a: any, b: any) => a.item_order - b.item_order)
    .forEach((l: any) => {
      labelMap.set(l.id, l.name);
      allLabelNames.push(l.name);
    });

  const allFilters: CleanFilter[] = data.filters
    .filter((f: any) => !f.is_deleted)
    .sort((a: any, b: any) => a.item_order - b.item_order)
    .map((f: any) => ({
      name: f.name,
      query: f.query,
    }));

  const itemMap = new Map<string, any>();
  const rootItems: any[] = [];
  const sortedRawItems = data.items.sort(
    (a: any, b: any) => a.child_order - b.child_order,
  );

  sortedRawItems.forEach((item: any) => {
    if (item.is_deleted) return;

    const cleanItem = {
      id: item.id, // temp
      project_id: item.project_id,
      section_id: item.section_id,
      parent_id: item.parent_id,
      content: item.content,
      description: item.description || undefined,
      priority: mapPriority(item.priority),
      is_completed: item.checked === 1,
      due: item.due ? item.due.string || item.due.date : undefined,
      labels: item.labels.map(
        (id: string) => labelMap.get(id) || "Unknown Label",
      ),
      subtasks: [],
    };

    itemMap.set(item.id, cleanItem);
  });

  itemMap.forEach((item) => {
    if (item.parent_id && itemMap.has(item.parent_id)) {
      const parent = itemMap.get(item.parent_id);
      parent.subtasks.push(removeInternalIds(item));
    } else {
      rootItems.push(item);
    }
  });

  const itemsByProjectAndSection = new Map<
    string,
    { noSection: any[]; sections: Map<string, any[]> }
  >();

  rootItems.forEach((item) => {
    if (!itemsByProjectAndSection.has(item.project_id)) {
      itemsByProjectAndSection.set(item.project_id, {
        noSection: [],
        sections: new Map(),
      });
    }
    const projGroup = itemsByProjectAndSection.get(item.project_id)!;

    if (item.section_id) {
      if (!projGroup.sections.has(item.section_id)) {
        projGroup.sections.set(item.section_id, []);
      }
      projGroup.sections.get(item.section_id)!.push(removeInternalIds(item));
    } else {
      projGroup.noSection.push(removeInternalIds(item));
    }
  });

  const projectMap = new Map<string, any>();
  const rootProjects: any[] = [];

  data.projects.forEach((p: any) => {
    if (p.is_deleted) return;

    const projGroup = itemsByProjectAndSection.get(p.id);
    const projectSections: CleanSection[] = [];
    const rawSections = data.sections.filter(
      (s: any) => s.project_id === p.id && !s.is_deleted,
    );

    rawSections.sort((a: any, b: any) => a.section_order - b.section_order);
    rawSections.forEach((s: any) => {
      const tasks = projGroup?.sections.get(s.id) || [];
      projectSections.push({ name: s.name, tasks: tasks });
    });

    const tempProject = {
      _id: p.id,
      _parentId: p.parent_id,
      _childOrder: p.child_order,
      project: p.name,
      is_archived: p.is_archived,
      view_style: p.view_style,
      sections: projectSections,
      tasks: projGroup?.noSection || [],
      sub_projects: [],
    };

    projectMap.set(p.id, tempProject);
  });

  projectMap.forEach((p) => {
    if (p._parentId && projectMap.has(p._parentId)) {
      const parent = projectMap.get(p._parentId);
      parent.sub_projects.push(p);
    } else {
      rootProjects.push(p);
    }
  });

  function finalizeProject(p: any): CleanProject {
    if (p.sub_projects.length > 0) {
      p.sub_projects.sort((a: any, b: any) => a._childOrder - b._childOrder);
      p.sub_projects = p.sub_projects.map(finalizeProject);
    }
    const { _id, _parentId, _childOrder, ...clean } = p;
    return clean as CleanProject;
  }

  rootProjects.sort((a: any, b: any) => a._childOrder - b._childOrder);
  const finalProjectsTree = rootProjects.map(finalizeProject);

  return {
    meta: {
      generated_at: new Date().toISOString(),
      stats: {
        total_projects: data.projects.length,
        total_tasks: data.items.length,
        total_labels: allLabelNames.length,
        total_filters: allFilters.length,
      },
    },
    global_definitions: {
      available_labels: allLabelNames,
      available_filters: allFilters,
    },
    projects_tree: finalProjectsTree,
  };
}

function removeInternalIds(item: any): CleanTask {
  const { id, project_id, section_id, parent_id, ...clean } = item;
  return clean;
}

function mapPriority(p: number): string {
  switch (p) {
    case 4:
      return "P1";
    case 3:
      return "P2";
    case 2:
      return "P3";
    case 1:
      return "P4";
    default:
      return "P4";
  }
}

performBackup();
