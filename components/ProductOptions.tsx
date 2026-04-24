"use client";

import { useState, useRef, useCallback } from "react";
import {
  Minus, Plus, Gift, ShoppingCart, Zap, Heart,
  Share2, CheckCircle, Upload, X, ImagePlus, Check,
} from "lucide-react";

/* ─── Data ─── */

const greetingCardOptions = [
  { id: "none", label: "No card", price: 0 },
  { id: "standard", label: "Standard card", price: 3.99 },
  { id: "premium", label: "Premium gift card", price: 6.99 },
];

interface Swatch {
  id: string;
  label: string;
  color: string;
  border: string;
  emoji: string;
}

const sashColorSwatches: Swatch[] = [
  { id: "royal-blue",  label: "Royal Blue",   color: "#2563eb", border: "#1d4ed8", emoji: "💙" },
  { id: "teal",        label: "Teal",          color: "#2a9d8f", border: "#21867a", emoji: "🩵" },
  { id: "gold",        label: "Gold",          color: "#d97706", border: "#b45309", emoji: "🌟" },
  { id: "crimson",     label: "Crimson",       color: "#dc2626", border: "#b91c1c", emoji: "❤️" },
  { id: "purple",      label: "Purple",        color: "#7c3aed", border: "#6d28d9", emoji: "💜" },
  { id: "forest",      label: "Forest Green",  color: "#16a34a", border: "#15803d", emoji: "💚" },
  { id: "rose",        label: "Rose Gold",     color: "#e879a0", border: "#db2777", emoji: "🌸" },
  { id: "black",       label: "Classic Black", color: "#171717", border: "#000000", emoji: "🖤" },
];

interface StyleSwatch {
  id: string;
  label: string;
  bg: string;
  emoji: string;
  price: number;
}

const characterStyleSwatches: StyleSwatch[] = [
  { id: "classic",    label: "Classic",    bg: "from-blue-100 to-purple-100",  emoji: "🎓", price: 0    },
  { id: "cute",       label: "Cute",       bg: "from-pink-100 to-rose-100",    emoji: "🧸", price: 0    },
  { id: "cool",       label: "Cool",       bg: "from-gray-100 to-slate-100",   emoji: "😎", price: 0    },
  { id: "sparkle",    label: "Sparkle",    bg: "from-yellow-100 to-amber-100", emoji: "✨", price: 5.00 },
  { id: "floral",     label: "Floral",     bg: "from-green-100 to-teal-100",   emoji: "🌸", price: 5.00 },
  { id: "sports",     label: "Sports",     bg: "from-orange-100 to-red-100",   emoji: "🏆", price: 5.00 },
];

/* ─── Sub-components ─── */

function SwatchColorPicker({
  swatches,
  selected,
  onSelect,
}: {
  swatches: Swatch[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {swatches.map((s) => (
        <button
          key={s.id}
          title={s.label}
          onClick={() => onSelect(s.id)}
          className={`relative w-9 h-9 rounded-full transition-all focus:outline-none ${
            selected === s.id
              ? "ring-2 ring-offset-2 ring-[#2a9d8f] scale-110"
              : "hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
          }`}
          style={{ backgroundColor: s.color, borderWidth: 2, borderColor: s.border }}
        >
          {selected === s.id && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function StyleSwatchPicker({
  swatches,
  selected,
  onSelect,
}: {
  swatches: StyleSwatch[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {swatches.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center ${
            selected === s.id
              ? "border-[#2a9d8f] bg-[#e8f5f4]"
              : "border-gray-100 bg-gray-50 hover:border-gray-200"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${s.bg} flex items-center justify-center text-xl`}
          >
            {s.emoji}
          </div>
          <span className="text-xs font-medium text-gray-700 leading-tight">
            {s.label}
          </span>
          {s.price > 0 && (
            <span className="text-[10px] text-[#2a9d8f] font-semibold">
              +AU${s.price.toFixed(2)}
            </span>
          )}
          {selected === s.id && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#2a9d8f] rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface UploadedFile {
  name: string;
  size: number;
  preview: string;
}

function ImageUploader({
  value,
  onChange,
}: {
  value: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange({
          name: file.name,
          size: file.size,
          preview: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  if (value) {
    return (
      <div className="relative rounded-xl border-2 border-[#2a9d8f] bg-[#e8f5f4] overflow-hidden">
        <div className="flex items-center gap-3 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.preview}
            alt="Uploaded reference"
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{value.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {(value.size / 1024).toFixed(0)} KB · Uploaded ✓
            </p>
            <button
              onClick={() => onChange(null)}
              className="mt-1.5 text-xs text-[#2a9d8f] hover:text-red-500 font-medium transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Remove & re-upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
        dragging
          ? "border-[#2a9d8f] bg-[#e8f5f4] scale-[1.01]"
          : "border-gray-200 hover:border-[#2a9d8f] hover:bg-gray-50"
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        <ImagePlus className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">
          {dragging ? "Drop image here" : "Upload reference photo"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Drag & drop or click to browse · JPG, PNG, WEBP · Max 10 MB
        </p>
      </div>
      <span className="text-xs text-[#2a9d8f] font-medium flex items-center gap-1">
        <Upload className="w-3 h-3" /> Choose file
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}

/* ─── Main component ─── */

export default function ProductOptions() {
  const [name, setName] = useState("");
  const [year, setYear] = useState("2026");
  const [sashColor, setSashColor] = useState("royal-blue");
  const [charStyle, setCharStyle] = useState("classic");
  const [dedication, setDedication] = useState("");
  const [referencePhoto, setReferencePhoto] = useState<UploadedFile | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [greetingCard, setGreetingCard] = useState("none");
  const [giftMessage, setGiftMessage] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const basePrice = 37.0;
  const cardPrice = greetingCardOptions.find((c) => c.id === greetingCard)?.price ?? 0;
  const stylePrice = characterStyleSwatches.find((s) => s.id === charStyle)?.price ?? 0;
  const totalPrice = (basePrice + cardPrice + stylePrice) * quantity;

  const selectedColor = sashColorSwatches.find((s) => s.id === sashColor);
  const selectedStyle = characterStyleSwatches.find((s) => s.id === charStyle);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Free gift box badge */}
      <div className="flex items-center gap-2 bg-[#e8f5f4] border border-[#2a9d8f]/30 rounded-xl px-4 py-3">
        <Gift className="w-5 h-5 text-[#2a9d8f] flex-shrink-0" />
        <p className="text-sm text-[#1a6b61] font-medium">
          Complimentary gift box included with every order
        </p>
      </div>

      {/* Name field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-800">
          Name on sash <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sarah Johnson"
          maxLength={30}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400">{name.length}/30 characters</p>
      </div>

      {/* Year field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-800">
          Graduation year <span className="text-red-500">*</span>
        </label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent bg-white"
        >
          {["2024", "2025", "2026", "2027", "2028"].map((y) => (
            <option key={y} value={y}>
              Class of {y}
            </option>
          ))}
        </select>
      </div>

      {/* ── Swatch: Sash color ── */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            Sash colour <span className="text-red-500">*</span>
          </label>
          {selectedColor && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span>{selectedColor.emoji}</span>
              {selectedColor.label}
            </span>
          )}
        </div>
        <SwatchColorPicker
          swatches={sashColorSwatches}
          selected={sashColor}
          onSelect={setSashColor}
        />
      </div>

      {/* ── Swatch: Character style ── */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            Character style <span className="text-red-500">*</span>
          </label>
          {selectedStyle && selectedStyle.price > 0 && (
            <span className="text-xs text-[#2a9d8f] font-semibold bg-[#e8f5f4] px-2 py-0.5 rounded-full">
              +AU${selectedStyle.price.toFixed(2)}
            </span>
          )}
        </div>
        <StyleSwatchPicker
          swatches={characterStyleSwatches}
          selected={charStyle}
          onSelect={setCharStyle}
        />
      </div>

      {/* ── Text area: Dedication message ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            Dedication message
            <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
          </label>
        </div>
        <p className="text-xs text-gray-400 -mt-1">
          Printed in small text below the character on the sash.
        </p>
        <div className="relative">
          <textarea
            value={dedication}
            onChange={(e) => setDedication(e.target.value)}
            placeholder={`e.g. "Congrats Sarah! We're so proud of everything you've achieved. Class of 2026 🎓"`}
            maxLength={120}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent resize-none placeholder:text-gray-400"
          />
          <span
            className={`absolute bottom-2.5 right-3 text-xs ${
              dedication.length >= 100 ? "text-orange-400" : "text-gray-300"
            }`}
          >
            {dedication.length}/120
          </span>
        </div>
      </div>

      {/* ── Upload: Reference photo ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-800">
          Reference photo
          <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <p className="text-xs text-gray-400 -mt-1">
          Upload a photo so our artist can create a cartoon likeness of the graduate.
        </p>
        <ImageUploader value={referencePhoto} onChange={setReferencePhoto} />
      </div>

      {/* Greeting card */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-800">
          Greeting card
        </label>
        <div className="flex flex-col gap-2">
          {greetingCardOptions.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                greetingCard === opt.id
                  ? "border-[#2a9d8f] bg-[#e8f5f4]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="greetingCard"
                value={opt.id}
                checked={greetingCard === opt.id}
                onChange={() => setGreetingCard(opt.id)}
                className="accent-[#2a9d8f]"
              />
              <span className="text-sm text-gray-700 flex-1">{opt.label}</span>
              <span className="text-sm font-semibold text-gray-800">
                {opt.price === 0 ? "Free" : `+AU$${opt.price.toFixed(2)}`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Gift message */}
      {greetingCard !== "none" && (
        <div className="flex flex-col gap-1.5 fade-in">
          <label className="text-sm font-semibold text-gray-800">
            Gift message (optional)
          </label>
          <div className="relative">
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Write a heartfelt message for the graduate..."
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent resize-none placeholder:text-gray-400"
            />
            <span
              className={`absolute bottom-2.5 right-3 text-xs ${
                giftMessage.length >= 160 ? "text-orange-400" : "text-gray-300"
              }`}
            >
              {giftMessage.length}/200
            </span>
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-800">Quantity</label>
        <div className="flex items-center gap-0">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-l-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-40"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Math.min(99, Number(e.target.value))))
            }
            className="w-14 h-10 text-center border-t border-b border-gray-200 text-sm font-semibold focus:outline-none"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-r-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price total */}
      <div className="flex items-baseline gap-2 pt-1">
        <span className="text-3xl font-bold text-gray-900">
          AU${totalPrice.toFixed(2)}
        </span>
        {quantity > 1 && (
          <span className="text-sm text-gray-500">
            (AU${(basePrice + cardPrice + stylePrice).toFixed(2)} each)
          </span>
        )}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            addedToCart
              ? "bg-green-500 text-white"
              : "bg-[#2a9d8f] hover:bg-[#21867a] text-white shadow-md shadow-[#2a9d8f]/30 hover:shadow-[#2a9d8f]/40"
          }`}
        >
          {addedToCart ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </button>
        <button className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-gray-900/20">
          <Zap className="w-5 h-5" />
          Buy Now
        </button>
      </div>

      {/* Wishlist & Share */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
          />
          {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2a9d8f] transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
