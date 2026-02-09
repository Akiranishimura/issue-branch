import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { GitHubIssue } from "../types.js";

const execFileAsync = promisify(execFile);

const CACHE_DIR = join(tmpdir(), "issue-branch");
const CACHE_TTL_MS = 30_000; // 30 seconds

interface CacheEntry {
  timestamp: number;
  assignee: string;
  limit: number;
  issues: GitHubIssue[];
}

function getCachePath(): string {
  return join(CACHE_DIR, "issues-cache.json");
}

async function readCache(
  assignee: string,
  limit: number,
): Promise<GitHubIssue[] | null> {
  try {
    const raw = await readFile(getCachePath(), "utf-8");
    const entry = JSON.parse(raw) as CacheEntry;

    if (
      entry.assignee === assignee &&
      entry.limit === limit &&
      Date.now() - entry.timestamp < CACHE_TTL_MS
    ) {
      return entry.issues;
    }
  } catch {
    // cache miss or corrupt — ignore
  }
  return null;
}

async function writeCache(
  assignee: string,
  limit: number,
  issues: GitHubIssue[],
): Promise<void> {
  const entry: CacheEntry = {
    timestamp: Date.now(),
    assignee,
    limit,
    issues,
  };
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(getCachePath(), JSON.stringify(entry));
  } catch {
    // non-critical — ignore write failures
  }
}

export interface FetchResult {
  issues: GitHubIssue[];
  fromCache: boolean;
}

export async function fetchIssues(
  assignee: string,
  limit: number,
): Promise<FetchResult> {
  const cached = await readCache(assignee, limit);
  if (cached) {
    return { issues: cached, fromCache: true };
  }

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

  const issues = JSON.parse(stdout) as GitHubIssue[];
  await writeCache(assignee, limit, issues);
  return { issues, fromCache: false };
}
