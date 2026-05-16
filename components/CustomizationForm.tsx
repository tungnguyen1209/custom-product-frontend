"use client";

import {
  useEffect, useState, useRef, useCallback, useMemo, ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import WM from "@megaads/wm";

// `createPortal` is kept available for the mobile sticky CTA bar (which
// portals to document.body so it escapes the right-column transform/
// stacking context). Removing it here would force a fragile import dance
// later — leave it imported so the bar can mount without further churn.
import {
  Minus, Plus, ShoppingCart, Zap, Heart, Share2,
  CheckCircle, ImagePlus, Upload, X, Check, ChevronDown, Loader2, Eye, Ruler,
} from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

/* ─── Preview Modal ────────────────────────────────────────────────────── */

function PreviewModal({
  isOpen,
  onClose,
  imageUrl,
  onAddToCart,
  isAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onAddToCart: () => void;
  isAdded: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Preview Your Gift</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="relative aspect-square w-full rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 mb-6 flex items-center justify-center">
            <Zoom>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Personalization Preview"
                className="max-w-full max-h-full object-contain"
              />
            </Zoom>
          </div>

          <button
            onClick={onAddToCart}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
              isAdded
                ? "bg-green-500 text-white shadow-green-500/30"
                : "bg-[#ff6b6b] hover:bg-[#ee5253] text-white shadow-[#ff6b6b]/30"
            }`}
          >
            {isAdded ? (
              <>
                <CheckCircle className="w-6 h-6" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="w-6 h-6" /> Add to Cart
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
            * This is a digital preview. Actual product colors may vary slightly from the screen.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Swatch option ────────────────────────────────────────────────────── */

interface SwatchVal {
  id: number | string;
  valueName: string;
  thumbColor?: string;
  thumbImage?: string;
}

interface DropdownVal {
  id: number | string;
  valueName: string;
}

interface IOption {
  id: number;
  type: string;
  label: string;
  isShow: boolean;
  hideVisually?: boolean;
  isCallieHide?: boolean;
  required?: boolean;
  currentValue: number | string;
  swatchValues?: SwatchVal[];
  dropdownValues?: DropdownVal[];
  fileUploadImageId?: string | number;
  config?: {
    placeholder?: string;
    maxLength?: number;
    initialValue?: string;
    buttonText?: string;
    helpText?: string;
  };
}

function isOptionFilled(option: IOption): boolean {
  const v = option.currentValue;
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return !Number.isNaN(v);
  return Boolean(v);
}

function getMissingRequired(options: IOption[]): IOption[] {
  return options.filter(
    (o) => o.required && o.isShow && !o.hideVisually && !o.isCallieHide && !isOptionFilled(o),
  );
}

/* ─── Swatch option ────────────────────────────────────────────────────── */

function SwatchOption({
  option,
  onSelect,
  loadingValueId,
  showError,
}: {
  option: IOption;
  onSelect: (val: SwatchVal) => void;
  loadingValueId?: number | string | null;
  showError?: boolean;
}) {
  const values = option.swatchValues ?? [];
  const hasImages = values.some((v) => v.thumbImage);
  const selected = values.find((v) => v.id === option.currentValue);
  const errored = showError && option.required && !isOptionFilled(option);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-800">
          {option.label}
          {option.required && <span className="text-red-500 ml-0.5">*</span>}:
        </span>
        {selected && (
          <span className="text-sm text-gray-500 font-medium">{selected.valueName}</span>
        )}
        {errored && (
          <span className="text-xs text-red-500 font-semibold">Please select an option</span>
        )}
      </div>

      {hasImages ? (
        /* Image swatches – compact scrollable row */
        <div className="flex flex-wrap gap-2">
          {values.map((val) => {
            const isActive = val.id === option.currentValue;
            const isLoading = loadingValueId === val.id;
            return (
              <button
                key={val.id}
                onClick={() => !loadingValueId && onSelect(val)}
                title={val.valueName}
                disabled={!!loadingValueId}
                className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-50 transition-all focus:outline-none ${
                  isActive
                    ? "ring-2 ring-[#ff6b6b] ring-offset-2"
                    : "ring-1 ring-gray-200 hover:ring-[#ff6b6b] opacity-90 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={val.thumbImage}
                  alt={val.valueName}
                  className="w-full h-full object-contain p-0.5"
                />
                {isLoading ? (
                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#ff6b6b] rounded-full flex items-center justify-center">
                    <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
                  </span>
                ) : isActive ? (
                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#ff6b6b] rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        /* Color dot swatches */
        <div className="flex flex-wrap gap-2.5">
          {values.map((val) => {
            const isActive = val.id === option.currentValue;
            const isLoading = loadingValueId === val.id;
            return (
              <button
                key={val.id}
                onClick={() => !loadingValueId && onSelect(val)}
                title={val.valueName}
                disabled={!!loadingValueId}
                style={{ backgroundColor: val.thumbColor || "#ccc" }}
                className={`relative w-8 h-8 rounded-full border-2 border-white transition-all focus:outline-none shadow-sm ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-[#ff6b6b] scale-110"
                    : "hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
                }`}
              >
                {isLoading ? (
                  <Loader2
                    className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-sm animate-spin"
                  />
                ) : isActive ? (
                  <Check
                    className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-sm"
                    strokeWidth={4}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Variation option (rendered as radio pill cards) ─────────────────── */

/** True when the option group is some flavour of "Color" / "Colour". */
function isColorVariation(option: IOption): boolean {
  const label = option.label?.toLowerCase() ?? "";
  return label.includes("color") || label.includes("colour");
}

/** True when the option group is a Size selector. */
function isSizeVariation(option: IOption): boolean {
  return (option.label?.toLowerCase() ?? "").includes("size");
}

interface ResolvedColor {
  /** Canonical CSS color string (e.g. `#ff0000`) — falsy when the label
   *  doesn't resolve to a real CSS color. */
  bg: string | null;
  /** Whether the bg is light enough that we should render dark text on it. */
  isLight: boolean;
}

/** Convert a free-text colour label (e.g. `"Royal Blue"`, `"#aabbcc"`) into a
 *  canonical CSS colour by round-tripping through a canvas. Returns `null`
 *  when the label isn't a recognisable CSS colour. Runs only on the client. */
function resolveColorLabel(label: string): ResolvedColor {
  if (typeof document === "undefined") return { bg: null, isLight: false };
  const candidate = label.trim().toLowerCase().replace(/\s+/g, "");
  if (!candidate) return { bg: null, isLight: false };

  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return { bg: null, isLight: false };

  // Use a sentinel so we can detect when the browser rejected the colour
  // (it silently keeps the previous fillStyle in that case).
  const SENTINEL = "#abcabc";
  ctx.fillStyle = SENTINEL;
  ctx.fillStyle = candidate;
  const resolved = ctx.fillStyle as string;
  if (resolved.toLowerCase() === SENTINEL) {
    return { bg: null, isLight: false };
  }

  let r = 0;
  let g = 0;
  let b = 0;
  if (resolved.startsWith("#")) {
    let hex = resolved.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(resolved);
    if (m) {
      r = Number(m[1]);
      g = Number(m[2]);
      b = Number(m[3]);
    }
  }
  // Perceived luminance (Rec. 601). > 0.62 ≈ comfortable threshold for dark
  // text on the background.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return { bg: resolved, isLight: luminance > 0.62 };
}

function VariationRadioOption({
  option,
  onSelect,
  loadingValueId,
  showError,
  sizeChartHtml,
}: {
  option: IOption;
  onSelect: (val: DropdownVal) => void;
  loadingValueId?: number | string | null;
  showError?: boolean;
  sizeChartHtml?: string | null;
}) {
  const errored = showError && option.required && !isOptionFilled(option);
  const isColor = isColorVariation(option);
  const showSizeGuide =
    !!sizeChartHtml && sizeChartHtml.trim().length > 0 && isSizeVariation(option);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Stabilize the reference — `option.dropdownValues ?? []` produces a fresh
  // empty array on every render when the option has no values, which makes
  // useMemo below recompute pointlessly.
  const values = useMemo(
    () => option.dropdownValues ?? [],
    [option.dropdownValues],
  );

  // Customily can hand back values that share the same `id` (it's actually a
  // template/group identifier, not a per-value primary key). `valueName` is the
  // only field guaranteed to be unique within an option, so prefer it for
  // matching and rendering — falling back to id only when no value collides.
  const isValueSelected = (val: DropdownVal): boolean => {
    const current = option.currentValue;
    if (current === undefined || current === null || current === "") return false;
    if (val.valueName === current) return true;
    if (val.id !== undefined) {
      const idShared = values.some(
        (other) => other !== val && other.id === val.id,
      );
      if (!idShared) {
        if (val.id === current) return true;
        if (String(val.id) === String(current)) return true;
      }
    }
    return false;
  };

  // De-dupe by valueName — multiple Customily values can share the same id,
  // so id-based dedupe drops legitimate options.
  const uniqueValues = useMemo(() => {
    const seen = new Set<string>();
    const out: DropdownVal[] = [];
    for (const val of values) {
      if (seen.has(val.valueName)) continue;
      seen.add(val.valueName);
      out.push(val);
    }
    return out;
  }, [values]);

  // Resolve CSS colours for Colour-typed options. Done once per value-set on
  // the client; falls back to the regular pill rendering when the label
  // doesn't resolve.
  const colorMap = useMemo(() => {
    if (!isColor) return null;
    const map = new Map<string, ResolvedColor>();
    for (const val of uniqueValues) {
      map.set(val.valueName, resolveColorLabel(val.valueName));
    }
    return map;
  }, [isColor, uniqueValues]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">
            {option.label}
            {option.required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
          {errored && (
            <span className="text-xs text-red-500 font-semibold">
              Please select an option
            </span>
          )}
        </div>
        {showSizeGuide && (
          <button
            type="button"
            onClick={() => setSizeGuideOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff6b6b] hover:text-[#ee5253] underline decoration-dotted underline-offset-4"
          >
            <Ruler className="w-3.5 h-3.5" />
            Size guide
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {uniqueValues.map((val) => {
          const valKey = val.valueName;
          const isActive = isValueSelected(val);
          const isThisLoading =
            loadingValueId != null &&
            (loadingValueId === valKey ||
              String(loadingValueId) === String(valKey));
          const disabled = !!loadingValueId && !isThisLoading;
          const colorMeta = colorMap?.get(val.valueName);

          if (colorMeta && colorMeta.bg) {
            // Colour swatch: a plain coloured circle. The label is only kept
            // in the tooltip / accessibility name so the swatch grid stays
            // visually clean. Selected state is an outer coral ring with a
            // checkmark drawn over the swatch in a contrasting tint.
            const checkColor = colorMeta.isLight ? "#1f2937" : "#ffffff";
            return (
              <button
                key={valKey}
                type="button"
                onClick={() => !loadingValueId && onSelect(val)}
                disabled={disabled}
                aria-pressed={isActive}
                aria-label={val.valueName}
                title={val.valueName}
                className={`relative w-8 h-8 rounded-full transition-all select-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff6b6b]/40 ${
                  isActive
                    ? "ring-2 ring-offset-1 ring-[#ff6b6b] shadow-md"
                    : "ring-1 ring-inset ring-black/10 hover:ring-black/30 hover:scale-110"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                style={{ backgroundColor: colorMeta.bg }}
              >
                {isActive && (
                  <Check
                    className="absolute inset-0 m-auto w-3.5 h-3.5"
                    strokeWidth={3}
                    style={{ color: checkColor }}
                  />
                )}
                {isThisLoading && (
                  <Loader2 className="absolute -top-1 -right-1 w-3 h-3 text-[#ff6b6b] animate-spin bg-white rounded-full" />
                )}
              </button>
            );
          }

          // Default text-only pill for non-colour variations (or colours we
          // couldn't resolve to a real CSS value).
          return (
            <button
              key={valKey}
              type="button"
              onClick={() => !loadingValueId && onSelect(val)}
              disabled={disabled}
              aria-pressed={isActive}
              className={`relative inline-flex items-center justify-center min-w-[56px] px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all select-none focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/30 ${
                isActive
                  ? "border-[#ff6b6b] bg-white shadow-sm"
                  : errored
                    ? "border-red-300 bg-white hover:border-red-400"
                    : "border-gray-300 bg-white hover:border-gray-400"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`text-xs font-bold tracking-wide ${
                  isActive ? "text-[#ff6b6b]" : "text-gray-800"
                }`}
              >
                {val.valueName}
              </span>
              {isThisLoading && (
                <Loader2 className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[#ff6b6b] animate-spin bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      {showSizeGuide && (
        <SizeGuideModal
          html={sizeChartHtml!}
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Size guide modal ────────────────────────────────────────────────── */

type SizeUnit = "inch" | "cm";

/**
 * The source markup ships its own toggle (`.ks-unit-toggle` button row plus
 * `<div id="inches">` / `<div id="cm">` panels). Detecting whether each panel
 * exists is enough to decide if we should render our own segmented control —
 * the visual swap is driven by CSS scoped under `.size-guide-unit-*`.
 */
function detectUnitDivs(html: string): { hasInch: boolean; hasCm: boolean } {
  if (!html) return { hasInch: false, hasCm: false };
  // Match either the id (`inch`, `inches`) or a `.tabcontent.inches/.cm` class.
  const hasInch =
    /\bid\s*=\s*["']?inches?["'\s>]/i.test(html) ||
    /class\s*=\s*["'][^"']*\btabcontent\b[^"']*\binches?\b/i.test(html);
  const hasCm =
    /\bid\s*=\s*["']?cm["'\s>]/i.test(html) ||
    /class\s*=\s*["'][^"']*\btabcontent\b[^"']*\bcm\b/i.test(html);
  return { hasInch, hasCm };
}

function SizeGuideModal({
  html,
  open,
  onClose,
}: {
  html: string;
  open: boolean;
  onClose: () => void;
}) {
  const units = useMemo(() => detectUnitDivs(html), [html]);
  const hasBothUnits = units.hasInch && units.hasCm;
  // Default to inch when available, otherwise cm — picked once at mount
  // via a lazy initializer so the user's later choice isn't clobbered.
  const [unit, setUnit] = useState<SizeUnit>(() =>
    units.hasInch ? "inch" : units.hasCm ? "cm" : "inch",
  );

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
    >
      <button
        type="button"
        aria-label="Close size guide"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      />
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#fff0f0] text-[#ff6b6b] flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Size guide
              </h3>
              <p className="text-xs text-gray-500">
                Measurements as listed by the maker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {hasBothUnits && (
          <div className="px-6 pt-4 flex-shrink-0">
            <div
              role="tablist"
              aria-label="Measurement unit"
              className="inline-flex items-center gap-1 p-1 rounded-full bg-gray-100"
            >
              {(["inch", "cm"] as const).map((u) => {
                const active = unit === u;
                return (
                  <button
                    key={u}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setUnit(u)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      active
                        ? "bg-white text-[#ff6b6b] shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {u === "inch" ? "Inches" : "Centimeters"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="overflow-y-auto px-6 py-5 flex-1">
          <div
            className={`size-chart-content size-guide-content size-guide-unit-${unit}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Dropdown option (native <select>) ───────────────────────────────── */

function DropdownOption({
  option,
  onSelect,
  isLoading,
  showError,
}: {
  option: IOption;
  onSelect: (val: DropdownVal) => void;
  isLoading?: boolean;
  showError?: boolean;
}) {
  const values = option.dropdownValues ?? [];
  const errored = showError && option.required && !isOptionFilled(option);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-800">
        {option.label}
        {option.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={option.currentValue ?? ""}
          disabled={isLoading}
          onChange={(e) => {
            const chosen = values.find((v) =>
              typeof v.id !== "undefined"
                ? String(v.id) === e.target.value
                : v.valueName === e.target.value,
            );
            if (chosen) onSelect(chosen);
          }}
          className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 bg-white appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all ${
            errored
              ? "border-red-400 focus:ring-red-200 focus:border-red-500"
              : "border-gray-200 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
          }`}
        >
          <option value="">— Select {option.label} —</option>
          {values.map((val) => (
            <option
              key={
                typeof val.id !== "undefined"
                  ? String(val.id)
                  : val.valueName
              }
              value={
                typeof val.id !== "undefined"
                  ? String(val.id)
                  : val.valueName
              }
            >
              {val.valueName}
            </option>
          ))}
        </select>
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff6b6b] animate-spin pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
      </div>
      {errored && (
        <p className="text-xs text-red-500 font-semibold">
          Please select an option
        </p>
      )}
    </div>
  );
}

/* ─── Text-input option ────────────────────────────────────────────────── */

function TextInputOption({
  option,
  onChange,
  showError,
}: {
  option: IOption;
  onChange: (val: string) => void;
  showError?: boolean;
}) {
  const maxLen = option.config?.maxLength ?? 100;
  const placeholder = option.config?.placeholder ?? "Enter text...";
  const value = String(option.currentValue ?? "");
  const errored = showError && option.required && !isOptionFilled(option);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-800">
        {option.label}
        {option.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          maxLength={maxLen}
          rows={maxLen > 60 ? 4 : 1}
          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 bg-white resize-none placeholder:text-gray-400 transition-all ${
            errored
              ? "border-red-400 focus:ring-red-200 focus:border-red-500"
              : "border-gray-200 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
          }`}
          style={{ minHeight: maxLen > 60 ? undefined : "48px" }}
        />
        <span
          className={`absolute bottom-3 right-4 text-[10px] font-bold pointer-events-none ${
            value.length >= maxLen * 0.9 ? "text-orange-500" : "text-gray-300"
          }`}
        >
          {value.length}/{maxLen}
        </span>
      </div>
      {errored && (
        <p className="text-xs text-red-500 font-semibold">Please enter a value</p>
      )}
    </div>
  );
}

/* ─── Image-upload option ──────────────────────────────────────────────── */

interface UploadedPreview {
  name: string;
  dataUrl: string;
}

function ImageUploadOption({
  option,
  onUpload,
  showError,
}: {
  option: IOption;
  onUpload: (dataUrl: string) => void;
  showError?: boolean;
}) {
  const [preview, setPreview] = useState<UploadedPreview | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const errored = showError && option.required && !isOptionFilled(option) && !preview;

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview({ name: file.name, dataUrl });
        onUpload(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onUpload],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const helpText =
    option.config?.helpText ?? "Upload a photo for your gift design";
  const buttonText = option.config?.buttonText ?? "Choose photo from device";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-800">
        {option.label}
        {option.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {helpText && <p className="text-[11px] text-gray-400 -mt-1">{helpText}</p>}

      {preview ? (
        <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#ff6b6b] bg-[#fff0f0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.dataUrl}
            alt="preview"
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              {preview.name}
            </p>
            <p className="text-[11px] font-bold text-[#ff6b6b] mt-0.5 uppercase tracking-wider">Uploaded ✓</p>
            <button
              onClick={() => {
                setPreview(null);
                onUpload("");
              }}
              className="mt-2 text-xs text-gray-400 hover:text-[#ff6b6b] flex items-center gap-1.5 font-bold transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Remove photo
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2.5 py-8 px-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? "border-[#ff6b6b] bg-[#fff0f0]"
              : errored
                ? "border-red-400 bg-red-50/40 hover:border-red-500"
                : "border-gray-200 hover:border-[#ff6b6b] hover:bg-gray-50/50"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">
              {dragging ? "Drop photo here" : buttonText}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">
              JPG, PNG, WEBP · Max 10 MB
            </p>
          </div>
          <span className="text-xs text-[#ff6b6b] flex items-center gap-1.5 font-bold mt-1">
            <Upload className="w-3.5 h-3.5" /> Browse files
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processFile(f);
            }}
          />
        </div>
      )}
      {errored && (
        <p className="text-xs text-red-500 font-semibold">Please upload a photo</p>
      )}
    </div>
  );
}

/* ─── Quantity + CTA strip ─────────────────────────────────────────────── */

function CartStrip({
  onPreview,
  onAdd,
  added,
  adding,
  missingRequired,
}: {
  onPreview: () => void;
  onAdd: () => void;
  added: boolean;
  adding: boolean;
  missingRequired: IOption[];
}) {
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const blocked = missingRequired.length > 0;

  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* Quantity */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-800">Quantity</label>
        <div className="flex items-center">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="w-12 h-12 flex items-center justify-center rounded-l-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-40"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min={1}
            max={99}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(99, Number(e.target.value))))
            }
            className="w-16 h-12 text-center border-t border-b border-gray-200 text-sm font-bold focus:outline-none bg-white"
          />
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="w-12 h-12 flex items-center justify-center rounded-r-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-4">
        {blocked && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            <p className="font-bold mb-1">Please complete the required options:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {missingRequired.map((o) => (
                <li key={o.id} className="font-medium">{o.label}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={onPreview}
          className="w-full py-4 rounded-2xl font-bold text-sm bg-white hover:bg-gray-50 text-gray-900 transition-all flex items-center justify-center gap-2.5 border-2 border-gray-100 shadow-sm"
        >
          <Eye className="w-5 h-5 text-[#ff6b6b]" /> Preview Your Design
        </button>
        <button
          onClick={onAdd}
          disabled={adding}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#ff6b6b]/20 disabled:opacity-80 disabled:cursor-wait ${
            added
              ? "bg-green-500 text-white shadow-green-500/20"
              : "bg-[#ff6b6b] hover:bg-[#ee5253] text-white"
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="w-5 h-5" /> Added to Cart!
            </>
          ) : adding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </>
          )}
        </button>
      </div>

      {/* Wishlist / share */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-[#ff6b6b] transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-[#ff6b6b] text-[#ff6b6b]" : ""}`}
          />
          {wishlisted ? "Saved" : "Wishlist"}
        </button>
        <button className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-[#ff6b6b] transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
}

/* ─── Template broadcast helper ───────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function broadcastTemplate(svc: any, isUserInteraction = false) {
  const tmpl = svc.getTemplate?.();
  if (!tmpl) return;
  (window as unknown as Record<string, unknown>).__wmTemplate = tmpl;
  window.dispatchEvent(new CustomEvent("wm-template-update", { detail: { template: tmpl, isUserInteraction } }));
}

/* ─── Main component ───────────────────────────────────────────────────── */

import { API_BASE_URL, CUSTOMIZATION_BASE_URL } from "@/lib/api";

/**
 * Ask the WM service for a fresh preview dataUrl by piggybacking on the
 * existing wm-request-preview / wm-show-preview event pair.
 */
function requestCanvasPreview(timeoutMs = 8000): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let settled = false;
    const onShow = (e: Event) => {
      if (settled) return;
      const dataUrl = (e as CustomEvent).detail?.dataUrl;
      if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
        settled = true;
        window.removeEventListener("wm-show-preview", onShow);
        resolve(dataUrl);
      }
    };
    window.addEventListener("wm-show-preview", onShow);
    window.dispatchEvent(new CustomEvent("wm-request-preview"));
    setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener("wm-show-preview", onShow);
      resolve(null);
    }, timeoutMs);
  });
}

async function uploadCartPreview(dataUrl: string): Promise<string | null> {
  try {
    const sessionId =
      typeof window !== "undefined"
        ? localStorage.getItem("cart_session_id") || undefined
        : undefined;
    const res = await fetch(`${API_BASE_URL}/uploads/cart-preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionId ? { "x-session-id": sessionId } : {}),
      },
      body: JSON.stringify({ dataUrl }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { url?: string };
    return json.url ?? null;
  } catch {
    return null;
  }
}

const BASE_URL = CUSTOMIZATION_BASE_URL;

// Defensive normalization: backend should already send `elements` as an array,
// but accept a Record map too (older cached rows) just in case.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTemplate(template: any): any | null {
  if (!template) return null;
  const els = template.elements;
  if (els && !Array.isArray(els) && typeof els === "object") {
    return { ...template, elements: Object.values(els) };
  }
  return template;
}

// Pick initial template from the customization payload.
// Prefers the inline `template` field; falls back to lazy-fetching by id.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveInitialTemplate(customization: any): Promise<any | null> {
  if (customization?.template) return normalizeTemplate(customization.template);

  const initId =
    customization?.initialTemplateId ?? customization?.initialtemplateId;
  if (!initId) return null;

  try {
    const res = await fetch(`${CUSTOMIZATION_BASE_URL}/template/${initId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return normalizeTemplate(json?.result);
  } catch {
    return null;
  }
}

import { useCart } from "@/context/CartContext";
import { getProductCustomization, type ProductCustomizationData } from "@/lib/api";

interface CustomizationFormProps {
  productId: string;
  productName?: string;
  basePrice?: number;
  /** First gallery image URL — used as the thumbnail in the mobile
   *  sticky CTA bar. */
  imageUrl?: string | null;
  customization?: ProductCustomizationData | null;
  customizationError?: boolean;
  /** Sanitized HTML for the Size Guide popup. When provided, a "Size guide"
   *  link is rendered next to any variation option whose label is Size. */
  sizeChartHtml?: string | null;
}

export default function CustomizationForm({
  productId,
  productName = `Product ${productId}`,
  basePrice = 0,
  imageUrl = null,
  customization: customizationProp,
  customizationError: customizationErrorProp,
  sizeChartHtml = null,
}: CustomizationFormProps) {
  const [internalCustomization, setInternalCustomization] =
    useState<ProductCustomizationData | null>(null);
  const [internalCustomizationError, setInternalCustomizationError] =
    useState(false);

  // If parent didn't supply customization, fetch it ourselves so this
  // component remains usable standalone (e.g. on the home page showcase).
  useEffect(() => {
    if (customizationProp !== undefined || customizationErrorProp) return;
    let cancelled = false;
    getProductCustomization(productId)
      .then((data) => {
        if (!cancelled) setInternalCustomization(data);
      })
      .catch(() => {
        if (!cancelled) setInternalCustomizationError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, customizationProp, customizationErrorProp]);

  const customization =
    customizationProp !== undefined ? customizationProp : internalCustomization;
  const customizationError = customizationErrorProp || internalCustomizationError;
  const { addItem, openMiniCart } = useCart();
  const [options, setOptions] = useState<IOption[]>([]);
  const [ready, setReady] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  // Live price state — initialised from `basePrice` and updated by the
  // variant-selection useEffect via the `wm-price-update` event. Used by
  // the mobile sticky CTA bar at the bottom of the screen so it always
  // reflects the currently-selected variant.
  const [currentPrice, setCurrentPrice] = useState<number>(basePrice);
  const [currentComparePrice, setCurrentComparePrice] = useState<number | null>(null);
  useEffect(() => {
    setCurrentPrice(basePrice);
  }, [basePrice]);
  useEffect(() => {
    const onPriceUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{
        price?: number | null;
        comparePrice?: number | null;
      }>).detail;
      if (detail?.price != null && !Number.isNaN(detail.price)) {
        setCurrentPrice(detail.price);
      }
      setCurrentComparePrice(
        detail?.comparePrice != null && !Number.isNaN(detail.comparePrice)
          ? detail.comparePrice
          : null,
      );
    };
    window.addEventListener("wm-price-update", onPriceUpdate);
    return () => window.removeEventListener("wm-price-update", onPriceUpdate);
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceRef = useRef<any>(null);

  /* Preview + Cart logic */
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showRequiredErrors, setShowRequiredErrors] = useState(false);
  // True while we're piggybacking on wm-show-preview just to capture an image
  // for cart upload — suppresses the global "open preview modal" listener.
  const silentPreviewRef = useRef(false);

  const missingRequired = getMissingRequired(options);

  useEffect(() => {
    if (showRequiredErrors && missingRequired.length === 0) {
      setShowRequiredErrors(false);
    }
  }, [showRequiredErrors, missingRequired.length]);

  /* ── Variant price + URL sync ─────────────────────────────────────── */
  // Build a lookup from publicTitle → variant.
  // Variant entries come from product_variants table (filled by the variant
  // crawler) with their publicTitle matching Shopify's joined options.
  const variantsByCombo = useMemo(() => {
    const map = new Map<
      string,
      { variantId: string; price: number | null; comparePrice: number | null }
    >();
    for (const v of customization?.variants ?? []) {
      const key = v.publicTitle ?? "";
      map.set(key, {
        variantId: v.variantId,
        price: v.price,
        comparePrice: v.comparePrice,
      });
    }
    return map;
  }, [customization]);

  // Backward-compat: also keep a flat ID lookup so variants without option1/2/3
  // (older shops, derived from variations[].values[].product_id) still work.
  const variantById = useMemo(() => {
    const map = new Map<
      string,
      { price: number | null; comparePrice: number | null }
    >();
    for (const v of customization?.variants ?? []) {
      map.set(String(v.variantId), {
        price: v.price,
        comparePrice: v.comparePrice,
      });
    }
    return map;
  }, [customization]);

  const variationOptionIds = useMemo(
    () => customization?.variationOptionIds ?? [],
    [customization],
  );

  // Map variation slot ↔ position in `options`. We can't key by `opt.id`
  // alone: the backend can emit duplicate IDs in `variationOptionIds` when
  // Shopify ships more variant columns than Customily defines (product
  // #455 has 3 Shopify columns Style/Option/Size but only 2 Customily
  // variations, so slots 1 and 2 share the same Customily ID). Building
  // `new Map<id, vIdx>` collapses duplicates; consuming `options`
  // left-to-right matches `variationOptionIds[k]` to the first
  // not-yet-claimed option with that ID and keeps each slot distinct.
  const variationSlots = useMemo(() => {
    const slotByOptIdx = new Map<number, number>();
    const optIdxBySlot: number[] = new Array(variationOptionIds.length).fill(
      -1,
    );
    let cursor = 0;
    for (
      let optIdx = 0;
      optIdx < options.length && cursor < variationOptionIds.length;
      optIdx++
    ) {
      if (options[optIdx].id === variationOptionIds[cursor]) {
        slotByOptIdx.set(optIdx, cursor);
        optIdxBySlot[cursor] = optIdx;
        cursor++;
      }
    }
    return { slotByOptIdx, optIdxBySlot };
  }, [options, variationOptionIds]);

  // Rebuild each variation option's value list from the Shopify variants so
  // the radio pills always show every valid Style/Size/etc. combination, even
  // when Customily's `dropdownValues` is configured with fewer entries than
  // Shopify has variants. Falls back to the option's original values when no
  // variants are available.
  const filteredOptions = useMemo(() => {
    if (variationOptionIds.length === 0 || variantsByCombo.size === 0) return options;

    // Lenient comparison — Shopify variant titles and Customily value names can
    // disagree on whitespace, case, and fancy quotes (e.g. `17″ x 11″` vs
    // `17″x11″` vs `17x11`). Strip everything except alphanumerics so values
    // match regardless of formatting.
    const normalize = (s: unknown): string =>
      String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const allCombos = Array.from(variantsByCombo.keys()).map((k) =>
      k.split(" / ").map((p) => p.trim()),
    );

    const currentSelectionNames = variationOptionIds.map((_optId, vIdx) => {
      const optIdx = variationSlots.optIdxBySlot[vIdx];
      const opt = optIdx >= 0 ? options[optIdx] : undefined;
      if (!opt || opt.currentValue == null || opt.currentValue === "") return null;
      const match =
        opt.dropdownValues?.find(
          (v) => v.id === opt.currentValue || v.valueName === opt.currentValue,
        ) ??
        opt.swatchValues?.find(
          (v) => v.id === opt.currentValue || v.valueName === opt.currentValue,
        );
      return match ? String(match.valueName) : null;
    });
    const currentSelectionKeys = currentSelectionNames.map(normalize);

    // Per-position list of valid valueNames derived from the variants.
    const validNamesByPosition = new Map<number, string[]>();
    for (let vIdx = 0; vIdx < variationOptionIds.length; vIdx++) {
      const seenKeys = new Set<string>();
      const ordered: string[] = [];
      for (const combo of allCombos) {
        const cell = combo[vIdx];
        if (cell == null) continue;
        let earlierMatches = true;
        for (let i = 0; i < vIdx; i++) {
          if (
            currentSelectionKeys[i] &&
            normalize(combo[i]) !== currentSelectionKeys[i]
          ) {
            earlierMatches = false;
            break;
          }
        }
        if (!earlierMatches) continue;
        const key = normalize(cell);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        ordered.push(cell);
      }
      validNamesByPosition.set(vIdx, ordered);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildVariationValues = <T extends { valueName: string; id?: any }>(
      original: T[] | undefined,
      validNames: string[],
      optId: number,
    ): T[] => {
      const out: T[] = [];
      for (let i = 0; i < validNames.length; i++) {
        const variantName = validNames[i];
        // Prefer exact-name match first — Customily can have two distinct
        // entries that normalize identically (e.g. `24″ x 16″` for POSTER and
        // `24″x16″` for CANVAS), each with its own templateId.
        const exact = original?.find((v) => v.valueName === variantName);
        const key = normalize(variantName);
        const match = exact ?? original?.find((v) => normalize(v.valueName) === key);
        if (match) {
          out.push({ ...match, valueName: variantName });
        } else {
          // Synthesize using the first real entry as a template so optional
          // fields the service expects still exist.
          const template = (original?.[0] ?? {}) as T;
          out.push({
            ...template,
            id: `__variant_${optId}_${key || i}`,
            valueName: variantName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        }
      }
      return out;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pickFallback = (values: Array<{ id?: any; valueName: string }>) => {
      const first = values[0];
      if (!first) return null;
      const idShared =
        first.id !== undefined &&
        values.some((v) => v !== first && v.id === first.id);
      return idShared || first.id === undefined
        ? first.valueName
        : (first.id as string | number);
    };

    const isCurrentValid = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      values: Array<{ id?: any; valueName: string }>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current: any,
    ): boolean => {
      if (current === undefined || current === null || current === "") return false;
      return values.some(
        (v) => v.valueName === current || (v.id !== undefined && v.id === current),
      );
    };

    const nextOptions = options.map((opt, optIdx) => {
      const vIdx = variationSlots.slotByOptIdx.get(optIdx);
      if (vIdx === undefined) return opt;
      const validNames = validNamesByPosition.get(vIdx) ?? [];

      if (opt.swatchValues) {
        const built = buildVariationValues(opt.swatchValues, validNames, opt.id);
        const corrected = isCurrentValid(built, opt.currentValue)
          ? opt.currentValue
          : (pickFallback(built) ?? opt.currentValue);
        return { ...opt, swatchValues: built, currentValue: corrected };
      }
      if (opt.dropdownValues) {
        const built = buildVariationValues(
          opt.dropdownValues,
          validNames,
          opt.id,
        );
        const corrected = isCurrentValid(built, opt.currentValue)
          ? opt.currentValue
          : (pickFallback(built) ?? opt.currentValue);
        return { ...opt, dropdownValues: built, currentValue: corrected };
      }
      return opt;
    });

    return nextOptions;
  }, [options, variationOptionIds, variantsByCombo, variationSlots]);

  // After every option mutation, read the user's current selection on the
  // variation dropdowns (in option1, option2, option3 order), build a combo
  // key, and look up the matching variant. Falls back to direct ID match if
  // combo lookup misses (old data shape).
  useEffect(() => {
    if (filteredOptions.length === 0) return;

    // Collect value names from variation dropdowns in declared order.
    // Index by slot (not by id) so duplicate `variationOptionIds` map to
    // distinct options — see `variationSlots` for context.
    const selectedNames: string[] = [];
    for (let vIdx = 0; vIdx < variationOptionIds.length; vIdx++) {
      const optIdx = variationSlots.optIdxBySlot[vIdx];
      const opt = optIdx >= 0 ? filteredOptions[optIdx] : undefined;
      if (!opt) {
        selectedNames.push("");
        continue;
      }
      const currentVal = opt.currentValue;
      let name = "";
      if (currentVal != null) {
        const match =
          opt.dropdownValues?.find((v) => v.id === currentVal || v.valueName === currentVal) ??
          opt.swatchValues?.find((v) => v.id === currentVal || v.valueName === currentVal);
        if (match?.valueName) {
          name = String(match.valueName);
        } else if (typeof currentVal === "string") {
          name = currentVal;
        }
      }
      selectedNames.push(name);
    }

    let matchedId: string | null = null;
    let matchedEntry:
      | { price: number | null; comparePrice: number | null }
      | null = null;

    // Primary path: combo match (exact first, then normalized fallback for
    // sources where the dropdown valueName disagrees with the variant
    // publicTitle on whitespace/quotes).
    if (
      variantsByCombo.size > 0 &&
      variationOptionIds.length > 0 &&
      selectedNames.some((n) => n.length > 0)
    ) {
      const filtered = selectedNames.filter((n) => n.length > 0);
      const comboKey = filtered.join(" / ");
      let hit = variantsByCombo.get(comboKey);

      if (!hit) {
        const normalize = (s: string): string =>
          s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const target = filtered.map(normalize).join("|");
        for (const [k, v] of variantsByCombo) {
          const candidate = k.split(" / ").map((p) => normalize(p.trim())).join("|");
          if (candidate === target) {
            hit = v;
            break;
          }
        }
      }

      if (hit) {
        matchedId = hit.variantId;
        matchedEntry = { price: hit.price, comparePrice: hit.comparePrice };
      } else {
        console.log("--> Combo match FAILED. Not found in variantsByCombo.");
      }
    }

    // Fallback: an option's currentValue happens to BE a Shopify variant ID
    // (older shops without conf_variants, where variations[].values[].product_id
    // is the variant ID directly).
    if (!matchedId && variantById.size > 0) {
      for (let vIdx = 0; vIdx < variationOptionIds.length; vIdx++) {
        const optIdx = variationSlots.optIdxBySlot[vIdx];
        const opt = optIdx >= 0 ? options[optIdx] : undefined;
        if (!opt) continue;
        const v = opt.currentValue;
        if (v == null) continue;
        const entry = variantById.get(String(v).trim());
        if (entry) {
          matchedId = String(v).trim();
          matchedEntry = entry;
          break;
        }
      }
    }

    if (!matchedId || !matchedEntry) {
      if (typeof window !== "undefined") {
        console.warn("[variant] NO MATCH FOUND. Aborting URL/Price update.", {
          variationOptionIds,
          selectedNames,
          combosKnown: [...variantsByCombo.keys()],
        });
      }
      return;
    }

    window.dispatchEvent(
      new CustomEvent("wm-price-update", {
        detail: {
          variantId: matchedId,
          price: matchedEntry.price,
          comparePrice: matchedEntry.comparePrice,
        },
      }),
    );

    // Mirror the selected variant into the URL so the page is shareable and
    // matches Shopify's `?variant=<id>` convention. Use replaceState so the
    // back button still goes to the previous page, not the previous variant.
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("variant") !== matchedId) {
        url.searchParams.set("variant", matchedId);
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      /* ignore — URL not parseable */
    }
  }, [options, variantsByCombo, variantById, variationOptionIds, variationSlots, filteredOptions]);

  const focusMissing = useCallback((missing: IOption[]) => {
    if (missing.length === 0 || typeof document === "undefined") return;
    const el = document.querySelector<HTMLElement>(
      `[data-option-id="${missing[0].id}"]`,
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleAdd = useCallback(async () => {
    if (adding) return;
    const missing = getMissingRequired(options);
    if (missing.length > 0) {
      setShowRequiredErrors(true);
      focusMissing(missing);
      return;
    }

    setAdding(true);

    const selected: Record<string, any> = {};
    options.forEach(opt => {
      if (opt.currentValue) {
        selected[opt.label] = opt.currentValue;
      }
    });

    const rawTemplate = serviceRef.current?.getTemplate?.();
    const rawElements: any[] = !rawTemplate
      ? []
      : Array.isArray(rawTemplate.elements)
        ? rawTemplate.elements
        : rawTemplate.elements
          ? Object.values(rawTemplate.elements)
          : [];

    // Keep only visible elements (isShow) OR fully opaque ones — drops hidden
    // helper layers (guides, bounding boxes) that the editor uses internally
    // but don't belong in the order snapshot.
    const visibleElements = rawElements.filter(
      (el) => el?.isShow === true || el?.opacity === 1,
    );

    const canvas = rawTemplate
      ? {
          width: rawTemplate.width,
          height: rawTemplate.height,
          baseFile: rawTemplate.baseFile,
          elements: visibleElements,
        }
      : undefined;

    let previewImageUrl: string | null = null;
    silentPreviewRef.current = true;
    try {
      const dataUrl = await requestCanvasPreview();
      if (dataUrl) {
        previewImageUrl = await uploadCartPreview(dataUrl);
      }
    } catch (err) {
      console.warn('Preview capture/upload failed; continuing without preview', err);
    } finally {
      silentPreviewRef.current = false;
    }

    // Use the price of the currently selected variant when available so the
    // cart line reflects what the customer actually saw on the page.
    let activeUnitPrice = basePrice;
    if (variationOptionIds.length > 0 && variantsByCombo.size > 0) {
      const names = variationOptionIds.map((_optId, vIdx) => {
        const optIdx = variationSlots.optIdxBySlot[vIdx];
        const opt = optIdx >= 0 ? options[optIdx] : undefined;
        if (!opt || opt.currentValue == null) return "";
        const v = opt.currentValue;
        const match =
          opt.dropdownValues?.find((d) => d.id === v) ??
          opt.swatchValues?.find((s) => s.id === v);
        return match?.valueName ?? "";
      });
      const comboKey = names.filter(n => n.length > 0).join(" / ");
      const hit = variantsByCombo.get(comboKey);
      if (hit?.price != null) activeUnitPrice = hit.price;
    }
    if (activeUnitPrice === basePrice && variantById.size > 0) {
      // Fallback to direct ID match
      for (const opt of options) {
        const v = opt.currentValue;
        if (v == null) continue;
        const entry = variantById.get(String(v).trim());
        if (entry?.price != null) activeUnitPrice = entry.price;
      }
    }

    try {
      await addItem({
        productId: parseInt(productId),
        productName,
        unitPrice: activeUnitPrice,
        customization: selected,
        canvas,
        previewImageUrl: previewImageUrl ?? undefined,
      });
      setAdded(true);
      openMiniCart();
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  }, [adding, addItem, openMiniCart, productId, options, productName, basePrice, focusMissing, variantsByCombo, variantById, variationOptionIds, variationSlots]);

  const handlePreviewRequest = useCallback(() => {
    const missing = getMissingRequired(options);
    if (missing.length > 0) {
      setShowRequiredErrors(true);
      focusMissing(missing);
      return;
    }
    window.dispatchEvent(new CustomEvent("wm-request-preview"));
  }, [options, focusMissing]);

  useEffect(() => {
    const onShowPreview = (e: Event) => {
      // When handleAdd is silently capturing a preview for cart upload,
      // suppress the modal so it doesn't pop up unexpectedly.
      if (silentPreviewRef.current) return;
      const dataUrl = (e as CustomEvent).detail?.dataUrl;
      if (dataUrl) {
        setPreviewImageUrl(dataUrl);
        setIsPreviewOpen(true);
      }
    };
    window.addEventListener("wm-show-preview", onShowPreview);
    return () => window.removeEventListener("wm-show-preview", onShowPreview);
  }, []);

  /* Init WM service when customization data arrives (client-only, no SSR) */
  useEffect(() => {
    if (customizationError) {
      setFetchError(true);
      return;
    }
    if (!customization) return;

    let cancelled = false;

    async function init() {
      try {
        const rawOptions = customization?.options ?? [];
        const rawTemplate = await resolveInitialTemplate(customization);

        if (cancelled) return;

        if (!rawTemplate || !rawOptions.length) {
          console.error("[CustomizationForm] Missing template or options", {
            hasTemplate: !!rawTemplate,
            optionsCount: rawOptions.length,
            customization,
          });
          setErrorDetail(
            !rawTemplate
              ? "Không tìm được template cho sản phẩm"
              : "Không có options customization",
          );
          setFetchError(true);
          return;
        }

        const svc = WM.initCustomization({
          template: rawTemplate,
          options: rawOptions,
          baseUrl: BASE_URL,
          breadcrumbs: [],
          isAllowReplaceBackground: false,
          isShowExcessiveOption: true
        });

        serviceRef.current = svc;
        await svc.fetchImageUrlsFirstTime();

        // Pre-fill variation dropdowns. If the URL carries `?variant=<id>`,
        // pre-select the values that compose that variant (e.g. landing on a
        // shared "Unisex / WITH POCKET / XL" link drops the user straight
        // onto that combo with its price). Otherwise fall back to the first
        // value per slot — same behaviour as before so non-shareable visits
        // still see a usable initial state.
        //
        // We mutate `currentValue` directly and skip calling
        // `selectOptionValue` per option — re-entering the service per option
        // during init triggers extra element rebuilds that can leave
        // duplicate state.
        const initVariationIds: number[] =
          customization?.variationOptionIds ?? [];
        const initOpts = svc.getOptions() as unknown as IOption[];

        // Parse `?variant=<id>` into per-slot value names from the matching
        // variant's publicTitle (Shopify uses " / " as the joiner).
        const urlVariantId =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("variant")
            : null;
        let variantSlotNames: string[] | null = null;
        if (urlVariantId) {
          const v = (customization?.variants ?? []).find(
            (x) => String(x.variantId) === urlVariantId,
          );
          if (v?.publicTitle) {
            variantSlotNames = v.publicTitle
              .split(" / ")
              .map((s) => s.trim());
          }
        }

        // Slot → option index. Walk left-to-right matching each
        // `variationOptionIds[k]` to the first not-yet-claimed option with
        // that id (same logic as `variationSlots` lower down — repeated here
        // because that useMemo hasn't run yet at init time).
        const optIdxBySlot: number[] = new Array(initVariationIds.length).fill(
          -1,
        );
        {
          let cursor = 0;
          for (
            let i = 0;
            i < initOpts.length && cursor < initVariationIds.length;
            i++
          ) {
            if (initOpts[i].id === initVariationIds[cursor]) {
              optIdxBySlot[cursor] = i;
              cursor++;
            }
          }
        }

        // Lenient comparison so `Medium` vs `medium` vs `MEDIUM ` match.
        const normalize = (s: unknown): string =>
          String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

        for (let slot = 0; slot < initVariationIds.length; slot++) {
          const optIdx = optIdxBySlot[slot];
          if (optIdx < 0) continue;
          const opt = initOpts[optIdx];
          if (opt.type !== "dropdown") continue;

          let target = opt.dropdownValues?.[0];
          let fromVariant = false;

          // Prefer the variant-derived value when the URL gave us one. Falls
          // back to the first dropdown value when the variant's name for
          // this slot can't be matched (e.g. older publicTitle with a typo).
          if (variantSlotNames && variantSlotNames[slot]) {
            const key = normalize(variantSlotNames[slot]);
            const match = opt.dropdownValues?.find(
              (v) => normalize(v.valueName) === key,
            );
            if (match) {
              target = match;
              fromVariant = true;
            }
          }

          if (!target) continue;
          // Variant overrides any default-template pre-fill (the customer
          // explicitly asked for this combo via the URL). The fallback path
          // (no variant URL, or unmatched name) still respects an already-
          // filled value so we don't trample a template default.
          if (!fromVariant && isOptionFilled(opt)) continue;
          // Same defence as `handleSelectValue` — when ids are shared, the
          // `valueName` is the only field that uniquely identifies a value.
          const idShared =
            target.id !== undefined &&
            (opt.dropdownValues ?? []).some(
              (v) => v !== target && v.id === target.id,
            );
          opt.currentValue = idShared
            ? target.valueName
            : typeof target.id !== "undefined"
              ? target.id
              : target.valueName;
        }

        if (!cancelled) {
          setOptions([...svc.getOptions()]);
          setReady(true);
          broadcastTemplate(svc);
        }
      } catch (err) {
        console.error("[CustomizationForm] Init failed:", err, {
          customization,
        });
        if (!cancelled) {
          setErrorDetail(err instanceof Error ? err.message : String(err));
          setFetchError(true);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [customization, customizationError]);

  /* Sync options state after any mutation. `revealCanvas` controls whether
   * this interaction should flip the gallery from static images to the live
   * personalization canvas. Variant changes (size/style/colour pills) pass
   * `false` — picking a shirt size shouldn't drag the user's eye to a
   * preview they haven't asked for yet. Touching a real personalization
   * option (text, image, design colour) passes `true` and the canvas
   * reveals itself. */
  const syncOptions = useCallback((revealCanvas = true) => {
    if (serviceRef.current) {
      setOptions([...serviceRef.current.getOptions()]);
      broadcastTemplate(serviceRef.current, revealCanvas);
    }
  }, []);

  /* Handle swatch / dropdown selection */
  const handleSelectValue = useCallback(
    async (option: IOption, val: SwatchVal | DropdownVal) => {
      // Multiple options can share an id when Shopify ships more variant
      // columns than Customily defines (product #455's Style/Pocket/Size
      // where Pocket and Size both ride id 12711985971503). `find` always
      // returns the FIRST match, which silently routes Size clicks to
      // Pocket. Disambiguate by which candidate actually carries the value
      // the user clicked — `valueName` is the most reliable cross-option
      // discriminator since the original `options` (pre-filter) and the
      // rendered list both expose it.
      const candidates = options.filter((o) => o.id === option.id);
      let targetOption: IOption | undefined;
      if (candidates.length <= 1) {
        targetOption = candidates[0];
      } else {
        targetOption =
          candidates.find((o) => {
            const values =
              (o.dropdownValues as
                | Array<{ valueName?: unknown }>
                | undefined) ??
              (o.swatchValues as
                | Array<{ valueName?: unknown }>
                | undefined) ??
              [];
            return values.some(
              (v) =>
                v.valueName !== undefined && v.valueName === val.valueName,
            );
          }) ?? candidates[0];
      }
      if (!targetOption) return;

      // If the value's `id` is shared with another value in the same option
      // (Customily template/group ids are not unique per value), the id can't
      // uniquely identify the selection — store the valueName instead so the
      // pill highlights deterministically.
      const peers =
        (targetOption.dropdownValues as Array<{ id?: unknown }> | undefined) ??
        (targetOption.swatchValues as Array<{ id?: unknown }> | undefined) ??
        [];
      const idShared =
        val.id !== undefined &&
        peers.some((p) => p !== val && p.id === val.id);
      const valueId = idShared
        ? val.valueName
        : typeof val.id !== "undefined"
          ? val.id
          : val.valueName;
      const key = `${option.id}:${valueId}`;

      // Variant options (size/style/colour pills wired to Shopify variants)
      // shouldn't unmask the personalization canvas — only real design edits
      // should. We pass `revealCanvas=false` for the variant path so the
      // gallery stays on the static images until the user touches a real
      // customization control.
      const isVariantSelection = variationOptionIds.includes(targetOption.id);
      targetOption.currentValue = valueId;
      syncOptions(!isVariantSelection);
      setProcessingKey(key);
      try {
        await serviceRef.current?.selectOptionValue(targetOption, val);
      } catch {
        // ignore service errors — UI already shows the new value
      }
      syncOptions(!isVariantSelection);
      setProcessingKey(null);
    },
    [syncOptions, options, variationOptionIds],
  );

  /* Handle text input change (debounced) */
  const textTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const handleTextChange = useCallback(
    (option: IOption, text: string) => {
      option.currentValue = text;
      syncOptions(); // optimistic UI update
      clearTimeout(textTimers.current[option.id]);
      textTimers.current[option.id] = setTimeout(async () => {
        try {
          await serviceRef.current?.selectOptionValue(option, null);
        } catch {
          // ignore
        }
        syncOptions();
      }, 100);
    },
    [syncOptions],
  );

  /* Handle image upload */
  const handleImageUpload = useCallback(
    async (option: IOption, dataUrl: string) => {
      const key = `${option.id}:upload`;
      option.currentValue = dataUrl;
      syncOptions();
      setProcessingKey(key);
      try {
        await serviceRef.current?.selectOptionValue(option, null);
      } catch {
        // ignore
      }
      syncOptions();
      setProcessingKey(null);
    },
    [syncOptions],
  );

  /* Filter visible options */
  const visibleOptions = filteredOptions.filter(
    (o) => o.isShow && !o.hideVisually && !o.isCallieHide,
  );

  /* Loading / error state */
  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        {fetchError ? (
          <div className="px-1">
            <p className="text-sm text-red-500 font-bold">
              Could not load customization options. Please refresh.
            </p>
            {errorDetail && (
              <p className="text-xs text-gray-500 mt-1">{errorDetail}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 py-8 text-gray-400 text-sm font-bold">
            <Loader2 className="w-6 h-6 animate-spin text-[#ff6b6b]" />
            Loading customization options...
          </div>
        )}

        <CartStrip
          onPreview={handlePreviewRequest}
          onAdd={handleAdd}
          added={added}
          adding={adding}
          missingRequired={showRequiredErrors ? missingRequired : []}
        />
      </div>
    );
  }

  // Progress over REQUIRED options only — non-required options aren't
  // milestones the customer has to clear, so counting them would dilute
  // the signal. Variant pills (size/style/colour) ARE required and stay
  // in the denominator because not picking one blocks add-to-cart.
  const requiredVisibleOptions = visibleOptions.filter((o) => o.required);
  const requiredFilledCount = requiredVisibleOptions.filter(isOptionFilled).length;
  const requiredTotal = requiredVisibleOptions.length;
  const progressPct =
    requiredTotal === 0 ? 100 : Math.round((requiredFilledCount / requiredTotal) * 100);
  const allDone = requiredTotal > 0 && requiredFilledCount === requiredTotal;

  return (
    <div className="flex flex-col gap-6">
      {/* Personalization progress — rendered inline at the top of the
          options list so it sits next to the fields the customer is
          actually filling. Sticky offsets equal the Header's measured
          height so the bar pins flush against its bottom edge:
            - Mobile: promo `h-9` (36px) + main `h-16` (64px) = 100px.
            - Desktop: + nav `h-12` (48px) = 148px.
          The bar's full border/shadow makes any clipping more obvious
          than the gallery (which hides clipping inside its rounded
          image corners), hence the explicit pixel values instead of
          the gallery's `top-24 lg:top-32` shorthand. `z-30` keeps it
          above option pills but under the Header dropdowns (z-50). */}
      {requiredTotal > 0 && (
        <div className="sticky top-[100px] lg:top-[148px] z-30 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-700">
              {allDone ? "All set!" : "Personalization progress"}
            </span>
            <span
              className={
                allDone ? "text-emerald-600" : "text-gray-600"
              }
            >
              {requiredFilledCount} / {requiredTotal} completed
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full transition-all duration-300 ${
                allDone ? "bg-emerald-500" : "bg-[#ff6b6b]"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Dynamic options */}
      <div className="flex flex-col gap-6">
        {visibleOptions.map((option) => {
          let inner: React.ReactNode = null;

          if (option.type === "swatch") {
            const prefix = `${option.id}:`;
            const rawLoading = processingKey?.startsWith(prefix)
              ? processingKey.slice(prefix.length)
              : null;
            const loadingValueId = rawLoading != null && !isNaN(Number(rawLoading))
              ? Number(rawLoading)
              : rawLoading;
            inner = (
              <SwatchOption
                option={option}
                onSelect={(val) => handleSelectValue(option, val)}
                loadingValueId={loadingValueId}
                showError={showRequiredErrors}
              />
            );
          } else if (option.type === "dropdown") {
            const prefix = `${option.id}:`;
            const isVariation = variationOptionIds.includes(option.id);
            if (isVariation) {
              const rawLoading = processingKey?.startsWith(prefix)
                ? processingKey.slice(prefix.length)
                : null;
              const loadingValueId =
                rawLoading != null && !isNaN(Number(rawLoading))
                  ? Number(rawLoading)
                  : rawLoading;
              inner = (
                <VariationRadioOption
                  option={option}
                  onSelect={(val) => handleSelectValue(option, val)}
                  loadingValueId={loadingValueId}
                  showError={showRequiredErrors}
                  sizeChartHtml={sizeChartHtml}
                />
              );
            } else {
              inner = (
                <DropdownOption
                  option={option}
                  onSelect={(val) => handleSelectValue(option, val)}
                  isLoading={processingKey?.startsWith(prefix) ?? false}
                  showError={showRequiredErrors}
                />
              );
            }
          } else if (option.type === "text-input") {
            inner = (
              <TextInputOption
                option={option}
                onChange={(val) => handleTextChange(option, val)}
                showError={showRequiredErrors}
              />
            );
          } else if (option.type === "image-upload") {
            inner = (
              <ImageUploadOption
                option={option}
                onUpload={(dataUrl) => handleImageUpload(option, dataUrl)}
                showError={showRequiredErrors}
              />
            );
          }

          if (!inner) return null;
          return (
            <div key={option.id} data-option-id={option.id}>
              {inner}
            </div>
          );
        })}
      </div>

      {/* Quantity + Add to Cart */}
      <CartStrip
        onPreview={handlePreviewRequest}
        onAdd={handleAdd}
        added={added}
        adding={adding}
        missingRequired={showRequiredErrors ? missingRequired : []}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={previewImageUrl}
        onAddToCart={handleAdd}
        isAdded={added}
      />

      {/* Mobile sticky CTA bar — always-visible price + Add to Cart so
          the customer never loses the call to action while scrolling
          through long option lists. Portaled to <body> so it escapes
          the right-column transform/stacking context (CartContext-level
          modals also live at <body> root). Mobile-only (`lg:hidden`)
          since desktop has the full CartStrip in the right column.
          Hidden until WM finishes init (`ready`) so we never show "$0"
          before customization options have loaded. */}
      {ready && typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
            <div className="flex items-center gap-3 px-4 py-2.5">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-100 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">
                  Your design
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-gray-900">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {currentComparePrice != null &&
                    currentComparePrice > currentPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ${currentComparePrice.toFixed(2)}
                      </span>
                    )}
                </div>
              </div>
              <button
                onClick={() => void handleAdd()}
                disabled={adding}
                className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#ff6b6b]/20 transition-all disabled:cursor-wait disabled:opacity-80 ${
                  added
                    ? "bg-emerald-500"
                    : "bg-[#ff6b6b] hover:bg-[#ee5253]"
                }`}
              >
                {added
                  ? "Added"
                  : adding
                    ? "Adding…"
                    : "Add to Cart"}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
