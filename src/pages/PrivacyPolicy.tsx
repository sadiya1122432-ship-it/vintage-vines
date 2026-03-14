import React, { useState, useEffect } from "react";
import { SiteSettings } from "../types";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <div className="container mx-auto px-4 py-20 pt-32 max-w-4xl space-y-16">
      <header className="space-y-4">
        <h1 className="font-serif text-5xl font-bold">Privacy Policy</h1>
        <p className="text-stone-500 text-lg">Last updated: March 7, 2026</p>
      </header>

      <div className="bg-white p-10 rounded-3xl border border-stone-200 shadow-sm space-y-12">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-stone-900">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Our Commitment</h2>
          </div>
          <p className="text-stone-600 leading-relaxed">
            {settings?.privacyPolicy || "Your privacy is important to us. We collect only necessary information to process your orders."}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Lock className="w-8 h-8 text-stone-400" />
            <h3 className="font-bold">Data Security</h3>
            <p className="text-sm text-stone-500">We use industry-standard encryption to protect your personal and payment information.</p>
          </div>
          <div className="space-y-3">
            <Eye className="w-8 h-8 text-stone-400" />
            <h3 className="font-bold">Transparency</h3>
            <p className="text-sm text-stone-500">We are clear about what data we collect and how it is used to improve your experience.</p>
          </div>
          <div className="space-y-3">
            <FileText className="w-8 h-8 text-stone-400" />
            <h3 className="font-bold">Your Rights</h3>
            <p className="text-sm text-stone-500">You have the right to access, correct, or delete your personal data at any time.</p>
          </div>
        </div>

        <section className="space-y-6 pt-8 border-t border-stone-100">
          <h3 className="text-xl font-bold">1. Information We Collect</h3>
          <p className="text-stone-600 leading-relaxed">
            When you make a purchase, we collect your name, email address, phone number, and shipping address. 
            This information is used solely for order fulfillment and customer support.
          </p>

          <h3 className="text-xl font-bold">2. Payment Information</h3>
          <p className="text-stone-600 leading-relaxed">
            Payment transactions are processed through secure third-party providers. We do not store your credit card numbers on our servers.
          </p>

          <h3 className="text-xl font-bold">3. Cookies</h3>
          <p className="text-stone-600 leading-relaxed">
            We use cookies to maintain your shopping cart and provide a personalized browsing experience. 
            You can disable cookies in your browser settings, but some features of the site may not function correctly.
          </p>
        </section>
      </div>
    </div>
  );
}
