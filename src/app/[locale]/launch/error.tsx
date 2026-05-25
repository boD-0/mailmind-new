"use client";

import { NotFoundPage } from "@/components/ui/NotFoundPage";

export default function LaunchError({ error, reset }: { error: Error; reset: () => void }) {
  return <NotFoundPage isError onRetry={reset} errorMessage={error.message} />;
}
