"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Sparkles, ArrowRight, Rocket, CreditCard, Zap, Brain, Clock } from "lucide-react";
import { gsap } from "gsap";

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    
    // Initial hero animation
    const initialAnimation = () => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      })
      .from(subtitleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6")
      .from(ctaRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.4")
      .from(featuresRef.current?.children || [], {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.3");
  
      // Floating elements animation
      floatingElementsRef.current.forEach((el, index) => {
        if (el) {
          gsap.to(el, {
            y: "random(-20, 20)",
            x: "random(-10, 10)",
            rotation: "random(-5, 5)",
            duration: "random(3, 5)",
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.5
          });
        }
      });

      return () => {
        tl.kill();
      };
    }
    
    //initialAnimation();
    
    
    
  }, []);

  const handleCTAHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
    
    const icon = e.currentTarget.querySelector('.cta-icon');
    if (icon) {
      gsap.to(icon, {
        x: 5,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleCTALeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
    
    const icon = e.currentTarget.querySelector('.cta-icon');
    if (icon) {
      gsap.to(icon, {
        x: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const FloatingElement = ({ 
    icon: Icon, 
    className = "", 
    index = 0 
  }: { 
    icon: any; 
    className?: string; 
    index?: number;
  }) => (
    <div
      ref={(el) => { floatingElementsRef.current[index] = el; }}
      className={`absolute opacity-20 dark:opacity-10 ${className}`}
    >
      <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm">
        <Icon size={24} className="text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  );

  const FeatureCard = ({ 
    icon: Icon, 
    title, 
    description 
  }: { 
    icon: any; 
    title: string; 
    description: string;
  }) => (
    <div className="group flex items-center gap-4 p-6 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Spline Background */}
      <div className="spline-container fixed top-0 w-full h-screen -z-10">
        <iframe 
          src="https://my.spline.design/worldplanet-inmHh7fVCul1jUFrNRYlotVU" 
          frameBorder="0" 
          width="100%" 
          height="100%" 
          id="aura-spline"
          className="pointer-events-none"
        />
      </div>

      <section
        ref={heroRef}
        className="relative min-h-screen bg-gradient-to-br from-neutral-50/80 via-blue-50/40 to-purple-50/40 dark:from-neutral-950/80 dark:via-blue-950/30 dark:to-purple-950/30 overflow-hidden flex items-center justify-center backdrop-blur-sm"
      >
        {/* Floating background elements */}
        <FloatingElement icon={FileText} className="top-20 left-10" index={0} />
        <FloatingElement icon={Brain} className="top-32 right-16" index={1} />
        <FloatingElement icon={Sparkles} className="bottom-32 left-20" index={2} />
        <FloatingElement icon={Zap} className="bottom-20 right-12" index={3} />
        <FloatingElement icon={Clock} className="top-48 left-1/3" index={4} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        
        {/* Content overlay for better readability */}
        <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[2px]"></div>
        
        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            
            {/* Main title */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                    <FileText size={28} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                  </div>
                </div>
              </div>
              
              <h1
                ref={titleRef}
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 mb-6 tracking-tight drop-shadow-sm"
              >
                PDF Analyzer
              </h1>
            </div>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-xl sm:text-2xl lg:text-3xl text-neutral-700 dark:text-neutral-200 mb-12 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-sm"
            >
              Transform lengthy documents into 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold"> intelligent summaries </span>
              with advanced AI
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a
                href="/dashboard"
                onMouseEnter={handleCTAHover}
                onMouseLeave={handleCTALeave}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 inline-flex items-center"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Rocket size={20} />
                  Get Started
                  <ArrowRight size={18} className="cta-icon transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>

              <a href="/pricing" className="flex items-center gap-3 px-8 py-4 text-lg font-medium text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 group bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-white/10">
                <CreditCard size={20} className="group-hover:scale-110 transition-transform duration-300" />
                View Pricing
              </a>
            </div>

            
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 dark:from-neutral-950/80 to-transparent"></div>
      </section>
    </>
  );
};

export default HeroSection;