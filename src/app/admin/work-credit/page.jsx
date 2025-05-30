"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import WorkCreditForm from "./components/WorkCreditForm";
import WorkCreditList from "./components/WorkCreditList";
import WorkCreditHistory from "./components/WorkCreditHistory";

export default function AddWorkCreditPage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workCredits, setWorkCredits] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchWorkCredits();
    fetchHistory();
  }, []);

  const fetchWorkCredits = async () => {
    try {
      const response = await fetch("/api/user/get-all-work-credit");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch work credits");
      }
      setWorkCredits(data.workCredits);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/user/get-work-credit-history");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch history");
      setHistory(data.history);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/add-work-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: parseFloat(amount),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      toast.success("Work credit added successfully!");
      setEmail("");
      setAmount("");
      await fetchWorkCredits();
      await fetchHistory();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userEmail) => {
    try {
      const response = await fetch("/api/user/delete-work-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete work credit");
      }
      toast.success("Work credit deleted successfully!");
      await fetchWorkCredits();
      await fetchHistory();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Add Work Credit
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Assign work credits to users
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <WorkCreditForm
            email={email}
            amount={amount}
            isLoading={isLoading}
            onEmailChange={(e) => setEmail(e.target.value)}
            onAmountChange={(e) => setAmount(e.target.value)}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12">
        <WorkCreditList workCredits={workCredits} onDelete={handleDelete} />
      </div>
      <WorkCreditHistory history={history} />
    </div>
  );
}
