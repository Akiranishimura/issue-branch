import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function branchExists(name: string): Promise<boolean> {
  try {
    await execFileAsync("git", ["rev-parse", "--verify", name]);
    return true;
  } catch {
    return false;
  }
}

export async function isWorkingTreeDirty(): Promise<boolean> {
  const { stdout } = await execFileAsync("git", ["status", "--porcelain"]);
  return stdout.trim().length > 0;
}

export interface CheckoutResult {
  branchName: string;
  alreadyExisted: boolean;
}

export async function getCurrentBranch(): Promise<string> {
  const { stdout } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  return stdout.trim();
}

export async function getLocalBranches(): Promise<string[]> {
  const { stdout } = await execFileAsync("git", ["branch", "--format=%(refname:short)"]);
  return stdout.trim().split("\n").filter(Boolean);
}

export async function createAndCheckoutBranch(
  name: string,
  baseBranch?: string,
): Promise<CheckoutResult> {
  if (await branchExists(name)) {
    await execFileAsync("git", ["checkout", name]);
    return { branchName: name, alreadyExisted: true };
  }

  const args = ["checkout", "-b", name];
  if (baseBranch) args.push(baseBranch);
  await execFileAsync("git", args);
  return { branchName: name, alreadyExisted: false };
}
