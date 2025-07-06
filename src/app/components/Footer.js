"use client";

import {
  Phone,
  Mail,
  Clock,
  BookOpen,
  Utensils,
  Calendar,
  Info,
  MessageSquare,
} from "lucide-react";
import { useMemo } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

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
              <div className="flex flex-col space-y-2">
                <Link
                  href="/restaurant/book-table"
                  className="text-sm md:text-base text-orange-900 hover:text-orange-700 transition-colors flex items-center justify-center md:justify-start"
                >
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                  Book Table
                </Link>
                <Link
                  href="/restaurant/menu"
                  className="text-sm md:text-base text-orange-900 hover:text-orange-700 transition-colors flex items-center justify-center md:justify-start"
                >
                  <Utensils className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                  See Menu
                </Link>
              </div>
              <p className="flex items-center justify-center md:justify-start text-sm md:text-base">
                <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm md:text-base">
                  Kitchen: 11:00 – 21:00 <br />
                  Lounge: Thu – Sat to 23:00
                </span>
              </p>
              <p className="flex items-center justify-center md:justify-start">
                <Phone className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm md:text-base">(354) 766-6262</span>
              </p>
              <p className="flex items-center justify-center md:justify-start">
                <Mail className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm md:text-base">
                  team@mamareykjavik.is
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

          {/* Center section with logos side by side */}
          <div className="flex justify-center items-center space-x-4">
            <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40">
              <video
                src="/mamaimg/mamalogovideo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-full shadow-lg"
              />
            </div>
            <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40">
              <Image
                src="/whitelotus/whitelotuslogo.png"
                alt="White Lotus Logo"
                fill
                sizes="(min-width: 1024px) 160px, (min-width: 768px) 128px, 96px"
                className="object-contain"
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
                <Link
                  href="/events"
                  className="text-sm md:text-base text-teal-900 hover:text-teal-600 transition-colors"
                >
                  See Events
                </Link>
                <Calendar className="h-4 w-4 md:h-5 md:w-5 ml-2 text-teal-500 flex-shrink-0" />
              </p>
              <p className="flex items-center justify-center md:justify-end">
                <Link
                  href="/whitelotus"
                  className="text-sm md:text-base text-teal-900 hover:text-teal-600 transition-colors"
                >
                  About Venue
                </Link>
                <Info className="h-4 w-4 md:h-5 md:w-5 ml-2 text-teal-500 flex-shrink-0" />
              </p>
              <p className="flex items-center justify-center md:justify-end">
                <Link
                  href="/whitelotus/rent"
                  className="text-sm md:text-base text-teal-900 hover:text-teal-600 transition-colors"
                >
                  Host Your Event - Inquiry
                </Link>
                <MessageSquare className="h-4 w-4 md:h-5 md:w-5 ml-2 text-teal-500 flex-shrink-0" />
              </p>
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
