import FoodMenu from "@/app/components/restaurant/FoodMenu";
import BookDeliverLinks from "@/app/components/restaurant/Book-DeliverLinks";
import MenuHero from "./MenuHero";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";

export const revalidate = 60;

async function getMenuData() {
  const supabase = await createServerSupabaseComponent();

  const [categoriesRes, menuRes] = await Promise.all([
    supabase.from("menu_categories").select("id, name, order").order("order"),
    supabase
      .from("menu_items")
      .select("id, name, description, price, category_id")
      .eq("available", true)
      .order("order"),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (menuRes.error) throw menuRes.error;

  return { categories: categoriesRes.data, menuItems: menuRes.data };
}

export const metadata = {
  title: "Menu | Mama Reykjavik",
  description: "Explore our full menu at Mama Reykjavik. Conscious, nourishing plant-based food served all day, every day.",
  alternates: {
    canonical: "https://mama.is/restaurant/menu",
  },
  openGraph: {
    title: "Menu | Mama Reykjavik",
    description: "Discover our full menu of nourishing plant-based dishes, served all day at Mama Reykjavik.",
    url: "https://mama.is/restaurant/menu",
    images: [{ url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg", alt: "Mama Reykjavik Menu" }],
    type: "website",
  },
};

export default async function MenuPage() {
  const menuData = await getMenuData();

  return (
    <>
      <div data-navbar-theme="dark">
        <MenuHero />
      </div>
      <div className="bg-[#f9f4ec] text-[#1a1410]" data-navbar-theme="light">
        <FoodMenu menuData={menuData} />
      </div>
      <div data-navbar-theme="dark">
        <BookDeliverLinks />
      </div>
    </>
  );
}
