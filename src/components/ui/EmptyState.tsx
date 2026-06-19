type EmptyStateProps = {
  message: string;
  submessage?: string;
};

export function EmptyState({ message, submessage }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-memo-border bg-memo-accent-light px-6 py-12 text-center">
      <p className="text-sm font-medium text-memo-ink">{message}</p>
      {submessage ? (
        <p className="mt-2 text-sm text-memo-muted">{submessage}</p>
      ) : null}
    </div>
  );
}
