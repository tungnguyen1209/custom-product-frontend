"use client";

import {
  useEffect, useState, useRef, useCallback, useMemo, ChangeEvent,
} from "react";
import WM from "@megaads/wm";
import {
  Minus, Plus, Gift, ShoppingCart, Zap, Heart, Share2,
  CheckCircle, ImagePlus, Upload, X, Check, ChevronDown, Loader2, Eye,
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

/* ─── Dropdown option ──────────────────────────────────────────────────── */

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
          value={option.currentValue}
          disabled={isLoading}
          onChange={(e) => {
            const chosen = values.find((v) => typeof v.id !== 'undefined' ? String(v.id) == e.target.value : v.valueName == e.target.value);
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
            <option key={typeof val.id !== 'undefined' ? val.id : val.valueName} value={typeof val.id !== 'undefined' ? val.id : val.valueName}>
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
        <p className="text-xs text-red-500 font-semibold">Please select an option</p>
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
  customization?: ProductCustomizationData | null;
  customizationError?: boolean;
}

export default function CustomizationForm({
  productId,
  productName = `Product ${productId}`,
  basePrice = 0,
  customization: customizationProp,
  customizationError: customizationErrorProp,
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
  // Build a lookup from combination key "option1|option2|option3" → variant.
  // Variant entries come from product_variants table (filled by the variant
  // crawler) with their option1/2/3 columns matching Shopify's conf_variants.
  const variantsByCombo = useMemo(() => {
    const map = new Map<
      string,
      { variantId: string; price: number | null; comparePrice: number | null }
    >();
    for (const v of customization?.variants ?? []) {
      const key = [v.option1 ?? "", v.option2 ?? "", v.option3 ?? ""].join("|");
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

  // After every option mutation, read the user's current selection on the
  // variation dropdowns (in option1, option2, option3 order), build a combo
  // key, and look up the matching variant. Falls back to direct ID match if
  // combo lookup misses (old data shape).
  useEffect(() => {
    if (options.length === 0) return;

    // Collect value names from variation dropdowns in declared order.
    const selectedNames: string[] = [];
    for (const optId of variationOptionIds) {
      const opt = options.find((o) => o.id === optId);
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

    // Primary path: combo match
    if (
      variantsByCombo.size > 0 &&
      variationOptionIds.length > 0 &&
      selectedNames.some((n) => n.length > 0)
    ) {
      const padded = [
        selectedNames[0] ?? "",
        selectedNames[1] ?? "",
        selectedNames[2] ?? "",
      ];
      const key = padded.join("|");
      const hit = variantsByCombo.get(key);
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
      for (const optId of variationOptionIds) {
        const opt = options.find((o) => o.id === optId);
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
  }, [options, variantsByCombo, variantById, variationOptionIds]);

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
      const names = variationOptionIds.map((optId) => {
        const opt = options.find((o) => o.id === optId);
        if (!opt || opt.currentValue == null) return "";
        const v = opt.currentValue;
        const match =
          opt.dropdownValues?.find((d) => d.id === v) ??
          opt.swatchValues?.find((s) => s.id === v);
        return match?.valueName ?? "";
      });
      const padded = [names[0] ?? "", names[1] ?? "", names[2] ?? ""];
      const hit = variantsByCombo.get(padded.join("|"));
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
  }, [adding, addItem, openMiniCart, productId, options, productName, basePrice, focusMissing, variantsByCombo, variantById, variationOptionIds]);

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

  /* Sync options state after any mutation */
  const syncOptions = useCallback(() => {
    if (serviceRef.current) {
      setOptions([...serviceRef.current.getOptions()]);
      broadcastTemplate(serviceRef.current, true);
    }
  }, []);

  /* Handle swatch / dropdown selection */
  const handleSelectValue = useCallback(
    async (option: IOption, val: SwatchVal | DropdownVal) => {
      const valueId = typeof val.id !== 'undefined' ? val.id : val.valueName;
      const key = `${option.id}:${valueId}`;
      option.currentValue = valueId;
      syncOptions();
      setProcessingKey(key);
      try {
        await serviceRef.current?.selectOptionValue(option, val);
      } catch {
        // ignore service errors — UI already shows the new value
      }
      syncOptions();
      setProcessingKey(null);
    },
    [syncOptions],
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
  const visibleOptions = options.filter(
    (o) => o.isShow && !o.hideVisually && !o.isCallieHide,
  );

  /* Loading / error state */
  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 bg-[#fff0f0] border border-[#ff6b6b]/20 rounded-2xl px-5 py-4 shadow-sm">
          <Gift className="w-5 h-5 text-[#ff6b6b] flex-shrink-0" />
          <p className="text-[13px] text-[#ee5253] font-bold">
            Free premium gift box included with every order
          </p>
        </div>

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

  return (
    <div className="flex flex-col gap-6">
      {/* Gift box badge */}
      <div className="flex items-center gap-3 bg-[#fff0f0] border border-[#ff6b6b]/20 rounded-2xl px-5 py-4 shadow-sm">
        <Gift className="w-5 h-5 text-[#ff6b6b] flex-shrink-0" />
        <p className="text-[13px] text-[#ee5253] font-bold">
          Free premium gift box included with every order
        </p>
      </div>

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
            inner = (
              <DropdownOption
                option={option}
                onSelect={(val) => handleSelectValue(option, val)}
                isLoading={processingKey?.startsWith(`${option.id}:`) ?? false}
                showError={showRequiredErrors}
              />
            );
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
    </div>
  );
}
