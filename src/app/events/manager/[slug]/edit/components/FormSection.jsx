export default function FormSection({
  icon,
  title,
  description,
  gradientFrom,
  gradientTo,
  children,
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">{description}</p>
        </div>
      </div>
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}
