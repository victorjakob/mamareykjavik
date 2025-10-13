import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftIcon,
  SparklesIcon,
  MoonIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

const tableclothOptions = [
  {
    id: "white",
    label: "Hvítir dúkar",
    icon: SparklesIcon,
  },
  {
    id: "black",
    label: "Svartir dúkar",
    icon: MoonIcon,
  },
  {
    id: "own",
    label: "Kem með mína",
    icon: PaintBrushIcon,
  },
];

export default function TableclothQuestion({ formData, updateFormData, t }) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [napkins, setNapkins] = useState("");
  const [candles, setCandles] = useState("");

  useEffect(() => {
    setComment(formData.tableclothComment || "");
    setNapkins(formData.napkins || "");
    setCandles(formData.candles || "");
    if (formData.tableclothComment) {
      setShowComment(true);
    }
  }, [formData.tableclothComment, formData.napkins, formData.candles]);

  const handleSelection = (tablecloth) => {
    updateFormData({
      tablecloth,
      tableclothComment: comment,
      napkins,
      candles,
    });
  };

  const handleNapkinsSelection = (value) => {
    setNapkins(value);
    updateFormData({
      tablecloth: formData.tablecloth,
      napkins: value,
      candles,
      tableclothComment: comment,
    });
  };

  const handleCandlesSelection = (value) => {
    setCandles(value);
    updateFormData({
      tablecloth: formData.tablecloth,
      napkins,
      candles: value,
      tableclothComment: comment,
    });
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    updateFormData({
      tablecloth: formData.tablecloth,
      napkins,
      candles,
      tableclothComment: newComment,
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
        Borðbúnaður
      </h2>

      <div className="max-w-2xl mx-auto">
        {/* Dúkar (Tablecloths) */}
        <div className="mb-8">
          <h3 className="text-lg font-light text-[#fefff5] mb-4 text-center">
            Dúkar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tableclothOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelection(option.id)}
                  className={`
                    p-5 rounded-lg border transition-all duration-200
                    ${
                      formData.tablecloth === option.id
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
                  <div className="flex flex-col items-center text-center space-y-2">
                    <IconComponent className="w-7 h-7 text-[#a77d3b]" />
                    <div className="font-light text-[#fefff5] text-sm">
                      {option.label}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-[#a77d3b]/20"></div>
          <div className="px-4">
            <div className="w-2 h-2 rounded-full bg-[#a77d3b]/30"></div>
          </div>
          <div className="flex-1 border-t border-[#a77d3b]/20"></div>
        </div>

        {/* Servettur (Napkins) */}
        <div className="mb-8">
          <h3 className="text-lg font-light text-[#fefff5] mb-4 text-center">
            Vantar þig servettur?
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => handleNapkinsSelection("yes")}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${
                  napkins === "yes"
                    ? "border-[#a77d3b] bg-[#a77d3b]/10"
                    : "border-slate-600/30 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="font-light text-[#fefff5] text-center">Já</div>
            </motion.button>
            <motion.button
              onClick={() => handleNapkinsSelection("own")}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${
                  napkins === "own"
                    ? "border-[#a77d3b] bg-[#a77d3b]/10"
                    : "border-slate-600/30 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="font-light text-[#fefff5] text-center">
                Nei, Kem með
              </div>
            </motion.button>
          </div>
        </div>

        {/* Separator */}
        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-[#a77d3b]/20"></div>
          <div className="px-4">
            <div className="w-2 h-2 rounded-full bg-[#a77d3b]/30"></div>
          </div>
          <div className="flex-1 border-t border-[#a77d3b]/20"></div>
        </div>

        {/* Kerti (Candles) */}
        <div className="mb-8">
          <h3 className="text-lg font-light text-[#fefff5] mb-4 text-center">
            Vantar þig kerti?
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => handleCandlesSelection("yes")}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${
                  candles === "yes"
                    ? "border-[#a77d3b] bg-[#a77d3b]/10"
                    : "border-slate-600/30 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="font-light text-[#fefff5] text-center">Já</div>
            </motion.button>
            <motion.button
              onClick={() => handleCandlesSelection("own")}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${
                  candles === "own"
                    ? "border-[#a77d3b] bg-[#a77d3b]/10"
                    : "border-slate-600/30 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="font-light text-[#fefff5] text-center">
                Nei, kem með
              </div>
            </motion.button>
          </div>
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
