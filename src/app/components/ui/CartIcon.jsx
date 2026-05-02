import Link from "next/link";

export default function CartIcon({
  hasItems,
  count,
  href = "/shop/cart",
  className = "",
  isScrolled = false,
}) {
  const hasCount = hasItems && count > 0;
  if (!hasItems) {
    return null;
  }

  // On the hero (top of page) the cream cart icon reads fine on dark
  // banners. Once you scroll past the hero, the page background turns
  // cream/paper and the soft white pill vanishes against it. So when
  // scrolled we switch to the opaque emerald pill that matches the
  // navbar's center pill.
  const containerClasses = isScrolled
    ? "bg-emerald-900/90 border-emerald-900 text-white shadow-md"
    : "bg-white/40 border-emerald-900 text-emerald-900";

  const iconColor = isScrolled
    ? "text-white"
    : hasCount
    ? "text-emerald-900"
    : "text-emerald-900 group-hover:text-stone-600";

  return (
    <Link
      href={href}
      className={`relative group bg-blur-sm h-11 w-11 flex items-center justify-center rounded-full border backdrop-blur-md shadow hover:shadow-md transition-all duration-300 ${containerClasses} ${className}`}
      aria-label="View cart"
    >
      {/* Cart Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 transition-colors duration-300 ${iconColor}`}
        fill={hasCount ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={hasCount ? 0 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2c-.7.7-.2 2 .8 2h13"
        />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>

      {/* Badge */}
      {hasCount && (
        <span className="absolute -top-1.5 -right-1.5 text-[11px] min-w-[20px] px-1.5 py-0.5 text-white bg-emerald-600 rounded-full shadow-lg font-semibold text-center leading-tight animate-bounce">
          {count}
        </span>
      )}

      {/* Pulse ring */}
      {hasCount && (
        <span className="absolute inset-0 rounded-full ring-emerald-300 ring-2 animate-ping pointer-events-none" />
      )}
    </Link>
  );
}
