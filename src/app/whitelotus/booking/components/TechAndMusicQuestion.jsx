import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  InformationCircleIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

export default function TechAndMusicQuestion({ formData, updateFormData, t }) {
  const [techData, setTechData] = useState({
    djOnSite: null,
    djBringsOwnController: null,
    needsMicrophone: null,
    liveBand: null,
    useProjector: null,
    useLightsAndDiscoBall: null,
    equipmentBrought: "",
    comment: "",
  });
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    if (formData.techAndMusic) {
      setTechData({
        djOnSite: formData.techAndMusic.djOnSite,
        djBringsOwnController: formData.techAndMusic.djBringsOwnController,
        needsMicrophone: formData.techAndMusic.needsMicrophone,
        liveBand: formData.techAndMusic.liveBand,
        useProjector: formData.techAndMusic.useProjector,
        useLightsAndDiscoBall: formData.techAndMusic.useLightsAndDiscoBall,
        equipmentBrought: formData.techAndMusic.equipmentBrought || "",
        comment: formData.techAndMusic.comment || "",
      });
      if (formData.techAndMusic.comment) {
        setShowComment(true);
      }
    }
  }, [formData.techAndMusic]);

  const handleYesNoChange = (field, value) => {
    const newTechData = { ...techData, [field]: value };

    // If "Verður DJ á staðnum?" is set to false or null, reset "Kemur DJ með eigin spilara/controller?" to null
    if (field === "djOnSite" && (value === false || value === null)) {
      newTechData.djBringsOwnController = null;
    }

    setTechData(newTechData);
    updateFormData({ techAndMusic: newTechData });
  };

  const handleEquipmentChange = (e) => {
    const value = e.target.value;
    const newTechData = { ...techData, equipmentBrought: value };
    setTechData(newTechData);
    updateFormData({ techAndMusic: newTechData });
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    const newTechData = { ...techData, comment: value };
    setTechData(newTechData);
    updateFormData({ techAndMusic: newTechData });
  };

  const YesNoButton = ({ label, value, onChange, tooltip }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-light text-[#fefff5]">
          {label}
        </label>
        {tooltip && (
          <div className="group relative">
            <InformationCircleIcon className="w-4 h-4 text-[#a77d3b] cursor-help flex-shrink-0" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10 w-72 p-3 bg-slate-900/95 backdrop-blur-sm border border-slate-600/30 rounded-lg text-xs font-light text-[#fefff5] shadow-xl pointer-events-none">
              {tooltip}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-600/30"></div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3 items-center">
        <motion.button
          onClick={() => onChange(true)}
          className={`
            flex-1 p-3 border rounded-xl text-[#fefff5] font-light transition-all duration-200
            ${
              value === true
                ? "bg-[#a77d3b]/20 border-[#a77d3b] text-[#a77d3b]"
                : "border-slate-600/30 hover:border-[#a77d3b]/50 hover:bg-slate-800/50 bg-slate-900/30"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("yes")}
        </motion.button>
        <motion.button
          onClick={() => onChange(false)}
          className={`
            flex-1 p-3 border rounded-xl text-[#fefff5] font-light transition-all duration-200
            ${
              value === false
                ? "bg-[#a77d3b]/20 border-[#a77d3b] text-[#a77d3b]"
                : "border-slate-600/30 hover:border-[#a77d3b]/50 hover:bg-slate-800/50 bg-slate-900/30"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("no")}
        </motion.button>
        <motion.button
          onClick={() => onChange(null)}
          className={`
            w-12 h-12 border rounded-xl text-[#fefff5] font-light transition-all duration-200 flex items-center justify-center
            ${
              value === null
                ? "bg-[#a77d3b]/20 border-[#a77d3b] text-[#a77d3b]"
                : "border-slate-600/30 hover:border-[#a77d3b]/50 hover:bg-slate-800/50 bg-slate-900/30"
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={t("unknown")}
        >
          ?
        </motion.button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-20"
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        {t("techTitle")}
      </h2>

      {/* Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto mb-8"
      >
        <div className="bg-[#a77d3b]/10 border border-[#a77d3b]/30 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-light text-[#a77d3b] mb-4 text-center">
            {t("weOffer")}
          </h3>
          <div className="space-y-2 text-[#fefff5]/70 font-light text-sm">
            <p>• {t("techOffer1")}</p>
            <p>• {t("techOffer2")}</p>
            <p>• {t("techOffer3")}</p>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-600/30 rounded-xl p-6">
          <h3 className="text-sm font-light text-[#a77d3b] mb-4 text-center">
            {t("additionalOptions")}
          </h3>
          <div className="space-y-2 text-[#fefff5]/70 font-light text-sm">
            <p>• {t("techOption1")}</p>
            <p>• {t("techOption2")}</p>
          </div>
        </div>
      </motion.div>

      {/* Questions */}
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <YesNoButton
            label={t("djOnSite")}
            value={techData.djOnSite}
            onChange={(value) => handleYesNoChange("djOnSite", value)}
            tooltip={t("techTooltip1")}
          />
        </motion.div>

        <AnimatePresence>
          {techData.djOnSite === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <YesNoButton
                label={t("djBringsController")}
                value={techData.djBringsOwnController}
                onChange={(value) =>
                  handleYesNoChange("djBringsOwnController", value)
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <YesNoButton
            label={t("needsMicrophone")}
            value={techData.needsMicrophone}
            onChange={(value) => handleYesNoChange("needsMicrophone", value)}
            tooltip={t("techTooltip2")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <YesNoButton
            label={t("liveBand")}
            value={techData.liveBand}
            onChange={(value) => handleYesNoChange("liveBand", value)}
            tooltip={t("techTooltip3")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <YesNoButton
            label={t("useProjector")}
            value={techData.useProjector}
            onChange={(value) => handleYesNoChange("useProjector", value)}
            tooltip={t("techTooltip4")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <YesNoButton
            label={t("useLights")}
            value={techData.useLightsAndDiscoBall}
            onChange={(value) =>
              handleYesNoChange("useLightsAndDiscoBall", value)
            }
          />
        </motion.div>

        {/* Equipment Text Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            {t("equipmentBrought")}
          </label>
          <motion.input
            type="text"
            value={techData.equipmentBrought}
            onChange={handleEquipmentChange}
            placeholder={t("equipmentPlaceholder")}
            className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] font-light placeholder-slate-400 focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all"
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>

        {/* Optional Comment Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
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
                  value={techData.comment}
                  onChange={handleCommentChange}
                  placeholder={t("commentPlaceholder")}
                  rows={3}
                  className="w-full p-3 bg-slate-900/30 border border-slate-600/30 rounded-lg text-[#fefff5] font-light placeholder:text-[#fefff5]/30 focus:outline-none focus:border-[#a77d3b]/50 transition-colors resize-none"
                />
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
