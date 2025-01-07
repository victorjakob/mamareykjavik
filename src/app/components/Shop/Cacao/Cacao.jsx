"use client";

import CacaoAbout from "./CacaoAbout";
import CacaoList from "./CacaoList";
import HeroCacao from "./HeroCacao";

export default function Cacao() {
  return (
    <div
      className="relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/cacaohero.jpg')", // Shared background image
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Hero Section */}
      <div className="relative z-10">
        <HeroCacao />
      </div>

      {/* Cacao About Section */}
      <div className="relative z-10">
        <CacaoAbout />
      </div>

      <div className="relative z-10">
        <CacaoList />
      </div>
    </div>
  );
}
