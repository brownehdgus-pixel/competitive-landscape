import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Competitive Landscape Builder",
  description:
    "기술특례상장·VC 투자검토용 경쟁사·비교기업 정리 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6">
          <header className="mb-6 border-b border-memo-border pb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-memo-muted">
              v0.1 MVP
            </p>
            <h1 className="mt-1 text-xl font-semibold text-memo-ink">
              {process.env.NEXT_PUBLIC_APP_NAME ??
                "Competitive Landscape Builder"}
            </h1>
            <p className="mt-1 text-sm text-memo-muted">
              경쟁사·비교기업 Landscape 분석 워크벤치
            </p>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
