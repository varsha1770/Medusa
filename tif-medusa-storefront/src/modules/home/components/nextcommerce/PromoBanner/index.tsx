import React from "react";
import Image from "next/image";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20 bg-white">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        <div className="relative z-0 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#F5F5F7] to-[#EDEDF1] py-16 lg:py-20 px-8 sm:px-12 lg:px-20 mb-10 group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="max-w-[550px] w-full relative z-10">
            <span className="inline-block font-bold text-blue tracking-[0.3em] uppercase text-[10px] mb-5">
              Premium Collection
            </span>

            <h2 className="font-[650] text-3xl sm:text-5xl xl:text-6xl text-dark mb-6 leading-tight">
              UP TO <span className="text-blue">30%</span> OFF
            </h2>

            <p className="text-gray-500 max-w-[420px] mb-10 text-lg leading-relaxed font-medium">
              Luxury starts with quality. Enhance your living experience with our artisanal royal sofa sets.
            </p>

            <a
              href="#"
              className="inline-flex items-center gap-3 font-[650] text-[13px] tracking-widest uppercase py-4 px-10 rounded-full bg-dark text-white shadow-lg transition-all hover:bg-blue hover:-translate-y-1"
            >
              Shop Collection
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 right-0 lg:right-10 w-full max-w-[500px] h-full hidden lg:block">
            <Image
              src="/images/promo/luxury-royal.webp"
              alt="Promo Product"
              fill
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-110 mix-blend-multiply"
            />
          </div>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small 1 --> */}
          <div className="relative z-0 overflow-hidden rounded-[20px] bg-[#DBF4F3] p-10 lg:p-14 group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
               <div className="w-full sm:w-[50%] h-[200px] relative">
                <Image
                  src="/images/promo/Dublin_Poster.webp"
                  alt="Product"
                  fill
                  className="object-contain transition-all duration-700 ease-out group-hover:scale-115 group-hover:-rotate-3 mix-blend-multiply"
                />
              </div>

              <div className="w-full sm:w-[50%] text-center sm:text-right">
                <span className="block font-bold text-dark tracking-[0.2em] uppercase text-[10px] mb-3">
                  Comfort Seating
                </span>
                <h3 className="text-2xl xl:text-3xl font-[650] text-dark mb-4">Dublin Chair</h3>
                <p className="font-bold text-teal text-xl mb-8 uppercase tracking-widest">FLAT 20% OFF</p>
                <a
                  href="#"
                  className="inline-flex font-[650] text-[11px] tracking-widest uppercase text-white bg-teal py-3.5 px-8 rounded-full shadow-lg"
                >
                  Grab Now
                </a>
              </div>
            </div>
          </div>

          {/* <!-- promo banner small 2 --> */}
          <div className="relative z-0 overflow-hidden rounded-[20px] bg-[#FFECE1] p-10 lg:p-14 group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
              <div className="w-full sm:w-[50%] h-[240px] relative">
                <Image
                  src="/images/promo/Chair-resize.webp"
                  alt="Product"
                  fill
                  className="object-contain transition-all duration-700 ease-out group-hover:scale-115 group-hover:rotate-3 mix-blend-multiply"
                />
              </div>

              <div className="w-full sm:w-[50%] text-center sm:text-left">
                <span className="block font-bold text-dark tracking-[0.2em] uppercase text-[10px] mb-3">
                  Classic Wooden
                </span>
                <h3 className="text-2xl xl:text-3xl font-[650] text-dark mb-4 leading-tight">
                  Up To <span className="text-orange">40%</span> OFF
                </h3>
                <p className="max-w-[285px] mx-auto sm:mx-0 text-gray-600 text-sm mb-8 leading-relaxed font-medium">Timeless minimal design that balances room aesthetics.</p>
                <a
                  href="#"
                  className="inline-flex font-[650] text-[11px] tracking-widest uppercase text-white bg-orange py-3.5 px-8 rounded-full shadow-lg"
                >
                  Discover More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
