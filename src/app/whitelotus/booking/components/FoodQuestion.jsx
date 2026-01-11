import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChatBubbleLeftIcon,
  BeakerIcon,
  FireIcon,
  CakeIcon,
} from "@heroicons/react/24/outline";

// mainFoodOptions will be created inside component to use translations

const buffetOptions = [
  {
    id: "classic",
    label: "Classic",
    price: "13.900 kr",
  },
  {
    id: "simplified",
    label: "Einfaldað",
    price: "11.900 kr",
  },
];

const platedOptions = [
  {
    id: "3course",
    label: "3 rétta",
    price: "13.900 kr pp",
  },
  {
    id: "2course",
    label: "2 rétta",
    price: "10.900 kr pp",
  },
];

const fingerFoodOptions = [
  {
    id: "half",
    label: "Hálfur",
    description: "5-6 stk á mann",
    price: "3.900 kr",
  },
  {
    id: "full",
    label: "Heill",
    description: "10-12 stk á mann",
    price: "5.900 kr",
  },
];

export default function FoodQuestion({ formData, updateFormData, t }) {
  const mainFoodOptions = [
    {
      id: "buffet",
      label: t("buffet"),
      imageUrl: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1768120411/buffet_jux7ro.png",
    },
    {
      id: "plated",
      label: t("plated"),
      imageUrl: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1768120411/plated_lflveu.png",
    },
    {
      id: "fingerFood",
      label: t("fingerFood"),
      imageUrl: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1768120412/finger-food_fkodme.png",
    },
  ];

  const buffetOptions = [
    {
      id: "classic",
      label: t("classic"),
      price: `13.900 kr ${t("perPerson")}`,
    },
    {
      id: "simplified",
      label: t("simplified"),
      price: `11.900 kr ${t("perPerson")}`,
    },
  ];

  const platedOptions = [
    {
      id: "3course",
      label: t("threeCourse"),
      price: "13.900 kr pp",
    },
    {
      id: "2course",
      label: t("twoCourse"),
      price: "10.900 kr pp",
    },
  ];

  const fingerFoodOptions = [
    {
      id: "half",
      label: t("half"),
      description: t("halfDescription"),
      price: `3.900 kr ${t("perPerson")}`,
    },
    {
      id: "full",
      label: t("full"),
      description: t("fullDescription"),
      price: `5.900 kr ${t("perPerson")}`,
    },
  ];

  const [foodDetail, setFoodDetail] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setFoodDetail(formData.foodDetail || "");
    setComment(formData.foodComment || "");
    if (formData.foodComment) {
      setShowComment(true);
    }
  }, [formData.foodDetail, formData.foodComment]);

  const handleMainSelection = (foodType) => {
    // Clear detail when changing main food type
    setFoodDetail("");
    updateFormData({
      food: foodType,
      foodDetail: "",
      foodComment: comment,
    });
  };

  const handleDetailSelection = (detailId) => {
    setFoodDetail(detailId);
    updateFormData({
      food: formData.food,
      foodDetail: detailId,
      foodComment: comment,
    });
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    updateFormData({
      food: formData.food,
      foodDetail,
      foodComment: newComment,
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
        {t("whatKindOfFood")}
      </h2>

      {/* Main Food Options - 3 columns */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="grid grid-cols-3 gap-4">
          {mainFoodOptions.map((option, index) => {
            return (
              <motion.button
                key={option.id}
                onClick={() => handleMainSelection(option.id)}
                className={`
                  p-5 rounded-lg border transition-all duration-200
                  ${
                    formData.food === option.id
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
                <div className="flex flex-col items-center space-y-2">
                  <Image
                    src={option.imageUrl}
                    alt={option.label}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                  <div className="font-light text-[#fefff5]">
                    {option.label}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Conditional Detail Options based on main selection */}
      <AnimatePresence mode="wait">
        {formData.food === "buffet" && (
          <motion.div
            key="buffet-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="grid grid-cols-2 gap-4">
              {buffetOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleDetailSelection(option.id)}
                  className={`
                    p-4 rounded-lg border transition-all duration-200
                    ${
                      foodDetail === option.id
                        ? "border-[#a77d3b] bg-[#a77d3b]/10"
                        : "border-slate-600/30 hover:border-[#a77d3b]/50"
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div className="font-light text-[#fefff5]">
                      {option.label}
                    </div>
                    <div className="text-sm text-[#a77d3b] font-light">
                      {option.price}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {formData.food === "plated" && (
          <motion.div
            key="plated-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="grid grid-cols-2 gap-4">
              {platedOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleDetailSelection(option.id)}
                  className={`
                    p-4 rounded-lg border transition-all duration-200
                    ${
                      foodDetail === option.id
                        ? "border-[#a77d3b] bg-[#a77d3b]/10"
                        : "border-slate-600/30 hover:border-[#a77d3b]/50"
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div className="font-light text-[#fefff5]">
                      {option.label}
                    </div>
                    <div className="text-sm text-[#a77d3b] font-light">
                      {option.price}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {formData.food === "fingerFood" && (
          <motion.div
            key="fingerfood-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="grid grid-cols-2 gap-4">
              {fingerFoodOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleDetailSelection(option.id)}
                  className={`
                    p-4 rounded-lg border transition-all duration-200
                    ${
                      foodDetail === option.id
                        ? "border-[#a77d3b] bg-[#a77d3b]/10"
                        : "border-slate-600/30 hover:border-[#a77d3b]/50"
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div className="font-light text-[#fefff5]">
                      {option.label}
                    </div>
                    <div className="text-xs text-[#fefff5]/70 font-light">
                      {option.description}
                    </div>
                    <div className="text-sm text-[#a77d3b] font-light">
                      {option.price}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
