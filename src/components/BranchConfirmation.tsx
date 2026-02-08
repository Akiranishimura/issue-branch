import { useState } from "react";
import { Box, Text, useInput } from "ink";
import { TextInput } from "@inkjs/ui";
import type { GitHubIssue } from "../types.js";

type Field = "branchName" | "baseBranch";

interface Props {
  issue: GitHubIssue;
  defaultBranchName: string;
  baseBranch: string;
  onConfirm: (branchName: string, baseBranch: string) => void;
  onCancel: () => void;
}

export function BranchConfirmation({ issue, defaultBranchName, baseBranch, onConfirm, onCancel }: Props) {
  const [branchName, setBranchName] = useState(defaultBranchName);
  const [base, setBase] = useState(baseBranch);
  const [focused, setFocused] = useState<Field>("branchName");

  useInput((_input, key) => {
    if (key.return) {
      onConfirm(branchName, base);
    } else if (key.escape) {
      onCancel();
    } else if (key.tab) {
      setFocused((prev) => (prev === "branchName" ? "baseBranch" : "branchName"));
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Issue: </Text>
        <Text color="cyan">#{issue.number}</Text>
        <Text> {issue.title}</Text>
      </Box>

      <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1}>
        <Box>
          <Text bold color={focused === "branchName" ? "cyan" : undefined}>{"❯ Branch name: "}</Text>
          <TextInput
            defaultValue={defaultBranchName}
            onChange={setBranchName}
            isDisabled={focused !== "branchName"}
          />
        </Box>
        <Box>
          <Text bold color={focused === "baseBranch" ? "cyan" : undefined}>{"  Base branch: "}</Text>
          <TextInput
            defaultValue={baseBranch}
            onChange={setBase}
            isDisabled={focused !== "baseBranch"}
          />
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Tab switch · Enter confirm · Esc back</Text>
      </Box>
    </Box>
  );
}
