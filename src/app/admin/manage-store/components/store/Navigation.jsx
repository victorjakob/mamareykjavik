"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StoreNavigation() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/manage-store", label: "Dashboard" },
    { href: "/admin/manage-store/products", label: "Products" },
    { href: "/admin/manage-store/categories", label: "Categories" },
    { href: "/admin/manage-store/orders", label: "Orders" },
  ];

  return (
    <nav className="mb-6">
      <div className="flex flex-wrap gap-2">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200"
              style={
                active
                  ? {
                      background: "#ff914d",
                      color: "#ffffff",
                      boxShadow: "0 2px 10px rgba(255,145,77,0.28)",
                    }
                  : {
                      background: "#faf6f2",
                      color: "#9a7a62",
                      border: "1px solid #e8ddd3",
                    }
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
