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
        "gitリポジトリ内で実行してください。(git init もしくは git clone を先に実行)",
    };
  }

  if (!(await commandExists("gh", ["--version"]))) {
    return {
      ok: false,
      message:
        "gh CLI がインストールされていません。https://cli.github.com/ からインストールしてください。",
    };
  }

  if (!(await commandExists("gh", ["auth", "status"]))) {
    return {
      ok: false,
      message:
        "gh CLI にログインしていません。`gh auth login` を実行してください。",
    };
  }

  return { ok: true };
}
