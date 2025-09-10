"use client";
import { useState } from "react";
import {
  BrandHero,
  BrandSelector,
  BrandInfo,
  FormatSelector,
  BrandAssets,
  BrandGuidelines,
  ContactSupport,
} from "./components";

export default function BrandPage() {
  const [selectedBrand, setSelectedBrand] = useState("mama");
  const [selectedFormat, setSelectedFormat] = useState("png");

  const handleDownload = (assetName, format) => {
    // This would trigger the actual download
    // For now, we'll just show an alert
    alert(`Downloading ${assetName} in ${format.toUpperCase()} format...`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <BrandHero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Selector */}
        <BrandSelector
          selectedBrand={selectedBrand}
          onBrandSelect={setSelectedBrand}
        />

        {/* Selected Brand Info */}
        <BrandInfo selectedBrand={selectedBrand} />

        {/* Format Selector */}
        <FormatSelector
          selectedFormat={selectedFormat}
          onFormatSelect={setSelectedFormat}
        />

        {/* Brand Assets */}
        <BrandAssets
          selectedFormat={selectedFormat}
          onDownload={handleDownload}
        />

        {/* Brand Guidelines */}
        <BrandGuidelines />

        {/* Contact & Support */}
        <ContactSupport />
      </div>
    </div>
  );
}
