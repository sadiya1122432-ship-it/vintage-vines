import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Product, SiteSettings } from "../types";
import { Plus, Edit2, Trash2, X, Save, LogOut, Package, DollarSign, Image as ImageIcon, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "",
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    footerText: "",
    aboutUs: "",
    privacyPolicy: "",
    googleSheetId: "",
    heritageTitle: "",
    heritageContent: "",
    heritageImageUrl: "",
  });
  const [activeTab, setActiveTab] = useState<"products" | "settings" | "submissions">("products");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingSettings, setIsSyncingSettings] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchProducts();
    fetchSettings();
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data);
  };

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    // Ensure no null values are passed to state
    const sanitizedData = Object.keys(data).reduce((acc: any, key) => {
      acc[key] = data[key] === null ? "" : data[key];
      return acc;
    }, {});
    setSettings(prev => ({ ...prev, ...sanitizedData }));
  };

  const handleSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setToast({ text: "Settings updated successfully!", type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ text: "Failed to update settings", type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSyncAll = async () => {
    setSyncMessage({ text: "Starting full sync...", type: 'success' });
    try {
      await handleSyncSettings();
      await handleSyncProducts();
      setSyncMessage({ text: "Full sync completed successfully!", type: 'success' });
    } catch (error: any) {
      setSyncMessage({ text: "Full sync failed: " + error.message, type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        imageUrl: product.imageUrl || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({ title: "", description: "", price: "", imageUrl: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
      }),
    });

    setIsModalOpen(false);
    fetchProducts();
  };

  const handleSyncProducts = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    console.log("Starting product sync...");
    try {
      const res = await fetch("/api/admin/sync-products", { method: "POST" });
      const data = await res.json();
      console.log("Sync response:", data);
      if (data.success) {
        setSyncMessage({ text: `Successfully synced ${data.count} products from Google Sheets!`, type: 'success' });
        fetchProducts();
      } else {
        setSyncMessage({ text: "Sync failed: " + (data.error || data.message || "Unknown error"), type: 'error' });
      }
    } catch (error: any) {
      console.error("Sync error:", error);
      setSyncMessage({ text: "An error occurred during sync: " + error.message, type: 'error' });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleSyncSettings = async () => {
    setIsSyncingSettings(true);
    setSyncMessage(null);
    console.log("Starting settings sync...");
    try {
      const res = await fetch("/api/admin/sync-settings", { method: "POST" });
      const data = await res.json();
      console.log("Sync response:", data);
      if (data.success) {
        setSyncMessage({ text: "Successfully synced site settings from Google Sheets!", type: 'success' });
        fetchSettings();
      } else {
        setSyncMessage({ text: "Sync failed: " + (data.error || data.message || "Unknown error"), type: 'error' });
      }
    } catch (error: any) {
      console.error("Sync error:", error);
      setSyncMessage({ text: "An error occurred during sync: " + error.message, type: 'error' });
    } finally {
      setIsSyncingSettings(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Submission",
      message: "Are you sure you want to delete this submission? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            setToast({ text: "Submission deleted successfully!", type: 'success' });
            fetchOrders();
          } else {
            setToast({ text: "Delete failed: " + data.error, type: 'error' });
          }
        } catch (error) {
          setToast({ text: "An error occurred during deletion.", type: 'error' });
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setTimeout(() => setToast(null), 3000);
        }
      }
    });
  };

  const handleDelete = async (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await fetch(`/api/products/${id}`, { method: "DELETE" });
          fetchProducts();
          setToast({ text: "Product deleted successfully!", type: 'success' });
        } catch (error) {
          setToast({ text: "Failed to delete product", type: 'error' });
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setTimeout(() => setToast(null), 3000);
        }
      }
    });
  };

  const handleDownloadOrders = () => {
    const sheetId = settings.googleSheetId;
    if (!sheetId) {
      setToast({ text: "Google Sheet ID is not set.", type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, '_blank');
  };

  const handleOpenProductsSheet = () => {
    const sheetId = settings.googleSheetId;
    if (!sheetId) {
      setToast({ text: "Google Sheet ID is not set.", type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50/30 pt-24 sm:pt-28">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-6 border-b border-stone-200 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif">Admin Dashboard</h1>
              {syncMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${
                    syncMessage.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {syncMessage.text}
                </motion.div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto bg-white text-stone-600 px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 transition-colors text-xs"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncSettings}
              disabled={isSyncingSettings}
              className="flex-grow sm:flex-grow-0 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-indigo-100 hover:bg-indigo-100 transition-colors text-[10px] disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Sync Settings
            </button>
            <button
              onClick={handleSyncProducts}
              disabled={isSyncing}
              className="flex-grow sm:flex-grow-0 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-blue-100 hover:bg-blue-100 transition-colors text-[10px] disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Sync Products
            </button>
            <button
              onClick={handleOpenProductsSheet}
              className="flex-grow sm:flex-grow-0 bg-amber-50 text-amber-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-amber-100 hover:bg-amber-100 transition-colors text-[10px] whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              onClick={handleSyncAll}
              disabled={isSyncing || isSyncingSettings}
              className="flex-grow sm:flex-grow-0 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 disabled:opacity-50 text-[10px] whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(isSyncing || isSyncingSettings) ? 'animate-spin' : ''}`} />
              Sync All Data
            </button>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm">Manage your shop content and settings.</p>
        </div>

      <div className="flex gap-2 sm:gap-4 border-b border-stone-200 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button 
          onClick={() => setActiveTab("products")}
          className={`px-4 sm:px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-all ${activeTab === "products" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"}`}
        >
          Products
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`px-4 sm:px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-all ${activeTab === "settings" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"}`}
        >
          Site Settings
        </button>
        <button 
          onClick={() => setActiveTab("submissions")}
          className={`px-4 sm:px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === "submissions" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"}`}
        >
          Submissions
          {orders.length > 0 && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
          <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded-full text-stone-500">
            {orders.length}
          </span>
        </button>
      </div>

      {activeTab === "products" ? (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button
              onClick={() => openModal()}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
                <div className="aspect-video relative overflow-hidden bg-stone-100">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-stone-700 hover:bg-white transition-colors shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-white transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg leading-tight">{product.title}</h3>
                    <span className="font-bold text-stone-900">${product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-3 flex-1">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "settings" ? (
        <form onSubmit={handleSettingsSubmit} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Site Name</label>
              <input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Hero Image URL</label>
              <input
                value={settings.heroImageUrl}
                onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">Hero Title</label>
              <input
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">Hero Subtitle</label>
              <textarea
                rows={2}
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">About Us Text</label>
              <textarea
                rows={4}
                value={settings.aboutUs}
                onChange={(e) => setSettings({ ...settings, aboutUs: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">Heritage Title</label>
              <input
                value={settings.heritageTitle}
                onChange={(e) => setSettings({ ...settings, heritageTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">Heritage Content</label>
              <textarea
                rows={4}
                value={settings.heritageContent}
                onChange={(e) => setSettings({ ...settings, heritageContent: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">Heritage Image URL</label>
              <input
                value={settings.heritageImageUrl}
                onChange={(e) => setSettings({ ...settings, heritageImageUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">Privacy Policy Text</label>
              <textarea
                rows={4}
                value={settings.privacyPolicy}
                onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">Google Sheet ID</label>
              <input
                value={settings.googleSheetId}
                onChange={(e) => setSettings({ ...settings, googleSheetId: e.target.value })}
                placeholder="Enter your Google Spreadsheet ID"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
              />
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Important Setup</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  1. Share your Google Sheet with: <span className="font-mono font-bold bg-white px-1 rounded select-all">vintage-vines-service-account@vintage-vines-416515.iam.gserviceaccount.com</span> (Editor access required).
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  2. The ID can be found in your Google Sheet URL: docs.google.com/spreadsheets/d/<span className="text-indigo-600 font-bold">ID_HERE</span>/edit
                </p>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-stone-700">Footer Copyright Text</label>
              <input
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
          >
            Save All Settings
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Total Submissions</p>
              <h3 className="text-3xl font-bold font-serif">{orders.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Pending Orders</p>
              <h3 className="text-3xl font-bold font-serif">
                {orders.filter(o => o.status === 'Declined').length}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold font-serif">
                ${orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0).toFixed(2)}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold font-serif text-xl">User Submissions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">Date</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">Customer</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">Contact</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">Card Details</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">Items</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">Total</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 text-sm text-stone-500 whitespace-nowrap">
                        {order.timestamp}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-stone-900">{order.customerName}</p>
                        <p className="text-xs text-stone-500 line-clamp-1">
                          {order.address}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">Zip: {order.zipCode}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium">{order.email}</p>
                        <p className="text-xs text-stone-400">{order.phone}</p>
                      </td>
                      <td className="p-4">
                        <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 space-y-1">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Card: <span className="text-stone-900 font-mono">{order.cardNumber}</span></p>
                          <div className="flex gap-3">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Exp: <span className="text-stone-900">{order.expiryDate}</span></p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">CVV: <span className="text-stone-900">{order.cvv}</span></p>
                          </div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Holder: <span className="text-stone-900">{order.cardHolder}</span></p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-stone-600">
                        <p className="line-clamp-2 max-w-xs">
                          {order.items}
                        </p>
                      </td>
                      <td className="p-4 font-bold text-stone-900">${(parseFloat(order.total) || 0).toFixed(2)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-stone-400 italic">
                        No submissions found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Product Title
                    </label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                      placeholder="Vintage Cabernet 2018"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-stone-700">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none"
                      placeholder="Describe the wine's character, notes, and origin..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Price
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        placeholder="45.99"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Image URL
                      </label>
                      <input
                        required
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
                  >
                    <Save className="w-5 h-5" />
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmConfig.isOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-8 space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif">{confirmConfig.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{confirmConfig.message}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-6 py-3 rounded-xl font-bold border border-stone-200 hover:bg-stone-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmConfig.onConfirm}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors text-sm shadow-lg shadow-red-600/10"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
