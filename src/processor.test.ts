import { describe, test, expect } from "bun:test";
import { formatFilter, formatFilters } from "./processor";
import { createFilter } from "./test-utils";

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
