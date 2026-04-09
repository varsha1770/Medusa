"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const CounDown = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const deadline = "December, 31, 2026";

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();
    if (time < 0) return;

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    getTime();
    const interval = setInterval(() => getTime(), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden py-24">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-[20px] bg-[#D0E9F3] p-8 sm:p-12 lg:p-20">
          <div className="max-w-[500px] w-full relative z-10">
            <span className="block font-bold text-blue tracking-[0.3em] uppercase text-[10px] mb-5">
              Limited Time Offer
            </span>

            <h2 className="font-[650] text-3xl lg:text-5xl text-dark mb-6 leading-tight">
              Premium Comfort <br /> Sofa Set <span className="text-blue">.</span>
            </h2>

            <p className="text-gray-600 font-medium mb-10 max-w-[400px] leading-relaxed">
              Experience the pinnacle of artisanal craftsmanship and modern aesthetics. Only available for a short time.
            </p>

            {/* <!-- Countdown timer --> */}
            <div className="flex flex-wrap gap-5 mt-10">
              {/* <!-- timer day --> */}
              <div className="text-center">
                <span className="min-w-[70px] h-16 font-[650] text-2xl lg:text-3xl text-dark rounded-xl flex items-center justify-center bg-white shadow-lg px-4 mb-3 transition-transform hover:-translate-y-1">
                  {days < 10 ? "0" + days : days}
                </span>
                <span className="block text-[11px] font-bold text-dark uppercase tracking-widest opacity-60">
                  Days
                </span>
              </div>

              {/* <!-- timer hours --> */}
              <div className="text-center">
                <span className="min-w-[70px] h-16 font-[650] text-2xl lg:text-3xl text-dark rounded-xl flex items-center justify-center bg-white shadow-lg px-4 mb-3 transition-transform hover:-translate-y-1">
                  {hours < 10 ? "0" + hours : hours}
                </span>
                <span className="block text-[11px] font-bold text-dark uppercase tracking-widest opacity-60">
                  Hours
                </span>
              </div>

              {/* <!-- timer minutes --> */}
              <div className="text-center">
                <span className="min-w-[70px] h-16 font-[650] text-2xl lg:text-3xl text-dark rounded-xl flex items-center justify-center bg-white shadow-lg px-4 mb-3 transition-transform hover:-translate-y-1">
                  {minutes < 10 ? "0" + minutes : minutes}
                </span>
                <span className="block text-[11px] font-bold text-dark uppercase tracking-widest opacity-60">
                  Mins
                </span>
              </div>

              {/* <!-- timer seconds --> */}
              <div className="text-center">
                <span className="min-w-[70px] h-16 font-[650] text-2xl lg:text-3xl text-blue rounded-xl flex items-center justify-center bg-white shadow-lg px-4 mb-3 transition-transform hover:-translate-y-1">
                  {seconds < 10 ? "0" + seconds : seconds}
                </span>
                <span className="block text-[11px] font-bold text-dark uppercase tracking-widest opacity-60">
                  Secs
                </span>
              </div>
            </div>

            <a
              href="#"
              className="inline-flex font-bold text-[13px] tracking-widest uppercase text-white bg-dark py-4 px-12 rounded-full ease-out duration-200 hover:bg-blue hover:-translate-y-1 shadow-lg mt-12"
            >
              Shop Now
            </a>
          </div>

          {/* <!-- Images --> */}
          <div className="absolute right-0 bottom-0 w-full h-full pointer-events-none -z-0 hidden lg:block">
             <Image
              src="/images/countdown/countdown-bg.png"
              alt="bg shapes"
              className="absolute right-0 bottom-0 opacity-40"
              width={737}
              height={482}
            />
            <Image
              src="/images/countdown/Sofa.webp"
              alt="Premium Sofa"
              className="absolute right-10 bottom-10"
              width={550}
              height={400}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounDown;
