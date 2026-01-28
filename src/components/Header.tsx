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
            <div className="flex items-center gap-4 sm:gap-8">
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
              <div className="flex items-center gap-3 sm:gap-6 text-sm">
                <Link
                  href="/"
                  className={`${
                    pathname === "/"
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="hidden sm:inline">Contributions leaderboard</span>
                  <span className="sm:hidden">Contributions</span>
                </Link>
                <Link
                  href="/code-reviews"
                  className={`${
                    pathname === "/code-reviews"
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="hidden sm:inline">Code reviews leaderboard</span>
                  <span className="sm:hidden">Reviews</span>
                </Link>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
              <a
                href="https://github.com/anthropics/oss-arena"
                className="text-gray-400 hover:text-gray-700"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <span>built by{" "}
              <a
                href="https://twitter.com/auchenberg"
                className="text-gray-500 hover:text-gray-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @auchenberg
              </a>
              </span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
