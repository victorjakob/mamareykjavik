import FoodMenu from "@/app/components/restaurant/FoodMenu";

export default function Menu() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-36 mb-6">Menu</h1>
      <h3 className=" mx-auto max-w-s md:max-w-screen-sm lg:max-w-screen-md text-base text-center mb- px-10">
        Discover fresh, wholesome dishes crafted with love and inspired by
        Mother Nature. Nourishing flavors await to delight your body and soul.
      </h3>

      <FoodMenu />
    </div>
  );
}
