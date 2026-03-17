import React, { useState, useEffect } from "react";
import { SiteSettings } from "../types";
import { motion } from "motion/react";
import { Wine, History, Award, Users } from "lucide-react";

export default function OurHeritage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Real-time polling every 60 seconds
    const interval = setInterval(() => {
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => setSettings(data));
    }, 60000);

    window.scrollTo(0, 0);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-stone-50 z-[500] flex flex-col items-center justify-center space-y-8">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          <Wine className="w-12 h-12 text-gold" />
          <div className="absolute -inset-4 border-2 border-gold/20 border-t-gold rounded-full" />
        </motion.div>
        <div className="space-y-2 text-center">
          <p className="text-gold text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse">Vintage Vines</p>
          <p className="text-stone-400 text-xs font-light italic">Recalling our history...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-stone-50/30">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img 
            src={settings.heritageImageUrl || "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80"} 
            alt="Heritage" 
            className="w-full h-full object-cover brightness-[0.6]"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="relative z-10 text-center space-y-6 px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold text-[10px] font-bold uppercase tracking-[0.5em] block"
          >
            Established 2026
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-serif text-5xl md:text-8xl text-white font-light italic"
          >
            {settings.heritageTitle || "Our Heritage"}
          </motion.h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 md:py-32 container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-12"
          >
            <div className="prose prose-stone prose-lg max-w-none">
              <p className="text-stone-600 text-xl leading-relaxed font-light first-letter:text-7xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-gold">
                {settings.heritageContent}
              </p>
            </div>
          </motion.div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 border-t border-stone-200">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                <History className="text-gold w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl italic">Tradition</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Honoring age-old winemaking techniques passed down through generations of master vintners.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                <Award className="text-gold w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl italic">Quality</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Uncompromising standards in every bottle, from the soil of the vineyard to the cork in the cellar.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                <Users className="text-gold w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl italic">Community</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Building lasting relationships with growers and connoisseurs who share our passion for excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-ink py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center space-y-12 relative z-10">
          <Wine className="text-gold w-12 h-12 mx-auto opacity-50" />
          <h2 className="font-serif text-4xl md:text-6xl text-white font-light italic max-w-4xl mx-auto leading-tight">
            "A legacy is not what we leave behind, but what we create for the future."
          </h2>
          <div className="w-12 h-[1px] bg-gold mx-auto" />
          <p className="text-white/40 text-sm font-bold tracking-[0.3em] uppercase">The Vintage Vines Philosophy</p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-radial from-gold/5 to-transparent blur-3xl" />
      </section>
    </div>
  );
}
