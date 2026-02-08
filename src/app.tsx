import { useState, useEffect } from "react";
import { useApp } from "ink";
import type { AppState, CliFlags, Config, GitHubIssue } from "./types.js";
import { checkPrerequisites } from "./lib/prerequisites.js";
import { fetchIssues } from "./lib/github.js";
import { generateBranchName } from "./lib/branch.js";
import { createAndCheckoutBranch } from "./lib/git.js";
import { LoadingIndicator } from "./components/LoadingIndicator.js";
import { ErrorMessage } from "./components/ErrorMessage.js";
import { SuccessMessage } from "./components/SuccessMessage.js";
import { IssueSelector } from "./components/IssueSelector.js";

interface Props {
  flags: CliFlags;
  config: Config;
}

export function App({ flags, config }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({ phase: "checking" });

  const template = flags.template ?? config.branchTemplate;

  useEffect(() => {
    if (state.phase !== "checking") return;

    checkPrerequisites().then((result) => {
      if (!result.ok) {
        setState({ phase: "error", message: result.message! });
      } else {
        setState({ phase: "loading" });
      }
    });
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "loading") return;

    fetchIssues(flags.assignee, config.maxIssues)
      .then((issues) => {
        if (issues.length === 0) {
          setState({
            phase: "error",
            message: "アサインされたオープンIssueがありません。",
          });
        } else {
          setState({ phase: "selecting", issues });
        }
      })
      .catch((err: Error) => {
        setState({ phase: "error", message: `Issue取得に失敗: ${err.message}` });
      });
  }, [state.phase, flags.assignee, config.maxIssues]);

  useEffect(() => {
    if (state.phase !== "creating") return;

    createAndCheckoutBranch(state.branchName)
      .then((result) => {
        setState({
          phase: "done",
          branchName: result.branchName,
          alreadyExisted: result.alreadyExisted,
        });
      })
      .catch((err: Error) => {
        setState({ phase: "error", message: `ブランチ作成に失敗: ${err.message}` });
      });
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === "done" || state.phase === "error") {
      exit();
    }
  }, [state.phase, exit]);

  const handleSelect = (issue: GitHubIssue) => {
    const branchName = generateBranchName(issue, template);
    setState({ phase: "creating", issue, branchName });
  };

  switch (state.phase) {
    case "checking":
      return <LoadingIndicator label="前提条件を確認中..." />;
    case "loading":
      return <LoadingIndicator label="Issueを取得中..." />;
    case "selecting":
      return <IssueSelector issues={state.issues} onSelect={handleSelect} />;
    case "creating":
      return <LoadingIndicator label={`ブランチ作成中: ${state.branchName}`} />;
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
