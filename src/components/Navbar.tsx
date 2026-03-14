import { Link, useLocation } from "react-router-dom";
import { Wine, User, ShoppingCart, Menu, X, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../CartContext";
import { useState, useEffect } from "react";
import { SiteSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${(isScrolled || isCartOpen || !isHomePage) ? "bg-white border-b border-stone-200 py-4 shadow-md" : "bg-transparent py-6"}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-ink rounded-full flex items-center justify-center group-hover:bg-gold transition-all duration-500 group-hover:rotate-[360deg]">
            <Wine className="text-white w-5 h-5" />
          </div>
          <span className={`font-serif text-xl md:text-2xl font-bold tracking-tight transition-colors duration-500 ${!(isScrolled || isCartOpen || !isHomePage) ? "text-white" : "text-ink"}`}>
            {settings?.siteName || "Vintage Vines"}
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-12">
          <Link to="/" className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${!(isScrolled || isCartOpen || !isHomePage) ? "text-white/80 hover:text-white" : "text-stone-500 hover:text-ink"}`}>Home</Link>
          <Link to="/products" className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${!(isScrolled || isCartOpen || !isHomePage) ? "text-white/80 hover:text-white" : "text-stone-500 hover:text-ink"}`}>Collection</Link>
          <Link to="/about" className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${!(isScrolled || isCartOpen || !isHomePage) ? "text-white/80 hover:text-white" : "text-stone-500 hover:text-ink"}`}>Our Story</Link>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`relative p-2 rounded-full transition-all duration-500 ${!(isScrolled || isCartOpen || !isHomePage) ? "text-white hover:bg-white/10" : "text-ink hover:bg-stone-100"}`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                {cartCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-full transition-all duration-500 ${!(isScrolled || isCartOpen || !isHomePage) ? "text-white hover:bg-white/10" : "text-ink hover:bg-stone-100"}`}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-stone-200 p-8 space-y-8 shadow-2xl"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-2xl font-serif font-bold">Home</Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block text-2xl font-serif font-bold">Collection</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-2xl font-serif font-bold">Our Story</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md bg-white z-[201] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-bold">Your Collection</h2>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">{cartCount} Items Selected</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-stone-50 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-stone-200" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-stone-900 font-medium">Your cellar is empty</p>
                      <p className="text-stone-400 text-sm">Discover our exquisite collection to begin.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate("/products");
                      }}
                      className="px-8 py-4 bg-ink text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                    >
                      Browse Wines
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-6 group">
                      <div className="w-24 h-32 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-serif text-lg font-medium leading-tight">{item.title}</h3>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-stone-300 hover:text-red-500 transition-colors p-1"
                              title="Remove from cart"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gold font-medium">${item.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-stone-200 rounded-full px-2 py-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:text-gold transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:text-gold transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-stone-50 border-t border-stone-100 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-stone-500 text-sm">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-900 font-bold text-xl">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate("/shipping");
                    }}
                    className="w-full bg-ink text-white py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gold transition-colors shadow-xl shadow-ink/10"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
