import Link from "next/link";

export default function ProfileIcon({ href = "/profile", className = "" }) {
  return (
    <Link
      href={href}
      className={`relative group h-11 w-11 flex items-center justify-center rounded-full border border-black bg-white/40 backdrop-blur-md shadow hover:shadow-md transition-all duration-300 ${className}`}
      aria-label="View profile"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-black group-hover:text-gray-700 transition-colors duration-300"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}
