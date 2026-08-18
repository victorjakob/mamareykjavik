import FoodMenu from "@/app/components/restaurant/FoodMenu";
import BookDeliverLinks from "@/app/components/restaurant/Book-DeliverLinks";
import MenuHero from "./MenuHero";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";

export const revalidate = 60;

async function getMenuData() {
  const supabase = await createServerSupabaseComponent();

  const [categoriesRes, menuRes] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id, name, name_is, description, description_is, order")
      .order("order"),
    supabase
      .from("menu_items")
      .select("id, name, name_is, description, description_is, price, category_id")
      .eq("available", true)
      .order("order"),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (menuRes.error) throw menuRes.error;

  return { categories: categoriesRes.data, menuItems: menuRes.data };
}

const META = {
  en: {
    title: "Menu | Mama Reykjavik",
    description:
      "Explore our full menu at Mama Reykjavik — breakfast from 9:00, hearty stews, salads, raw cakes, coffee, herbal teas and more. Conscious, nourishing plant-based food served all day, every day.",
    ogTitle: "Menu | Mama Reykjavik",
    ogDescription:
      "Breakfast, stews, salads, cakes, coffee and herbal tea — our full plant-based menu, served all day at Mama Reykjavik.",
    ogAlt: "Mama Reykjavik Menu",
  },
  is: {
    title: "Matseðill | Mama Reykjavík",
    description:
      "Skoðaðu matseðilinn okkar á Mama Reykjavík — morgunverður frá kl. 9, pottréttir, salöt, hrákökur, kaffi, jurtate og fleira. Plöntubasaður matur, framreiddur alla daga.",
    ogTitle: "Matseðill | Mama Reykjavík",
    ogDescription:
      "Morgunverður, pottréttir, salöt, kökur, kaffi og jurtate — allur plöntubasaði matseðillinn okkar, alla daga á Mama Reykjavík.",
    ogAlt: "Matseðill Mama Reykjavík",
  },
};

export async function generateMetadata() {
  const locale = await getLocaleFromHeaders();
  const t = META[locale] ?? META.en;
  const alternates = alternatesFor({
    locale,
    pathname: "/restaurant/menu",
    translated: true,
  });

  return {
    title: t.title,
    description: t.description,
    alternates,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          width: 1200,
          height: 630,
          alt: t.ogAlt,
        },
      ],
      type: "website",
      locale: ogLocale(locale),
    },
  };
}

export default async function MenuPage() {
  const [menuData, locale] = await Promise.all([
    getMenuData(),
    getLocaleFromHeaders(),
  ]);

  return (
    <>
      <div data-navbar-theme="dark">
        <MenuHero locale={locale} />
      </div>
      <div className="bg-[#f9f4ec] text-[#1a1410]" data-navbar-theme="light">
        <FoodMenu menuData={menuData} locale={locale} />
      </div>
      <div data-navbar-theme="dark">
        <BookDeliverLinks />
      </div>
    </>
  );
}
