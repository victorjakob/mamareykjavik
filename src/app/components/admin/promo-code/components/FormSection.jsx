export default function FormSection({
  title,
  color = "orange",
  children,
  className = "",
}) {
  const colorClasses = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div
      className={`bg-gray-50 p-6 rounded-xl border border-gray-200 ${className}`}
    >
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span
          className={`w-2 h-2 ${colorClasses[color]} rounded-full mr-3`}
        ></span>
        {title}
      </h4>
      {children}
    </div>
  );
}
