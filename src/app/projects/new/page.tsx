import Link from "next/link";

export default function NewProjectPage() {
  return (
    <section className="rounded-lg border border-memo-border bg-memo-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-memo-ink">새 프로젝트</h2>
      <p className="mt-2 text-sm text-memo-muted">
        Step 3에서 Target Company 입력 폼이 연결됩니다.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm text-memo-highlight hover:underline"
      >
        ← 목록으로
      </Link>
    </section>
  );
}
