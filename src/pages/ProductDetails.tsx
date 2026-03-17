import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product } from "../types";
import { ShoppingCart, ArrowLeft, Shield, Truck, RefreshCcw, Wine, Star } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        
        const products: Product[] = await res.json();
        const found = products.find((p) => p.id.toString() === id);
        
        if (!found && retryCount < 1) {
          // If not found, wait a bit and try one more time (maybe sync was in progress)
          setTimeout(() => fetchProduct(retryCount + 1), 1000);
          return;
        }
        
        setProduct(found || null);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
      navigate("/shipping");
    }
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
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <h2 className="font-serif text-3xl">Product not found</h2>
        <button 
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-ink text-white rounded-full text-xs font-bold uppercase tracking-widest"
        >
          Back to Collection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-gold/30">
      <div className="relative pt-32 pb-24">
        <div className="container mx-auto px-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-stone-400 hover:text-stone-900 transition-all mb-16 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Return to Collection</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24 items-center">
            {/* Image Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 relative group"
            >
              <div className="relative aspect-[4/5] md:aspect-[16/10] rounded-[3rem] overflow-hidden bg-white border border-stone-200 shadow-2xl flex items-center justify-center p-4 md:p-8">
                <motion.img 
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-contain drop-shadow-2xl scale-110"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Badge */}
                {!!product.isPremium && (
                  <div className="absolute top-10 left-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="px-6 py-3 bg-white/90 backdrop-blur-xl border border-gold/20 rounded-full flex items-center gap-3 shadow-lg"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                      <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Premium Product</span>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 space-y-12"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] w-12 bg-gold/30" />
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">Limited Edition</span>
                  </div>
                  <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight text-stone-900">
                    {product.title.split(' ').map((word, i) => (
                      <span key={i} className={i % 2 === 1 ? "italic block" : "block"}>
                        {word}
                      </span>
                    ))}
                  </h1>
                </div>

                <div className="flex items-end gap-4">
                  <div className="text-4xl md:text-5xl font-serif text-gold">${product.price.toFixed(2)}</div>
                  <div className="text-stone-400 text-sm pb-1 uppercase tracking-widest font-light">Excluding VAT</div>
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-stone-500 text-lg font-light leading-relaxed italic border-l-2 border-gold/20 pl-6">
                  {product.description}
                </p>
                
                <div className="grid grid-cols-2 gap-8 py-10 border-y border-stone-200">
                  <div className="space-y-2">
                    <div className="text-gold text-[10px] font-bold uppercase tracking-widest">Vintage</div>
                    <div className="text-stone-900 font-serif text-xl">Estate Bottled</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-gold text-[10px] font-bold uppercase tracking-widest">Region</div>
                    <div className="text-stone-900 font-serif text-xl">Reserve Vineyards</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button
                  onClick={handleBuyNow}
                  className="group relative w-full bg-stone-900 text-white py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-stone-900/20"
                >
                  <span className="relative z-10">Buy Now</span>
                  <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
                
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-transparent text-stone-900 py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] border border-stone-200 hover:border-stone-900 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Collection
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-between pt-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 text-stone-900">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Authentic</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Express</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <RefreshCcw className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Insured</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
