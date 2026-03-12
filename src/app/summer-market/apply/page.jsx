import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";
import SummerMarketApplyPageClient from "../components/apply/SummerMarketApplyPageClient";

const OG_IMAGE_URL =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1773310721/Summer_Market_mggv0n.png";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/summer-market/apply";
  const alternates = alternatesFor({
    locale: language,
    pathname,
    translated: false,
  });

  const t = {
    title: "Apply for White Lotus Summer Market | Vendor Application",
    description:
      "Submit your vendor application for White Lotus Summer Market in downtown Reykjavik.",
    ogTitle: "Apply for White Lotus Summer Market",
    ogDescription:
      "Share your products, preferred dates, and details to apply as a vendor at White Lotus Summer Market.",
  };

  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 675,
          alt: "White Lotus Summer Market vendor application",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [OG_IMAGE_URL],
    },
  };
}

export default function SummerMarketApplyPage() {
  return <SummerMarketApplyPageClient />;
}
