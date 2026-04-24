"use client";

import { useState } from "react";
import { Search, ShoppingCart, Heart, Menu, X, ChevronDown } from "lucide-react";

const navCategories = [
  "Wedding",
  "Birthday",
  "Baby",
  "Mother's Day",
  "Graduation",
  "Personalised Gifts",
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top promo bar */}
      <div className="bg-[#2a9d8f] text-white text-center text-xs py-2 px-4 font-medium tracking-wide">
        FREE SHIPPING on orders over AU$60 &bull; 99-Day Returns
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-[#2a9d8f] flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                callie
              </span>
            </div>
          </a>

          {/* Search bar – desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search personalised gifts..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-[#2a9d8f] transition-colors">
              <Heart className="w-5 h-5" />
              <span className="hidden lg:block">Wishlist</span>
            </button>
            <button className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-[#2a9d8f] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden lg:block">Cart</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2a9d8f] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                0
              </span>
            </button>
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nav links – desktop */}
        <nav className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {navCategories.map((cat) => (
            <a
              key={cat}
              href="#"
              className="flex-shrink-0 flex items-center gap-0.5 text-sm text-gray-600 hover:text-[#2a9d8f] px-3 py-1 rounded-full hover:bg-[#e8f5f4] transition-all"
            >
              {cat}
              <ChevronDown className="w-3 h-3" />
            </a>
          ))}
          <a
            href="#"
            className="flex-shrink-0 text-sm font-semibold text-[#2a9d8f] px-3 py-1 rounded-full bg-[#e8f5f4]"
          >
            🎓 Graduation Sale
          </a>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search personalised gifts..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] bg-gray-50"
            />
          </div>
          {navCategories.map((cat) => (
            <a
              key={cat}
              href="#"
              className="block text-sm text-gray-700 py-2 border-b border-gray-50 hover:text-[#2a9d8f]"
            >
              {cat}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
