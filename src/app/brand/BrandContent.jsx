"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/util/supabase/client";
import Image from "next/image";

const mamaLogos = [
  {
    id: "mama-original",
    name: "Mama Original Logo",
    file: "mama-original.png",
    description: "Original full-color version",
  },
  {
    id: "mama-black",
    name: "Mama Black Logo",
    file: "mama-black.png",
    description: "Black version for light backgrounds",
  },
  {
    id: "mama-lupin",
    name: "Mama Lupin Logo",
    file: "mama-lupin.png",
    description: "Lupin color version",
  },
  {
    id: "mama-circle",
    name: "Mama Circle Logo",
    file: "mama-circle.png",
    description: "Circular logo variant",
  },
];

const whiteLotusLogos = [
  {
    id: "wl-darkbg",
    name: "White Lotus Dark BG",
    file: "wl-darkbg.png",
  },
  {
    id: "wl-whitebg",
    name: "White Lotus White BG",
    file: "wl-whitebg.png",
  },
];

export default function BrandContent() {
  const [selectedSection, setSelectedSection] = useState("mama");
  const [logoUrls, setLogoUrls] = useState({});
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    // Fetch logo URLs from Supabase storage
    const fetchLogoUrls = async () => {
      const urls = {};

      // Fetch Mama logos
      for (const logo of mamaLogos) {
        const { data } = supabase.storage
          .from("brand")
          .getPublicUrl(`mama/${logo.file}`);
        if (data) {
          urls[logo.id] = data.publicUrl;
        }
      }

      // Fetch White Lotus logos
      for (const logo of whiteLotusLogos) {
        const { data } = supabase.storage
          .from("brand")
          .getPublicUrl(`whitelotus/${logo.file}`);
        if (data) {
          urls[logo.id] = data.publicUrl;
        }
      }

      setLogoUrls(urls);
    };

    fetchLogoUrls();
  }, []);

  const handleDownload = async (logo, folder) => {
    setDownloading(logo.id);
    try {
      const { data, error } = await supabase.storage
        .from("brand")
        .download(`${folder}/${logo.file}`);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = logo.file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading:", error);
      alert("Failed to download logo. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="mt-24 md:mt-32 flex items-center justify-center px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl text-center"
        >
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="pt-1 pb-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-3 md:mb-4 text-gray-800"
          >
            Brand Resources
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-gray-600 font-light tracking-wide"
          >
            Download our official logos and brand assets
          </motion.p>
        </motion.div>
      </section>

      {/* Brand Selector */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedSection("mama")}
            className={`px-6 py-2 border font-light tracking-wide transition-all duration-300 ${
              selectedSection === "mama"
                ? "border-orange-500 text-orange-600 bg-orange-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Mama
          </button>
          <button
            onClick={() => setSelectedSection("whitelotus")}
            className={`px-6 py-2 border font-light tracking-wide transition-all duration-300 ${
              selectedSection === "whitelotus"
                ? "border-teal-500 text-teal-600 bg-teal-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            White Lotus
          </button>
        </div>

        {/* Mama Section */}
        {selectedSection === "mama" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-light tracking-wide text-gray-800 mb-6 text-center">
              Mama Logos
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-12">
              {mamaLogos.map((logo, index) => (
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="border border-gray-200 p-6 hover:border-gray-400 transition-all duration-300"
                >
                  {/* Logo Preview */}
                  <div className="bg-gray-50 aspect-square flex items-center justify-center mb-4 p-4 relative">
                    {logoUrls[logo.id] ? (
                      <Image
                        src={logoUrls[logo.id]}
                        alt={logo.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">Loading...</div>
                    )}
                  </div>

                  {/* Logo Info */}
                  <h3 className="text-lg font-light tracking-wide text-gray-800 mb-4">
                    {logo.name}
                  </h3>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(logo, "mama")}
                    disabled={downloading === logo.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-light tracking-wide hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    {downloading === logo.id ? "Downloading..." : "Download"}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Brand Colors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="border-t border-gray-200 pt-8"
            >
              <h3 className="text-xl md:text-2xl font-light tracking-wide text-gray-800 mb-6 text-center">
                Brand Colors
              </h3>
              <div className="space-y-6">
                {/* Primary Orange */}
                <div>
                  <p className="text-sm font-light text-gray-600 mb-3">
                    Primary Orange
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="w-full h-20 bg-orange-600 rounded border border-gray-200 mb-2"></div>
                      <p className="text-xs font-light text-gray-700">
                        Orange 600
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-20 bg-orange-500 rounded border border-gray-200 mb-2"></div>
                      <p className="text-xs font-light text-gray-700">
                        Orange 500
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-20 bg-orange-900 rounded border border-gray-200 mb-2"></div>
                      <p className="text-xs font-light text-gray-700">
                        Orange 900
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-20 bg-orange-50 rounded border border-gray-200 mb-2"></div>
                      <p className="text-xs font-light text-gray-700">
                        Orange 50
                      </p>
                    </div>
                  </div>
                </div>

                {/* Olive Green */}
                <div>
                  <p className="text-sm font-light text-gray-600 mb-3">
                    Accent Olive Green
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="text-center">
                      <div
                        className="w-full h-20 rounded border border-gray-200 mb-2"
                        style={{ backgroundColor: "#455318" }}
                      ></div>
                      <p className="text-xs font-light text-gray-700">
                        #455318
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-full h-20 rounded border border-gray-200 mb-2"
                        style={{ backgroundColor: "#698d42" }}
                      ></div>
                      <p className="text-xs font-light text-gray-700">
                        #698d42
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-20 rounded border border-gray-200 mb-2 bg-gradient-to-r from-[#455318] to-[#698d42]"></div>
                      <p className="text-xs font-light text-gray-700">
                        Gradient
                      </p>
                    </div>
                  </div>
                </div>

                {/* Background */}
                <div>
                  <p className="text-sm font-light text-gray-600 mb-3">
                    Background
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="text-center">
                      <div
                        className="w-full h-20 rounded border border-gray-200 mb-2"
                        style={{ backgroundColor: "#fdfbf7" }}
                      ></div>
                      <p className="text-xs font-light text-gray-700">
                        #fdfbf7
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* White Lotus Section */}
        {selectedSection === "whitelotus" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-light tracking-wide text-gray-800 mb-6 text-center">
              White Lotus Logos
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-12">
              {whiteLotusLogos.map((logo, index) => (
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="border border-gray-200 p-6 hover:border-gray-400 transition-all duration-300"
                >
                  {/* Logo Preview */}
                  <div className="bg-gray-50 aspect-square flex items-center justify-center mb-4 p-4 relative">
                    {logoUrls[logo.id] ? (
                      <Image
                        src={logoUrls[logo.id]}
                        alt={logo.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">Loading...</div>
                    )}
                  </div>

                  {/* Logo Info */}
                  <h3 className="text-lg font-light tracking-wide text-gray-800 mb-4">
                    {logo.name}
                  </h3>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(logo, "whitelotus")}
                    disabled={downloading === logo.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-light tracking-wide hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    {downloading === logo.id ? "Downloading..." : "Download"}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
