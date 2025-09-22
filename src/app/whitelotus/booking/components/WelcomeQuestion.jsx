import { motion } from "framer-motion";

export default function WelcomeQuestion({ formData, updateFormData, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-4"
    >
      <h2 className="text-3xl font-bold text-stone-100">
        Velkomin í White Lotus
      </h2>
      <p className="text-lg text-stone-200 leading-relaxed">
        Láttu okkur hjálpa þér að skipuleggja fullkominn viðburð
      </p>
    </motion.div>
  );
}
