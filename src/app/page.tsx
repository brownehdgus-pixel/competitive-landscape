import Link from "next/link";

export default function Home() {
  return (
    <section className="rounded-lg border border-memo-border bg-memo-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-memo-ink">프로젝트 목록</h2>
      <p className="mt-2 text-sm text-memo-muted">
        Step 0 완료. Step 3에서 프로젝트 생성·목록 UI가 연결됩니다.
      </p>
      <div className="mt-6 rounded-md border border-dashed border-memo-border bg-memo-accent-light px-4 py-8 text-center text-sm text-memo-muted">
        등록된 Landscape 프로젝트가 없습니다.
      </div>
      <Link
        href="/projects/new"
        className="mt-4 inline-flex items-center rounded-md bg-memo-accent px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        새 프로젝트 만들기
      </Link>
    </section>
  );
}
