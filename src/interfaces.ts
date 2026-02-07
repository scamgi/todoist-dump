import { z } from "zod";

// --- Nested Schemas ---

const TaskDeadlineSchema = z.object({
  date: z.string(),
  lang: z.string(),
});

const TaskDueSchema = z.object({
  date: z.string(),
  is_recurring: z.boolean(),
  lang: z.string(),
  string: z.string(),
  timezone: z.string().nullable(),
});

const TaskDurationSchema = z.object({
  amount: z.number(),
  unit: z.enum(["minute", "hour", "day"]).or(z.string()),
});

const ProjectAccessSchema = z.object({
  configuration: z.record(z.unknown()), // Represents {}
  visibility: z.string(),
});

// --- Main Entity Schemas ---

export const TodoistFilterSchema = z.object({
  color: z.string(),
  id: z.string(),
  is_deleted: z.boolean(),
  is_favorite: z.boolean(),
  is_frozen: z.boolean(),
  item_order: z.number(),
  name: z.string(),
  query: z.string(),
});

export const TodoistItemSchema = z.object({
  added_at: z.string(),
  added_by_uid: z.string(),
  assigned_by_uid: z.string().nullable(),
  checked: z.boolean(),
  child_order: z.number(),
  collapsed: z.boolean(),
  completed_at: z.string().nullable(),
  completed_by_uid: z.string().nullable(),
  content: z.string(),
  day_order: z.number(),
  deadline: TaskDeadlineSchema.nullable(),
  description: z.string(),
  due: TaskDueSchema.nullable(),
  duration: TaskDurationSchema.nullable(),
  id: z.string(),
  is_deleted: z.boolean(),
  labels: z.array(z.string()),
  note_count: z.number(),
  parent_id: z.string().nullable(),
  priority: z.number(),
  project_id: z.string(),
  responsible_uid: z.string().nullable(),
  section_id: z.string().nullable(),
  sync_id: z.string().nullable(),
  updated_at: z.string(),
  user_id: z.string(),
  v2_id: z.string(),
  v2_parent_id: z.string().nullable(),
  v2_project_id: z.string(),
  v2_section_id: z.string().nullable(),
});

export const TodoistLabelSchema = z.object({
  color: z.string(),
  id: z.string(),
  is_deleted: z.boolean(),
  is_favorite: z.boolean(),
  item_order: z.number(),
  name: z.string(),
});

export const TodoistProjectSchema = z.object({
  access: ProjectAccessSchema,
  can_assign_tasks: z.boolean(),
  child_order: z.number(),
  collapsed: z.boolean(),
  color: z.string(),
  created_at: z.string(),
  creator_uid: z.string(),
  default_order: z.number(),
  description: z.string(),
  id: z.string(),
  inbox_project: z.boolean().optional(),
  is_archived: z.boolean(),
  is_deleted: z.boolean(),
  is_favorite: z.boolean(),
  is_frozen: z.boolean(),
  name: z.string(),
  parent_id: z.string().nullable(),
  public_access: z.boolean(),
  public_key: z.string(),
  role: z.string(),
  shared: z.boolean(),
  sync_id: z.string().nullable(),
  updated_at: z.string(),
  v2_id: z.string(),
  v2_parent_id: z.string().nullable(),
  view_style: z.string(),
});

export const TodoistSectionSchema = z.object({
  added_at: z.string(),
  archived_at: z.string().nullable(),
  collapsed: z.boolean(),
  id: z.string(),
  is_archived: z.boolean(),
  is_deleted: z.boolean(),
  name: z.string(),
  project_id: z.string(),
  section_order: z.number(),
  sync_id: z.string().nullable(),
  updated_at: z.string(),
  user_id: z.string(),
  v2_id: z.string(),
  v2_project_id: z.string(),
});

// --- Root Response Schema ---

export const TodoistSyncResponseSchema = z.object({
  filters: z.array(TodoistFilterSchema),
  full_sync: z.boolean(),
  full_sync_date_utc: z.string(),
  items: z.array(TodoistItemSchema),
  labels: z.array(TodoistLabelSchema),
  projects: z.array(TodoistProjectSchema),
  sections: z.array(TodoistSectionSchema),
  sync_token: z.string(),
  temp_id_mapping: z.record(z.string()),
});

// --- Exported TypeScript Types (Inferred from Schemas) ---

export type TodoistSyncResponse = z.infer<typeof TodoistSyncResponseSchema>;
export type TodoistItem = z.infer<typeof TodoistItemSchema>;
export type TodoistProject = z.infer<typeof TodoistProjectSchema>;
