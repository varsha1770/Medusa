"use client";
import React from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import shopData from "../data/shopData";

const BestSeller = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8">
        {/* <!-- section title --> */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="text-center md:text-left">
            <span className="flex items-center justify-center md:justify-start gap-3 font-bold text-blue tracking-[0.2em] uppercase text-[10px] mb-2">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Our Favorites
            </span>
            <h2 className="font-[650] text-3xl lg:text-4xl text-dark tracking-tight">
              Best Sellers <span className="text-blue">.</span>
            </h2>
          </div>

          <LocalizedClientLink
            href="/store"
            className="group flex items-center gap-3 font-[650] text-[13px] tracking-widest uppercase py-3.5 px-8 rounded-full border border-gray-100 bg-white text-dark shadow-sm hover:bg-dark hover:text-white transition-all"
          >
            Explore All
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </LocalizedClientLink>
        </div>

        {/* Change to 4 columns as requested by user */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {shopData.map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
