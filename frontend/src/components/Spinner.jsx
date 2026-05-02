import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-8 w-8" }) {
  return (
    <Loader2
      className={`animate-spin text-brand-600 ${className}`}
      aria-hidden
    />
  );
}
