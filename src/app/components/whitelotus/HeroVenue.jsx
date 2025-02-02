import { Button } from "@/app/components/Button";
import Image from "next/image";
export default function HeroVenue() {
  return (
    <div className="container mx-auto px-4 space-y-12 text-center mt-28">
      <Image
        src="/whitelotus/whitelotuslogo.png"
        alt="White Lotus Logo"
        width={1161}
        height={1020}
        className="mx-auto w-64 h-auto"
      />
      <h1 className="text-3xl w-2/3 md:text-4xl font-bold mb-4 max-w-3xl mx-auto">
        Exclusive event venue in the heart of the city{" "}
      </h1>
      <p className="w-4/5 font-light  mx-auto text-xl md:text-2xl mb-8">
        Located in the vibrant downtown Reykjavik
        <br /> a dynamic hub brimming with cultural events and activities{" "}
      </p>
      <Button href={"whitelotus/rent"} label={"Book Your Event Now"}>
        Contact Now
      </Button>
    </div>
  );
}
