export interface CleanTask {
  content: string;
  description?: string;
  priority: string;
  due?: string;
  is_completed: boolean;
  labels: string[];
  subtasks: CleanTask[];
}

export interface CleanSection {
  name: string;
  tasks: CleanTask[];
}

export interface CleanProject {
  project: string;
  is_archived: boolean;
  view_style: string;
  sections: CleanSection[];
  tasks: CleanTask[];
  sub_projects: CleanProject[];
}

export interface CleanFilter {
  name: string;
  query: string;
}

export interface FullExport {
  meta: {
    generated_at: string;
    stats: {
      total_projects: number;
      total_tasks: number;
      total_labels: number;
      total_filters: number;
    };
  };
  global_definitions: {
    available_labels: string[];
    available_filters: CleanFilter[];
  };
  projects_tree: CleanProject[];
}
