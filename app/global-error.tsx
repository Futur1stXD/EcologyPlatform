"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body className="antialiased bg-white text-[#0a0a0a]">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-[#6b6b6b] mb-6 max-w-sm">
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          {error.digest && (
            <p className="text-xs text-[#a3a3a3] mb-4 font-mono">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
