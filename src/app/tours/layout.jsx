import { notFound } from "next/navigation";

// Mama Tours launch gate. The section is fully built (Reykjadalur seeded in
// the DB) but hidden until the transport permit is in place.
// Flip to `true` to launch — then add /tours to the navbar/footer.
// NOTE: currently TRUE for local testing — set back to FALSE before
// deploying unless you're ready for the page to be publicly reachable.
const TOURS_ENABLED = true;

export default function ToursLayout({ children }) {
  if (!TOURS_ENABLED) notFound();
  return <>{children}</>;
}

