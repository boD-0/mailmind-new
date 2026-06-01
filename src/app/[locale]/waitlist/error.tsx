"use client";

import { NotFoundPage } from "@/components/ui/NotFoundPage";

export default function WaitlistError({ error, reset }: { error: Error; reset: () => void }) {
  return <NotFoundPage isError onRetry={reset} errorMessage={error.message} />;
}
