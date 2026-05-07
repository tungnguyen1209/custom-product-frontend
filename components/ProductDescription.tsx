"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-sm font-semibold text-gray-800 hover:text-[#ff6b6b] transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductDescription() {
  return (
    <div className="border border-gray-100 rounded-2xl px-5 py-1">
      <AccordionItem title="Product Description" defaultOpen>
        <p className="mb-3">
          Celebrate your graduate&apos;s big achievement with this beautifully
          personalised graduation sash featuring an adorable cartoon character
          design. Customised with the graduate&apos;s name and graduation year,
          it&apos;s a keepsake they&apos;ll cherish for years to come.
        </p>
        <ul className="space-y-2 list-none">
          {[
            "Unique cartoon character design inspired by the graduate",
            "Personalised with name and graduation year",
            "Perfect for Class of 2026 ceremonies",
            "Makes a wonderful gift for friends and family to give",
            "Suitable for high school, university, and college graduates",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="text-[#ff6b6b] mt-0.5 flex-shrink-0">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem title="Specifications">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Size", value: '72" × 6" (183cm × 15cm)' },
            { label: "Material", value: "100% Polyester Satin" },
            { label: "Print method", value: "Sublimation print" },
            { label: "Personalisation", value: "Name + Year" },
            { label: "Colour", value: "Full colour" },
            { label: "Packaging", value: "Gift box included" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {label}
              </span>
              <span className="text-sm font-medium text-gray-700">{value}</span>
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem title="Care Instructions">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-lg">🫧</span>
            <p>Hand wash in cool or warm water. Do not machine wash.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🌬️</span>
            <p>Hang to dry naturally. Do not tumble dry.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">♨️</span>
            <p>Iron on low heat if needed. Avoid ironing directly on printed areas.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🚫</span>
            <p>Do not bleach or dry clean.</p>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="Why Choose gifthub?">
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              icon: "🎨",
              title: "Handcrafted with care",
              desc: "Each item is individually personalised and quality-checked.",
            },
            {
              icon: "⚡",
              title: "Fast production",
              desc: "Orders are personalised and dispatched within 2–3 business days.",
            },
            {
              icon: "💌",
              title: "Gift-ready packaging",
              desc: "Every order arrives in our signature gift box at no extra cost.",
            },
            {
              icon: "🛡️",
              title: "99-Day guarantee",
              desc: "Not happy? We'll replace or refund — no questions asked.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AccordionItem>
    </div>
  );
}
