// --- Nested Types for Tasks (Items) ---

export interface TaskDeadline {
  date: string;
  lang: string;
}

export interface TaskDue {
  date: string;
  is_recurring: boolean;
  lang: string;
  string: string;
  timezone: string | null;
}

export interface TaskDuration {
  amount: number;
  unit: "minute" | "hour" | "day" | string;
}

// --- Main Entities ---

export interface TodoistFilter {
  color: string;
  id: string;
  is_deleted: boolean;
  is_favorite: boolean;
  is_frozen: boolean;
  item_order: number;
  name: string;
  query: string;
}

export interface TodoistItem {
  added_at: string;
  added_by_uid: string;
  assigned_by_uid: string | null;
  checked: boolean;
  child_order: number;
  collapsed: boolean;
  completed_at: string | null;
  completed_by_uid: string | null;
  content: string;
  day_order: number;
  deadline: TaskDeadline | null;
  description: string;
  due: TaskDue | null;
  duration: TaskDuration | null;
  id: string;
  is_deleted: boolean;
  labels: string[];
  note_count: number;
  parent_id: string | null;
  priority: number;
  project_id: string;
  responsible_uid: string | null;
  section_id: string | null;
  sync_id: string | null;
  updated_at: string;
  user_id: string;
  v2_id: string;
  v2_parent_id: string | null;
  v2_project_id: string;
  v2_section_id: string | null;
}

export interface TodoistLabel {
  color: string;
  id: string;
  is_deleted: boolean;
  is_favorite: boolean;
  item_order: number;
  name: string;
}

export interface ProjectAccess {
  configuration: Record<string, unknown>;
  visibility: string;
}

export interface TodoistProject {
  access: ProjectAccess;
  can_assign_tasks: boolean;
  child_order: number;
  collapsed: boolean;
  color: string;
  created_at: string;
  creator_uid: string;
  default_order: number;
  description: string;
  id: string;
  inbox_project?: boolean; // This field is optional as it only appears on the Inbox project
  is_archived: boolean;
  is_deleted: boolean;
  is_favorite: boolean;
  is_frozen: boolean;
  name: string;
  parent_id: string | null;
  public_access: boolean;
  public_key: string;
  role: string;
  shared: boolean;
  sync_id: string | null;
  updated_at: string;
  v2_id: string;
  v2_parent_id: string | null;
  view_style: "list" | "board" | string;
}

export interface TodoistSection {
  added_at: string;
  archived_at: string | null;
  collapsed: boolean;
  id: string;
  is_archived: boolean;
  is_deleted: boolean;
  name: string;
  project_id: string;
  section_order: number;
  sync_id: string | null;
  updated_at: string;
  user_id: string;
  v2_id: string;
  v2_project_id: string;
}

// --- Root Response Interface ---

export interface TodoistSyncResponse {
  filters: TodoistFilter[];
  full_sync: boolean;
  full_sync_date_utc: string;
  items: TodoistItem[];
  labels: TodoistLabel[];
  projects: TodoistProject[];
  sections: TodoistSection[];
  sync_token: string;
  temp_id_mapping: Record<string, string>;
}
