"use client";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

function getAmountStyle(amount) {
  if (parseFloat(amount) >= 0) {
    return { background: "rgba(255,145,77,0.12)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.2)" };
  }
  return { background: "rgba(255,107,107,0.1)", color: "#ff8080", border: "1px solid rgba(255,107,107,0.18)" };
}

function getTypeStyle(type) {
  const t = type?.toLowerCase();
  if (t === "add") return { background: "rgba(255,145,77,0.1)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.2)" };
  if (t === "subtract") return { background: "rgba(255,107,107,0.08)", color: "#ff8080", border: "1px solid rgba(255,107,107,0.15)" };
  if (t === "auto") return { background: "rgba(255,200,77,0.1)", color: "#ffcc4d", border: "1px solid rgba(255,200,77,0.2)" };
  return { background: "rgba(255,255,255,0.04)", color: "#7a6a5a", border: "1px solid #2a1c0e" };
}

const formatDt = (v) => new Date(v).toLocaleDateString("en-US", {
  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
});

export default function WorkCreditHistory({ history }) {
  const [show, setShow] = useState(true);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-[#9a7a62]">
          {history.length} transaction{history.length !== 1 ? "s" : ""}
        </span>
        <button onClick={() => setShow(!show)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#9a7a62] transition-colors"
          style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
          {show ? <><EyeSlashIcon className="h-3.5 w-3.5" />Hide</> : <><EyeIcon className="h-3.5 w-3.5" />Show</>}
        </button>
      </div>

      {show && (
        history.length === 0 ? (
          <div className="text-center py-10 rounded-xl" style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
            <DocumentTextIcon className="mx-auto h-8 w-8 text-[#e8ddd3] mb-2" />
            <p className="text-sm text-[#9a7a62]">No transaction history yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl" style={{ border: "1.5px solid #f0e6d8" }}>
              <table className="min-w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #e8ddd3" }}>
                    {["Date", "User", "Amount", "Type", "Note"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9a7a62]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: "1px solid #e8ddd3" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#faf6f2"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#9a7a62]">{formatDt(entry.created_at)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-[#2c1810]">{entry.email}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={getAmountStyle(entry.amount)}>
                          {parseFloat(entry.amount) >= 0 ? "+" : ""}{parseFloat(entry.amount).toLocaleString()} kr
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={getTypeStyle(entry.type)}>
                          {entry.type || "Manual"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#9a7a62] max-w-[200px] truncate">{entry.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-xl p-4"
                  style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-[#2c1810]">{entry.email}</p>
                      <p className="text-xs text-[#9a7a62] mt-0.5">{formatDt(entry.created_at)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={getAmountStyle(entry.amount)}>
                        {parseFloat(entry.amount) >= 0 ? "+" : ""}{parseFloat(entry.amount).toLocaleString()} kr
                      </span>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={getTypeStyle(entry.type)}>
                        {entry.type || "Manual"}
                      </span>
                    </div>
                  </div>
                  {entry.note && (
                    <p className="text-xs text-[#9a7a62] rounded-lg px-2 py-1.5 mt-1"
                      style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                      {entry.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}
