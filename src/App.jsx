import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { ShieldAlert, Home, Shield, List, Menu, X, Key } from "lucide-react";
import ReportForm from "./ReportForm";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";
import FraudList from "./FraudList";
import FraudDetails from "./FraudDetails";
import UpdateReport from "./UpdateForm";
import { ToastProvider, toast } from "toasticom";
import "./index.css";
import ManageOtp from "./ManageOtp";

function AppContent() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasUserToken, setHasUserToken] = useState(false); // New state for token check

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);


  useEffect(() => {
    const handleCopy = (e) => e.preventDefault();
    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && ["c", "s", "p"].includes(e.key.toLowerCase())) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        toast("error", "Keyboard shortcuts are disabled.");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = "blur(10px)";
      } else {
        document.body.style.filter = "none";
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);



  // Check for user token on mount and whenever needed
  useEffect(() => {
    const token = localStorage.getItem('token'); // Assuming key is 'userToken' (adjust if different)
    setHasUserToken(!!token);
  }, []);

  const baseNavItems = [
    { to: "/", label: "Report", icon: Home },
    { to: "/admin", label: "Admin", icon: Shield },
    { to: "/fraudlist", label: "Fraud List", icon: List }
  ];

  const navItems = [
    ...baseNavItems,
    // ...(hasUserToken ? [{ to: "/otp", label: "OTP", icon: Key }] : [])
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-2xl text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ShieldAlert className="w-7 h-7" />
              <span className="tracking-tight">FraudWatch</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.to)
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(item.to)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Routes>
            <Route path="/" element={<ReportForm />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/fraudlist" element={<FraudList />} />
            <Route path="/fraudlist/:id" element={<FraudDetails />} />
            <Route path="/update-report/:id" element={<UpdateReport />} />
            {/* New OTP Route - Add your OTP component here */}
            <Route path="/otp" element={<ManageOtp />} /> {/* Replace OtpComponent with actual component */}
          </Routes>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>
          ⚠️ Demo app — Reports are saved in{" "}
          <span className="font-semibold">local storage</span>. Replace with a
          secure backend for production.
        </p>
      </footer> */}
    </div>
  );
}


export default function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}