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

/* ─── Helpers ─────────────────────────────────────────────────────────── */

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

/* ─── Fingerprint: tạo chuỗi hash nhẹ để so sánh element có thay đổi không ── */

function getImageUrl(el: TemplateElement): string | undefined {
  const cfg = el.config;
  if (el.source === "callie") {
    const callieImg = (cfg.images ?? []).find(
      (img) => String(img.order) === String(cfg.imageId),
    );
    return callieImg?.value ?? cfg.imageUrl;
  }
  return cfg.staticPath || cfg.imageUrl;
}

function elementFingerprint(el: TemplateElement): string {
  const cfg = el.config;
  if (el.type === "text_box" || el.type === "text_box_circular") {
    return `text|${cfg.textConfig?.text}|${cfg.textConfig?.fill}|${cfg.textConfig?.fontSize}|${cfg.textConfig?.font}|${cfg.textConfig?.multiline}|${cfg.centerX}|${cfg.centerY}|${cfg.sWidth}|${cfg.rotation}`;
  }
  const url = getImageUrl(el);
  if (el.source === "callie") {
    const ci = (cfg.images ?? []).find((img) => String(img.order) === String(cfg.imageId));
    return `img|${url}|${ci?.scaleX}|${ci?.scaleY}|${ci?.left}|${ci?.top}|${cfg.centerX}|${cfg.centerY}|${cfg.sWidth}|${cfg.sHeight}|${cfg.rotation}`;
  }
  return `img|${url}|${cfg.centerX}|${cfg.centerY}|${cfg.sWidth}|${cfg.sHeight}|${cfg.rotation}`;
}

/* ─── Image cache ─────────────────────────────────────────────────────── */

const imageCache = new Map<string, fabric.Image>();

async function getCachedImage(url: string): Promise<fabric.Image | null> {
  console.log(url);
  if (imageCache.has(url)) {
    // Clone cached image để mỗi element có instance riêng
    const cached = imageCache.get(url)!;
    return new Promise((resolve) => {
      cached.clone((cloned: fabric.Image) => resolve(cloned));
    });
  }
  const img = await loadFabricImage(url);
  if (img) {
    imageCache.set(url, img);
    // Return a clone, keep original in cache
    return new Promise((resolve) => {
      img.clone((cloned: fabric.Image) => resolve(cloned));
    });
  }
  return null;
}

/* ─── Tracked element entry ───────────────────────────────────────────── */

interface TrackedElement {
  fingerprint: string;
  fabricObj: fabric.Object;
}

/* ─── Component ───────────────────────────────────────────────────────── */

export default function TemplatePreview() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const renderCounterRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Map elementId → tracked fabric object + fingerprint
  const objectMapRef = useRef<Map<string | number, TrackedElement>>(new Map());
  // Lưu lại template trước để so sánh kích thước
  const prevTemplateSizeRef = useRef<{ w: number; h: number } | null>(null);

  const renderTemplate = useCallback(async (template: WMTemplate) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const myRender = ++renderCounterRef.current;

    const templateWidth = template.width || CANVAS_PX;
    const templateHeight = template.height || CANVAS_PX;
    const scale = CANVAS_PX / templateWidth;

    // Chỉ resize canvas khi kích thước template thay đổi
    const prevSize = prevTemplateSizeRef.current;
    if (!prevSize || prevSize.w !== templateWidth || prevSize.h !== templateHeight) {
      canvas.setDimensions({ width: CANVAS_PX, height: templateHeight * scale });
      prevTemplateSizeRef.current = { w: templateWidth, h: templateHeight };

      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const displayScale = containerWidth / CANVAS_PX;
        containerRef.current.style.height = `${templateHeight * scale * displayScale}px`;
      }
    }

    const elements = [...(template.elements ?? [])]
      .filter((el) => el.isShow || (el.opacity ?? 1) > 0)
      .sort((a, b) => a.order - b.order);

    const objectMap = objectMapRef.current;
    const newElementIds = new Set<string | number>();
    const pendingAdds: { id: string | number; order: number; obj: fabric.Object }[] = [];

    for (const el of elements) {
      if (myRender !== renderCounterRef.current) return;

      const elId = el.elementId;
      newElementIds.add(elId);

      const fp = elementFingerprint(el);
      const existing = objectMap.get(elId);

      // Element không thay đổi → giữ nguyên, skip
      if (existing && existing.fingerprint === fp) {
        continue;
      }

      // Element thay đổi → xóa cái cũ khỏi canvas
      if (existing) {
        canvas.remove(existing.fabricObj);
        objectMap.delete(elId);
      }

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
          // Shrink font to fit bounding box width when text overflows
          if (cfg.sWidth && cfg.sWidth > 0) {
            const boxWidth = cfg.sWidth * scale;
            if ((obj.width ?? 0) > boxWidth) {
              const shrunkSize = Math.max(6, Math.floor(configs.fontSize * boxWidth / (obj.width ?? 1)));
              obj.set({ fontSize: shrunkSize });
              obj.initDimensions();
            }
          }
        }

        obj.setPositionByOrigin(
          new fabric.Point((cfg.centerX ?? 0) * scale, (cfg.centerY ?? 0) * scale),
          "center",
          "center",
        );

        objectMap.set(elId, { fingerprint: fp, fabricObj: obj });
        pendingAdds.push({ id: elId, order: el.order, obj });
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

        const oImg = await getCachedImage(url);
        if (myRender !== renderCounterRef.current) return;
        if (!oImg) continue;

        let sWidth: number, sHeight: number, centerX: number, centerY: number;

        if (callieImage?.scaleX !== undefined && callieImage?.scaleY !== undefined) {
          const naturalW = oImg.width ?? 1;
          const naturalH = oImg.height ?? 1;
          sWidth = naturalW * callieImage.scaleX;
          sHeight = naturalH * callieImage.scaleY;
          centerX = sWidth / 2 + (callieImage.left ?? 0);
          centerY = sHeight / 2 + (callieImage.top ?? 0);
        } else {
          sWidth = cfg.sWidth ?? (oImg.width ?? 1);
          sHeight = cfg.sHeight ?? (oImg.height ?? 1);
          centerX = cfg.centerX ?? 0;
          centerY = cfg.centerY ?? 0;
        }

        placeImage(oImg, centerX, centerY, sWidth, sHeight, scale, cfg.rotation ?? 0);
        objectMap.set(elId, { fingerprint: fp, fabricObj: oImg });
        pendingAdds.push({ id: elId, order: el.order, obj: oImg });
        continue;
      }

      /* ── Standard image ────────────────────────────────────────────── */
      const url = cfg.staticPath || cfg.imageUrl;
      if (!url) continue;

      const oImg = await getCachedImage(url);
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
      objectMap.set(elId, { fingerprint: fp, fabricObj: oImg });
      pendingAdds.push({ id: elId, order: el.order, obj: oImg });
    }

    if (myRender !== renderCounterRef.current) return;

    // Xóa các element không còn trong template mới
    for (const [id, tracked] of objectMap) {
      if (!newElementIds.has(id)) {
        canvas.remove(tracked.fabricObj);
        objectMap.delete(id);
      }
    }

    // Thêm các element mới vào canvas
    for (const item of pendingAdds) {
      canvas.add(item.obj);
    }

    // Sắp xếp lại thứ tự trên canvas theo order
    const sortedElements = elements.filter((el) => objectMap.has(el.elementId));
    for (let i = 0; i < sortedElements.length; i++) {
      const tracked = objectMap.get(sortedElements[i].elementId);
      if (tracked) {
        canvas.moveTo(tracked.fabricObj, i);
      }
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

    const handleRequestPreview = () => {
      if (fabricRef.current) {
        const dataUrl = fabricRef.current.toDataURL({
          format: "png",
          multiplier: 2,
        });
        window.dispatchEvent(new CustomEvent("wm-show-preview", { detail: { dataUrl } }));
      }
    };
    window.addEventListener("wm-request-preview", handleRequestPreview);

    return () => {
      window.removeEventListener("wm-template-update", handleUpdate);
      window.removeEventListener("wm-request-preview", handleRequestPreview);
      canvas.dispose();
      fabricRef.current = null;
      objectMapRef.current.clear();
      prevTemplateSizeRef.current = null;
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
