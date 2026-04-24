import { Globe, Link2, X, Music2 } from "lucide-react";

const links = {
  Help: ["FAQ", "Shipping Info", "Returns & Exchanges", "Track My Order", "Contact Us"],
  Company: ["About Callie", "Careers", "Press", "Sustainability", "Affiliates"],
  Shop: ["Graduation", "Wedding", "Birthday", "Baby Gifts", "Mother's Day"],
};

const paymentIcons = ["💳", "🔒", "✅"];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#2a9d8f] flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-white">callie</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              Personalised gifts crafted with heart. Making every milestone
              unforgettable since 2018.
            </p>
            <div className="flex items-center gap-3 mb-6">
              {[Globe, Link2, X, Music2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#2a9d8f] hover:text-white transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {/* App download */}
            <div className="flex gap-2">
              <a
                href="#"
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl px-3 py-2 transition-colors"
              >
                <span className="text-lg">📱</span>
                <div>
                  <p className="text-[9px] text-gray-400 leading-tight">
                    Download on the
                  </p>
                  <p className="text-xs font-semibold text-white leading-tight">
                    App Store
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl px-3 py-2 transition-colors"
              >
                <span className="text-lg">🤖</span>
                <div>
                  <p className="text-[9px] text-gray-400 leading-tight">
                    Get it on
                  </p>
                  <p className="text-xs font-semibold text-white leading-tight">
                    Google Play
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-[#2a9d8f] transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 Callie Pty Ltd. All rights reserved. ABN 12 345 678 901
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Cookie Settings
            </a>
          </div>
          <div className="flex items-center gap-2">
            {paymentIcons.map((icon, i) => (
              <span
                key={i}
                className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-sm"
              >
                {icon}
              </span>
            ))}
            <span className="text-xs text-gray-500 ml-1">Secure checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
