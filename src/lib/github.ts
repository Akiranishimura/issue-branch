import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { GitHubIssue } from "../types.js";

const execFileAsync = promisify(execFile);

export async function fetchIssues(
  assignee: string,
  limit: number,
): Promise<GitHubIssue[]> {
  const { stdout } = await execFileAsync("gh", [
    "issue",
    "list",
    "--assignee",
    assignee,
    "--state",
    "open",
    "--limit",
    String(limit),
    "--json",
    "number,title,labels,url",
  ]);

  return JSON.parse(stdout) as GitHubIssue[];
}
