import { useState, useEffect } from "react";
import { useApp } from "ink";
import type { AppState, CliFlags, Config, GitHubIssue } from "./types.js";
import { checkPrerequisites } from "./lib/prerequisites.js";
import { fetchIssues } from "./lib/github.js";
import { generateBranchName } from "./lib/branch.js";
import { createAndCheckoutBranch, getCurrentBranch } from "./lib/git.js";
import { LoadingIndicator } from "./components/LoadingIndicator.js";
import { ErrorMessage } from "./components/ErrorMessage.js";
import { SuccessMessage } from "./components/SuccessMessage.js";
import { IssueSelector } from "./components/IssueSelector.js";
import { BranchConfirmation } from "./components/BranchConfirmation.js";

interface Props {
  flags: CliFlags;
  config: Config;
}

export function App({ flags, config }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({ phase: "checking" });
  const [currentBranch, setCurrentBranch] = useState("");

  const template = flags.template ?? config.branchTemplate;

  useEffect(() => {
    (async () => {
      const result = await checkPrerequisites();
      if (!result.ok) {
        setState({ phase: "error", message: result.message! });
        return;
      }

      const branch = await getCurrentBranch();
      setCurrentBranch(branch);
      setState({ phase: "loading" });

      try {
        const issues = await fetchIssues(flags.assignee, config.maxIssues);
        if (issues.length === 0) {
          setState({
            phase: "error",
            message: "No open issues assigned to you.",
          });
        } else {
          setState({ phase: "selecting", issues });
        }
      } catch (err) {
        setState({ phase: "error", message: `Failed to fetch issues: ${(err as Error).message}` });
      }
    })();
  }, []);

  // exit() はレンダー後に実行する必要があるため useEffect が必須
  useEffect(() => {
    if (state.phase === "done" || state.phase === "error") {
      exit();
    }
  }, [state.phase, exit]);

  const handleSelect = (issue: GitHubIssue) => {
    const branchName = generateBranchName(issue, template);
    const issues = state.phase === "selecting" ? state.issues : [];
    setState({ phase: "confirming", issue, defaultBranchName: branchName, baseBranch: currentBranch, issues });
  };

  const handleConfirm = async (branchName: string, baseBranch: string) => {
    if (state.phase !== "confirming") return;
    setState({ phase: "creating", issue: state.issue, branchName, baseBranch });
    try {
      const result = await createAndCheckoutBranch(branchName, baseBranch);
      setState({
        phase: "done",
        branchName: result.branchName,
        alreadyExisted: result.alreadyExisted,
      });
    } catch (err) {
      setState({ phase: "error", message: `Failed to create branch: ${(err as Error).message}` });
    }
  };

  const handleCancel = () => {
    if (state.phase !== "confirming") return;
    setState({ phase: "selecting", issues: state.issues });
  };

  switch (state.phase) {
    case "checking":
      return <LoadingIndicator label="Checking prerequisites..." />;
    case "loading":
      return <LoadingIndicator label="Fetching issues..." />;
    case "selecting":
      return <IssueSelector issues={state.issues} onSelect={handleSelect} onCancel={exit} />;
    case "confirming":
      return (
        <BranchConfirmation
          issue={state.issue}
          defaultBranchName={state.defaultBranchName}
          baseBranch={state.baseBranch}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );
    case "creating":
      return <LoadingIndicator label={`Creating branch: ${state.branchName}`} />;
    case "done":
      return (
        <SuccessMessage
          branchName={state.branchName}
          alreadyExisted={state.alreadyExisted}
        />
      );
    case "error":
      return <ErrorMessage message={state.message} />;
  }
}
