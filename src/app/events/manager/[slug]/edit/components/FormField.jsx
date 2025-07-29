export default function FormField({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  min,
  step,
  focusColor = "indigo",
  ...props
}) {
  const focusClasses = {
    indigo: "focus:border-indigo-500 focus:ring-indigo-500",
    emerald: "focus:border-emerald-500 focus:ring-emerald-500",
    amber: "focus:border-amber-500 focus:ring-amber-500",
    purple: "focus:border-purple-500 focus:ring-purple-500",
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          {...register(name)}
          rows={4}
          placeholder={placeholder}
          className={`block w-full rounded-lg border-gray-300 shadow-sm ${focusClasses[focusColor]} sm:text-sm transition-colors duration-200`}
          {...props}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`block w-full rounded-lg border-gray-300 shadow-sm ${focusClasses[focusColor]} sm:text-sm transition-colors duration-200`}
          {...props}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
