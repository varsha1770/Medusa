"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import testimonialsData from "./testimonialsData";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";
import SingleItem from "./SingleItem";

const Testimonials = () => {
  // FIX: Added <any> to resolve TypeScript 'never' error
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
    <section className="overflow-hidden py-24 bg-gradient-to-b from-white via-[#F9FAFB] to-white relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue/5 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue/5 rounded-full blur-3xl translate-y-1/2"></div>

      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-8 xl:px-0 relative z-10">
        <div className="swiper testimonial-carousel common-carousel relative group">
          {/* <!-- section title --> */}
          <div className="mb-14 flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="text-left">
              <span className="block font-bold text-blue tracking-[0.3em] uppercase text-[9px] mb-3 opacity-80">
                User Feedback
              </span>
              <h2 className="font-[650] text-3xl xl:text-4xl text-dark leading-tight">
                What Our Clients Say <span className="text-blue/40 font-light ml-1">/</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrev} 
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-dark shadow-sm transition-all hover:bg-blue hover:text-white hover:shadow-lg hover:shadow-blue/20 active:scale-95 border border-gray-100/50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              <button 
                onClick={handleNext} 
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-dark shadow-sm transition-all hover:bg-blue hover:text-white hover:shadow-lg hover:shadow-blue/20 active:scale-95 border border-gray-100/50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            spaceBetween={40}
            breakpoints={{
              0: {
                slidesPerView: 1.1,
                centeredSlides: true,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                centeredSlides: false,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                centeredSlides: false,
                spaceBetween: 40,
              },
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            modules={[Autoplay, Pagination]}
            className="pb-15"
          >
            {testimonialsData.map((item, key) => (
              <SwiperSlide key={key}>
                <SingleItem testimonial={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
