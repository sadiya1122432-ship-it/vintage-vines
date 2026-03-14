import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import Shipping from "./pages/Shipping";
import Payment from "./pages/Payment";
import OrderResult from "./pages/OrderResult";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs";
import OurHeritage from "./pages/OurHeritage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./CartContext";

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col no-scrollbar">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<AllProducts />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-result" element={<OrderResult />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/heritage" element={<OurHeritage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}
