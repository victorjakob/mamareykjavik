import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  TableCellsIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  HomeIcon,
  PresentationChartBarIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

// roomSetups will be created inside component to use translations

export default function RoomSetupQuestion({ formData, updateFormData, t }) {
  const roomSetups = [
    {
      id: "seated",
      title: t("seated"),
      description: `${t("seatedDescription")} ${t("seatedMaxSeats")}`,
      icon: TableCellsIcon,
    },
    {
      id: "standing",
      title: t("standing"),
      description: `${t("standingDescription")} ${t("standingNote")}`,
      icon: UserGroupIcon,
    },
    {
      id: "mixed",
      title: t("mixed"),
      description: t("mixedDescription"),
      icon: ArrowsRightLeftIcon,
    },
    {
      id: "lounge",
      title: t("lounge"),
      description: t("loungeDescription"),
      icon: HomeIcon,
    },
    {
      id: "presentation",
      title: t("presentation"),
      description: t("presentationDescription"),
      icon: PresentationChartBarIcon,
    },
  ];

  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment(formData.roomSetupComment || "");
    if (formData.roomSetupComment) {
      setShowComment(true);
    }
  }, [formData.roomSetupComment]);

  const handleSelection = (setup) => {
    updateFormData({ roomSetup: setup, roomSetupComment: comment });
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    updateFormData({
      roomSetup: formData.roomSetup,
      roomSetupComment: newComment,
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
        {t("roomSetupTitle")}
      </h2>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomSetups.map((setup, index) => {
            const IconComponent = setup.icon;
            return (
              <motion.button
                key={setup.id}
                onClick={() => handleSelection(setup.id)}
                className={`
                  p-5 rounded-lg border transition-all duration-200
                  ${
                    formData.roomSetup === setup.id
                      ? "border-[#a77d3b] bg-[#a77d3b]/10"
                      : "border-slate-600/30 hover:border-[#a77d3b]/50"
                  }
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <IconComponent className="w-8 h-8 text-[#a77d3b]" />
                  <div>
                    <div className="font-light text-[#fefff5] text-lg mb-1">
                      {setup.title}
                    </div>
                    <div className="text-xs text-[#fefff5]/70 font-light">
                      {setup.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
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
