import { CleanTask } from "./interfaces";

export function removeInternalIds(item: any): CleanTask {
  const { id, project_id, section_id, parent_id, ...clean } = item;
  return clean;
}

export function mapPriority(p: number): string {
  switch (p) {
    case 4:
      return "P1";
    case 3:
      return "P2";
    case 2:
      return "P3";
    case 1:
      return "P4";
    default:
      return "P4";
  }
}
