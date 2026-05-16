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

interface ProductDescriptionProps {
  description?: string | null;
}

/**
 * Crawled Shopify product descriptions arrive as HTML (with `<style>`,
 * `<video>`, paragraphs, etc.); legacy plain-text descriptions remain too.
 * The leading-tag check tells them apart so we can render rich HTML faithfully
 * without breaking older rows that stored only text.
 */
const HTML_LIKELY_RE = /<[a-z][\s\S]*?>/i;

export default function ProductDescription({ description }: ProductDescriptionProps = {}) {
  const hasHtml = !!description && HTML_LIKELY_RE.test(description);
  return (
    <div className="border border-gray-100 rounded-2xl px-5 py-1">
      <AccordionItem title="Product Description" defaultOpen>
        {description ? (
          hasHtml ? (
            <div
              className="product-description-html mb-3 text-sm leading-relaxed [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:list-disc [&_li]:ml-5 [&_ol_li]:list-decimal [&_strong]:font-semibold [&_a]:text-[#ff6b6b] [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded [&_video]:my-2 [&_video]:max-w-full [&_video]:rounded"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="mb-3 whitespace-pre-line">{description}</p>
          )
        ) : (
          <>
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
          </>
        )}
      </AccordionItem>

      <AccordionItem title="Shipping & Returns">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Production time", value: "2–3 business days" },
            { label: "Standard delivery", value: "10–12 business days" },
            { label: "Express delivery", value: "6–8 business days" },
            { label: "Return window", value: "30 days from delivery" },
            { label: "Refund time", value: "5–7 business days" },
            { label: "Shipping coverage", value: "Worldwide tracked" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {label}
              </span>
              <span className="text-sm font-medium text-gray-700">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          Personalised items can be returned if defective or damaged on arrival.
          Contact our support team within 30 days and we&apos;ll arrange a
          replacement or full refund — no questions asked.
        </p>
      </AccordionItem>

      <AccordionItem title="Personalization">
        <div className="space-y-3">
          <p>
            Please complete fields required to customize options
            (Name/Characteristics) and recheck carefully all the customized
            options.
          </p>
          <p>
            <span className="font-semibold text-gray-700">Text:</span>{" "}
            Standard English excluding special characters, emojis to ensure
            the best looking.
          </p>
          <p>
            <span className="font-semibold text-gray-700">Characteristics:</span>{" "}
            Pick one-by-one options that match your description.
          </p>
          <p>
            The last step, click{" "}
            <span className="font-semibold text-gray-700">&quot;Preview&quot;</span>{" "}
            to get a glimpse of the wonderful creation you&apos;ve made ❤️.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3 mt-1">
            Please be aware that the Preview may be slightly different from the
            physical item in terms of color due to our lighting at our product
            photoshoot or your device&apos;s display.
          </p>
        </div>
      </AccordionItem>
    </div>
  );
}
