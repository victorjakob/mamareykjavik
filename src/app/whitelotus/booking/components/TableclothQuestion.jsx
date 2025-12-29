import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function TableclothQuestion({ formData, updateFormData, t }) {
  const [tableclothData, setTableclothData] = useState({
    wantsToRentTablecloths: undefined,
    tableclothColor: "",
    needsNapkins: undefined,
    needsCandles: undefined,
    decorationComments: "",
  });

  useEffect(() => {
    if (formData.tableclothData) {
      setTableclothData(formData.tableclothData);
    }
  }, [formData.tableclothData]);

  const handleUpdate = (updates) => {
    const newData = { ...tableclothData, ...updates };
    setTableclothData(newData);
    updateFormData({ tableclothData: newData });
  };

  const YesNoButton = ({ label, value, onChange, tooltip, note }) => (
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
      {note && (
        <p className="text-xs text-[#a77d3b]/70 font-light italic">
          {note}
        </p>
      )}
      <div className="flex gap-4">
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
        Borðbúnaður & skreytingar
      </h2>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Rent Tablecloths Question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <YesNoButton
            label="Viltu leigja dúka frá okkur?"
            value={tableclothData.wantsToRentTablecloths}
            onChange={(value) => handleUpdate({ wantsToRentTablecloths: value })}
            tooltip="Leiga á dúkum bætist við heildarverð."
          />
        </motion.div>

        {/* Tablecloth Options - Only show if wantsToRentTablecloths is true */}
        <AnimatePresence>
          {tableclothData.wantsToRentTablecloths === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tablecloth Color Selection */}
              <div>
                <label className="block text-sm font-light text-[#fefff5] mb-3">
                  Veldu lit á dúkum
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    onClick={() => handleUpdate({ tableclothColor: "white" })}
                    className={`
                      p-4 border rounded-xl transition-all duration-200
                      ${
                        tableclothData.tableclothColor === "white"
                          ? "border-[#a77d3b] bg-[#a77d3b]/10"
                          : "border-slate-600/30 hover:border-[#a77d3b]/50 bg-slate-900/30"
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-light text-[#fefff5] text-center">
                      Hvítir dúkar
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={() => handleUpdate({ tableclothColor: "black" })}
                    className={`
                      p-4 border rounded-xl transition-all duration-200
                      ${
                        tableclothData.tableclothColor === "black"
                          ? "border-[#a77d3b] bg-[#a77d3b]/10"
                          : "border-slate-600/30 hover:border-[#a77d3b]/50 bg-slate-900/30"
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-light text-[#fefff5] text-center">
                      Svartir dúkar
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message when not renting tablecloths */}
        <AnimatePresence>
          {tableclothData.wantsToRentTablecloths === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#a77d3b]/10 border border-[#a77d3b]/30 rounded-xl p-4"
            >
              <p className="text-sm font-light text-[#fefff5] text-center">
                Borðin eru kringlótt 125 cm, mikilvægt að koma með ykkar eigin
                dúka fyrir borðin
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Napkins Question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <YesNoButton
            label="Þarftu servéttur frá okkur?"
            value={tableclothData.needsNapkins}
            onChange={(value) => handleUpdate({ needsNapkins: value })}
            tooltip="Við bjóðum upp á servéttur gegn auka-gjaldi. Hægt að koma með eigin án kostnaðar."
          />
        </motion.div>

        {/* Candles Question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <YesNoButton
            label="Þarftu kerti frá okkur?"
            value={tableclothData.needsCandles}
            onChange={(value) => handleUpdate({ needsCandles: value })}
            tooltip="Við eigum kerti til staðar gegn auka-gjaldi. Þú getur einnig komið með eigin kerti án kostnaðar."
          />
        </motion.div>

        {/* Decoration Comments */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            Athugasemdir um borðskreytingar
          </label>
          <motion.textarea
            value={tableclothData.decorationComments}
            onChange={(e) =>
              handleUpdate({ decorationComments: e.target.value })
            }
            placeholder=""
            rows={4}
            className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] font-light placeholder-slate-400 focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all resize-none"
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
