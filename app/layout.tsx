import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IX v3 — Intelligent Experience Demo",
  description: "IX Expression Layer — deterministic healthcare experience composition",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen bg-neutral-950 ix-grid-bg`}>
        {children}
      </body>
    </html>
  );
}
