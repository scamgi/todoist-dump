import { describe, test, expect } from "bun:test";
import { formatFilter, formatFilters } from "./processor";
import { TodoistFilter } from "./interfaces";

const createFilter = (
  overrides: Partial<TodoistFilter> = {},
): TodoistFilter => ({
  color: "charcoal",
  id: "test-id",
  is_deleted: false,
  is_favorite: false,
  is_frozen: false,
  item_order: 1,
  name: "Default Filter",
  query: "#default",
  ...overrides,
});

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
