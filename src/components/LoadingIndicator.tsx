import { Spinner } from "@inkjs/ui";

export function LoadingIndicator({ label }: { label: string }) {
  return <Spinner label={label} />;
}
