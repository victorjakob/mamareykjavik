// Dark-themed form field for admin create-event
export default function FormField({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  className = "",
  helpText,
  ...props
}) {
  const baseInputCls = `w-full px-4 py-3 rounded-xl text-sm
    focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30
    transition-all duration-200 ${className}`;

  const inputStyle = {
    backgroundColor: "#faf6f2",
    color: "#2c1810",
    border: "1px solid #e8ddd3"
  };

  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-xs font-medium mb-2 tracking-wide" style={{ color: "#9a7a62" }}>
          {label}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          {...register(name)}
          rows={4}
          className={`${baseInputCls} resize-none`}
          placeholder={placeholder}
          style={{ ...inputStyle, height: "auto", overflow: "hidden" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${Math.max(e.target.scrollHeight, 8 * 16)}px`;
          }}
          {...props}
        />
      ) : (
        <input
          {...register(name)}
          id={name}
          type={type}
          className={baseInputCls}
          placeholder={placeholder}
          style={inputStyle}
          {...props}
        />
      )}

      {helpText && !error && (
        <p className="mt-1.5 text-xs" style={{ color: "#9a7a62" }}>{helpText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-[#c05a1a] flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
