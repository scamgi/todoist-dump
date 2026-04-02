import { describe, test, expect } from "bun:test";
import {
  formatFilter,
  formatFilters,
  formatLabels,
  formatSingleTask,
  formatTaskList,
  formatSection,
  formatSingleProject,
  formatAllProjects,
  getPriorityLabel,
} from "./processor";
import {
  createFilter,
  createItem,
  createLabel,
  createProject,
  createSection,
} from "./test-utils";

// =============================================================================
// formatFilter
// =============================================================================

describe("Data Processor: formatFilter", () => {
  test.each([
    { name: "", query: "some-query", case: "empty name" },
    { name: "some-name", query: "", case: "empty query" },
    { name: null as any, query: "query", case: "null name" },
    { name: "name", query: null as any, case: "null query" },
  ])("should throw error when $case is provided", ({ name, query }) => {
    expect(() => formatFilter(createFilter({ name, query }))).toThrow(
      "filter is null or name or query are null",
    );
  });

  test("should format a valid filter correctly", () => {
    const filter = createFilter({ name: "Priority 1", query: "p1" });
    const result = formatFilter(filter);
    expect(result).toBe("- Priority 1: p1");
  });
});

// =============================================================================
// formatFilters
// =============================================================================

describe("Data Processor: formatFilters", () => {
  test("should return empty string when input is an empty array", () => {
    expect(formatFilters([])).toBe("");
  });

  test("should return empty string if ALL items are deleted", () => {
    const input = [
      createFilter({ name: "F1", is_deleted: true }),
      createFilter({ name: "F2", is_deleted: true }),
    ];

    expect(formatFilters(input)).toBe("");
  });

  test("should format active filters correctly and ignore deleted ones", () => {
    const input = [
      createFilter({ name: "Work", query: "#work", is_deleted: false }),
      createFilter({ name: "Deleted", query: "#old", is_deleted: true }),
      createFilter({ name: "Personal", query: "#me", is_deleted: false }),
    ];

    const result = formatFilters(input);

    const expected = `# List of filters
- Work: #work
- Personal: #me`;

    expect(result).toBe(expected);
  });

  test("should handle special characters in names and queries", () => {
    const input = [
      createFilter({ name: "Complex & Name", query: "@label | !#project" }),
    ];

    const result = formatFilters(input);

    expect(result).toContain(formatFilter(input[0]));
  });
});

// =============================================================================
// formatLabels
// =============================================================================

describe("Data Processor: formatLabels", () => {
  test("should return empty string when input is an empty array", () => {
    expect(formatLabels([])).toBe("");
  });

  test("should return empty string if ALL labels are deleted", () => {
    const input = [
      createLabel({ name: "L1", is_deleted: true }),
      createLabel({ name: "L2", is_deleted: true }),
    ];

    expect(formatLabels(input)).toBe("");
  });

  test("should format active labels correctly and ignore deleted ones", () => {
    const input = [
      createLabel({ name: "work", is_deleted: false }),
      createLabel({ name: "deleted-label", is_deleted: true }),
      createLabel({ name: "personal", is_deleted: false }),
    ];

    const result = formatLabels(input);

    const expected = `# List of Labels
- work
- personal`;

    expect(result).toBe(expected);
  });
});

// =============================================================================
// getPriorityLabel
// =============================================================================

describe("Data Processor: getPriorityLabel", () => {
  test.each([
    { priority: 4, expected: "P1 " },
    { priority: 3, expected: "P2 " },
    { priority: 2, expected: "P3 " },
    { priority: 1, expected: "P4 " },
  ])("should return $expected for priority $priority", ({ priority, expected }) => {
    expect(getPriorityLabel(priority)).toBe(expected);
  });

  test("should return empty string for unknown priority", () => {
    expect(getPriorityLabel(0)).toBe("");
    expect(getPriorityLabel(5)).toBe("");
    expect(getPriorityLabel(-1)).toBe("");
  });
});

// =============================================================================
// formatSingleTask
// =============================================================================

describe("Data Processor: formatSingleTask", () => {
  test("should format a basic task with default priority", () => {
    const item = createItem({ content: "Buy groceries", priority: 1 });
    const result = formatSingleTask(item);
    expect(result).toBe("- P4 Buy groceries\n");
  });

  test("should format a task with high priority", () => {
    const item = createItem({ content: "Urgent task", priority: 4 });
    const result = formatSingleTask(item);
    expect(result).toBe("- P1 Urgent task\n");
  });

  test("should include due date when present", () => {
    const item = createItem({
      content: "Task with due",
      priority: 1,
      due: {
        date: "2024-03-15",
        is_recurring: false,
        lang: "en",
        string: "Mar 15",
        timezone: null,
      },
    });
    const result = formatSingleTask(item);
    expect(result).toBe("- P4 Task with due 📅 Do: 2024-03-15\n");
  });

  test("should include deadline when present", () => {
    const item = createItem({
      content: "Task with deadline",
      priority: 1,
      deadline: { date: "2024-03-20", lang: "en" },
    });
    const result = formatSingleTask(item);
    expect(result).toBe("- P4 Task with deadline ⏳ Deadline: 2024-03-20\n");
  });

  test("should include labels when present", () => {
    const item = createItem({
      content: "Task with labels",
      priority: 1,
      labels: ["work", "important"],
    });
    const result = formatSingleTask(item);
    expect(result).toBe("- P4 Task with labels 🏷️ Labels: work, important\n");
  });

  test("should not include labels section when labels array is empty", () => {
    const item = createItem({
      content: "Task without labels",
      priority: 1,
      labels: [],
    });
    const result = formatSingleTask(item);
    expect(result).not.toContain("🏷️");
  });

  test("should include description when present", () => {
    const item = createItem({
      content: "Task with description",
      priority: 1,
      description: "This is a detailed description",
    });
    const result = formatSingleTask(item);
    expect(result).toBe(
      "- P4 Task with description\n  > This is a detailed description\n",
    );
  });

  test("should format a task with all optional fields", () => {
    const item = createItem({
      content: "Complete task",
      priority: 3,
      due: {
        date: "2024-03-15",
        is_recurring: false,
        lang: "en",
        string: "Mar 15",
        timezone: null,
      },
      deadline: { date: "2024-03-20", lang: "en" },
      labels: ["work", "urgent"],
      description: "Full description here",
    });
    const result = formatSingleTask(item);
    expect(result).toBe(
      "- P2 Complete task 📅 Do: 2024-03-15 ⏳ Deadline: 2024-03-20 🏷️ Labels: work, urgent\n  > Full description here\n",
    );
  });
});

// =============================================================================
// formatTaskList
// =============================================================================

describe("Data Processor: formatTaskList", () => {
  test("should return empty string for empty array", () => {
    expect(formatTaskList([])).toBe("");
  });

  test("should sort tasks by child_order", () => {
    const items = [
      createItem({ id: "3", content: "Third", child_order: 3 }),
      createItem({ id: "1", content: "First", child_order: 1 }),
      createItem({ id: "2", content: "Second", child_order: 2 }),
    ];
    const result = formatTaskList(items);
    const lines = result.trim().split("\n");
    expect(lines[0]).toContain("First");
    expect(lines[1]).toContain("Second");
    expect(lines[2]).toContain("Third");
  });

  test("should format multiple tasks correctly", () => {
    const items = [
      createItem({ content: "Task A", child_order: 1 }),
      createItem({ content: "Task B", child_order: 2 }),
    ];
    const result = formatTaskList(items);
    expect(result).toContain("Task A");
    expect(result).toContain("Task B");
  });
});

// =============================================================================
// formatSection
// =============================================================================

describe("Data Processor: formatSection", () => {
  test("should format section header correctly", () => {
    const section = createSection({ name: "My Section" });
    const result = formatSection(section, []);
    expect(result).toContain("### Section: My Section");
  });

  test("should show no active tasks message when empty", () => {
    const section = createSection({ name: "Empty Section" });
    const result = formatSection(section, []);
    expect(result).toContain("_(No active tasks)_");
  });

  test("should include tasks when present", () => {
    const section = createSection({ name: "Work" });
    const tasks = [
      createItem({ content: "Task 1", section_id: section.id }),
      createItem({ content: "Task 2", section_id: section.id }),
    ];
    const result = formatSection(section, tasks);
    expect(result).toContain("### Section: Work");
    expect(result).toContain("Task 1");
    expect(result).toContain("Task 2");
    expect(result).not.toContain("_(No active tasks)_");
  });
});

// =============================================================================
// formatSingleProject
// =============================================================================

describe("Data Processor: formatSingleProject", () => {
  test("should format project header correctly", () => {
    const project = createProject({ name: "My Project" });
    const result = formatSingleProject(project, [], []);
    expect(result).toContain("## Project: My Project");
  });

  test("should include project description when present", () => {
    const project = createProject({
      name: "Described Project",
      description: "This is my project description",
    });
    const result = formatSingleProject(project, [], []);
    expect(result).toContain("> This is my project description");
  });

  test("should not include description block when empty", () => {
    const project = createProject({ name: "No Description", description: "" });
    const result = formatSingleProject(project, [], []);
    expect(result).not.toContain("> ");
  });

  test("should include root tasks (tasks without section)", () => {
    const project = createProject({ id: "proj-1", name: "Project" });
    const tasks = [
      createItem({
        content: "Root Task",
        project_id: "proj-1",
        section_id: null,
      }),
    ];
    const result = formatSingleProject(project, tasks, []);
    expect(result).toContain("Root Task");
  });

  test("should include sections with their tasks", () => {
    const project = createProject({ id: "proj-1", name: "Project" });
    const section = createSection({
      id: "sec-1",
      name: "Section One",
      project_id: "proj-1",
    });
    const tasks = [
      createItem({
        content: "Section Task",
        project_id: "proj-1",
        section_id: "sec-1",
      }),
    ];
    const result = formatSingleProject(project, tasks, [section]);
    expect(result).toContain("### Section: Section One");
    expect(result).toContain("Section Task");
  });

  test("should handle both root tasks and sectioned tasks", () => {
    const project = createProject({ id: "proj-1", name: "Mixed Project" });
    const section = createSection({
      id: "sec-1",
      name: "Work",
      project_id: "proj-1",
    });
    const tasks = [
      createItem({
        content: "Root Task",
        project_id: "proj-1",
        section_id: null,
      }),
      createItem({
        content: "Work Task",
        project_id: "proj-1",
        section_id: "sec-1",
      }),
    ];
    const result = formatSingleProject(project, tasks, [section]);
    expect(result).toContain("Root Task");
    expect(result).toContain("### Section: Work");
    expect(result).toContain("Work Task");
  });
});

// =============================================================================
// formatAllProjects
// =============================================================================

describe("Data Processor: formatAllProjects", () => {
  test("should include header", () => {
    const result = formatAllProjects([], [], []);
    expect(result).toContain("# Projects and Tasks");
  });

  test("should filter out deleted projects", () => {
    const projects = [
      createProject({ id: "1", name: "Active", is_deleted: false }),
      createProject({ id: "2", name: "Deleted", is_deleted: true }),
    ];
    const result = formatAllProjects(projects, [], []);
    expect(result).toContain("Active");
    expect(result).not.toContain("Deleted");
  });

  test("should filter out archived projects", () => {
    const projects = [
      createProject({ id: "1", name: "Active", is_archived: false }),
      createProject({ id: "2", name: "Archived", is_archived: true }),
    ];
    const result = formatAllProjects(projects, [], []);
    expect(result).toContain("Active");
    expect(result).not.toContain("Archived");
  });

  test("should sort projects by child_order", () => {
    const projects = [
      createProject({ id: "3", name: "Third", child_order: 3 }),
      createProject({ id: "1", name: "First", child_order: 1 }),
      createProject({ id: "2", name: "Second", child_order: 2 }),
    ];
    const result = formatAllProjects(projects, [], []);
    const firstIndex = result.indexOf("First");
    const secondIndex = result.indexOf("Second");
    const thirdIndex = result.indexOf("Third");
    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });

  test("should filter out deleted and checked items", () => {
    const project = createProject({ id: "proj-1", name: "Project" });
    const items = [
      createItem({
        id: "1",
        content: "Active",
        project_id: "proj-1",
        is_deleted: false,
        checked: false,
      }),
      createItem({
        id: "2",
        content: "Deleted",
        project_id: "proj-1",
        is_deleted: true,
        checked: false,
      }),
      createItem({
        id: "3",
        content: "Checked",
        project_id: "proj-1",
        is_deleted: false,
        checked: true,
      }),
    ];
    const result = formatAllProjects([project], items, []);
    expect(result).toContain("Active");
    expect(result).not.toContain("Deleted");
    expect(result).not.toContain("Checked");
  });

  test("should filter out deleted and archived sections", () => {
    const project = createProject({ id: "proj-1", name: "Project" });
    const sections = [
      createSection({
        id: "1",
        name: "Active Section",
        project_id: "proj-1",
        is_deleted: false,
        is_archived: false,
      }),
      createSection({
        id: "2",
        name: "Deleted Section",
        project_id: "proj-1",
        is_deleted: true,
        is_archived: false,
      }),
      createSection({
        id: "3",
        name: "Archived Section",
        project_id: "proj-1",
        is_deleted: false,
        is_archived: true,
      }),
    ];
    const result = formatAllProjects([project], [], sections);
    expect(result).toContain("Active Section");
    expect(result).not.toContain("Deleted Section");
    expect(result).not.toContain("Archived Section");
  });

  test("should sort sections by section_order", () => {
    const project = createProject({ id: "proj-1", name: "Project" });
    const sections = [
      createSection({
        id: "3",
        name: "Third Section",
        project_id: "proj-1",
        section_order: 3,
      }),
      createSection({
        id: "1",
        name: "First Section",
        project_id: "proj-1",
        section_order: 1,
      }),
      createSection({
        id: "2",
        name: "Second Section",
        project_id: "proj-1",
        section_order: 2,
      }),
    ];
    const result = formatAllProjects([project], [], sections);
    const firstIndex = result.indexOf("First Section");
    const secondIndex = result.indexOf("Second Section");
    const thirdIndex = result.indexOf("Third Section");
    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });

  test("should associate items with correct projects", () => {
    const projects = [
      createProject({ id: "proj-1", name: "Project One" }),
      createProject({ id: "proj-2", name: "Project Two" }),
    ];
    const items = [
      createItem({ content: "Task for One", project_id: "proj-1" }),
      createItem({ content: "Task for Two", project_id: "proj-2" }),
    ];
    const result = formatAllProjects(projects, items, []);

    // Verify tasks appear in their respective projects
    const proj1Start = result.indexOf("Project One");
    const proj2Start = result.indexOf("Project Two");
    const task1Index = result.indexOf("Task for One");
    const task2Index = result.indexOf("Task for Two");

    expect(task1Index).toBeGreaterThan(proj1Start);
    expect(task1Index).toBeLessThan(proj2Start);
    expect(task2Index).toBeGreaterThan(proj2Start);
  });
});
