"use client";

import {
  useEffect, useState, useRef, useCallback, ChangeEvent,
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

/* ─── Swatch option ────────────────────────────────────────────────────── */

function SwatchOption({
  option,
  onSelect,
  loadingValueId,
}: {
  option: IOption;
  onSelect: (val: SwatchVal) => void;
  loadingValueId?: number | string | null;
}) {
  const values = option.swatchValues ?? [];
  const hasImages = values.some((v) => v.thumbImage);
  const selected = values.find((v) => v.id === option.currentValue);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-800">{option.label}:</span>
        {selected && (
          <span className="text-sm text-gray-500 font-medium">{selected.valueName}</span>
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
}: {
  option: IOption;
  onSelect: (val: DropdownVal) => void;
  isLoading?: boolean;
}) {
  const values = option.dropdownValues ?? [];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-800">
        {option.label}
      </label>
      <div className="relative">
        <select
          value={option.currentValue}
          disabled={isLoading}
          onChange={(e) => {
            const chosen = values.find((v) => typeof v.id !== 'undefined' ? String(v.id) == e.target.value : v.valueName == e.target.value);
            if (chosen) onSelect(chosen);
          }}
          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b] bg-white appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
    </div>
  );
}

/* ─── Text-input option ────────────────────────────────────────────────── */

function TextInputOption({
  option,
  onChange,
}: {
  option: IOption;
  onChange: (val: string) => void;
}) {
  const maxLen = option.config?.maxLength ?? 100;
  const placeholder = option.config?.placeholder ?? "Enter text...";
  const value = String(option.currentValue ?? "");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-800">
        {option.label}
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
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b] bg-white resize-none placeholder:text-gray-400 transition-all"
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
}: {
  option: IOption;
  onUpload: (dataUrl: string) => void;
}) {
  const [preview, setPreview] = useState<UploadedPreview | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    </div>
  );
}

/* ─── Quantity + CTA strip ─────────────────────────────────────────────── */

function CartStrip({
  onPreview,
  onAdd,
  added,
}: {
  onPreview: () => void;
  onAdd: () => void;
  added: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

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
        <button
          onClick={onPreview}
          className="w-full py-4 rounded-2xl font-bold text-sm bg-white hover:bg-gray-50 text-gray-900 transition-all flex items-center justify-center gap-2.5 border-2 border-gray-100 shadow-sm"
        >
          <Eye className="w-5 h-5 text-[#ff6b6b]" /> Preview Your Design
        </button>
        <button
          onClick={onAdd}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#ff6b6b]/20 ${
            added
              ? "bg-green-500 text-white shadow-green-500/20"
              : "bg-[#ff6b6b] hover:bg-[#ee5253] text-white"
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="w-5 h-5" /> Added to Cart!
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

const BASE_URL = "https://variant-service.printerval.com/product/customization";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deriveTemplateUuid(productResult: any): string {
  const template = productResult?.template;
  if (template?.uuid) return template.uuid;

  const options = productResult?.options ?? [];
  for (const option of options) {
    for (const functionItem of (option.functionItems ?? [])) {
      if (functionItem.type === "change-template") {
        if (option.type === "swatch") return option.swatchValues?.[0]?.templateId ?? "";
        if (option.type === "dropdown") return option.dropdownValues?.[0]?.templateId ?? "";
      }
    }
  }
  return "";
}

import { useCart } from "@/context/CartContext";

export default function CustomizationForm({ productId }: { productId: string }) {
  const { addItem } = useCart();
  const [options, setOptions] = useState<IOption[]>([]);
  const [ready, setReady] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceRef = useRef<any>(null);

  /* Preview + Cart logic */
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [added, setAdded] = useState(false);

  const handleAdd = useCallback(async () => {
    const customization: Record<string, any> = {};
    options.forEach(opt => {
      if (opt.currentValue) {
        customization[opt.label] = opt.currentValue;
      }
    });

    try {
      await addItem({
        productId: parseInt(productId),
        productName: `Personalized Throw Pillow`,
        unitPrice: 450000,
        customization,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, [addItem, productId, options]);

  const handlePreviewRequest = useCallback(() => {
    window.dispatchEvent(new CustomEvent("wm-request-preview"));
  }, []);

  useEffect(() => {
    const onShowPreview = (e: Event) => {
      const dataUrl = (e as CustomEvent).detail?.dataUrl;
      if (dataUrl) {
        setPreviewImageUrl(dataUrl);
        setIsPreviewOpen(true);
      }
    };
    window.addEventListener("wm-show-preview", onShowPreview);
    return () => window.removeEventListener("wm-show-preview", onShowPreview);
  }, []);

  /* Fetch data + init WM service on mount (client-only, no SSR) */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const productRes = await fetch(`${BASE_URL}/${productId}`);
        const productJson = await productRes.json();

        if (cancelled) return;

        const productResult = productJson?.result ?? {};
        const rawOptions = productResult.options ?? [];
        const templateUuid = deriveTemplateUuid(productResult);

        if (!templateUuid || !rawOptions.length) {
          setFetchError(true);
          return;
        }

        const templateRes = await fetch(`${BASE_URL}/template/${templateUuid}`);
        const templateJson = await templateRes.json();

        if (cancelled) return;

        const rawTemplate = templateJson?.result ?? null;

        if (!rawTemplate) {
          setFetchError(true);
          return;
        }

        const svc = WM.initCustomization({
          template: rawTemplate,
          options: rawOptions,
          baseUrl: BASE_URL,
          breadcrumbs: [],
          isAllowReplaceBackground: false,
        });

        serviceRef.current = svc;
        await svc.fetchImageUrlsFirstTime();

        if (!cancelled) {
          setOptions([...svc.getOptions()]);
          setReady(true);
          broadcastTemplate(svc);
        }
      } catch {
        if (!cancelled) setFetchError(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [productId]);

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
          <p className="text-sm text-red-500 font-bold px-1">
            Could not load customization options. Please refresh.
          </p>
        ) : (
          <div className="flex items-center gap-4 py-8 text-gray-400 text-sm font-bold">
            <Loader2 className="w-6 h-6 animate-spin text-[#ff6b6b]" />
            Loading customization options...
          </div>
        )}

        <CartStrip onPreview={handlePreviewRequest} onAdd={handleAdd} added={added} />
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
          if (option.type === "swatch") {
            const prefix = `${option.id}:`;
            const rawLoading = processingKey?.startsWith(prefix)
              ? processingKey.slice(prefix.length)
              : null;
            const loadingValueId = rawLoading != null && !isNaN(Number(rawLoading))
              ? Number(rawLoading)
              : rawLoading;
            return (
              <SwatchOption
                key={option.id}
                option={option}
                onSelect={(val) => handleSelectValue(option, val)}
                loadingValueId={loadingValueId}
              />
            );
          }

          if (option.type === "dropdown") {
            return (
              <DropdownOption
                key={option.id}
                option={option}
                onSelect={(val) => handleSelectValue(option, val)}
                isLoading={processingKey?.startsWith(`${option.id}:`) ?? false}
              />
            );
          }

          if (option.type === "text-input") {
            return (
              <TextInputOption
                key={option.id}
                option={option}
                onChange={(val) => handleTextChange(option, val)}
              />
            );
          }

          if (option.type === "image-upload") {
            return (
              <ImageUploadOption
                key={option.id}
                option={option}
                onUpload={(dataUrl) => handleImageUpload(option, dataUrl)}
              />
            );
          }

          return null;
        })}
      </div>

      {/* Quantity + Add to Cart */}
      <CartStrip onPreview={handlePreviewRequest} onAdd={handleAdd} added={added} />

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
