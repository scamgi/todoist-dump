import {
  TodoistSyncResponse,
  TodoistItem,
  TodoistProject,
  TodoistSection,
  TodoistFilter,
  TodoistLabel,
} from "./interfaces";

/**
 * Main entry point. Orchestrates the formatting of the entire export.
 */
export default function processor(rawData: TodoistSyncResponse): string {
  const parts = [
    formatFilters(rawData.filters),
    formatLabels(rawData.labels),
    formatAllProjects(rawData.projects, rawData.items, rawData.sections),
  ];

  return parts.filter(Boolean).join("\n\n");
}

/**
 * Formats the list of Filters.
 */
export function formatFilters(filters: TodoistFilter[]): string {
  const activeFilters = filters.filter((f) => !f.is_deleted);
  if (activeFilters.length === 0) return "";

  const lines = activeFilters.map((f) => `- ${f.name}: ${f.query}`);
  return "# List of filters\n" + lines.join("\n");
}

/**
 * Formats the list of Labels.
 */
export function formatLabels(labels: TodoistLabel[]): string {
  const activeLabels = labels.filter((l) => !l.is_deleted);
  if (activeLabels.length === 0) return "";

  const lines = activeLabels.map((l) => `- ${l.name}`);
  return "# List of Labels\n" + lines.join("\n");
}

/**
 * Orchestrates the formatting of all projects, handling sorting and filtering.
 */
export function formatAllProjects(
  projects: TodoistProject[],
  allItems: TodoistItem[],
  allSections: TodoistSection[],
): string {
  const sortedProjects = projects
    .filter((p) => !p.is_deleted && !p.is_archived)
    .sort((a, b) => a.child_order - b.child_order);

  const projectStrings = sortedProjects.map((project) => {
    // Isolate items for this project
    const projectItems = allItems.filter(
      (i) => i.project_id === project.id && !i.is_deleted && !i.checked,
    );

    // Isolate sections for this project
    const projectSections = allSections
      .filter(
        (s) => s.project_id === project.id && !s.is_deleted && !s.is_archived,
      )
      .sort((a, b) => a.section_order - b.section_order);

    return formatSingleProject(project, projectItems, projectSections);
  });

  return "# Projects and Tasks\n\n" + projectStrings.join("\n");
}

/**
 * Formats a single project, including its description, root tasks, and sections.
 */
export function formatSingleProject(
  project: TodoistProject,
  projectItems: TodoistItem[],
  projectSections: TodoistSection[],
): string {
  let markdown = `## Project: ${project.name}\n`;

  if (project.description) {
    markdown += `> ${project.description}\n\n`;
  }

  // 1. Root tasks (no section)
  const rootTasks = projectItems.filter((i) => !i.section_id);
  if (rootTasks.length > 0) {
    markdown += formatTaskList(rootTasks);
  }

  // 2. Sections
  projectSections.forEach((section) => {
    const sectionTasks = projectItems.filter(
      (i) => i.section_id === section.id,
    );
    markdown += formatSection(section, sectionTasks);
  });

  return markdown;
}

/**
 * Formats a specific section and its tasks.
 */
export function formatSection(
  section: TodoistSection,
  sectionTasks: TodoistItem[],
): string {
  let markdown = `\n### Section: ${section.name}\n`;

  if (sectionTasks.length > 0) {
    markdown += formatTaskList(sectionTasks);
  } else {
    markdown += `_(No active tasks)_\n`;
  }

  return markdown;
}

/**
 * Formats a list of tasks, handling sorting.
 */
export function formatTaskList(items: TodoistItem[]): string {
  return items
    .sort((a, b) => a.child_order - b.child_order)
    .map(formatSingleTask)
    .join("");
}

/**
 * Formats a single task line, including priority, due date, and description.
 */
export function formatSingleTask(item: TodoistItem): string {
  const priorityLabel = getPriorityLabel(item.priority);
  const dueString = item.due ? ` 📅 Do: ${item.due.date}` : "";
  const deadlineString = item.deadline
    ? ` ⏳ Deadline: ${item.deadline.date}`
    : "";

  let markdown = `- ${priorityLabel}${item.content}${dueString}${deadlineString}\n`;

  if (item.description) {
    markdown += `  > ${item.description}\n`;
  }

  return markdown;
}

/**
 * Helper to map API priority (1-4) to user-friendly labels (P1-P4).
 */
export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 4:
      return "P1 "; // Red
    case 3:
      return "P2 "; // Yellow
    case 2:
      return "P3 "; // Blue
    case 1:
      return "P4 "; // Standard
    default:
      return "";
  }
}
