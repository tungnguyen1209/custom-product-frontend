"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { setTokenFromOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    const next = params.get("next") || "/account";
    if (!token) {
      setError("Missing token in callback. Please try signing in again.");
      return;
    }
    setTokenFromOAuth(token)
      .then(() => router.replace(next))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Sign-in failed"),
      );
  }, [params, router, setTokenFromOAuth]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-sm p-10 max-w-sm w-full text-center">
        {error ? (
          <>
            <h1 className="text-lg font-bold text-gray-900 mb-2">
              Sign-in failed
            </h1>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <a
              href="/login"
              className="inline-block px-4 py-2 rounded-xl bg-[#ff6b6b] text-white text-sm font-semibold"
            >
              Back to login
            </a>
          </>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#ff6b6b] mb-3" />
            <p className="text-sm text-gray-600">Signing you in…</p>
          </>
        )}
      </div>
    </main>
  );
}
