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
  const inputStyle = {
    background: "#faf6f2",
    border: "1.5px solid #e8ddd3",
    color: "#2c1810",
    borderRadius: "0.75rem",
    padding: "0.625rem 1rem",
    width: "100%",
    fontSize: "0.925rem",
    transition: "border-color 0.15s ease",
    outline: "none",
  };

  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-xs uppercase tracking-[0.25em] font-medium mb-2" style={{ color: "#9a7a62" }}>
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          id={name}
          {...register(name)}
          rows={4}
          className={`resize-none ${className}`}
          placeholder={placeholder}
          style={{ ...inputStyle, height: "auto", overflow: "hidden" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${Math.max(e.target.scrollHeight, 8 * 16)}px`;
          }}
          onFocus={e => { e.target.style.borderColor = "#ff914d"; e.target.style.boxShadow = "0 0 0 3px rgba(255,145,77,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "#e8ddd3"; e.target.style.boxShadow = "none"; }}
          {...props}
        />
      ) : (
        <input
          id={name}
          {...register(name)}
          type={type}
          className={className}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "#ff914d"; e.target.style.boxShadow = "0 0 0 3px rgba(255,145,77,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "#e8ddd3"; e.target.style.boxShadow = "none"; }}
          {...props}
        />
      )}
      {helpText && !error && (
        <p className="mt-1.5 text-xs" style={{ color: "#c0a890" }}>{helpText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#dc2626" }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
