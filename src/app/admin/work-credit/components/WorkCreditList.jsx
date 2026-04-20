"use client";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline";

export default function WorkCreditList({ workCredits, onDelete }) {
  const [show, setShow] = useState(true);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-[#9a7a62]">
          {workCredits.length} active credit{workCredits.length !== 1 ? "s" : ""}
        </span>
        <button onClick={() => setShow(!show)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#9a7a62] transition-colors"
          style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
          {show ? <><EyeSlashIcon className="h-3.5 w-3.5" />Hide</> : <><EyeIcon className="h-3.5 w-3.5" />Show</>}
        </button>
      </div>

      {show && (
        workCredits.length === 0 ? (
          <div className="text-center py-10 rounded-xl" style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
            <UserIcon className="mx-auto h-8 w-8 text-[#e8ddd3] mb-2" />
            <p className="text-sm text-[#9a7a62]">No work credits yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl" style={{ border: "1.5px solid #f0e6d8" }}>
              <table className="min-w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #e8ddd3" }}>
                    {["User", "Credits", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9a7a62]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workCredits.map((credit, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e8ddd3" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#faf6f2"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-[#ff914d]"
                            style={{ background: "rgba(255,145,77,0.14)" }}>
                            {credit.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-[#2c1810]">{credit.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full px-3 py-1 text-xs font-medium"
                          style={credit.amount === 0
                            ? { background: "#f3f0ec", color: "#9a7a62", border: "1px solid #e8ddd3" }
                            : { background: "rgba(255,145,77,0.14)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.25)" }
                          }>
                          {credit.amount.toLocaleString()} kr
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => onDelete(credit.email)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                          style={{ background: "rgba(255,107,107,0.08)", color: "#ff8080", border: "1px solid rgba(255,107,107,0.15)" }}>
                          <TrashIcon className="h-3.5 w-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {workCredits.map((credit, i) => (
                <div key={i} className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-[#ff914d]"
                      style={{ background: "rgba(255,145,77,0.14)" }}>
                      {credit.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-[#2c1810]">{credit.email}</p>
                      <p className="text-xs text-[#9a7a62]">{credit.amount.toLocaleString()} kr</p>
                    </div>
                  </div>
                  <button onClick={() => onDelete(credit.email)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "#9a7a62" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#ff8080"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#9a7a62"}>
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}
