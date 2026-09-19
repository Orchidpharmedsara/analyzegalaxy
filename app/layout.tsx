import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reel Analyzer',
  description: 'AI-powered social media video analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.className} bg-gray-950 text-gray-100 min-h-screen antialiased`}
      >
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-xl">🎬</span>
              <span>Reel Analyzer</span>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                New Analysis
              </Link>
              <Link
                href="/history"
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                History
              </Link>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
