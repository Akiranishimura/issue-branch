export interface GitHubIssue {
  number: number;
  title: string;
  labels: { name: string }[];
  url: string;
}

export interface Config {
  branchTemplate: string;
  maxIssues: number;
}

export type AppState =
  | { phase: "checking" }
  | { phase: "loading" }
  | { phase: "selecting"; issues: GitHubIssue[] }
  | { phase: "creating"; issue: GitHubIssue; branchName: string }
  | { phase: "done"; branchName: string; alreadyExisted: boolean }
  | { phase: "error"; message: string };

export interface CliFlags {
  assignee: string;
  template: string | undefined;
}
