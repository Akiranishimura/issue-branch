import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import type { Config } from "../types.js";

const DEFAULT_CONFIG: Config = {
  branchTemplate: "feature/{number}-{title}",
  maxIssues: 50,
};

function getConfigDir(): string {
  return join(
    process.env["XDG_CONFIG_HOME"] || join(homedir(), ".config"),
    "issue-branch",
  );
}

export function getConfigPath(): string {
  return join(getConfigDir(), "config.json");
}

export async function loadConfig(): Promise<Config> {
  try {
    const raw = await readFile(getConfigPath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<Config>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function initConfig(): Promise<{ created: boolean; path: string }> {
  const configPath = getConfigPath();

  try {
    await readFile(configPath, "utf-8");
    return { created: false, path: configPath };
  } catch {
    // file doesn't exist — create it
  }

  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
  return { created: true, path: configPath };
}
