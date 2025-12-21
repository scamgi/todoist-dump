/**
 * Todoist Smart Backup & AI-Export Script (Bun + TypeScript)
 *
 * 1. Downloads full Sync API v9 data.
 * 2. Restructures data into a hierarchical tree (Project -> Section -> Task).
 * 3. Cleans noise (IDs, timestamps) for better AI token efficiency.
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
  priority: string; // "p1" (Normal) to "p4" (Urgent)
  due?: string; // "2023-10-01" or "every day"
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
  view_style: string; // "list" or "board"
  sections: CleanSection[];
  tasks: CleanTask[]; // Tasks directly in project (no section)
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
        resource_types: '["projects", "items", "sections", "labels"]',
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

    const cleanFilename = `todoist_ai_export_${timestamp}.json`;
    await Bun.write(cleanFilename, JSON.stringify(aiReadyData, null, 2));

    console.log(`✅ Export successful!`);
    console.log(`📂 AI Context File: ${cleanFilename}`);

    console.table({
      Projects: aiReadyData.length,
      "Total Tasks": rawData.items.length,
    });
  } catch (error) {
    console.error("❌ Backup failed:", error);
  }
}

function processForAI(data: any): CleanProject[] {
  const labelMap = new Map<string, string>();
  data.labels.forEach((l: any) => labelMap.set(l.id, l.name));

  const projectMap = new Map<string, any>();
  data.projects.forEach((p: any) => projectMap.set(p.id, p));

  const sectionMap = new Map<string, any>();
  data.sections.forEach((s: any) => sectionMap.set(s.id, s));

  const itemMap = new Map<string, any>();
  const rootItems: any[] = [];

  const sortedRawItems = data.items.sort(
    (a: any, b: any) => a.child_order - b.child_order,
  );

  sortedRawItems.forEach((item: any) => {
    if (item.is_deleted) return;

    const cleanItem = {
      id: item.id, // kept temporarily for linking
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

  const projectsTree: CleanProject[] = [];

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

  data.projects
    .sort((a: any, b: any) => a.child_order - b.child_order)
    .forEach((p: any) => {
      if (p.is_deleted) return;

      const projGroup = itemsByProjectAndSection.get(p.id);

      const projectSections: CleanSection[] = [];
      const rawSections = data.sections.filter(
        (s: any) => s.project_id === p.id && !s.is_deleted,
      );
      rawSections.sort((a: any, b: any) => a.section_order - b.section_order);

      rawSections.forEach((s: any) => {
        const tasks = projGroup?.sections.get(s.id) || [];
        if (tasks.length > 0) {
          projectSections.push({
            name: s.name,
            tasks: tasks,
          });
        }
      });

      const cleanProject: CleanProject = {
        project: p.name,
        is_archived: p.is_archived,
        view_style: p.view_style,
        sections: projectSections,
        tasks: projGroup?.noSection || [],
      };

      projectsTree.push(cleanProject);
    });

  return projectsTree;
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
