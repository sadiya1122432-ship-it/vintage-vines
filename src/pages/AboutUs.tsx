import React, { useState, useEffect } from "react";
import { SiteSettings } from "../types";
import { Wine, Heart, Shield, Globe } from "lucide-react";
import { motion } from "motion/react";

export default function AboutUs() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadData();

    // Real-time polling every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-40 pb-32 space-y-32">
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">{settings?.heritageTitle || "Our Heritage"}</span>
              <h1 className="font-serif text-4xl md:text-8xl font-light leading-tight italic">
                A Legacy of <br /> Excellence
              </h1>
            </div>
            <div className="space-y-8 text-stone-500 text-lg font-light leading-relaxed max-w-xl">
              <p>
                {settings?.heritageContent || "Founded in 2026, Vintage Vines began with a simple mission: to curate the world's most exceptional wines and bring them to the tables of those who appreciate the finer things in life."}
              </p>
              <p>
                Our journey takes us across continents, from the sun-drenched hills of Tuscany to the misty valleys of Napa, seeking out vintages that tell a story of land, labor, and love.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-8 md:gap-12 pt-8 border-t border-stone-100">
              <div className="space-y-1">
                <div className="font-serif text-4xl text-ink italic">500+</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Rare Vintages</div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-4xl text-ink italic">12</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Global Regions</div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-4xl text-ink italic">24/7</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Expert Support</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            className="relative aspect-[4/5] rounded-[3rem] overflow-hidden premium-shadow"
          >
            <img 
              src={settings?.heritageImageUrl || "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80"} 
              alt="Vineyard" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
          </motion.div>
        </div>
      </section>

      <section className="bg-ink py-32 overflow-hidden relative">
        <div className="container mx-auto px-6 text-center space-y-12 relative z-10">
          <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">The Philosophy</span>
          <h2 className="font-serif text-5xl md:text-7xl text-white font-light italic max-w-4xl mx-auto leading-tight">
            "Wine is the only artwork you can drink."
          </h2>
          <div className="w-12 h-[1px] bg-gold mx-auto" />
          <p className="text-white/40 text-lg font-light tracking-widest uppercase">Luis Fernando Olaverri</p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-radial from-gold/5 to-transparent blur-3xl" />
      </section>
    </div>
  );
}
