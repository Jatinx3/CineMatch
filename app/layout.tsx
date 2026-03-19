import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineMatch — AI Movie Recommendations",
  description: "CineMatch uses TF-IDF and BERT neural embeddings to recommend movies that perfectly match your vibe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-[#080808] dark:text-white transition-colors duration-300">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">{children}</div>
            <footer className="w-full border-t border-white/5 bg-[#080808] py-6 px-6">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎬</span>
                  <span className="text-sm font-black tracking-tight text-white">CineMatch</span>
                  <span className="text-xs font-medium text-zinc-500 ml-1">AI-Powered Movie Discovery</span>
                </div>
                <p className="text-xs font-medium text-zinc-500">
                  Built with{" "}
                  <span className="text-rose-500">♥</span>{" "}
                  by{" "}
                  <span className="text-white font-bold">Jatin</span>
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
