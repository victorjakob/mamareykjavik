"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Gift,
  Calendar,
  Loader2,
  AlertCircle,
  Mail,
  MapPin,
  Package,
  CheckCircle,
} from "lucide-react";
import { formatPrice } from "@/util/IskFormat";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export default function GiftCardPage() {
  const params = useParams();
  const token = params.token;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarkingPickedUp, setIsMarkingPickedUp] = useState(false);

  const fetchCard = async () => {
    if (!token) {
      setError("Token is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/gift-cards/by-token/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load gift card");
      }

      setCard(data.card);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCard();
    } else {
      setError("Token is required");
      setLoading(false);
    }
  }, [token]);

  const handleMarkPickedUp = async () => {
    if (!card || card.picked_up) return;

    setIsMarkingPickedUp(true);
    try {
      const response = await fetch("/api/gift-cards/mark-picked-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark as picked up");
      }

      // Update local state
      setCard(data.card);
      toast.success("Gift card marked as picked up!");
    } catch (err) {
      toast.error(err.message || "Failed to mark as picked up");
      console.error("Error marking as picked up:", err);
    } finally {
      setIsMarkingPickedUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-gray-900 mb-2">
            Gift Card Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const isPaid = card.status === "paid";
  const isPickedUp = card.picked_up === true;
  const isPickupDelivery = card.delivery_method === "pickup";
  const isEmailDelivery = card.delivery_method === "email";
  const canMarkPickedUp = isPickupDelivery && isPaid && !isPickedUp;
  const isProcessing = isEmailDelivery && isPaid && !card.dineout_code;

  const deliveryMethodLabels = {
    email: "Email Delivery",
    pickup: "Pick Up at Store",
    mail: "Mail Delivery",
  };

  const deliveryIcons = {
    email: Mail,
    pickup: MapPin,
    mail: Package,
  };

  const DeliveryIcon = deliveryIcons[card.delivery_method] || Package;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 pt-24 pb-8 sm:pt-32 sm:pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {/* Header */}
          <div className="text-right sm:text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tighter">
              Gift Card
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Mama Reykjavik</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Processing Banner (for email delivery, waiting for dineout_code) */}
            {isProcessing && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 sm:px-6 py-3 text-center">
                <p className="text-sm sm:text-base font-semibold text-white flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing - Your gift card will be activated within 48 hours
                </p>
              </div>
            )}

            {/* Active Banner (for email delivery, dineout_code added) */}
            {isEmailDelivery && isPaid && card.dineout_code && (
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-6 py-3 text-center">
                <p className="text-sm sm:text-base font-semibold text-white flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Active - Your gift card is ready to use!
                </p>
              </div>
            )}

            {/* Claimed Banner (if picked up) */}
            {isPickedUp && (
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-6 py-3 text-center">
                <p className="text-sm sm:text-base font-semibold text-white flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Claimed - Gift card has been picked up
                </p>
              </div>
            )}

            {/* Proof of Purchase Banner (for pickup, not yet picked up) */}
            {isPickupDelivery && isPaid && !isPickedUp && (
              <div className="bg-gradient-to-r from-orange-500 to-emerald-500 px-4 sm:px-6 py-3 text-center">
                <p className="text-sm sm:text-base font-semibold text-white">
                  ✓ Proof of Purchase - Show this page when picking up
                </p>
              </div>
            )}

            {/* Pending Payment Banner */}
            {!isPaid && (
              <div className="bg-yellow-100 px-4 sm:px-6 py-3 text-center">
                <p className="text-xs sm:text-sm text-yellow-800">
                  Payment pending
                </p>
              </div>
            )}

            <div className="p-4 sm:p-6 md:p-8">
              {/* Amount Display */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-block">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative"
                  >
                    <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-white flex flex-col items-center justify-center">
                        <Gift className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-orange-600 mb-2" />
                        <span className="text-lg sm:text-xl md:text-2xl font-light text-gray-900">
                          {formatPrice(card.amount)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-4">
                  Original Gift Card Amount
                </p>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 p-3 sm:p-4 rounded-xl border border-orange-100/50">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        Original Amount
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {formatPrice(card.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 p-3 sm:p-4 rounded-xl border border-orange-100/50">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <DeliveryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        Delivery Method
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {deliveryMethodLabels[card.delivery_method]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dineout Code Display (for email delivery when activated) */}
              {isEmailDelivery && card.dineout_code && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-5 rounded-xl border-2 border-emerald-300 mb-4 sm:mb-6">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-emerald-700 mb-2 font-medium">
                      Gift Card Code
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-900 font-mono tracking-wider">
                      {card.dineout_code}
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-600 mt-2">
                      Use this code at Mama Reykjavik
                    </p>
                  </div>
                </div>
              )}

              {/* Cardholder Info */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Purchased By
                </p>
                <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                  {card.buyer_name}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  {card.buyer_email}
                </p>
              </div>

              {/* Pick Up Button (for pickup delivery, not yet picked up) */}
              {canMarkPickedUp && (
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMarkPickedUp}
                    disabled={isMarkingPickedUp}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isMarkingPickedUp ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Marking as picked up...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Mark as Picked Up</span>
                      </>
                    )}
                  </motion.button>
                  <p className="text-xs sm:text-sm text-gray-500 text-center mt-3">
                    Click this button when the customer picks up the gift card
                    at the store
                  </p>
                </div>
              )}

              {/* Purchase Info */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">
                  Purchase Information
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Purchased on{" "}
                      {format(new Date(card.created_at), "MMMM d, yyyy")}
                    </span>
                  </div>
                  {isPickedUp && card.picked_up_at && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Picked up on{" "}
                        {format(
                          new Date(card.picked_up_at),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </span>
                    </div>
                  )}
                  {card.delivery_method === "pickup" && !isPickedUp && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Show this page at Mama Reykjavik to pick up your gift
                        card
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-gray-500">
            <p>Made with big love 🌱 Mama</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
