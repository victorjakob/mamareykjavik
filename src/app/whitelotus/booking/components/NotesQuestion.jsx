import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function NotesQuestion({ formData, updateFormData, t }) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (formData.notes) {
      setNotes(formData.notes);
    }
  }, [formData.notes]);

  const handleNotesChange = (value) => {
    setNotes(value);
    updateFormData({ notes: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Athugasemdir og spurningar
      </h2>

      <div className="text-center mb-6">
        <p className="text-[#fefff5] font-light">
          Er eitthvað sérstakt sem við ættum að vita um viðburðinn þinn?
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Skrifaðu hér allar athugasemdir, sérstakar óskir, spurningar eða annað sem við ættum að vita..."
          rows={6}
          maxLength={500}
          className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] placeholder-slate-400 focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all resize-none"
          whileFocus={{ scale: 1.02 }}
        />

        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-slate-400 font-light">
            {notes.length}/500 stafir
          </p>
          <p className="text-sm text-slate-500 font-light">Valkvætt</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-[#a77d3b]/20 border border-[#a77d3b]/30 rounded-xl"
        >
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#a77d3b] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#fefff5] text-sm">💭</span>
            </div>
            <div className="text-sm text-[#fefff5]">
              <p className="font-light mb-1">Allt sem þú vilt segja</p>
              <p className="font-light">
                Til dæmis: sérstakar óskir, mataróskir, aðstæður gesta,
                spurningar eða eitthvað annað sem við ættum að vita.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 bg-[#a77d3b]/20 border border-[#a77d3b]/30 rounded-xl"
        >
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#a77d3b] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#fefff5] text-sm">🤝</span>
            </div>
            <div className="text-sm text-[#fefff5]">
              <p className="font-light mb-1">Við erum hér til að hjálpa</p>
              <p className="font-light">
                Ef þú hefur spurningar eða þarfnast ráðgjöf, ekki hika við að
                spyrja. Við höfum reynslu af mörgum mismunandi viðburðum.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
