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
      className="mt-20"
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
          className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] placeholder-slate-400 focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all resize-none font-light"
          whileFocus={{ scale: 1.02 }}
        />

        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-slate-400 font-light">
            {notes.length}/500 stafir
          </p>
          <p className="text-sm text-slate-500 font-light">Valkvætt</p>
        </div>
      </div>
    </motion.div>
  );
}
