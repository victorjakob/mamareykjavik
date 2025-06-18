import Link from "next/link";

export default function CartIcon({
  hasItems,
  count = 0,
  href = "/shop/cart",
  className = "",
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center justify-center h-10 w-10 ${className}`}
      aria-label="View cart"
    >
      <span
        className={`absolute inset-0 rounded-full transition-shadow duration-300 pointer-events-none ${
          hasItems
            ? "shadow-[0_0_0_4px_rgba(16,185,129,0.2)] animate-pulse"
            : ""
        }`}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-7 w-7 transition-colors duration-300 drop-shadow ${
          hasItems ? "text-emerald-600" : "text-gray-400"
        }`}
        fill={hasItems ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={hasItems ? 0 : 1.5}
      >
        {/* Unique, bold cart icon */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6h15l-1.5 9h-13z"
        />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>
      {hasItems && (
        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow pointer-events-none">
          {count > 0 ? count : ""}
        </span>
      )}
    </Link>
  );
}
