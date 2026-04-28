"use client";

import {
  useEffect, useState, useRef, useCallback, ChangeEvent,
} from "react";
import WM from "@megaads/wm";
import {
  Minus, Plus, Gift, ShoppingCart, Zap, Heart, Share2,
  CheckCircle, ImagePlus, Upload, X, Check, ChevronDown, Loader2,
} from "lucide-react";

/* ─── Minimal local types ──────────────────────────────────────────────── */

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
}: {
  option: IOption;
  onSelect: (val: SwatchVal) => void;
}) {
  const values = option.swatchValues ?? [];
  const hasImages = values.some((v) => v.thumbImage);
  const selected = values.find((v) => v.id === option.currentValue);

  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-800">{option.label}:</span>
        {selected && (
          <span className="text-sm text-gray-500">{selected.valueName}</span>
        )}
      </div>

      {hasImages ? (
        /* Image swatches – compact scrollable row */
        <div className="flex flex-wrap gap-1.5">
          {values.map((val) => {
            const isActive = val.id === option.currentValue;
            return (
              <button
                key={val.id}
                onClick={() => onSelect(val)}
                title={val.valueName}
                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-50 transition-all focus:outline-none ${
                  isActive
                    ? "ring-2 ring-[#2a9d8f] ring-offset-1"
                    : "ring-1 ring-gray-200 hover:ring-[#2a9d8f] opacity-80 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={val.thumbImage}
                  alt={val.valueName}
                  className="w-full h-full object-contain p-0.5"
                />
                {isActive && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#2a9d8f] rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Color dot swatches */
        <div className="flex flex-wrap gap-2">
          {values.map((val) => {
            const isActive = val.id === option.currentValue;
            return (
              <button
                key={val.id}
                onClick={() => onSelect(val)}
                title={val.valueName}
                style={{ backgroundColor: val.thumbColor || "#ccc" }}
                className={`relative w-7 h-7 rounded-full border-2 border-white transition-all focus:outline-none shadow-sm ${
                  isActive
                    ? "ring-2 ring-offset-1 ring-[#2a9d8f] scale-110"
                    : "hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
                }`}
              >
                {isActive && (
                  <Check
                    className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow-sm"
                    strokeWidth={3}
                  />
                )}
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
}: {
  option: IOption;
  onSelect: (val: DropdownVal) => void;
}) {
  const values = option.dropdownValues ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-800">
        {option.label}
      </label>
      <div className="relative">
        <select
          value={option.currentValue ?? ""}
          onChange={(e) => {
            const chosen = values.find((v) => String(v.id) === e.target.value);
            if (chosen) onSelect(chosen);
          }}
          className="w-full px-4 py-2.5 pr-9 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent bg-white appearance-none cursor-pointer"
        >
          {values.map((val) => (
            <option key={val.id} value={val.id}>
              {val.valueName}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
  const placeholder = option.config?.placeholder ?? "";
  const value = String(option.currentValue ?? "");

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-800">
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
          rows={maxLen > 60 ? 5 : 3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent resize-none placeholder:text-gray-400"
          style={{ minHeight: maxLen > 60 ? undefined : "42px" }}
        />
        <span
          className={`absolute bottom-2.5 right-3 text-xs pointer-events-none ${
            value.length >= maxLen * 0.9 ? "text-orange-400" : "text-gray-300"
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
    option.config?.helpText ?? "Upload a photo for your personalised design";
  const buttonText = option.config?.buttonText ?? "Choose photo";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-800">
        {option.label}
      </label>
      {helpText && <p className="text-xs text-gray-400 -mt-1">{helpText}</p>}

      {preview ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#2a9d8f] bg-[#e8f5f4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.dataUrl}
            alt="preview"
            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {preview.name}
            </p>
            <p className="text-xs text-[#2a9d8f] mt-0.5">Uploaded ✓</p>
            <button
              onClick={() => {
                setPreview(null);
                onUpload("");
              }}
              className="mt-1 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Remove
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
          className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? "border-[#2a9d8f] bg-[#e8f5f4]"
              : "border-gray-200 hover:border-[#2a9d8f] hover:bg-gray-50"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ImagePlus className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {dragging ? "Drop here" : buttonText}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPG, PNG, WEBP · max 10 MB
            </p>
          </div>
          <span className="text-xs text-[#2a9d8f] flex items-center gap-1 font-medium">
            <Upload className="w-3 h-3" /> Browse files
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

function CartStrip() {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4 pt-1">
      {/* Quantity */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-800">Quantity</label>
        <div className="flex items-center">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-l-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-40"
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
            className="w-14 h-10 text-center border-t border-b border-gray-200 text-sm font-semibold focus:outline-none"
          />
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-r-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAdd}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            added
              ? "bg-green-500 text-white"
              : "bg-[#2a9d8f] hover:bg-[#21867a] text-white shadow-md shadow-[#2a9d8f]/30"
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
        <button className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white transition-all flex items-center justify-center gap-2">
          <Zap className="w-5 h-5" /> Buy Now
        </button>
      </div>

      {/* Wishlist / share */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
          />
          {wishlisted ? "Saved" : "Add to Wishlist"}
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2a9d8f] transition-colors">
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

export default function CustomizationForm({ productId }: { productId: string }) {
  const [options, setOptions] = useState<IOption[]>([]);
  const [ready, setReady] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceRef = useRef<any>(null);

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
      option.currentValue = val.id;
      syncOptions(); // optimistic: reflect new value in UI immediately
      setIsProcessing(true);
      try {
        await serviceRef.current?.selectOptionValue(option, val);
      } catch {
        // ignore service errors — UI already shows the new value
      }
      syncOptions();
      setIsProcessing(false);
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
      }, 300);
    },
    [syncOptions],
  );

  /* Handle image upload */
  const handleImageUpload = useCallback(
    async (option: IOption, dataUrl: string) => {
      option.currentValue = dataUrl;
      syncOptions();
      setIsProcessing(true);
      try {
        await serviceRef.current?.selectOptionValue(option, null);
      } catch {
        // ignore
      }
      syncOptions();
      setIsProcessing(false);
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 bg-[#e8f5f4] border border-[#2a9d8f]/30 rounded-xl px-4 py-3">
          <Gift className="w-5 h-5 text-[#2a9d8f] flex-shrink-0" />
          <p className="text-sm text-[#1a6b61] font-medium">
            Complimentary gift box included with every order
          </p>
        </div>

        {fetchError ? (
          <p className="text-sm text-red-400 px-1">
            Could not load customization options. Please refresh.
          </p>
        ) : (
          <div className="flex items-center gap-3 py-6 text-gray-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading customization options…
          </div>
        )}

        <CartStrip />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Gift box badge */}
      <div className="flex items-center gap-2 bg-[#e8f5f4] border border-[#2a9d8f]/30 rounded-xl px-4 py-3">
        <Gift className="w-5 h-5 text-[#2a9d8f] flex-shrink-0" />
        <p className="text-sm text-[#1a6b61] font-medium">
          Complimentary gift box included with every order
        </p>
      </div>

      {/* Dynamic options */}
      <div className={`flex flex-col gap-5 transition-opacity ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}>
        {visibleOptions.map((option) => {
          if (option.type === "swatch") {
            return (
              <SwatchOption
                key={option.id}
                option={option}
                onSelect={(val) => handleSelectValue(option, val)}
              />
            );
          }

          if (option.type === "dropdown") {
            return (
              <DropdownOption
                key={option.id}
                option={option}
                onSelect={(val) => handleSelectValue(option, val)}
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
      <CartStrip />
    </div>
  );
}
