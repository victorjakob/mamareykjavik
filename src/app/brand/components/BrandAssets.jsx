"use client";
import { motion } from "framer-motion";
import { SwatchIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";

// turns any Cloudinary "image/upload/..." URL into a forced-download URL
function cldForceDownload(
  url,
  {
    filename = "Brand-Asset",
    format, // "png" | "jpg" | "webp" | "svg" (don't set svg if original isn't vector)
    width, // e.g. 4096 for a big raster
  } = {}
) {
  if (!url.includes("/image/upload/")) return url;

  // Build transformation segment
  const parts = [`fl_attachment:${encodeURIComponent(filename)}`];
  if (format) parts.push(`f_${format}`);
  if (width && format !== "svg") parts.push(`w_${width}`);
  const tx = parts.join(",");

  // Insert transformation right after /image/upload/
  return url.replace("/image/upload/", `/image/upload/${tx}/`);
}

const brandAssets = [
  {
    category: "Logos",
    items: [
      {
        name: "Full Logo",
        description: "Complete Mama logo with all design elements",
        url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756674800/MamaFINAL_blrlme.png",
        type: "png",
      },
      {
        name: "Minimalistic Logo",
        description: "Cleaner version with simplified design",
        url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756674787/smallerlogoFINAL_bnyqpv.png",
        type: "png",
      },
      {
        name: "Simple Logo",
        description: "Most minimal version without decorative elements",
        url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756674771/smallerlogoNOFLOWERS_wyr43q.png",
        type: "png",
      },
    ],
  },
  {
    category: "Brand Elements",
    items: [
      { name: "Color Palette", description: "Primary and secondary colors" },
      { name: "Typography", description: "Brand fonts and usage guidelines" },
      { name: "Patterns", description: "Decorative elements and textures" },
      { name: "Icons", description: "Custom icon set" },
    ],
  },
  {
    category: "Marketing Materials",
    items: [
      {
        name: "Social Media Templates",
        description: "Instagram, Facebook, LinkedIn",
      },
      { name: "Business Cards", description: "Professional contact cards" },
      { name: "Email Signatures", description: "Branded email templates" },
      {
        name: "Presentation Templates",
        description: "PowerPoint/Keynote themes",
      },
    ],
  },
  {
    category: "Video Assets",
    items: [
      {
        name: "Logo Animation",
        description: "Animated version of the Mama logo",
        note: "Video format available - contact us for access",
      },
    ],
  },
];

export default function BrandAssets({ selectedFormat, onDownload }) {
  const handleDownload = (assetName, format, url) => {
    if (!url) return;

    const forced = cldForceDownload(url, {
      filename: `${assetName.replace(/\s+/g, "_")}_${format.toUpperCase()}`,
      format,
      width: format === "svg" ? undefined : 4096, // big crisp raster
    });

    // Navigate to the forced-download URL
    window.location.href = forced;
  };

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-light text-gray-800 mb-6 tracking-wide">
        Brand Assets
      </h3>
      <div className="space-y-8">
        {brandAssets.map((category) => (
          <div
            key={category.category}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h4 className="text-xl font-light text-gray-800 mb-4 flex items-center gap-2 tracking-wide">
              <SwatchIcon className="h-5 w-5 text-orange-500" />
              {category.category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <h5 className="font-light text-gray-800 tracking-wide">
                      {item.name}
                    </h5>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    {item.note && (
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (item.note && item.note.includes("Video")) {
                          alert("Please contact us for video assets access");
                        } else {
                          handleDownload(item.name, selectedFormat, item.url);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        item.note && item.note.includes("Video")
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      }`}
                      title={
                        item.note && item.note.includes("Video")
                          ? "Contact us for access"
                          : "Download"
                      }
                      disabled={item.note && item.note.includes("Video")}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (item.url) {
                          window.open(item.url, "_blank");
                        }
                      }}
                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { brandAssets };
