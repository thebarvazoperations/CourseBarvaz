"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-charcoal text-white h-14 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">&#9878;</span>
          <span>The Constitution Guard</span>
        </Link>
      </div>

      {/* Form */}
      <div className="max-w-sm mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
        <p className="text-muted mb-8">Start preparing for your legal exams</p>

        {error && (
          <div className="bg-error-light text-error rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="input-field"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input-field"
              autoComplete="new-password"
            />
          </div>

          {/* Info box */}
          <div className="bg-surface rounded-lg px-4 py-3 text-sm text-muted">
            <p className="font-medium text-charcoal mb-1">Free Plan Includes:</p>
            <p>10 questions per exam across 2 categories</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg mt-2"
          >
            {loading ? "Creating account..." : "Create Free Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-burnt-orange font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
