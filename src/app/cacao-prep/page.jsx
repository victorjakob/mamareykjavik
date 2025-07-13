import React from "react";
import HeroCacao from "./HeroCacao";
import CacaoIngredients from "./Ingredients";
import CacaoPreparation from "./Preparation";
import CacaoCeremony from "./Ceremony";
import CacaoCTA from "./CTA";

const CacaoPrepPage = () => (
  <main className="min-h-screen relative overflow-x-clip">
    {/* Decorative cacao plant image in top right */}

    <div className="relative z-10">
      <HeroCacao />
      <CacaoIngredients />
      <CacaoPreparation />
      <CacaoCeremony />
      <CacaoCTA />
    </div>
  </main>
);

export default CacaoPrepPage;
