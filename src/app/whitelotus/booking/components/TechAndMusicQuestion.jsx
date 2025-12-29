import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function TechAndMusicQuestion({ formData, updateFormData, t }) {
  const [techData, setTechData] = useState({
    djOnSite: undefined,
    djBringsOwnController: undefined,
    needsMicrophone: undefined,
    liveBand: undefined,
    useProjector: undefined,
    useLightsAndDiscoBall: undefined,
    equipmentBrought: "",
  });

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
      });
    }
  }, [formData.techAndMusic]);

  const handleYesNoChange = (field, value) => {
    const newTechData = { ...techData, [field]: value };
    setTechData(newTechData);
    updateFormData({ techAndMusic: newTechData });
  };

  const handleEquipmentChange = (e) => {
    const value = e.target.value;
    const newTechData = { ...techData, equipmentBrought: value };
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
          Já
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
          Nei
        </motion.button>
        <motion.button
          onClick={() => onChange(undefined)}
          className={`
            w-12 h-12 border rounded-xl text-[#fefff5] font-light transition-all duration-200 flex items-center justify-center
            ${
              value === undefined
                ? "bg-[#a77d3b]/20 border-[#a77d3b] text-[#a77d3b]"
                : "border-slate-600/30 hover:border-[#a77d3b]/50 hover:bg-slate-800/50 bg-slate-900/30"
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Veit ekki enn"
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
        Tækni og tónlist
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
            Við bjóðum upp á:
          </h3>
          <div className="space-y-2 text-[#fefff5]/70 font-light text-sm">
            <p>• Öflugt hátalarakerfi, 4 toppar og 2 bassar (Bluetooth eða tenging í mixer)</p>
            <p>• Skjávarpa og HDMI snúru (þú kemur með tölvu eða millistykki ef þarf)</p>
            <p>• Ljós og diskókúlu</p>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-600/30 rounded-xl p-6">
          <h3 className="text-sm font-light text-[#a77d3b] mb-4 text-center">
            Viðbótarvalkostir:
          </h3>
          <div className="space-y-2 text-[#fefff5]/70 font-light text-sm">
            <p>• Hægt að leigja DJ controller hjá okkur (Pioneer einnig í boði sem rental)</p>
            <p>• Við eigum 1 míkrófón – þú kemur með aukamic ef þú þarft fleiri</p>
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
            label="Verður DJ á staðnum?"
            value={techData.djOnSite}
            onChange={(value) => handleYesNoChange("djOnSite", value)}
            tooltip="Hægt að leigja DJ controller hjá okkur"
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
                label="Kemur DJ með eigin spilara/controller?"
                value={techData.djBringsOwnController}
                onChange={(value) => handleYesNoChange("djBringsOwnController", value)}
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
            label="Þarftu míkrófón?"
            value={techData.needsMicrophone}
            onChange={(value) => handleYesNoChange("needsMicrophone", value)}
            tooltip="Við eigum 1 míkrófón"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <YesNoButton
            label="Verður Live hljómsveit?"
            value={techData.liveBand}
            onChange={(value) => handleYesNoChange("liveBand", value)}
            tooltip="Við erum með 6 rása mixer til staðar. Gott að bóka sound check fyrir hljómsveit ef mikið af búnaði er notað"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <YesNoButton
            label="Viltu nota skjávarpa?"
            value={techData.useProjector}
            onChange={(value) => handleYesNoChange("useProjector", value)}
            tooltip="HDMI snúra á staðnum, þú kemur með tölvu"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <YesNoButton
            label="Viltu nota ljós og diskókúlu?"
            value={techData.useLightsAndDiscoBall}
            onChange={(value) => handleYesNoChange("useLightsAndDiscoBall", value)}
          />
        </motion.div>

        {/* Equipment Text Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            Búnaður sem verður með í viðburði
          </label>
          <motion.input
            type="text"
            value={techData.equipmentBrought}
            onChange={handleEquipmentChange}
            placeholder="T.d. hljóðfæri, magnarar, snúrur o.s.frv."
            className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] font-light placeholder-slate-400 focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all"
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

