import type { GitHubIssue } from "../types.js";

const MAX_LENGTH = 60;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateBranchName(
  issue: GitHubIssue,
  template: string,
): string {
  const slugTitle = slugify(issue.title);
  const name = template
    .replace("{number}", String(issue.number))
    .replace("{title}", slugTitle);

  if (name.length > MAX_LENGTH) {
    return name.slice(0, MAX_LENGTH).replace(/-$/, "");
  }
  return name;
}
