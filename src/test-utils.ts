import { TodoistFilter } from "./interfaces";

/**
 * Factory for creating a TodoistFilter with sensible defaults.
 * Pass only the properties you need to override.
 */
export const createFilter = (
  overrides: Partial<TodoistFilter> = {},
): TodoistFilter => ({
  color: "charcoal",
  id: "test-filter-id",
  is_deleted: false,
  is_favorite: false,
  is_frozen: false,
  item_order: 1,
  name: "Default Filter",
  query: "#default",
  ...overrides,
});
