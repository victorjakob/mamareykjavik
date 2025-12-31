import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  UserIcon,
  UserGroupIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

export default function GuestCountQuestion({ formData, updateFormData, t }) {
  const guestCountOptions = [
    {
      id: "undir-10",
      label: t("under10"),
    },
  {
    id: "10-25",
    label: "10-25",
  },
  {
    id: "26-50",
    label: "26-50",
  },
  {
    id: "51-75",
    label: "51-75",
  },
  {
    id: "76-100",
    label: "76-100",
  },
  {
    id: "100+",
    label: "100+",
  },
];
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment(formData.guestCountComment || "");
    if (formData.guestCountComment) {
      setShowComment(true);
    }
  }, [formData.guestCountComment]);

  const handleSelection = (guestCount) => {
    updateFormData({ guestCount, guestCountComment: comment });
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    updateFormData({
      guestCount: formData.guestCount,
      guestCountComment: newComment,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-20"
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        {t("guestCountTitle")}
      </h2>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {guestCountOptions.map((option, index) => (
            <motion.button
              key={option.id}
              onClick={() => handleSelection(option.id)}
              className={`
                p-4 rounded-lg border transition-all duration-200 text-center
                ${
                  formData.guestCount === option.id
                    ? "border-[#a77d3b] bg-[#a77d3b]/10"
                    : "border-slate-600/30 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex flex-col items-center space-y-2">
                <UsersIcon className="w-6 h-6 text-[#a77d3b]" />
                <div className="font-light text-[#fefff5]">{option.label}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Staff Requirements Info */}
      <div className="max-w-2xl mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-[#a77d3b]/10 border border-[#a77d3b]/30 rounded-xl p-4 md:p-5"
        >
          <div className="flex items-start gap-3">
            <UserGroupIcon className="w-5 h-5 text-[#a77d3b] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm md:text-base text-[#fefff5] font-light leading-relaxed">
                <span className="font-medium">{t("staffCostInfo")}</span> {t("staffCostDetails")}
              </p>
              <p className="text-sm md:text-base text-[#fefff5] font-light leading-relaxed mt-2">
                {t("staffCostPrice")} <span className="font-medium">{t("staffCostPerHour")}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Optional Comment Section */}
      <div className="max-w-2xl mx-auto mt-8">
        {!showComment ? (
          <motion.button
            onClick={() => setShowComment(true)}
            className="flex items-center space-x-2 text-[#fefff5]/70 hover:text-[#a77d3b] transition-colors duration-200 mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="font-light text-sm">{t("addComment")}</span>
          </motion.button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label className="flex items-center space-x-2 text-[#fefff5]/70 text-sm font-light">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{t("comment")}</span>
              </label>
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder={t("commentPlaceholder")}
                rows={3}
                className="w-full p-3 bg-slate-900/30 border border-slate-600/30 rounded-lg text-[#fefff5] font-light placeholder:text-[#fefff5]/30 focus:outline-none focus:border-[#a77d3b]/50 transition-colors resize-none"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
