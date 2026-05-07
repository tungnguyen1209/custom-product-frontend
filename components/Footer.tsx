import { Globe, Link2, X, Music2, Gift } from "lucide-react";

const links = {
  "Customer Care": ["Help Center", "Shipping Info", "Returns & Exchanges", "Track Order", "Contact Us"],
  "About Gifthub": ["Brand Story", "Careers", "Press", "Sustainability", "Partners"],
  "Discover": ["Family Gifts", "Friends Gifts", "Pet Gifts", "Anniversary", "Birthday Gifts"],
};

const paymentIcons = ["💳", "🔒", "✅"];

export default function Footer() {
  return (
    <footer className="bg-[#2d3436] text-gray-300 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ff6b6b] flex items-center justify-center">
                <Gift className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Gift<span className="text-[#ff6b6b]">hub</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Every gift tells a story. Gifthub helps you send love through the most unique personalized products.
            </p>
            <div className="flex items-center gap-4 mb-8">
              {[Globe, Link2, X, Music2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#ff6b6b] hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
                {heading}
              </h4>
              <ul className="space-y-3.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[13px] text-gray-400 hover:text-[#ff6b6b] transition-colors"
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
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-500">
            © 2026 Gifthub Inc. Every gift tells a story.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Settings
            </a>
          </div>
          <div className="flex items-center gap-3">
            {paymentIcons.map((icon, i) => (
              <span
                key={i}
                className="w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-base border border-gray-700"
              >
                {icon}
              </span>
            ))}
            <span className="text-[10px] text-gray-500 ml-1 font-medium uppercase tracking-tighter">Secure Payment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
