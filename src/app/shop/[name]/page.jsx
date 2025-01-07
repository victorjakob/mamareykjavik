"use client";

import Cacao from "@/app/components/Shop/Cacao/Cacao";
import { usePathname } from "next/navigation";

export default function ShopItem() {
  const pathname = usePathname(); // Get the current path
  const lastPath = pathname.split("/").pop(); // Extract the last segment

  return <div>{lastPath === "ceremonial-cacao" && <Cacao />} </div>;
}
