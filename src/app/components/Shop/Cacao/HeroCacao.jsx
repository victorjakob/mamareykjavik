import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa"; // Import the arrow icon

export default function HeroCacao() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/cacaohero.jpg')", // Replace with a cacao image URL
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center text-white px-6"
        >
          <h1 className="text-5xl tracking-tight font-extrabold leading-relaxed p-5">
            Experience the Magic of Cacao
          </h1>
          <p className="mt-4 text-lg">
            100% Organic Raw, Handcrafted with Love
          </p>

          {/* Downward Icon for Scrolling */}
          <motion.div
            whileHover={{ scale: 1.5 }} // Grow effect on hover
            whileTap={{ scale: 0.9 }} // Slight shrink on tap
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 1,
              ease: "easeOut",
            }} // Smooth animation
            onClick={() =>
              window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
            }
            className=" mt-12 inline-block cursor-pointer text-[#ff914d] hover:text-[#E68345] transition duration-300 ease-in-out"
          >
            <FaChevronDown size={48} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
