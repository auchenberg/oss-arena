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
              <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 19H9V12.5V8.6C9 8.26863 9.26863 8 9.6 8H14.4C14.7314 8 15 8.26863 15 8.6V14.5V19Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 5H9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.4 19H15V15.1C15 14.7686 15.2686 14.5 15.6 14.5H20.4C20.7314 14.5 21 14.7686 21 15.1V18.4C21 18.7314 20.7314 19 20.4 19Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 19V13.1C9 12.7686 8.73137 12.5 8.4 12.5H3.6C3.26863 12.5 3 12.7686 3 13.1V18.4C3 18.7314 3.26863 19 3.6 19H9Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
