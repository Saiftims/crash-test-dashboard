import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crash Test Clearance Dashboard",
  description: "Search and visualize vehicle crash test dummy position measurements",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
            <a href="/" className="text-lg font-bold text-white hover:text-blue-400 transition">
              Crash Test Dashboard
            </a>
            <a href="/" className="text-sm text-gray-400 hover:text-white transition">Search</a>
            <a href="/compare" className="text-sm text-gray-400 hover:text-white transition">Compare</a>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
