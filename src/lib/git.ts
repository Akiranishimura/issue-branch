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

export async function createAndCheckoutBranch(
  name: string,
): Promise<CheckoutResult> {
  if (await branchExists(name)) {
    await execFileAsync("git", ["checkout", name]);
    return { branchName: name, alreadyExisted: true };
  }

  await execFileAsync("git", ["checkout", "-b", name]);
  return { branchName: name, alreadyExisted: false };
}
