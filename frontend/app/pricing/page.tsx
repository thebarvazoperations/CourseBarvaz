import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const freeFeatures = [
  { label: "10 questions per exam", included: true },
  { label: "2 exam categories", included: true },
  { label: "Instant scoring", included: true },
  { label: "20 questions per exam", included: false },
  { label: "All exam categories", included: false },
  { label: "Answer explanations", included: false },
  { label: "Full exam history", included: false },
  { label: "Priority support", included: false },
];

const proFeatures = [
  { label: "10 questions per exam", included: true },
  { label: "2 exam categories", included: true },
  { label: "Instant scoring", included: true },
  { label: "20 questions per exam", included: true },
  { label: "All exam categories", included: true },
  { label: "Answer explanations", included: true },
  { label: "Full exam history", included: true },
  { label: "Priority support", included: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 px-4 py-8 pb-28 sm:pb-10 max-w-content mx-auto w-full">
        <h1 className="text-2xl font-bold text-charcoal mb-1">Plans &amp; Pricing</h1>
        <p className="text-muted mb-8">Start free. Upgrade when you&apos;re ready.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card flex flex-col">
            <div className="mb-5">
              <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-1">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-charcoal">&#8362;0</span>
                <span className="text-muted">/month</span>
              </div>
              <p className="text-sm text-muted mt-1">No credit card required</p>
            </div>
            <ul className="space-y-3 flex-1 mb-6">
              {freeFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-base">
                  <span className={`text-lg w-6 text-center ${f.included ? "text-success" : "text-border"}`}>
                    {f.included ? "✓" : "✕"}
                  </span>
                  <span className={f.included ? "text-charcoal" : "text-muted line-through"}>{f.label}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-secondary w-full justify-center">Get Started Free</Link>
          </div>
          <div className="card flex flex-col border-burnt-orange border-2 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-burnt-orange text-white text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-burnt-orange uppercase tracking-wide mb-1">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-charcoal">&#8362;49</span>
                <span className="text-muted">/month</span>
              </div>
              <p className="text-sm text-muted mt-1">Full access to everything</p>
            </div>
            <ul className="space-y-3 flex-1 mb-6">
              {proFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-base">
                  <span className="text-lg w-6 text-center text-success">{"✓"}</span>
                  <span className="text-charcoal">{f.label}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary w-full justify-center">Upgrade to Pro</Link>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-bold text-charcoal mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Your Pro subscription can be cancelled at any time from your account settings." },
              { q: "Is the free plan really free?", a: "Yes. The free plan gives you full access to 10 questions per session and 2 categories, forever." },
              { q: "How many questions are in the bank?", a: "We currently have 25 sample questions across 3 categories. More are added regularly." },
            ].map((item) => (
              <div key={item.q} className="card">
                <p className="font-semibold text-charcoal mb-1">{item.q}</p>
                <p className="text-muted text-base">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
