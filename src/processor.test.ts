import { describe, test, expect, mock, beforeAll, afterAll } from "bun:test";
import { formatFilter, formatFilters } from "./processor";
import { TodoistFilter } from "./interfaces";

describe("Data Processor", () => {
  test("formatFilters should format filters correctly", () => {
    const input: TodoistFilter[] = [
      {
        color: "Green",
        id: "bla bla bla",
        is_deleted: false,
        is_favorite: false,
        is_frozen: false,
        item_order: 1,
        name: "Nome del mio mitico filtro",
        query: "#ciao",
      },
      {
        color: "Yellow",
        id: "bla bla bla",
        is_deleted: true,
        is_favorite: false,
        is_frozen: false,
        item_order: 1,
        name: "yays",
        query: "#ciao",
      },
      {
        color: "Orange",
        id: "bla bla bla",
        is_deleted: false,
        is_favorite: false,
        is_frozen: false,
        item_order: 1,
        name: "dhsgdsahd",
        query: "#ciao",
      },
    ];

    const result = formatFilters(input);

    expect(result).toBeString();
    expect(result).toStartWith("# List of filters\n");

    const expectedIncludedResult = input
      .filter((f) => !f.is_deleted)
      .map(formatFilter)
      .join("\n");
    expect(result).toContain(expectedIncludedResult);
  });

  test("formatFilters should start with title", () => {
    const input: TodoistFilter[] = [
      {
        color: "Green",
        id: "bla bla bla",
        is_deleted: false,
        is_favorite: false,
        is_frozen: false,
        item_order: 1,
        name: "Nome del mio mitico filtro",
        query: "#ciao",
      },
      {
        color: "Yellow",
        id: "bla bla bla",
        is_deleted: true,
        is_favorite: false,
        is_frozen: false,
        item_order: 1,
        name: "yays",
        query: "#ciao",
      },
      {
        color: "Orange",
        id: "bla bla bla",
        is_deleted: false,
        is_favorite: false,
        is_frozen: false,
        item_order: 1,
        name: "dhsgdsahd",
        query: "#ciao",
      },
    ];

    const result = formatFilters(input);

    expect(result).toBeString();
    expect(result).toStartWith("# List of filters\n");
  });

  test("formatFilters should return empty string when the input is empty array", () => {
    const input = [];

    const result = formatFilters(input);

    expect(result).toBeString();
    expect(result).toEqual("");
  });

  test("formatFilters should not contain deleted items", () => {
    const input: TodoistFilter[] = [
      {
        color: "Green",
        id: "bla bla bla",
        is_deleted: false,
        is_favorite: false,
        is_frozen: false,
        item_order: 1,
        name: "Nome del mio mitico filtro",
        query: "#ciao",
      },
      {
        color: "Green",
        id: "bla bla bla",
        is_deleted: true,
        is_favorite: false,
        is_frozen: false,
        item_order: 1,
        name: "filter 2",
        query: "#hey",
      },
    ];

    const result = formatFilters(input);

    expect(result).toContain(formatFilter(input[0]));
    expect(result).not.toContain(formatFilter(input[1]));
  });
});
