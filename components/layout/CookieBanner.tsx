"use client";

import { useState, useEffect } from "react";
import { X, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: "all" | "essential") => {
    localStorage.setItem("cookie_consent", choice);
    setIsVisible(false);
  };

  // Prevent server-side hydration mismatches
  if (!isMounted) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:max-w-md z-50 transition-all duration-500 ease-out ${
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f43f5e]/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-[#f43f5e]" />
            </div>
            <h3 className="font-bold text-sm text-white tracking-tight">Cookie Preferences</h3>
          </div>
          <button 
            onClick={() => handleChoice("essential")}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 leading-relaxed">
          We use cookies to understand site usage and improve your movie discovery experience. No tracking without your consent! Read our{" "}
          <Link href="/documentation" className="text-[#f43f5e] hover:underline">
            ML Docs
          </Link>
          .
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => handleChoice("all")}
            className="flex-1 bg-white text-black font-bold text-xs py-2.5 rounded-xl hover:bg-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
          >
            Accept All
          </button>
          <button
            onClick={() => handleChoice("essential")}
            className="flex-1 bg-white/5 border border-white/5 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer text-center"
          >
            Reject Optional
          </button>
        </div>
        
      </div>
    </div>
  );
}
