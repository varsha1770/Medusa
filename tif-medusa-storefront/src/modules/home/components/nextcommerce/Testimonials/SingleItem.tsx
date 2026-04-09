import React from "react";
import { Testimonial } from "../types/testimonial";
import Image from "next/image";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50 flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:shadow-blue/5 hover:-translate-y-2 mx-2 my-2 relative overflow-hidden group/card">
      {/* Decorative Quote Icon Background */}
      <div className="absolute -top-4 -right-2 text-blue/[0.03] text-9xl font-serif pointer-events-none select-none group-hover/card:text-blue/[0.05] transition-colors duration-500">
        &rdquo;
      </div>

      <div className="flex items-center gap-1.5 mb-8 relative z-10">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className="w-4 h-4 text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>

      <div className="relative z-10">
        <p className="text-dark-4 text-lg lg:text-xl mb-10 leading-[1.6] font-medium text-dark/90 italic tracking-tight">
          &ldquo;{testimonial.review}&rdquo;
        </p>
      </div>

      <div className="mt-auto flex items-center gap-5 pt-8 border-t border-dark/5 relative z-10">
        <div className="relative">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue/20 to-transparent rounded-full blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
          <div className="w-14 h-14 rounded-full overflow-hidden border-[3px] border-white shadow-md relative">
            <Image
              src={testimonial.authorImg}
              alt={testimonial.authorName}
              width={56}
              height={56}
              className="object-cover scale-110 group-hover/card:scale-125 transition-transform duration-700"
            />
          </div>
        </div>

        <div>
          <h3 className="font-bold text-dark text-lg leading-tight mb-1 group-hover/card:text-blue transition-colors duration-300">
            {testimonial.authorName}
          </h3>
          <p className="text-blue/70 text-[10px] font-black uppercase tracking-[0.2em]">
            {testimonial.authorRole}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
