import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShippingData } from "../types";
import { MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "../CartContext";

export default function Shipping() {
  const navigate = useNavigate();
  const { cart, cartTotal } = useCart();
  const [formData, setFormData] = useState<ShippingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    street: "",
    houseNumber: "",
    postalCode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("[Shipping] Submitting form data:", formData);
    
    if (cart.length === 0) {
      console.warn("[Shipping] Submission blocked: Cart is empty");
      setError("Your cart is empty!");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("[Shipping] Sending request to /api/shipping...");
      const response = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("[Shipping] Server response status:", response.status);

      if (response.ok) {
        console.log("[Shipping] Success! Saving to localStorage...");
        localStorage.setItem("shippingInfo", JSON.stringify(formData));
        localStorage.setItem("currentOrder", JSON.stringify({
          items: cart,
          total: cartTotal,
          product: cart[0], 
        }));
        console.log("[Shipping] Navigating to /payment...");
        navigate("/payment");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Shipping] Server error:", errorData);
        setError(`${errorData.error || "Failed to save shipping information."} (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("[Shipping] Network or unexpected error:", error);
      setError("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formattedValue = formatPhoneNumber(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 px-6 pt-32">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-400 hover:text-ink transition-colors mb-4 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back to Cart</span>
      </button>

      <div className="flex items-center gap-4 border-b border-stone-200 pb-6">
        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
          <MapPin className="text-stone-900 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Shipping Information</h1>
          <p className="text-stone-500">Where should we send your exquisite selection?</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">First Name</label>
          <input
            required
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            placeholder="John"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Last Name</label>
          <input
            required
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            placeholder="Doe"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-stone-700">Email Address</label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            placeholder="john@example.com"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-stone-700">Phone Number</label>
          <input
            required
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            placeholder="(555) 000-0000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">State</label>
          <select
            required
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="">Select State</option>
            <option value="AL">AL - Alabama</option>
            <option value="AK">AK - Alaska</option>
            <option value="AZ">AZ - Arizona</option>
            <option value="AR">AR - Arkansas</option>
            <option value="CA">CA - California</option>
            <option value="CO">CO - Colorado</option>
            <option value="CT">CT - Connecticut</option>
            <option value="DE">DE - Delaware</option>
            <option value="FL">FL - Florida</option>
            <option value="GA">GA - Georgia</option>
            <option value="HI">HI - Hawaii</option>
            <option value="ID">ID - Idaho</option>
            <option value="IL">IL - Illinois</option>
            <option value="IN">IN - Indiana</option>
            <option value="IA">IA - Iowa</option>
            <option value="KS">KS - Kansas</option>
            <option value="KY">KY - Kentucky</option>
            <option value="LA">LA - Louisiana</option>
            <option value="ME">ME - Maine</option>
            <option value="MD">MD - Maryland</option>
            <option value="MA">MA - Massachusetts</option>
            <option value="MI">MI - Michigan</option>
            <option value="MN">MN - Minnesota</option>
            <option value="MS">MS - Mississippi</option>
            <option value="MO">MO - Missouri</option>
            <option value="MT">MT - Montana</option>
            <option value="NE">NE - Nebraska</option>
            <option value="NV">NV - Nevada</option>
            <option value="NH">NH - New Hampshire</option>
            <option value="NJ">NJ - New Jersey</option>
            <option value="NM">NM - New Mexico</option>
            <option value="NY">NY - New York</option>
            <option value="NC">NC - North Carolina</option>
            <option value="ND">ND - North Dakota</option>
            <option value="OH">OH - Ohio</option>
            <option value="OK">OK - Oklahoma</option>
            <option value="OR">OR - Oregon</option>
            <option value="PA">PA - Pennsylvania</option>
            <option value="RI">RI - Rhode Island</option>
            <option value="SC">SC - South Carolina</option>
            <option value="SD">SD - South Dakota</option>
            <option value="TN">TN - Tennessee</option>
            <option value="TX">TX - Texas</option>
            <option value="UT">UT - Utah</option>
            <option value="VT">VT - Vermont</option>
            <option value="VA">VA - Virginia</option>
            <option value="WA">WA - Washington</option>
            <option value="WV">WV - West Virginia</option>
            <option value="WI">WI - Wisconsin</option>
            <option value="WY">WY - Wyoming</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">City</label>
          <input
            required
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            placeholder="New York"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-stone-700">Street Address</label>
          <input
            required
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            placeholder="123 Wine Lane"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">House Number</label>
          <input
            required
            name="houseNumber"
            value={formData.houseNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            placeholder="Apt 4B"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Postal Code</label>
          <input
            required
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            placeholder="10001"
          />
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Continue to Payment"}
            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
