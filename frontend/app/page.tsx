"use client";

import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const categories = [
  {
    slug: "amendments",
    icon: "📜",
    title: "Amendments",
    description: "Test your knowledge of Constitutional Amendments",
  },
  {
    slug: "branches",
    icon: "🏛",
    title: "Branches of Government",
    description: "Executive, Legislative, and Judicial branches",
  },
  {
    slug: "civil-rights",
    icon: "✊",
    title: "Civil Rights",
    description: "Landmark cases and civil liberties",
  },
];

const features = [
  {
    icon: "📝",
    title: "25+ Questions",
    description: "Comprehensive question bank covering key constitutional topics",
  },
  {
    icon: "📊",
    title: "Track Progress",
    description: "Monitor your scores and improvement over time",
  },
  {
    icon: "⚡",
    title: "Quick Exam Format",
    description: "10-question exams you can complete in under 10 minutes",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <Header />

      {/* Hero Section */}
      <section className="bg-charcoal text-white">
        <div className="max-w-content mx-auto px-4 py-12 sm:py-16 text-center">
          <span className="inline-block bg-white/10 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Legal Exam Preparation
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Master the U.S.{" "}
            <span className="text-burnt-orange">Constitution</span>
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
            Practice with real exam-style questions. Track your progress.
            Ace your legal exams with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8">
              Start Practicing Free
            </Link>
            <Link href="/pricing" className="btn-secondary !text-white !border-white/30 hover:!bg-white/10">
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="max-w-content mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-2">Exam Categories</h2>
        <p className="text-muted mb-6">
          Choose a topic and start testing your knowledge
        </p>
        <div className="grid gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href="/register"
              className="card flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <h3 className="font-semibold">{cat.title}</h3>
                <p className="text-sm text-muted">{cat.description}</p>
              </div>
              <span className="ml-auto text-muted text-xl">&rsaquo;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface">
        <div className="max-w-content mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Why Constitution Guard?
          </h2>
          <div className="grid gap-4">
            {features.map((feat) => (
              <div key={feat.title} className="card flex items-start gap-4">
                <span className="text-2xl mt-0.5">{feat.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{feat.title}</h3>
                  <p className="text-sm text-muted">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-burnt-orange text-white">
        <div className="max-w-content mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Ready to Test Your Knowledge?
          </h2>
          <p className="text-white/80 mb-6">
            Join for free and start your first practice exam today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-white text-burnt-orange
                       font-semibold min-h-touch px-8 rounded-lg hover:bg-white/90
                       transition-colors active:scale-[0.97]"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white/60">
        <div className="max-w-content mx-auto px-4 py-8 text-center text-sm">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} The Constitution Guard. All rights
            reserved.
          </p>
          <p>Built for legal exam preparation.</p>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
