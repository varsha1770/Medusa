import React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import ProductItem from "../Common/ProductItem";
import shopData from "../data/shopData";

const NewArrival = () => {
  return (
    <section className="overflow-hidden py-20 pb-32">
      <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8">
        {/* <!-- section title --> */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4 text-center md:text-left">
          <div>
            <span className="group mb-3 flex items-center justify-center md:justify-start gap-4 font-medium text-blue tracking-[0.2em] uppercase text-[10px]">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue/10 text-blue transition-transform duration-500 group-hover:rotate-[360deg]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              Just In
            </span>
            <h2 className="font-[350] text-3xl lg:text-4xl text-dark tracking-tight">
              New Arrivals <span className="text-blue">.</span>
            </h2>
          </div>

          <LocalizedClientLink
            href="/store"
            className="group flex items-center gap-3 font-[350] text-[13px] tracking-widest uppercase py-3.5 px-8 rounded-full border border-gray-100 bg-white text-dark shadow-sm hover:bg-dark hover:text-white transition-all shadow-blue/5"
          >
            Explore Collection
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {shopData.map((item, key) => (
            <ProductItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
