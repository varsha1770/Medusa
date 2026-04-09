import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-12 lg:pb-16 pt-12 lg:pt-14 bg-[#FAFAFB]">
      <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-8">
          
          {/* 1. Immersive Gallery Column (2/3 width, Reduced Height 450px) */}
          <div className="xl:max-w-[850px] w-full flex-1">
            <div className="relative z-1 rounded-[40px] bg-white overflow-hidden shadow-2xl shadow-dark/5 border border-gray-100 h-[450px]">
              <HeroCarousel />
            </div>
          </div>

          {/* 2. Sleek Side Portal (1/3 width, Reduced Height 450px) */}
          <div className="xl:max-w-[410px] w-full lg:min-w-[380px]">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-8 h-full h-[450px]">

                {/* Side Card 1: Refined Scaling (Natural View) */}
                <LocalizedClientLink 
                  href="/categories/pants"
                  className="w-full relative rounded-[40px] bg-[#F8F9FB] overflow-hidden group cursor-pointer shadow-xl shadow-dark/5 border border-gray-100 flex-1 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 block"
                >
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/categories/sofa.webp"
                            alt="Designer Sofas"
                            fill
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-dark/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Refined Glass Tag (Reduced Height/Weight) */}
                    <div className="absolute left-5 bottom-5 right-5 z-10 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-white/90 backdrop-blur-xl border border-white/40 p-5 rounded-[24px] shadow-2xl transition-all group-hover:bg-white group-hover:scale-[1.02]">
                            <h2 className="font-medium text-[#111] text-base mb-1 leading-tight tracking-tighter opacity-80">
                                Designer Modular Sofas
                            </h2>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark/5">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-xl text-dark">$699</span>
                                  <span className="text-gray-400 line-through text-xs opacity-50">$999</span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-dark text-white flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </LocalizedClientLink>

                {/* Side Card 2: Refined Scaling (Natural View) */}
                <LocalizedClientLink 
                  href="/categories/merch"
                  className="w-full relative rounded-[40px] bg-[#F8F9FB] overflow-hidden group cursor-pointer shadow-xl shadow-dark/5 border border-gray-100 flex-1 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 block"
                >
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/categories/Dining Sets.webp"
                            alt="Dining Selection"
                            fill
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                         <div className="absolute inset-0 bg-dark/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Refined Glass Tag (Reduced Height/Weight) */}
                    <div className="absolute left-5 bottom-5 right-5 z-10 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-white/90 backdrop-blur-xl border border-white/40 p-5 rounded-[24px] shadow-2xl transition-all group-hover:bg-white group-hover:scale-[1.02]">
                            <h2 className="font-[350] text-[#111] text-base mb-1 leading-tight tracking-tighter opacity-80">
                                Minimalist Dining Selection
                            </h2>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark/5">
                                <div className="flex items-center gap-3">
                                  <span className="font-[350] text-xl text-dark">$699</span>
                                  <span className="text-gray-400 line-through text-xs opacity-50 font-[350]">$999</span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-dark text-white flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </LocalizedClientLink>

            </div>
          </div>
        </div>

        {/* Hero Features Icons */}
        <div className="mt-16">
          <HeroFeature />
        </div>
      </div>
    </section>
  );
};

export default Hero;
