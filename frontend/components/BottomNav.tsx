"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home", icon: "🏠", href: "/", auth: false },
  { label: "Exams", icon: "📋", href: "/dashboard", auth: true },
  { label: "Plans", icon: "💎", href: "/pricing", auth: false },
  { label: "Account", icon: "👤", href: "/dashboard", auth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border sm:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const href = item.auth && !user ? "/login" : item.href;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                         transition-colors ${
                           isActive
                             ? "text-burnt-orange"
                             : "text-muted hover:text-charcoal"
                         }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for iPhone */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
