import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function commandExists(cmd: string, args: string[]): Promise<boolean> {
  try {
    await execFileAsync(cmd, args);
    return true;
  } catch {
    return false;
  }
}

export interface PrerequisiteResult {
  ok: boolean;
  message?: string;
}

export async function checkPrerequisites(): Promise<PrerequisiteResult> {
  if (!(await commandExists("git", ["rev-parse", "--is-inside-work-tree"]))) {
    return {
      ok: false,
      message:
        "Not a git repository. Run `git init` or `git clone` first.",
    };
  }

  if (!(await commandExists("gh", ["--version"]))) {
    return {
      ok: false,
      message:
        "gh CLI is not installed. Install it from https://cli.github.com/",
    };
  }

  if (!(await commandExists("gh", ["auth", "status"]))) {
    return {
      ok: false,
      message:
        "Not logged in to gh CLI. Run `gh auth login` first.",
    };
  }

  return { ok: true };
}
