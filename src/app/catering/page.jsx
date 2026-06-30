import CateringPage from "../components/catering/CateringPage";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

// Live "sample menu" for the catering page. These restaurant-menu categories
// (managed in /admin/manage-menu) are the catering-appropriate dishes, in the
// order we want them shown. Editing the menu updates catering automatically.
const CATERING_CATEGORIES = [
  "Our Hearty Stews",
  "Platter & Soup",
  "Salads",
  "Appetizers / Sides",
];
const MAX_CATERING_ITEMS = 8;

// Menu descriptions are full restaurant copy (multi-line, with "topped with"
// and "served with" sections). For the catering teaser we want one tidy line.
function cateringBlurb(desc) {
  const first = (desc || "").split("\n")[0].trim();
  return first.length > 120
    ? first.slice(0, 117).replace(/\s+\S*$/, "") + "…"
    : first;
}

async function getCateringMenu() {
  try {
    const supabase = await createServerSupabaseComponent();
    const [{ data: cats }, { data: items }] = await Promise.all([
      supabase.from("menu_categories").select("id, name"),
      supabase
        .from("menu_items")
        .select("name, description, category_id, available, order")
        .eq("available", true),
    ]);
    if (!cats || !items) return [];

    const rank = new Map(CATERING_CATEGORIES.map((n, i) => [n, i]));
    const catRank = new Map(
      cats.filter((c) => rank.has(c.name)).map((c) => [c.id, rank.get(c.name)]),
    );

    return items
      .filter((it) => catRank.has(it.category_id))
      .sort((a, b) => {
        const d = catRank.get(a.category_id) - catRank.get(b.category_id);
        return d !== 0 ? d : (a.order ?? 0) - (b.order ?? 0);
      })
      .slice(0, MAX_CATERING_ITEMS)
      .map((it) => ({ name: it.name, description: cateringBlurb(it.description) }));
  } catch {
    return [];
  }
}

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/catering";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Catering by Mama Reykjavík | Plant-Based Catering for Events & Offices",
      description:
        "Mama Reykjavík offers conscious, 100% plant-based catering for corporate lunches, private events, and wellness retreats across Reykjavík. Minimum 10 portions, 1 week notice.",
      keywords:
        "Mama Reykjavík catering, vegan catering Reykjavik, plant-based event catering Iceland, corporate lunch delivery Reykjavik, wellness retreat catering Iceland",
      ogTitle: "Catering by Mama Reykjavík | Conscious Food, Delivered",
      ogDescription:
        "Bring the warmth of Mama's kitchen to your team, event, or retreat. 100% plant-based catering across Reykjavík.",
    },
    is: {
      title: "Matur að heimsenda frá Mama Reykjavík | Plöntubundinn matur fyrir viðburði",
      description:
        "Mama Reykjavík býður upp á meðvitaðan, 100% plöntubundinn mat að heimsenda fyrir fyrirtæki, einkaviðburði og heilbrigðisretreat um allt Reykjavík.",
      keywords:
        "Mama Reykjavík catering, vegan matur Reykjavík, plöntubundinn viðburðarmatur Ísland",
      ogTitle: "Matur að heimsenda frá Mama Reykjavík",
      ogDescription:
        "Við komum með hlýju Mama eldhússins til þíns teymis, viðburðar eða retreat. 100% plöntubundið.",
    },
  };

  const t = translations[language] || translations.en;
  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    keywords: t.keywords,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/v1762326608/dahl_aumxpm.jpg",
          width: 1200,
          height: 630,
          alt: "Catering by Mama Reykjavík",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default async function CateringRoute() {
  const cateringMenu = await getCateringMenu();
  return <CateringPage cateringMenu={cateringMenu} />;
}
