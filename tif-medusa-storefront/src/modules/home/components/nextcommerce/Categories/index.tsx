"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef } from "react";
import { Autoplay, Navigation, FreeMode } from "swiper/modules";
import data from "./categoryData";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import SingleItem from "./SingleItem";

const Categories = () => {
  const sliderRef = useRef<any>(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  return (
    <section className="overflow-hidden py-24 pb-32">
      <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8">
        <div className="swiper categories-carousel common-carousel relative group px-4">
          
          {/* <!-- section title --> */}
          <div className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="relative group/title">
              <span className="flex items-center justify-center md:justify-start gap-4 font-bold text-blue tracking-[0.3em] uppercase text-[10px] mb-4">
                <div className="w-8 h-[2px] bg-blue/10 group-hover/title:w-12 transition-all"></div>
                Curated Collections
              </span>
              <h2 className="font-[650] text-xl lg:text-3xl text-dark tracking-tighter transition-all">
                Browse by Category <span className="text-blue">.</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrev} 
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-dark shadow-xl shadow-blue/5 transition-all hover:bg-blue hover:text-white hover:-translate-x-1 active:scale-95 border border-gray-50"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              <button 
                onClick={handleNext} 
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-dark shadow-xl shadow-blue/5 transition-all hover:bg-blue hover:text-white hover:translate-x-1 active:scale-95 border border-gray-50"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={4.5}
            spaceBetween={30}
            freeMode={true}
            speed={800}
            modules={[FreeMode, Navigation]}
            breakpoints={{
              0: { slidesPerView: 1.2, spaceBetween: 20 },
              640: { slidesPerView: 2.2, spaceBetween: 25 },
              1000: { slidesPerView: 3.2, spaceBetween: 30 },
              1300: { slidesPerView: 4.5, spaceBetween: 30 },
            }}
            className="pb-10"
          >
            {data.map((item, key) => (
              <SwiperSlide key={key} className="flex justify-center">
                <SingleItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Categories;
