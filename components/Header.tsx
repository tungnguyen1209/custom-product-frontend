"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search, ShoppingCart, Heart, Menu, X, ChevronDown, Gift, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// MiniCart is a drawer — only mount once it has actually been opened. Saves
// ~210 LOC + dependencies from the initial Header chunk on every page load.
const MiniCart = dynamic(() => import("./MiniCart"), { ssr: false });

const navCategories = [
  "Family",
  "Friends",
  "Pets",
  "Anniversary",
  "Birthday",
  "New In",
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { cart, isMiniCartOpen, openMiniCart, closeMiniCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const accountLabel = isAuthenticated
    ? user?.firstName || user?.email?.split("@")[0] || "Account"
    : "Sign in";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top promo bar */}
      <div className="bg-[#ff6b6b] text-white text-center text-xs py-2 px-4 font-medium tracking-wide">
        🎁 Send all your love with gifts from Gifthub &bull; Free Shipping over $50
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-[#ff6b6b] flex items-center justify-center shadow-sm">
                <Gift className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-[#ff6b6b]">Gift</span>
                <span className="text-gray-900">hub</span>
              </span>
            </div>
          </a>

          {/* Search bar – desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for gifts for mom, dad, pets..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b] bg-gray-50 transition-all"
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <a
              href={isAuthenticated ? "/account" : "/login"}
              className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#ff6b6b] transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="max-w-[120px] truncate">{accountLabel}</span>
            </a>
            <button className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#ff6b6b] transition-colors">
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </button>
            <button
              onClick={openMiniCart}
              aria-label={`Open cart, ${itemCount} items`}
              className="relative flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#ff6b6b] transition-colors cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#ff6b6b] rounded-full text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:block">Cart</span>
            </button>
            <button
              className="md:hidden text-gray-600 p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Nav links – desktop */}
        <nav className="hidden md:flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
          {navCategories.map((cat) => (
            <a
              key={cat}
              href="#"
              className="flex-shrink-0 flex items-center gap-0.5 text-[13px] font-medium text-gray-600 hover:text-[#ff6b6b] px-4 py-1.5 rounded-full hover:bg-[#fff0f0] transition-all"
            >
              {cat}
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </a>
          ))}
          <a
            href="#"
            className="flex-shrink-0 text-[13px] font-bold text-white px-4 py-1.5 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] transition-colors shadow-sm"
          >
            ✨ Best Sellers
          </a>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for gifts..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navCategories.map((cat) => (
              <a
                key={cat}
                href="#"
                className="block text-sm font-medium text-gray-700 p-3 rounded-xl bg-gray-50 hover:bg-[#fff0f0] hover:text-[#ff6b6b] transition-colors"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      )}

      {isMiniCartOpen && (
        <MiniCart open={isMiniCartOpen} onClose={closeMiniCart} />
      )}
    </header>
  );
}
