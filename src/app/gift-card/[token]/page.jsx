"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Gift, Calendar, Loader2, AlertCircle, Mail, MapPin, Package } from "lucide-react";
import { formatPrice } from "@/util/IskFormat";
import { format } from "date-fns";

export default function GiftCardPage() {
  const params = useParams();
  const token = params.token;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/gift-cards/by-token/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load gift card");
      }

      setCard(data.card);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCard();
    }
  }, [token]);

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

  const isActive = card.status === "paid" && card.remaining_balance > 0;
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 pt-24 sm:pt-28 pb-8 px-4">
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
            <p className="text-sm sm:text-base text-gray-600">
              Mama Reykjavik
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Status Banner */}
            {!isActive && (
              <div className="bg-gray-100 px-4 sm:px-6 py-3 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  {card.remaining_balance === 0
                    ? "Gift card fully used"
                    : "Gift card inactive"}
                </p>
              </div>
            )}

            {/* Proof of Purchase Banner (for pickup) */}
            {card.delivery_method === "pickup" && card.status === "paid" && (
              <div className="bg-gradient-to-r from-orange-500 to-emerald-500 px-4 sm:px-6 py-3 text-center">
                <p className="text-sm sm:text-base font-semibold text-white">
                  ✓ Proof of Purchase - Show this page when picking up
                </p>
              </div>
            )}

            <div className="p-4 sm:p-6 md:p-8">
              {/* Balance Display */}
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
                          {formatPrice(card.remaining_balance)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-4">
                  Remaining Balance
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
                {card.recipient_name && (
                  <>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1 mt-3">
                      Recipient
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                      {card.recipient_name}
                    </p>
                    {card.recipient_email && (
                      <p className="text-xs sm:text-sm text-gray-600 break-words">
                        {card.recipient_email}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">
                  How to Use
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0">
                      •
                    </span>
                    <span>
                      Use this gift card at Mama Reykjavik for any purchase
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0">
                      •
                    </span>
                    <span>Your gift card never expires</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0">
                      •
                    </span>
                    <span>
                      {card.delivery_method === "pickup"
                        ? "Show this page when picking up your gift card"
                        : card.delivery_method === "mail"
                        ? "Your physical gift card will arrive by mail"
                        : "This is your digital gift card - save this link!"}
                    </span>
                  </li>
                </ul>
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

