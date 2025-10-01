"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  CurrencyDollarIcon,
  ClockIcon,
  PlusIcon,
  CreditCardIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import WorkCreditForm from "./components/WorkCreditForm";
import WorkCreditList from "./components/WorkCreditList";
import WorkCreditHistory from "./components/WorkCreditHistory";
import AutoCreditSubscriptions from "./components/AutoCreditSubscriptions";

export default function AddWorkCreditPage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workCredits, setWorkCredits] = useState([]);
  const [history, setHistory] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    fetchWorkCredits();
    fetchHistory();
    fetchSubscriptions();
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

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/user/auto-credit-subscriptions");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch subscriptions");
      }
      setSubscriptions(data.subscriptions || []);
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

  // Calculate statistics
  const totalCredits = workCredits.reduce(
    (sum, credit) => sum + credit.amount,
    0
  );
  const totalUsers = workCredits.length;
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.is_active
  ).length;
  const monthlyAutoCredits = subscriptions
    .filter((sub) => sub.is_active)
    .reduce((sum, sub) => sum + sub.monthly_amount, 0);

  return (
    <div className="min-h-screen pt-32">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
              <CurrencyDollarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              Work Credit Management
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage work credits and automated subscriptions
            </p>
            <div className="mt-6 flex justify-center">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-1">
                <div className="bg-white rounded-md px-4 py-2">
                  <div className="text-sm font-medium text-gray-900">
                    Total Credits
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {totalCredits.toLocaleString()} kr
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Credits
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {totalCredits.toLocaleString()} kr
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Auto Subscriptions
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {activeSubscriptions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Monthly Auto
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {monthlyAutoCredits.toLocaleString()} kr
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Add Credit Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-4">
                <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Add Work Credit
                </h2>
                <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                  Assign credits to users instantly
                </p>
              </div>
              <div className="p-4 sm:p-6">
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
          </div>

          {/* Right Column - Tables */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Credits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Current Work Credits
                </h2>
                <p className="text-green-100 text-sm mt-1">
                  Active credit balances by user
                </p>
              </div>
              <div className="p-6">
                <WorkCreditList
                  workCredits={workCredits}
                  onDelete={handleDelete}
                />
              </div>
            </div>

            {/* Auto Subscriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Auto-Credit Subscriptions
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Automated monthly credit assignments
                </p>
              </div>
              <div className="p-6">
                <AutoCreditSubscriptions
                  subscriptions={subscriptions}
                  onRefresh={fetchSubscriptions}
                />
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Transaction History
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Complete audit trail of all credit operations
                </p>
              </div>
              <div className="p-6">
                <WorkCreditHistory history={history} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
