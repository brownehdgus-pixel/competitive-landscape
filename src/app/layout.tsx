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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
