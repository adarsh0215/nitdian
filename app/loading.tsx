// Root Suspense boundary: lets static shells prerender while
// session-dependent pages (dashboard, directory, …) stream in.
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
    </div>
  );
}
