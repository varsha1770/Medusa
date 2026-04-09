"use client";
import React, { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    // Simulate API call for the boutique demo
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  return (
    <section className="py-24 bg-[#0F172A] overflow-hidden relative min-h-[500px] flex items-center">
      {/* 1. Architectural Floating Shapes (Dynamic Background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Circle 1 */}
        <div className="absolute top-[10%] left-[5%] w-64 h-64 border border-white/5 rounded-full animate-[spin_20s_linear_infinite] opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        </div>
        
        {/* Animated Circle 2 */}
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse] opacity-10">
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/20 rounded-full"></div>
        </div>

        {/* Blueprint Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* 2. Global Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue/10 rounded-full blur-[160px] -z-0"></div>

      <div className="max-w-[1200px] w-full mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Main Content */}
          <div className="max-w-[550px] text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue/10 border border-blue/20 text-blue text-[10px] uppercase tracking-[0.3em] font-[350] mb-6 animate-pulse">
              Stay Connected
            </span>
            <h2 className="font-[350] text-4xl sm:text-5xl text-white mb-6 leading-tight tracking-tight uppercase">
              Join Our <br /> <span className="text-blue">Newsletter</span>
            </h2>
            <p className="text-gray-400 text-lg font-[350] leading-relaxed">
              Experience the art of modern living. Subscribe for exclusive releases, architectural insights, and the essence of minimalist luxury.
            </p>
          </div>

          {/* Interactive Form Area */}
          <div className="w-full max-w-[550px]">
            <div className={`relative p-2 rounded-[32px] transition-all duration-700 ${status === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 backdrop-blur-2xl border border-white/10'}`}>
              
              {status === "success" ? (
                <div className="py-12 px-8 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <h3 className="text-2xl font-[350] text-white uppercase mb-2">Welcome Aboard</h3>
                  <p className="text-gray-400 font-[350]">You've successfully joined the elite inner circle.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative group">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-transparent border-none rounded-full px-8 py-5 text-white placeholder-gray-500 focus:outline-none focus:ring-0 font-[350] text-base"
                        required
                        disabled={status === "loading"}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className={`w-full sm:w-auto inline-flex items-center justify-center font-[350] text-xs tracking-[0.2em] uppercase bg-blue text-white py-5 px-12 rounded-[24px] shadow-2xl transition-all duration-500 transform ${
                        status === "loading" ? "opacity-50 cursor-wait" : "hover:bg-white hover:text-dark hover:scale-105 active:scale-95"
                      }`}
                    >
                      {status === "loading" ? (
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                        </div>
                      ) : (
                        "Subscribe"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <p className="mt-6 text-[10px] text-gray-500 text-center lg:text-left uppercase tracking-[0.2em] font-[350] opacity-60">
              Your privacy is sacred. No spam, just pure inspiration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
