export default function FormField({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  className = "",
  focusColor = "indigo",
  ...props
}) {
  const baseClasses = `w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-${focusColor}-500 focus:ring-2 focus:ring-${focusColor}-200 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base`;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          {...register(name)}
          rows={4}
          className={`${baseClasses} resize-none ${className}`}
          placeholder={placeholder}
          style={{ height: "auto", overflow: "hidden" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${Math.max(
              e.target.scrollHeight,
              8 * 16
            )}px`;
          }}
          {...props}
        />
      ) : (
        <input
          {...register(name)}
          type={type}
          className={`${baseClasses} ${className}`}
          placeholder={placeholder}
          {...props}
        />
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
