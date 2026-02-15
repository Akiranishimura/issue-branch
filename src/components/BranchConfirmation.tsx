import { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { TextInput } from "@inkjs/ui";
import { Fzf, type FzfResultItem } from "fzf";
import type { GitHubIssue } from "../types.js";

type Field = "branchName" | "baseBranch" | "create";

const VISIBLE_COUNT = 6;

interface Props {
	issue: GitHubIssue;
	defaultBranchName: string;
	baseBranch: string;
	branches: string[];
	onConfirm: (branchName: string, baseBranch: string) => void;
	onCancel: () => void;
}

export function BranchConfirmation({
	issue,
	defaultBranchName,
	baseBranch,
	branches,
	onConfirm,
	onCancel,
}: Props) {
	const [branchName, setBranchName] = useState(defaultBranchName);
	const [focused, setFocused] = useState<Field>("branchName");
	const [baseQuery, setBaseQuery] = useState(baseBranch);
	const [cursor, setCursor] = useState(0);

	const fzf = useMemo(
		() => new Fzf(branches, { selector: (b: string) => b }),
		[branches]
	);

	const results: FzfResultItem<string>[] = useMemo(() => {
		return fzf.find(baseQuery);
	}, [fzf, baseQuery]);

	useInput((input, key) => {
		if (key.escape) {
			onCancel();
			return;
		}

		if (focused === "branchName") {
			if (key.return || key.tab) {
				setFocused("baseBranch");
			}
		} else if (focused === "baseBranch") {
			if (key.upArrow) {
				setCursor((prev) => Math.max(0, prev - 1));
			} else if (key.downArrow) {
				setCursor((prev) => Math.min(results.length - 1, prev + 1));
			} else if (key.return && results.length > 0) {
				setBaseQuery(results[cursor]!.item);
				setFocused("create");
			} else if (key.tab) {
				setFocused("create");
			} else if (key.backspace || key.delete) {
				setBaseQuery((prev) => prev.slice(0, -1));
				setCursor(0);
			} else if (input && !key.ctrl && !key.meta) {
				setBaseQuery((prev) => prev + input);
				setCursor(0);
			}
		} else if (focused === "create") {
			if (key.return) {
				const selectedBase = results.length > 0 ? results[0]!.item : baseQuery;
				onConfirm(branchName, selectedBase);
			} else if (key.tab) {
				setFocused("branchName");
			}
		}
	});

	const windowStart = Math.max(
		0,
		Math.min(
			cursor - Math.floor(VISIBLE_COUNT / 2),
			results.length - VISIBLE_COUNT
		)
	);
	const visibleResults = results.slice(
		windowStart,
		windowStart + VISIBLE_COUNT
	);

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold>Issue: </Text>
				<Text color="cyan">#{issue.number}</Text>
				<Text> {issue.title}</Text>
			</Box>

			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor="gray"
				paddingX={1}
			>
				<Box>
					<Text bold color={focused === "branchName" ? "cyan" : undefined}>
						{focused === "branchName" ? "❯" : " "} Branch name:{" "}
					</Text>
					<TextInput
						defaultValue={defaultBranchName}
						onChange={setBranchName}
						isDisabled={focused !== "branchName"}
					/>
				</Box>
				<Box>
					<Text bold color={focused === "baseBranch" ? "cyan" : undefined}>
						{focused === "baseBranch" ? "❯" : " "} Base branch:{" "}
					</Text>
					<Text>{baseQuery}</Text>
					{focused === "baseBranch" && <Text dimColor>▌</Text>}
				</Box>

				{focused === "baseBranch" && (
					<Box flexDirection="column" marginLeft={2}>
						{results.length === 0 ? (
							<Text dimColor>No matching branches.</Text>
						) : (
							visibleResults.map((result, i) => {
								const actualIndex = windowStart + i;
								const isSelected = actualIndex === cursor;
								return (
									<Text key={result.item}>
										<Text
											color={isSelected ? "cyan" : undefined}
											bold={isSelected}
										>
											{isSelected ? "❯ " : "  "}
											{result.item}
										</Text>
									</Text>
								);
							})
						)}
						<Text dimColor>{results.length} branches</Text>
					</Box>
				)}

				<Box marginTop={1}>
					<Text bold color={focused === "create" ? "cyan" : undefined}>
						{focused === "create" ? "❯" : " "} {"[ Create branch ]"}
					</Text>
				</Box>
			</Box>

			<Box marginTop={1}>
				<Text dimColor>
					{focused === "baseBranch"
						? "↑↓ select · Enter/Tab next · Esc back"
						: focused === "create"
						? "Enter create · Tab move · Esc back"
						: "Tab move · Esc back"}
				</Text>
			</Box>
		</Box>
	);
}
