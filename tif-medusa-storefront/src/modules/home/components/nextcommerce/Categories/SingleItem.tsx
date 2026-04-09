import { Category } from "../types/category";
import React from "react";
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <LocalizedClientLink 
      href={item.handle ? `/categories/${item.handle}` : "#"} 
      className="group relative block w-full overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
    >
      {/* 1. Full-Bleed Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={item.img} 
          alt={item.title} 
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
        />
        {/* Subtle Dark Gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
      </div>

      {/* 2. Glassmorphic Title Plate (Sticks to bottom) */}
      <div className="absolute inset-x-4 bottom-4 z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/40">
          <h3 className="text-white font-[350] text-sm lg:text-base tracking-[0.1em] uppercase text-center transition-all duration-300 group-hover:tracking-[0.2em]">
            {item.title}
          </h3>
          
          <div className="flex items-center justify-center gap-2 mt-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
             <span className="text-[10px] text-white/80 font-[350] uppercase tracking-widest">Explore</span>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  );
};

export default SingleItem;
