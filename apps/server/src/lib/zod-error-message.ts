import type { ZodIssue } from "zod";

export function zodErrorToMessage(issues: ZodIssue[] | undefined): string {
  if (!issues) return "";
  return issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}
