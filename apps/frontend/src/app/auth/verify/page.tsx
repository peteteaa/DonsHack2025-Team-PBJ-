"use client";

import { Suspense } from "react";
import VerifyContent from "./verify-content";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
