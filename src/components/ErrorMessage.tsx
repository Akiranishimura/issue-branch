import { Text } from "ink";

export function ErrorMessage({ message }: { message: string }) {
  return <Text color="red">✖ {message}</Text>;
}
