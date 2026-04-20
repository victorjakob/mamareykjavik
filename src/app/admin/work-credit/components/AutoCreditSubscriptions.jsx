"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashIcon, PlayIcon, RefreshCw, CalendarIcon, Loader2 } from "lucide-react";

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-[#f0ebe3] placeholder-[#5a4a40]
  bg-[#17100a] border border-[#3a2812]
  focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30
  transition-all duration-200`;

export default function AutoCreditSubscriptions({ subscriptions = [], onRefresh }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [autoProcessDone, setAutoProcessDone] = useState(false);
  const [formData, setFormData] = useState({ email: "", monthlyAmount: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingId ? `/api/user/auto-credit-subscriptions/${editingId}` : "/api/user/auto-credit-subscriptions";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          monthlyAmount: parseFloat(formData.monthlyAmount),
          description: formData.description,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");
      toast.success(editingId ? "Subscription updated!" : "Subscription created!");
      setShowForm(false);
      setEditingId(null);
      setFormData({ email: "", monthlyAmount: "", description: "" });
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subscription) => {
    setEditingId(subscription.id);
    setFormData({
      email: subscription.email,
      monthlyAmount: subscription.monthly_amount.toString(),
      description: subscription.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      const response = await fetch(`/api/user/auto-credit-subscriptions/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Subscription deleted!");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const response = await fetch(`/api/user/auto-credit-subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update");
      toast.success(`Subscription ${!isActive ? "activated" : "deactivated"}!`);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleProcessNow = async ({ skipConfirm = false, silent = false } = {}) => {
    if (!skipConfirm && !confirm("Process all overdue subscriptions immediately?")) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/process-monthly-credits", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to process");
      if (data.processed > 0) {
        toast.success(`Processed ${data.processed} subscription(s)!`, { duration: 5000 });
        if (data.errors?.length > 0) toast.error(`${data.errors.length} had errors.`, { duration: 5000 });
      } else if (!silent) {
        toast("No subscriptions due for processing.");
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoProcessDone || subscriptions.length === 0) return;
    const now = new Date();
    const hasDue = subscriptions.some((s) => s.is_active && s.next_payment_date && new Date(s.next_payment_date) <= now);
    if (hasDue) {
      setAutoProcessDone(true);
      handleProcessNow({ skipConfirm: true, silent: true });
    }
  }, [autoProcessDone, subscriptions]);

  const handleResetDates = async () => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 1);
    targetDate.setDate(1);
    targetDate.setHours(0, 0, 0, 0);
    const formattedDate = targetDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    if (!confirm(`Update all overdue subscriptions' next payment date to ${formattedDate} WITHOUT processing? Continue?`)) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/reset-subscription-dates", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reset");
      if (data.updated > 0) {
        toast.success(`Updated ${data.updated} subscription(s) to ${formattedDate}!`, { duration: 5000 });
      } else {
        toast("No overdue subscriptions to update.");
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const btnGhost = { background: "#241809", border: "1px solid #3a2812", color: "#9a8e82" };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <span className="text-xs text-[#7a6a5a]">
          {subscriptions.length} subscription{subscriptions.length !== 1 ? "s" : ""}
        </span>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleResetDates} disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all disabled:opacity-50"
            style={btnGhost}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarIcon className="h-3.5 w-3.5" />}
            Reset to Next Month
          </button>
          <button onClick={handleProcessNow} disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all disabled:opacity-50"
            style={btnGhost}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Process Now
          </button>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
            style={{ background: "#ff914d", color: "#000" }}>
            <PlusIcon className="h-3.5 w-3.5" /> Add Subscription
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="mb-5 rounded-xl p-5" style={{ background: "#17100a", border: "1px solid #3a2812" }}>
          <h4 className="text-sm font-medium text-[#f0ebe3] mb-4">
            {editingId ? "Edit Subscription" : "New Subscription"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9a8e82] mb-1.5">Email address</label>
              <input type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputCls} placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9a8e82] mb-1.5">Monthly amount (kr)</label>
              <input type="number" step="100" required value={formData.monthlyAmount}
                onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                className={inputCls} placeholder="50000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9a8e82] mb-1.5">Description (optional)</label>
              <input type="text" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputCls} placeholder="Monthly allowance for…" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-50"
                style={{ background: "#ff914d", color: "#000" }}>
                {isLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</> : editingId ? "Update" : "Create"}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setFormData({ email: "", monthlyAmount: "", description: "" }); }}
                className="inline-flex items-center rounded-xl px-4 py-2 text-xs font-medium"
                style={btnGhost}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="text-center py-10 rounded-xl" style={{ background: "#17100a", border: "1px solid #2a1c0e" }}>
          <PlayIcon className="mx-auto h-8 w-8 text-[#3a2812] mb-2" />
          <p className="text-sm text-[#5a4a40]">No auto-credit subscriptions yet</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl" style={{ border: "1px solid #3a2812" }}>
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #3a2812" }}>
                  {["Email", "Monthly", "Status", "Next payment", "Last payment", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5a4a40]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid #2a1c0e" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#241809"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-[#ff914d]"
                          style={{ background: "rgba(255,145,77,0.14)" }}>
                          {sub.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-[#c0b4a8]">{sub.email}</p>
                          {sub.description && <p className="text-xs text-[#5a4a40]">{sub.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: "rgba(255,145,77,0.12)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.2)" }}>
                        {sub.monthly_amount.toLocaleString()} kr
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleToggleActive(sub.id, sub.is_active)}
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium transition-all"
                        style={sub.is_active
                          ? { background: "rgba(255,145,77,0.12)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.2)" }
                          : { background: "rgba(255,255,255,0.04)", color: "#5a4a40", border: "1px solid #2a1c0e" }
                        }>
                        {sub.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#7a6a5a]">
                      {sub.next_payment_date ? formatDate(sub.next_payment_date) : "N/A"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#7a6a5a]">
                      {sub.last_payment_date ? formatDate(sub.last_payment_date) : "Never"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(sub)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                          style={btnGhost}>
                          <PencilIcon className="h-3 w-3" />Edit
                        </button>
                        <button onClick={() => handleDelete(sub.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                          style={{ background: "rgba(255,107,107,0.08)", color: "#ff8080", border: "1px solid rgba(255,107,107,0.15)" }}>
                          <TrashIcon className="h-3 w-3" />Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="rounded-xl p-4" style={{ background: "#17100a", border: "1px solid #3a2812" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-[#ff914d]"
                      style={{ background: "rgba(255,145,77,0.14)" }}>
                      {sub.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-[#c0b4a8]">{sub.email}</p>
                      {sub.description && <p className="text-xs text-[#5a4a40]">{sub.description}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleToggleActive(sub.id, sub.is_active)}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={sub.is_active
                      ? { background: "rgba(255,145,77,0.12)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.2)" }
                      : { background: "rgba(255,255,255,0.04)", color: "#5a4a40", border: "1px solid #2a1c0e" }
                    }>
                    {sub.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="space-y-1.5 text-xs mb-3">
                  <div className="flex justify-between text-[#7a6a5a]">
                    <span>Monthly:</span>
                    <span className="text-[#ff914d] font-medium">{sub.monthly_amount.toLocaleString()} kr</span>
                  </div>
                  <div className="flex justify-between text-[#7a6a5a]">
                    <span>Next payment:</span>
                    <span>{sub.next_payment_date ? formatDate(sub.next_payment_date) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-[#7a6a5a]">
                    <span>Last payment:</span>
                    <span>{sub.last_payment_date ? formatDate(sub.last_payment_date) : "Never"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(sub)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium"
                    style={btnGhost}>
                    <PencilIcon className="h-3 w-3" />Edit
                  </button>
                  <button onClick={() => handleDelete(sub.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium"
                    style={{ background: "rgba(255,107,107,0.08)", color: "#ff8080", border: "1px solid rgba(255,107,107,0.15)" }}>
                    <TrashIcon className="h-3 w-3" />Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
