"use client";

import { useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import FontFaceObserver from "fontfaceobserver";

const CANVAS_PX = 520;

/* ─── Font loader ─────────────────────────────────────────────────────── */

const SYSTEM_FONTS = new Set(["sans-serif", "serif", "monospace", "cursive", "fantasy"]);
const fontLoadCache = new Map<string, Promise<void>>();

function loadFont(fontFamily?: string, fontUrl?: string): Promise<void> {
  if (!fontFamily || SYSTEM_FONTS.has(fontFamily)) return Promise.resolve();
  const cacheKey = fontUrl ?? fontFamily;
  if (fontLoadCache.has(cacheKey)) return fontLoadCache.get(cacheKey)!;

  const p = (async () => {
    if (fontUrl) {
      /* Load directly from URL provided by the element config */
      try {
        const face = new FontFace(fontFamily, `url(${fontUrl})`);
        await face.load();
        document.fonts.add(face);
      } catch {
        /* fallback to system font silently */
      }
    } else {
      /* Fallback: try Google Fonts */
      const id = `gfont-${fontFamily.replace(/\s+/g, "-")}`;
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, "+")}:ital,wght@0,400;0,700;1,400&display=swap`;
        document.head.appendChild(link);
      }
      try {
        await new FontFaceObserver(fontFamily).load(null, 5000);
      } catch {
        /* font unavailable — canvas will use fallback */
      }
    }
  })();

  fontLoadCache.set(cacheKey, p);
  return p;
}

interface CallieImage {
  order: number;
  value: string;
  scaleX: number;
  scaleY: number;
  left: number;
  top: number;
}

interface ElementConfig {
  sWidth: number;
  sHeight: number;
  centerX: number;
  centerY: number;
  rotation: number;
  imageUrl?: string;
  imageId?: number | string;
  images?: CallieImage[];
  textConfig?: {
    text?: string;
    fill?: string;
    fontSize?: number;
    fontFamily?: string;
    font?: string;
    multiline?: boolean;
  };
  staticPath?: string;
}

interface TemplateElement {
  elementId: string | number;
  order: number;
  type: string;
  source?: string;
  opacity?: number;
  isShow?: boolean;
  config: ElementConfig;
}

interface WMTemplate {
  width: number;
  height: number;
  elements: TemplateElement[];
}

/* Place a loaded fabric.Image using the same formula as the reference Layer class */
function placeImage(
  oImg: fabric.Image,
  centerX: number,
  centerY: number,
  sWidth: number,
  sHeight: number,
  displayScale: number,
  rotation: number,
) {
  const naturalW = oImg.width ?? 1;
  const naturalH = oImg.height ?? 1;
  const xRatio = sWidth / naturalW;
  const yRatio = sHeight / naturalH;
  const objScale = Math.min(xRatio, yRatio);

  oImg.set({
    scaleX: objScale * displayScale,
    scaleY: objScale * displayScale,
    angle: rotation,
    selectable: false,
    evented: false,
    objectCaching: true,
  });
  oImg.setPositionByOrigin(
    new fabric.Point(centerX * displayScale, centerY * displayScale),
    "center",
    "center",
  );
}

function loadFabricImage(url: string): Promise<fabric.Image | null> {
  return new Promise((resolve) => {
    fabric.Image.fromURL(
      url,
      (img) => resolve(img ?? null),
      { crossOrigin: "anonymous" },
    );
  });
}

export default function TemplatePreview() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const renderCounterRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderTemplate = useCallback(async (template: WMTemplate) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const myRender = ++renderCounterRef.current;
    canvas.clear();

    const templateWidth = template.width || CANVAS_PX;
    const templateHeight = template.height || CANVAS_PX;
    const scale = CANVAS_PX / templateWidth;

    canvas.setDimensions({ width: CANVAS_PX, height: templateHeight * scale });

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const displayScale = containerWidth / CANVAS_PX;
      containerRef.current.style.height = `${templateHeight * scale * displayScale}px`;
    }

    const elements = [...(template.elements ?? [])]
      .filter((el) => el.isShow || (el.opacity ?? 1) > 0)
      .sort((a, b) => a.order - b.order);

    for (const el of elements) {
      if (myRender !== renderCounterRef.current) return;

      const cfg = el.config;

      /* ── Text ──────────────────────────────────────────────────────── */
      if (el.type === "text_box" || el.type === "text_box_circular") {
        const text = cfg.textConfig?.text ?? "";
        if (!text.trim()) continue;
        await loadFont(cfg.textConfig?.font, cfg.textConfig?.font);
        if (myRender !== renderCounterRef.current) return;
        let isMultiline = cfg.textConfig?.multiline;
        if (!isMultiline && cfg.textConfig?.text?.toString().trim().includes('\n')) {
          isMultiline = true;
        }

        const configs = {
          fontSize: (cfg.textConfig?.fontSize ?? 16) * scale,
          fontFamily: cfg.textConfig?.font || "sans-serif",
          fill: cfg.textConfig?.fill ?? "#000000",
          angle: cfg.rotation ?? 0,
          selectable: false,
          evented: false,
          multiline: isMultiline,
        };
        let obj;
        if (isMultiline) {
          obj = new fabric.Textbox(text, configs);
          obj.set({
            width: cfg.sWidth ?? 0,
          })
        } else {
          obj = new fabric.IText(text, configs);

        }

        obj.setPositionByOrigin(
          new fabric.Point((cfg.centerX ?? 0) * scale, (cfg.centerY ?? 0) * scale),
          "center",
          "center",
        );
        canvas.add(obj);
        continue;
      }

      /* ── Skip non-image element types ──────────────────────────────── */
      if (
        el.type !== "dynamic_image" &&
        el.type !== "image_placeholder" &&
        el.type !== "vector_eps"
      ) {
        continue;
      }

      /* ── Callie image ──────────────────────────────────────────────── */
      if (el.source === "callie") {
        const callieImage = (cfg.images ?? []).find(
          (img) => String(img.order) === String(cfg.imageId),
        );
        const url = callieImage?.value ?? cfg.imageUrl;
        if (!url) continue;

        const oImg = await loadFabricImage(url);
        if (myRender !== renderCounterRef.current) return;
        if (!oImg) continue;

        let sWidth: number, sHeight: number, centerX: number, centerY: number;

        if (callieImage?.scaleX !== undefined && callieImage?.scaleY !== undefined) {
          /* Full callie formula: derive size+position from natural dims × callieImage data */
          const naturalW = oImg.width ?? 1;
          const naturalH = oImg.height ?? 1;
          sWidth = naturalW * callieImage.scaleX;
          sHeight = naturalH * callieImage.scaleY;
          centerX = sWidth / 2 + (callieImage.left ?? 0);
          centerY = sHeight / 2 + (callieImage.top ?? 0);
        } else {
          /* No callie position data (e.g. user-uploaded photo) — use WM pre-computed values */
          sWidth = cfg.sWidth ?? (oImg.width ?? 1);
          sHeight = cfg.sHeight ?? (oImg.height ?? 1);
          centerX = cfg.centerX ?? 0;
          centerY = cfg.centerY ?? 0;
        }

        placeImage(oImg, centerX, centerY, sWidth, sHeight, scale, cfg.rotation ?? 0);
        canvas.add(oImg);
        continue;
      }

      /* ── Standard image ────────────────────────────────────────────── */
      const url = cfg.staticPath || cfg.imageUrl;
      if (!url) continue;

      const oImg = await loadFabricImage(url);
      if (myRender !== renderCounterRef.current) return;
      if (!oImg) continue;

      placeImage(
        oImg,
        cfg.centerX ?? 0,
        cfg.centerY ?? 0,
        cfg.sWidth ?? 0,
        cfg.sHeight ?? 0,
        scale,
        cfg.rotation ?? 0,
      );
      canvas.add(oImg);
    }

    if (myRender === renderCounterRef.current) {
      canvas.renderAll();
    }
  }, []);

  /* Init FabricJS canvas */
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_PX,
      height: CANVAS_PX,
      selection: false,
      renderOnAddRemove: false,
    });
    fabricRef.current = canvas;

    const cached = (window as unknown as Record<string, unknown>)
      .__wmTemplate as WMTemplate | undefined;
    if (cached) renderTemplate(cached);

    const handleUpdate = (e: Event) => {
      const template = (e as CustomEvent<{ template: WMTemplate }>).detail?.template;
      if (template) renderTemplate(template);
    };
    window.addEventListener("wm-template-update", handleUpdate);

    return () => {
      window.removeEventListener("wm-template-update", handleUpdate);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [renderTemplate]);

  /* Scale canvas element to fill container width */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const apply = () => {
      const canvasEl = canvasElRef.current;
      const fabricCanvas = fabricRef.current;
      if (!canvasEl || !fabricCanvas) return;

      const containerWidth = container.clientWidth;
      const displayScale = containerWidth / CANVAS_PX;
      canvasEl.style.transform = `scale(${displayScale})`;
      canvasEl.style.transformOrigin = "top left";
      container.style.height = `${(fabricCanvas.height ?? CANVAS_PX) * displayScale}px`;
    };

    const observer = new ResizeObserver(apply);
    observer.observe(container);
    apply();

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl bg-gray-50">
      <canvas ref={canvasElRef} />
    </div>
  );
}
