import { redirect } from "next/navigation";

// Icelandic entrypoint. We keep English homepage at `/` unchanged.
// This is intentionally a lightweight redirect until a dedicated IS homepage exists.
export default function IcelandicHomeRedirect() {
  redirect("/is/restaurant");
}

