import { notFound } from "next/navigation";

// Tours are temporarily disabled (no env var required).
// Flip to `true` when tours are back.
const TOURS_ENABLED = false;

export default function ToursLayout({ children }) {
  if (!TOURS_ENABLED) notFound();
  return <>{children}</>;
}

