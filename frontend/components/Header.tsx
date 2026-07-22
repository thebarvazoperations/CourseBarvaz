"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-charcoal text-white">
      <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-xl" role="img" aria-label="scales">
            &#9878;
          </span>
          <span className="hidden sm:inline">The Constitution Guard</span>
          <span className="sm:hidden">CG</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm text-white/60 hidden sm:inline">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-burnt-orange text-white text-sm font-medium px-4 py-2 rounded-lg
                           hover:bg-burnt-orange-dark transition-colors"
              >
                Start Free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
