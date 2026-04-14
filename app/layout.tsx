import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Dinner Decision App",
  description: "Choose what to cook based on your pantry and preferences.",
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
    >
      <body className="min-h-full text-zinc-950">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(7,17,31,0.82)] backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              expert-spoon
            </span>
            <a href="/expert-spoon/" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Recipes
            </a>
            <a href="/expert-spoon/pantry" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Pantry
            </a>
            <a href="/expert-spoon/preferences" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Preferences
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
