"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Top accent bar */}
      <div className="h-1 bg-gray-800" />

      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-semibold text-gray-900">
                OSS Arena
              </Link>
              <div className="flex items-center gap-6 text-sm">
                <Link
                  href="/"
                  className={`${
                    pathname === "/"
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Contributions leaderboard
                </Link>
                <Link
                  href="/code-reviews"
                  className={`${
                    pathname === "/code-reviews"
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Code reviews leaderboard
                </Link>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              built by{" "}
              <a
                href="https://twitter.com/auchenberg"
                className="text-gray-500 hover:text-gray-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @auchenberg
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
