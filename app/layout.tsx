import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import QuickCapture from "@/components/QuickCapture";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ToDo ADHD - 時間は有限。だから今日、動く。",
  description: "時間盲と先延ばし癖に悩むADHD当事者のためのカウントダウン型ToDoアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-20 pb-12">
          {children}
        </main>
        <QuickCapture />
      </body>
    </html>
  );
}
