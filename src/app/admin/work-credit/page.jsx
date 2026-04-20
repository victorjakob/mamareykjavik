"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CurrencyDollarIcon, ClockIcon, PlusIcon, CreditCardIcon, UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import WorkCreditForm from "./components/WorkCreditForm";
import WorkCreditList from "./components/WorkCreditList";
import WorkCreditHistory from "./components/WorkCreditHistory";
import AutoCreditSubscriptions from "./components/AutoCreditSubscriptions";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";

// ── Dark panel wrapper ─────────────────────────────────────────────────────────
function Panel({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}
    >
      <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
      <div className="px-5 py-4 border-b border-[#e8ddd3] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,145,77,0.14)" }}>
          <Icon className="h-4 w-4 text-[#ff914d]" />
        </div>
        <div>
          <p className="text-[#2c1810] text-sm font-medium">{title}</p>
          {subtitle && <p className="text-[#9a7a62] text-xs">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-4"
      style={{ background: "#faf6f2", border: "1.5px solid #f0e6d8", boxShadow: "0 2px 12px rgba(60,30,10,0.04)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,145,77,0.12)" }}>
        <Icon className="h-4 w-4 text-[#ff914d]" />
      </div>
      <div>
        <p className="text-[#9a7a62] text-xs">{label}</p>
        <p className="font-cormorant italic text-[#2c1810] text-2xl font-light leading-none">{value}</p>
      </div>
    </div>
  );
}

export default function AddWorkCreditPage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workCredits, setWorkCredits] = useState([]);
  const [history, setHistory] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => { fetchWorkCredits(); fetchHistory(); fetchSubscriptions(); }, []);

  const fetchWorkCredits = async () => {
    try {
      const r = await fetch("/api/user/get-all-work-credit");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to fetch work credits");
      setWorkCredits(d.workCredits);
    } catch (e) { toast.error(e.message); }
  };
  const fetchHistory = async () => {
    try {
      const r = await fetch("/api/user/get-work-credit-history");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to fetch history");
      setHistory(d.history);
    } catch (e) { toast.error(e.message); }
  };
  const fetchSubscriptions = async () => {
    try {
      const r = await fetch("/api/user/auto-credit-subscriptions");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to fetch subscriptions");
      setSubscriptions(d.subscriptions || []);
    } catch (e) { toast.error(e.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const r = await fetch("/api/user/add-work-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount: parseFloat(amount) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Something went wrong");
      toast.success("Work credit added!");
      setEmail(""); setAmount("");
      await fetchWorkCredits(); await fetchHistory();
    } catch (e) { toast.error(e.message); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (userEmail) => {
    try {
      const r = await fetch("/api/user/delete-work-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to delete");
      toast.success("Work credit deleted!");
      await fetchWorkCredits(); await fetchHistory();
    } catch (e) { toast.error(e.message); }
  };

  const totalCredits = workCredits.reduce((s, c) => s + c.amount, 0);
  const totalUsers = workCredits.length;
  const activeSubscriptions = subscriptions.filter((s) => s.is_active).length;
  const monthlyAutoCredits = subscriptions.filter((s) => s.is_active).reduce((s, c) => s + c.monthly_amount, 0);

  return (
    <AdminShell>
      <AdminHero
        eyebrow="Admin"
        title="Work Credits"
        subtitle="Mama Coins & automated subscriptions"
      />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatPill icon={CurrencyDollarIcon} label="Total Credits" value={`${totalCredits.toLocaleString()} kr`} />
          <StatPill icon={UserGroupIcon} label="Active Users" value={totalUsers} />
          <StatPill icon={ClockIcon} label="Auto Subscriptions" value={activeSubscriptions} />
          <StatPill icon={ChartBarIcon} label="Monthly Auto" value={`${monthlyAutoCredits.toLocaleString()} kr`} />
        </div>

        <div className="h-px mb-8" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.2), transparent)" }} />

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Add credit form */}
          <div className="lg:col-span-1">
            <Panel title="Add Work Credit" subtitle="Assign credits instantly" icon={PlusIcon}>
              <WorkCreditForm
                email={email} amount={amount} isLoading={isLoading}
                onEmailChange={(e) => setEmail(e.target.value)}
                onAmountChange={(e) => setAmount(e.target.value)}
                onSubmit={handleSubmit}
              />
            </Panel>
          </div>

          {/* Tables */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Panel title="Current Work Credits" subtitle="Active balances by user" icon={CreditCardIcon}>
              <WorkCreditList workCredits={workCredits} onDelete={handleDelete} />
            </Panel>
            <Panel title="Auto-Credit Subscriptions" subtitle="Monthly credit assignments" icon={ClockIcon}>
              <AutoCreditSubscriptions subscriptions={subscriptions} onRefresh={fetchSubscriptions} />
            </Panel>
            <Panel title="Transaction History" subtitle="Full audit trail" icon={ChartBarIcon}>
              <WorkCreditHistory history={history} />
            </Panel>
          </div>
        </div>
    </AdminShell>
  );
}
