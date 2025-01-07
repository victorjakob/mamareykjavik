import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { useMemo } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="text-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Mama Restaurant Section */}
          <div className="w-full md:w-1/3 mb-8 md:mb-0 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-4 text-orange-600">
              Mama Restaurant
            </h3>
            <div className="space-y-2">
              <p className="flex items-center justify-center md:justify-start">
                <Phone className="h-5 w-5 mr-2 text-orange-500" />
                <span>(354) 766-6262</span>
              </p>
              <p className="flex items-center justify-center md:justify-start">
                <Mail className="h-5 w-5 mr-2 text-orange-500" />
                <span>mama.reykjavik@gmail.com</span>
              </p>
            </div>
            <div className="flex justify-center md:justify-start space-x-4 mt-4">
              <a
                href="https://www.whitelotus.is"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600"
              >
                <FaFacebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/mamareykjavik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600"
              >
                <FaInstagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* center video section */}
          <div className="w-full md:w-1/3 mb-8 md:mb-0 flex justify-center items-center">
            <div className="relative w-48 h-48 rounded-full shadow-lg overflow-visible">
              <video
                src="/mamaimg/mamalogovideo.mp4"
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover rounded-full"
              ></video>
              <div
                className="absolute inset-0 -z-10 w-[200%] h-[200%] bg-transparent pointer-events-none"
                style={{
                  clipPath: "circle(60% at center)",
                }}
              ></div>
            </div>
          </div>

          {/* White Lotus Section */}
          <div className="w-full md:w-1/3 text-center md:text-right">
            <h3 className="text-2xl font-bold mb-4 text-teal-600">
              White Lotus Venue
            </h3>
            <div className="space-y-2">
              <p className="flex items-center justify-center md:justify-end">
                <Mail className="h-5 w-5 ml-2 text-teal-500 order-2" />
                <span>team@whitelotus.is</span>
              </p>
            </div>
            <div className="flex justify-center md:justify-end space-x-4 mt-4">
              <a
                href="https://www.facebook.com/profile.php?id=61566431262645"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-500 hover:text-teal-600"
              >
                <FaFacebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/whitelotusvenue"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-500 hover:text-teal-600"
              >
                <FaInstagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm">
            © {currentYear} Mama Restaurant & White Lotus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
