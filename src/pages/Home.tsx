import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product, SiteSettings } from "../types";
import { ShoppingCart, Info, ArrowRight, X, Package, Wine } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../CartContext";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchSettings()]);
      setIsLoading(false);
    };
    loadData();

    // Real-time polling every 60 seconds
    const interval = setInterval(() => {
      fetchProducts();
      fetchSettings();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      console.log("[Home] Settings loaded:", data);
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const heroImage = settings?.heroImageUrl || "https://images.unsplash.com/photo-1506377247377-2a5b3b0ca7df?w=1920&q=80";

  const handleBuyNow = (product: Product) => {
    addToCart(product);
    navigate("/shipping");
  };

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
          <p className="text-stone-400 text-xs font-light italic">Curating excellence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-32 pb-32">
      {/* Cinematic Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-ink">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ 
            scale: [1.2, 1],
            opacity: 1,
            x: [0, 10, -10, 0],
            y: [0, -5, 5, 0],
          }}
          transition={{ 
            scale: { duration: 0.3, ease: "easeOut" },
            opacity: { duration: 0.2 },
            x: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 10, repeat: Infinity, ease: "linear" }
          }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={heroImage} 
            alt="Hero" 
            className="w-full h-full object-cover brightness-[0.6] contrast-[1.1] saturate-[1.1]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/60" />
        </motion.div>
        
        <div className="container mx-auto px-6 relative z-10 text-center space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto space-y-10"
          >
            <h1 className="font-serif text-6xl md:text-[11rem] text-white font-light leading-[0.85] tracking-tighter drop-shadow-2xl">
              {settings?.heroTitle || "Exquisite Wines for Every Occasion"}
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-3xl text-white/50 font-light leading-relaxed max-w-3xl mx-auto italic font-serif"
            >
              {settings?.heroSubtitle || "Discover our curated collection of fine wines from the world's most prestigious vineyards."}
            </motion.p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12">
              <button 
                onClick={() => navigate("/products")}
                className="group relative px-14 py-7 bg-white text-ink rounded-full font-bold text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all duration-700 hover:scale-110 active:scale-95 shadow-2xl shadow-white/10"
              >
                <span className="relative z-10">Explore Collection</span>
                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]" />
              </button>
              <button 
                onClick={() => navigate("/heritage")}
                className="group flex items-center gap-4 text-white/70 text-[11px] font-bold uppercase tracking-[0.4em] hover:text-white transition-all"
              >
                Our Heritage
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 to-white/40" />
          <span className="text-white/30 text-[9px] uppercase tracking-[0.3em] vertical-rl">Scroll</span>
        </motion.div>
      </section>

      {/* Featured Selection */}
      <section className="container mx-auto px-6 space-y-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-200 pb-12">
          <div className="space-y-4">
            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">The Cellar</span>
            <h2 className="font-serif text-5xl md:text-6xl font-light italic">Featured Selection</h2>
          </div>
          <p className="text-stone-500 max-w-sm text-sm leading-relaxed">
            Each bottle in our featured collection is chosen for its exceptional character and heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {products.length > 0 ? products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: idx * 0.1 }}
              className="group space-y-8"
            >
              <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative premium-shadow rounded-2xl">
                <motion.img
                  whileTap={{ scale: 0.95 }}
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 cursor-pointer"
                  referrerPolicy="no-referrer"
                  onClick={() => setSelectedProduct(product)}
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-500 pointer-events-none" />
                <button 
                  onClick={() => setSelectedProduct(product)}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-ink text-[10px] font-bold uppercase tracking-widest rounded-full opacity-100 md:opacity-0 translate-y-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 hover:bg-gold hover:text-white shadow-lg"
                >
                  Quick View
                </button>
              </div>
              <div className="space-y-4 text-center">
                <h3 className="font-serif text-3xl font-medium text-ink">{product.title}</h3>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[1px] w-8 bg-stone-200" />
                  <span className="text-gold font-medium tracking-widest">${product.price.toFixed(2)}</span>
                  <div className="h-[1px] w-8 bg-stone-200" />
                </div>
                <button
                  onClick={() => handleBuyNow(product)}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:from-gold hover:to-amber-500 transition-all active:scale-95 shadow-lg shadow-stone-900/20 hover:shadow-gold/40 border border-white/10"
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <Package className="w-12 h-12 mx-auto text-stone-200" />
              <p className="text-stone-400 font-light">No products available in the collection yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Refined Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-ink/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-paper rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 no-scrollbar"
            >
              <div className="md:w-1/2 h-64 md:h-auto flex-shrink-0 bg-stone-100">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 md:p-12 md:w-1/2 space-y-8 flex flex-col justify-center">
                <div className="space-y-4">
                  <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Product Details</span>
                  <h2 className="font-serif text-4xl md:text-5xl font-light">{selectedProduct.title}</h2>
                  <div className="text-xl md:text-2xl font-serif italic text-stone-400">${selectedProduct.price.toFixed(2)}</div>
                </div>
                <p className="text-stone-500 text-base md:text-lg leading-relaxed font-light">{selectedProduct.description}</p>
                <div className="space-y-4 pt-4">
                  <button
                    onClick={() => handleBuyNow(selectedProduct)}
                    className="w-full bg-ink text-white py-4 md:py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-gold transition-colors duration-500 shadow-xl shadow-ink/10"
                  >
                    Proceed to Purchase
                  </button>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-transparent text-ink py-4 md:py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] border border-ink/20 hover:border-ink transition-all active:scale-95"
                  >
                    Add to Collection
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-8 right-8 p-2 text-ink/40 hover:text-ink transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
