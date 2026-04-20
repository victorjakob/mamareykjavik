// /tribe-card/[token] — public card view (server component wrapper).
//
// Uses generateMetadata to fetch the card's holder name at request time,
// so shared links show "Your Tribe Card — Aldin | Mama Reykjavík" instead
// of the generic title. This page is also `noindex` — it's a private
// share URL, not a landing page for Google.

import { createServerSupabase } from "@/util/supabase/server";
import { getLocaleFromHeaders, urlFor } from "@/lib/seo";
import TribeCardTokenClient from "../components/TribeCardTokenClient";

export async function generateMetadata({ params }) {
  const { token } = await params;
  const language = await getLocaleFromHeaders();

  // Best-effort lookup. If the token is invalid or Supabase hiccups, we
  // fall back to a generic title — we never want metadata to throw and
  // take down the page render.
  let holderName = null;
  try {
    const supabase = createServerSupabase();
    const { data } = await supabase
      .from("tribe_cards")
      .select("holder_name, discount_percent")
      .eq("access_token", token)
      .maybeSingle();
    if (data?.holder_name) {
      holderName = data.holder_name;
    }
  } catch {
    // Ignore — generic metadata is fine.
  }

  const copy = {
    en: {
      withName: (n) => `${n}'s Tribe Card | Mama Reykjavík`,
      generic: "Your Tribe Card | Mama Reykjavík",
      descWithName: (n) =>
        `${n}'s digital Tribe Card from Mama Reykjavík — a small thank-you from our community.`,
      descGeneric: "A digital Tribe Card from Mama Reykjavík.",
    },
    is: {
      withName: (n) => `Ættbálkurkort ${n} | Mama Reykjavík`,
      generic: "Ættbálkurkortið þitt | Mama Reykjavík",
      descWithName: (n) =>
        `Stafrænt Ættbálkurkort ${n} frá Mama Reykjavík — lítill þakklætisvottur frá samfélaginu okkar.`,
      descGeneric: "Stafrænt Ættbálkurkort frá Mama Reykjavík.",
    },
  };

  const t = copy[language];
  const title = holderName ? t.withName(holderName) : t.generic;
  const description = holderName ? t.descWithName(holderName) : t.descGeneric;

  const tokenPath = `/tribe-card/${token}`;
  const canonical = urlFor({ locale: language, pathname: tokenPath });

  return {
    title,
    description,
    // Private share URL — do not index, do not follow out-links.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function TribeCardTokenPage() {
  return <TribeCardTokenClient />;
}
