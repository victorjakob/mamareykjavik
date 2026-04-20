export default function FormSection({ icon, title, description, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}
    >
      {/* Top accent */}
      <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.2), transparent 70%)" }} />

      <div className="p-6 sm:p-7">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#fff8f2" }}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-base font-medium" style={{ color: "#2c1810" }}>{title}</h2>
            {description && (
              <p className="text-xs mt-0.5" style={{ color: "#9a7a62" }}>{description}</p>
            )}
          </div>
        </div>

        <div className="space-y-5">{children}</div>
      </div>
    </div>
  );
}
