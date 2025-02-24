import BookDeliverLinks from "@/app/components/restaurant/Book-DeliverLinks";
import FoodMenu from "@/app/components/restaurant/FoodMenu";
import { supabase } from "@/lib/supabase";

// ✅ Server-side data fetching
async function getMenuData() {
  const [categoriesRes, menuRes] = await Promise.all([
    supabase.from("menu_categories").select("id, name, order").order("order"),
    supabase
      .from("menu_items")
      .select("id, name, description, price, category_id")
      .order("order"),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (menuRes.error) throw menuRes.error;

  return {
    categories: categoriesRes.data,
    menuItems: menuRes.data,
  };
}

export const metadata = {
  title: "Menu | Mama Reykjavik",
  description:
    "Explore our delicious menu at Mama Reykjavik. We serve conscious, nourishing food all day, every day.",
  canonical: "https://mamareykjavik.is/restaurant/menu",
  openGraph: {
    title: "Menu at Mama Reykjavik Restaurant",
    description:
      "Discover our full menu of conscious dining options, served all day at Mama Reykjavik.",
    url: "https://mamareykjavik.is/restaurant/menu",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik Logo",
      },
    ],
    type: "website",
  },
};

export default async function Menu() {
  const menuData = await getMenuData();

  return (
    <div className="min-h-screen">
      <h1 className="text-4xl tracking-widest  font-bold text-center mt-36 mb-6">
        Menu
      </h1>
      <h3 className=" mx-auto max-w-s md:max-w-screen-sm lg:max-w-screen-md text-base text-center mb- px-10">
        served all day, every day at Mama
      </h3>

      <FoodMenu menuData={menuData} />
      <BookDeliverLinks />
    </div>
  );
}
