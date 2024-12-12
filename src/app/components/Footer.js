import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { useMemo } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="bg-gradient-to-r from-[#c8c5a8] via-[#d9d6b3] to-[#ebe8c0] text-gray-800 py-12">
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
                <span>(123) 456-7890</span>
              </p>
              <p className="flex items-center justify-center md:justify-start">
                <Mail className="h-5 w-5 mr-2 text-orange-500" />
                <span>info@mamarestaurant.com</span>
              </p>
            </div>
            <div className="flex justify-center md:justify-start space-x-4 mt-4">
              <a
                href="javascript:void(0)"
                className="text-orange-500 hover:text-orange-600"
              >
                <FaFacebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="javascript:void(0)"
                className="text-orange-500 hover:text-orange-600"
              >
                <FaInstagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Center Logo Section */}
          <div className="w-full md:w-1/3 mb-8 md:mb-0 flex justify-center items-center">
            <div className="bg-white p-6 rounded-full shadow-lg">
              <svg
                className="h-24 w-24"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="45" fill="url(#gradient)" />
                <path
                  d="M30 70L50 30L70 70"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0"
                    y1="0"
                    x2="100"
                    y2="100"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFA500" />
                    <stop offset="1" stopColor="#008080" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* White Lotus Section */}
          <div className="w-full md:w-1/3 text-center md:text-right">
            <h3 className="text-2xl font-bold mb-4 text-teal-600">
              White Lotus
            </h3>
            <div className="space-y-2">
              <p className="flex items-center justify-center md:justify-end">
                <Mail className="h-5 w-5 ml-2 text-teal-500 order-2" />
                <span>contact@whitelotus.com</span>
              </p>
            </div>
            <div className="flex justify-center md:justify-end space-x-4 mt-4">
              <a
                href="javascript:void(0)"
                className="text-teal-500 hover:text-teal-600"
              >
                <FaFacebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="javascript:void(0)"
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
