import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { useMemo } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="text-gray-800 py-8 w-full overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Mama Restaurant Section */}
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-orange-600">
              Mama Restaurant
            </h3>
            <div className="space-y-2">
              <p className="flex items-center justify-center md:justify-start">
                <Phone className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm md:text-base">(354) 766-6262</span>
              </p>
              <p className="flex items-center justify-center md:justify-start">
                <Mail className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm md:text-base">
                  mama.reykjavik@gmail.com
                </span>
              </p>
            </div>
            <div className="flex justify-center md:justify-start space-x-4 mt-4">
              <a
                href="https://www.facebook.com/mamareykjavik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 transition-colors"
              >
                <FaFacebook className="h-5 w-5 md:h-6 md:w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/mamareykjavik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 transition-colors"
              >
                <FaInstagram className="h-5 w-5 md:h-6 md:w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Center video section */}
          <div className="flex justify-center items-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
              <video
                src="/mamaimg/mamalogovideo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-full shadow-lg"
              />
            </div>
          </div>

          {/* White Lotus Section */}
          <div className="text-center md:text-right">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-teal-600">
              White Lotus Venue
            </h3>
            <div className="space-y-2">
              <p className="flex items-center justify-center md:justify-end">
                <span className="text-sm md:text-base">team@whitelotus.is</span>
                <Mail className="h-4 w-4 md:h-5 md:w-5 ml-2 text-teal-500 flex-shrink-0" />
              </p>
            </div>
            <div className="flex justify-center md:justify-end space-x-4 mt-4">
              <a
                href="https://www.facebook.com/profile.php?id=61566431262645"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-500 hover:text-teal-600 transition-colors"
              >
                <FaFacebook className="h-5 w-5 md:h-6 md:w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/whitelotusvenue"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-500 hover:text-teal-600 transition-colors"
              >
                <FaInstagram className="h-5 w-5 md:h-6 md:w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-xs md:text-sm text-gray-600">
            © {currentYear} Mama Restaurant & White Lotus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
