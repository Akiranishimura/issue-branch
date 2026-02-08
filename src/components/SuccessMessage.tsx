import { Text } from "ink";

export function SuccessMessage({
  branchName,
  alreadyExisted,
}: {
  branchName: string;
  alreadyExisted: boolean;
}) {
  return (
    <Text color="green">
      ✔ {alreadyExisted ? "Switched to existing branch" : "Created and switched to branch"}:{" "}
      <Text bold>{branchName}</Text>
    </Text>
  );
}
