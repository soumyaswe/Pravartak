"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LiquidEther from "@/components/ui/liquid-ether-new";

const HeroSection = () => {

  return (
    <section className="w-full pt-36 md:pt-48 pb-16 md:pb-20 relative min-h-[110vh] md:min-h-[120vh] overflow-hidden">
      {/* ReactBits LiquidEther Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <LiquidEther
          mouseForce={30}
          cursorSize={120}
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          autoDemo={true}
          autoSpeed={0.8}
          autoIntensity={1.5}
          takeoverDuration={0.05}
          autoResumeDelay={500}
          autoRampDuration={0.2}
          dt={0.018}
          className="w-full h-full"
        />
      </div>
      
      {/* Subtle overlay for better text readability - allows mouse events to pass through */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/30 pointer-events-none z-5"></div>
      
      {/* Content Layer - All pointer events pass through except button */}
      <div className="flex flex-col justify-center items-center h-full space-y-12 text-center relative z-20 pointer-events-none">
        <div className="space-y-8 mx-auto px-4">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl xl:text-7xl gradient-title animate-gradient drop-shadow-lg">
            Your AI Career Coach for
            <br />
            <span className="text-white drop-shadow-xl">Professional Success</span>
          </h1>
          <p className="mx-auto max-w-[800px] text-white/90 text-lg md:text-xl lg:text-2xl xl:text-3xl leading-relaxed drop-shadow-md font-medium">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button className="px-8 py-3 text-base md:text-lg bg-white text-gray-900 hover:bg-gray-100 shadow-2xl backdrop-blur-sm font-semibold h-12 md:h-14 rounded-xl pointer-events-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;