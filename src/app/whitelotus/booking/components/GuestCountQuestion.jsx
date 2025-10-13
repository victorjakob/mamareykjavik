import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  UserIcon,
  UserGroupIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

const guestCountOptions = [
  {
    id: "undir-10",
    label: "Undir 10",
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

export default function GuestCountQuestion({ formData, updateFormData, t }) {
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
            <span className="font-light text-sm">Bæta við athugasemd</span>
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
                <span>Athugasemd (valfrjálst)</span>
              </label>
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder="Skrifaðu hér ef þú vilt bæta við athugasemd..."
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
