import { TodoistSyncResponse, TodoistItem } from "./interfaces";

export default function processDataForAI(rawData: TodoistSyncResponse) {
  let markdown = "";

  // Add Filters
  markdown += "# List of filters\n";
  markdown += rawData.filters
    .filter((f) => !f.is_deleted)
    .map((f) => `- ${f.name}: ${f.query}`)
    .join("\n");

  // Add Labels
  markdown += "\n\n# List of Labels\n";
  markdown += rawData.labels
    .filter((l) => !l.is_deleted)
    .map((l) => `- ${l.name}`)
    .join("\n");

  // Add Projects, Sections, and Tasks
  markdown += "\n\n# Projects and Tasks\n";

  // Filter valid projects and sort by their order
  const projects = rawData.projects
    .filter((p) => !p.is_deleted && !p.is_archived)
    .sort((a, b) => a.child_order - b.child_order);

  projects.forEach((project) => {
    markdown += `\n## Project: ${project.name}\n`;
    if (project.description) {
      markdown += `> ${project.description}\n\n`;
    }

    // Get all active items for this project
    const projectItems = rawData.items.filter(
      (i) => i.project_id === project.id && !i.is_deleted && !i.checked,
    );

    // Get all sections for this project
    const sections = rawData.sections
      .filter(
        (s) => s.project_id === project.id && !s.is_deleted && !s.is_archived,
      )
      .sort((a, b) => a.section_order - b.section_order);

    // Helper function to format and print tasks
    const renderTasks = (items: TodoistItem[]) => {
      items
        .sort((a, b) => a.child_order - b.child_order)
        .forEach((item) => {
          // Map API priority (4=High/Red) to User labels (P1-P4)
          let priorityLabel = "";
          switch (item.priority) {
            case 4:
              priorityLabel = "P1 ";
              break; // Red
            case 3:
              priorityLabel = "P2 ";
              break; // Yellow
            case 2:
              priorityLabel = "P3 ";
              break; // Blue
            case 1:
              priorityLabel = "P4 ";
              break; // Standard
            default:
              priorityLabel = "";
          }

          // Format Due Date
          const dueString = item.due ? ` 📅 Do: ${item.due.date}` : "";

          // Format Deadline
          const deadlineString = item.deadline
            ? ` ⏳ Deadline: ${item.deadline.date}`
            : "";

          markdown += `- ${priorityLabel}${item.content}${dueString}${deadlineString}\n`;

          if (item.description) {
            markdown += `  > ${item.description}\n`;
          }
        });
    };

    // A. Print tasks that belong to the project root (no section)
    const rootTasks = projectItems.filter((i) => !i.section_id);
    if (rootTasks.length > 0) {
      renderTasks(rootTasks);
    }

    // B. Print tasks inside sections
    sections.forEach((section) => {
      markdown += `\n### Section: ${section.name}\n`;

      const sectionTasks = projectItems.filter(
        (i) => i.section_id === section.id,
      );

      if (sectionTasks.length > 0) {
        renderTasks(sectionTasks);
      } else {
        markdown += `_(No active tasks)_\n`;
      }
    });
  });

  return markdown;
}
