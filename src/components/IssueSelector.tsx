import { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { Fzf, type FzfResultItem } from "fzf";
import type { GitHubIssue } from "../types.js";

const VISIBLE_COUNT = 8;

interface Props {
  issues: GitHubIssue[];
  onSelect: (issue: GitHubIssue) => void;
  onCancel: () => void;
}

export function IssueSelector({ issues, onSelect, onCancel }: Props) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const fzf = useMemo(
    () =>
      new Fzf(issues, {
        selector: (issue: GitHubIssue) => `#${issue.number} ${issue.title}`,
      }),
    [issues],
  );

  const results: FzfResultItem<GitHubIssue>[] = useMemo(() => {
    return fzf.find(query);
  }, [fzf, query]);

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setCursor((prev) => Math.min(results.length - 1, prev + 1));
    } else if (key.return && results.length > 0) {
      onSelect(results[cursor]!.item);
    } else if (key.escape) {
      onCancel();
    } else if (key.backspace || key.delete) {
      setQuery((prev) => prev.slice(0, -1));
      setCursor(0);
    } else if (input && !key.ctrl && !key.meta) {
      setQuery((prev) => prev + input);
      setCursor(0);
    }
  });

  const windowStart = Math.max(
    0,
    Math.min(cursor - Math.floor(VISIBLE_COUNT / 2), results.length - VISIBLE_COUNT),
  );
  const visibleResults = results.slice(windowStart, windowStart + VISIBLE_COUNT);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Search: </Text>
        <Text>{query}</Text>
        <Text dimColor>▌</Text>
      </Box>

      {results.length === 0 ? (
        <Text dimColor>No matching issues.</Text>
      ) : (
        visibleResults.map((result, i) => {
          const actualIndex = windowStart + i;
          const issue = result.item;
          const isSelected = actualIndex === cursor;
          const labels = issue.labels.map((l: { name: string }) => l.name).join(", ");

          return (
            <Text key={issue.number}>
              <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
                {isSelected ? "❯ " : "  "}
                #{issue.number} {issue.title}
              </Text>
              {labels && (
                <Text dimColor> [{labels}]</Text>
              )}
            </Text>
          );
        })
      )}

      <Box marginTop={1}>
        <Text dimColor>
          {results.length} issues · ↑↓ select · Enter confirm · Esc cancel
        </Text>
      </Box>
    </Box>
  );
}
