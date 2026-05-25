"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setStatus("error");
        setMessage(errorDescription || "Authentication failed");
        return;
      }

      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus("error");
            setMessage(exchangeError.message);
          } else {
            setStatus("success");
            setMessage("Email verified successfully!");
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } catch (err) {
          setStatus("error");
          setMessage("An unexpected error occurred");
        }
      } else {
        setStatus("error");
        setMessage("Invalid callback URL");
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-[#54afe6] mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-[#371a5b] mb-2">Verifying...</h2>
              <p className="text-gray-600">Please wait while we verify your email.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#371a5b] mb-2">Success!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#371a5b] mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <a
                  href="/auth/login"
                  className="block w-full bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Go to Login
                </a>
                <a
                  href="/auth/signup"
                  className="block w-full border-2 border-[#371a5b] text-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Try Again
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
