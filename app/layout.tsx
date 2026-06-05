import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Medical News Agent | 의료 뉴스 자동 수집",
  description:
    "WHO, CDC, NIH, PubMed 등 7개 소스에서 최신 의료·질병 뉴스를 자동 수집하고 AI로 한국어 요약",
  openGraph: {
    title: "Medical News Agent",
    description: "최신 질병 정보 자동 수집 및 AI 요약 대시보드",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geist.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
