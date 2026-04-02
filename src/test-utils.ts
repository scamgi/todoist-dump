import {
  TodoistFilter,
  TodoistItem,
  TodoistLabel,
  TodoistProject,
  TodoistSection,
} from "./interfaces";

/**
 * Factory for creating a TodoistFilter with sensible defaults.
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

/**
 * Factory for creating a TodoistItem with sensible defaults.
 */
export const createItem = (
  overrides: Partial<TodoistItem> = {},
): TodoistItem => ({
  added_at: "2024-01-01T00:00:00Z",
  added_by_uid: "user-123",
  assigned_by_uid: null,
  checked: false,
  child_order: 1,
  collapsed: false,
  completed_at: null,
  completed_by_uid: null,
  content: "Default Task",
  day_order: 1,
  deadline: null,
  description: "",
  due: null,
  duration: null,
  id: "test-item-id",
  is_deleted: false,
  labels: [],
  note_count: 0,
  parent_id: null,
  priority: 1,
  project_id: "test-project-id",
  responsible_uid: null,
  section_id: null,
  sync_id: null,
  updated_at: "2024-01-01T00:00:00Z",
  user_id: "user-123",
  v2_id: "v2-item-id",
  v2_parent_id: null,
  v2_project_id: "v2-project-id",
  v2_section_id: null,
  ...overrides,
});

/**
 * Factory for creating a TodoistLabel with sensible defaults.
 */
export const createLabel = (
  overrides: Partial<TodoistLabel> = {},
): TodoistLabel => ({
  color: "blue",
  id: "test-label-id",
  is_deleted: false,
  is_favorite: false,
  item_order: 1,
  name: "Default Label",
  ...overrides,
});

/**
 * Factory for creating a TodoistProject with sensible defaults.
 */
export const createProject = (
  overrides: Partial<TodoistProject> = {},
): TodoistProject => ({
  access: { configuration: {}, visibility: "private" },
  can_assign_tasks: false,
  child_order: 1,
  collapsed: false,
  color: "grey",
  created_at: "2024-01-01T00:00:00Z",
  creator_uid: "user-123",
  default_order: 1,
  description: "",
  id: "test-project-id",
  inbox_project: false,
  is_archived: false,
  is_deleted: false,
  is_favorite: false,
  is_frozen: false,
  name: "Default Project",
  parent_id: null,
  public_access: false,
  public_key: "public-key",
  role: "owner",
  shared: false,
  sync_id: null,
  updated_at: "2024-01-01T00:00:00Z",
  v2_id: "v2-project-id",
  v2_parent_id: null,
  view_style: "list",
  ...overrides,
});

/**
 * Factory for creating a TodoistSection with sensible defaults.
 */
export const createSection = (
  overrides: Partial<TodoistSection> = {},
): TodoistSection => ({
  added_at: "2024-01-01T00:00:00Z",
  archived_at: null,
  collapsed: false,
  id: "test-section-id",
  is_archived: false,
  is_deleted: false,
  name: "Default Section",
  project_id: "test-project-id",
  section_order: 1,
  sync_id: null,
  updated_at: "2024-01-01T00:00:00Z",
  user_id: "user-123",
  v2_id: "v2-section-id",
  v2_project_id: "v2-project-id",
  ...overrides,
});
