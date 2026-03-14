import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../types";
import { ShoppingCart, Info, Search, X, Wine } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../CartContext";

export default function AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchProducts();
      setIsLoading(false);
    };
    loadData();

    // Real-time polling every 60 seconds
    const interval = setInterval(() => {
      fetchProducts();
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

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

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
          <p className="text-stone-400 text-xs font-light italic">Opening the cellar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 space-y-24">
      <header className="container mx-auto px-6 space-y-8 max-w-4xl text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]"
        >
          Our Full Collection
        </motion.span>
        <h1 className="font-serif text-4xl md:text-7xl font-light italic">The Wine Cellar</h1>
        <p className="text-stone-500 text-lg font-light leading-relaxed">
          Browse our complete collection of fine wines, from robust reds to refreshing whites, 
          sourced from the world's most prestigious vineyards.
        </p>
        
        <div className="relative max-w-xl mx-auto pt-8">
          <input 
            type="text"
            placeholder="Search our collection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white px-16 py-5 rounded-full border border-stone-200 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all font-light"
          />
          <Search className="absolute left-6 top-[calc(50%+16px)] -translate-y-1/2 text-stone-300 w-5 h-5" />
        </div>
      </header>

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {filteredProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group space-y-6"
          >
            <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative premium-shadow rounded-2xl">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
              <button 
                onClick={() => setSelectedProduct(product)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-white text-ink text-[9px] font-bold uppercase tracking-widest rounded-full opacity-100 md:opacity-0 translate-y-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 hover:bg-gold hover:text-white shadow-lg"
              >
                Quick View
              </button>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="font-serif text-2xl font-medium text-ink line-clamp-1">{product.title}</h3>
              <div className="text-gold text-sm font-medium tracking-widest">${product.price.toFixed(2)}</div>
              <button
                onClick={() => handleBuyNow(product)}
                className="w-full mt-4 py-3 bg-stone-50 text-ink text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-gold hover:text-white transition-all active:scale-95 border border-stone-100"
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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
              className="bg-paper rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 no-scrollbar"
            >
              <div className="md:w-1/2 h-64 md:h-auto flex-shrink-0 bg-stone-100">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 md:p-10 md:w-1/2 space-y-6 md:space-y-8 flex flex-col justify-center">
                <div className="space-y-3">
                  <span className="text-gold text-[9px] font-bold uppercase tracking-[0.3em]">Product Details</span>
                  <h2 className="font-serif text-3xl md:text-4xl font-light">{selectedProduct.title}</h2>
                  <div className="text-lg md:text-xl font-serif italic text-stone-400">${selectedProduct.price.toFixed(2)}</div>
                </div>
                <p className="text-stone-500 text-sm md:text-base leading-relaxed font-light">{selectedProduct.description}</p>
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => handleBuyNow(selectedProduct)}
                    className="w-full bg-ink text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gold transition-colors duration-500 shadow-xl shadow-ink/10"
                  >
                    Purchase
                  </button>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-transparent text-ink py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] border border-ink/20 hover:border-ink transition-all active:scale-95"
                  >
                    Add to Collection
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 p-2 text-ink/40 hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
