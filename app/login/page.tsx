"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, loginWithGoogle, loginWithFacebook, isAuthenticated } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const next = params.get("next") || "/account";

  useEffect(() => {
    if (isAuthenticated) router.replace(next);
  }, [isAuthenticated, next, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to manage your orders and addresses.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white font-bold text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-3">
            <button
              onClick={loginWithGoogle}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue with Google
            </button>
            <button
              onClick={loginWithFacebook}
              className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#1463cf] text-white text-sm font-semibold transition-colors"
            >
              Continue with Facebook
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500 text-center">
            New here?{" "}
            <a
              href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-[#ff6b6b] font-semibold hover:underline"
            >
              Create an account
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
