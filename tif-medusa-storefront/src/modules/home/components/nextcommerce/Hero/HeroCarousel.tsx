"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useRef } from "react";
import Image from "next/image";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

const heroData = [
  {
    subtitle: "PREMIUM SELECTION",
    title: "Elevated Comfort \n & Style",
    description: "Transform your space with our signature modular \n designs and artisanal craftsmanship.",
    img: "/images/hero/10_ed.webp", // Luxe Beige Sofa (with baked-in text)
    btn: "SAVE UP TO 50% OFF",
    hideContent: true,
    bgColor: "bg-[#F8F9FB]" // Match the beige background
  },
  {
    subtitle: "NEW DESIGN",
    title: "MODERN \n FURNITURE",
    description: "Discover curated furniture pieces that blend \n timeless elegance with contemporary comfort.",
    img: "/images/hero/13.webp", // Designer Green Sofa (with baked-in text)
    btn: "EXPLORE NOW",
    hideContent: true,
    bgColor: "bg-[#F8F9FB]"
  },
  {
    subtitle: "MASTER BEDROOM",
    title: "LUXURY \n SLEEPING",
    description: "Experience the ultimate in minimalist design \n and orthopedic support.",
    img: "/images/categories/Bed_room.webp", // Gallery Bed Room
    btn: "SHOP NOW",
    hideContent: false,
    bgColor: "bg-white"
  }
];

const HeroCarousal = () => {
  const sliderRef = useRef<any>(null);

  return (
    <div className="relative overflow-hidden group h-full">
      <Swiper
        ref={sliderRef}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
            clickable: true,
            el: '.hero-pagination',
        }}
        modules={[Autoplay, Pagination]}
        className="hero-carousel h-full"
      >
        {heroData.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={`relative flex items-center h-full min-h-[450px] ${slide.bgColor}`}>
              
              {/* 1. Refined Visibility (No Zoom for Text Banners) */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                  src={slide.img}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  // Disable scale-105 for banners with text to prevent cut-off
                  className={`object-cover transition-transform duration-1000 ${slide.hideContent ? '' : 'group-hover:scale-105'}`}
                />
                
                {/* Minimal Light Filter for Slide 3 only */}
                {!slide.hideContent && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent pointer-events-none"></div>
                )}
              </div>

              {/* 2. Soft Architectural Typography (Reduced Weight) */}
              {!slide.hideContent && (
              <div className="w-full sm:w-[60%] relative z-10 text-left px-12 lg:px-24 py-10 lg:py-16">
                 <div className="max-w-[480px]">
                    <span className="inline-flex items-center gap-3 font-[350] text-blue tracking-[0.25em] uppercase text-[10px] mb-6 opacity-70">
                      <span className="w-6 h-[1px] bg-blue/30"></span>
                      {slide.subtitle}
                    </span>
                    
                    {/* Reduce Font Weight to font-[350] for Classier look */}
                    <h1 className="font-[350] text-[#111] text-4xl lg:text-[64px] leading-[0.95] mb-8 tracking-tighter uppercase">
                      {slide.title}
                    </h1>
                    
                    <p className="text-[#333] text-sm lg:text-base mb-12 whitespace-pre-line leading-relaxed font-[350] max-w-[85%] opacity-60">
                      {slide.description}
                    </p>
                    
                    <button
                      className="group/btn relative inline-flex items-center gap-6 overflow-hidden font-[350] text-white text-[11px] tracking-[0.2em] uppercase rounded-full bg-[#111] py-4 px-10 transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      <span className="relative z-10">{slide.btn}</span>
                      <div className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center -mr-2 transition-transform group-hover/btn:translate-x-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </div>
                    </button>
                 </div>
              </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Refined Dock-Style Pagination */}
      <div className="hero-pagination absolute bottom-8 right-10 z-30 flex gap-2.5 bg-white/10 backdrop-blur-md p-2.5 rounded-full border border-white/20"></div>

      <style jsx global>{`
        .hero-pagination .swiper-pagination-bullet {
          width: 5px;
          height: 5px;
          background: #111;
          opacity: 0.08;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-pagination .swiper-pagination-bullet-active {
          width: 20px;
          border-radius: 6px;
          background: #111;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousal;
