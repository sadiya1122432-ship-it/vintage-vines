import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wine, ArrowRight } from "lucide-react";
import { SiteSettings } from "../types";

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    if (newCount === 9) {
      navigate("/admin/login");
      setClickCount(0);
    } else {
      setClickCount(newCount);
    }
  };

  return (
    <footer className="bg-ink text-white/90 pt-16 pb-10 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-12">
          <div className="lg:col-span-5 space-y-8">
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-3 cursor-pointer select-none group w-fit"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:bg-gold transition-all duration-500">
                <Wine className="text-ink w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight">
                {settings?.siteName || "Vintage Vines"}
              </span>
            </div>
            <p className="text-white/40 text-base font-light leading-relaxed max-w-sm">
              {settings?.aboutUs || "We are a family-owned boutique wine shop dedicated to bringing the finest vintages to your table."}
            </p>
            <div className="flex gap-6">
              {['Instagram', 'Twitter', 'Facebook'].map(social => (
                <a key={social} href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-gold transition-colors">{social}</a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">Navigation</h4>
            <ul className="space-y-3 text-sm font-light">
              <li><Link to="/" className="text-white/60 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-white/60 hover:text-white transition-colors">Collection</Link></li>
              <li><Link to="/about" className="text-white/60 hover:text-white transition-colors">Our Story</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">Legal</h4>
            <ul className="space-y-3 text-sm font-light">
              <li><Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
          <p>{settings?.footerText || "© 2026 Vintage Vines Wine Shop. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
}
