import BookDeliverLinks from "@/app/components/restaurant/Book-DeliverLinks";
import FoodMenu from "@/app/components/restaurant/FoodMenu";

export default function Menu() {
  return (
    <div>
      <h1 className="text-4xl tracking-widest  font-bold text-center mt-36 mb-6">
        Menu
      </h1>
      <h3 className=" mx-auto max-w-s md:max-w-screen-sm lg:max-w-screen-md text-base text-center mb- px-10">
        served all day, every day at Mama
      </h3>

      <FoodMenu />
      <BookDeliverLinks />
    </div>
  );
}
