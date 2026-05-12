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

interface gifthubImage {
  order: number;
  value: string;
  scaleX: number;
  scaleY: number;
  left: number;
  top: number;
}

interface FontEntry {
  id?: string;
  order: number | string;
  value: string;
}

interface ElementConfig {
  sWidth: number;
  sHeight: number;
  centerX: number;
  centerY: number;
  rotation: number;
  flipX?: boolean;
  flipY?: boolean;
  imageUrl?: string;
  imageId?: number | string;
  images?: gifthubImage[];
  fonts?: FontEntry[];
  fontId?: number | string;
  textConfig?: {
    text?: string;
    fill?: string;
    fontSize?: number;
    fontFamily?: string;
    font?: string;
    multiline?: boolean;
    textAlign?: string;
    outlineWidth?: number | null;
    outlineColor?: string | { hex?: string } | null;
    tracking?: number | null;
    /* Circular text */
    horizontalDiameter?: number | null;
    verticalDiameter?: number | null;
    startAngle?: number | null;
    endAngle?: number | null;
    convex?: boolean | string | null;
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
  baseFile?: string;
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
  flipX: boolean = false,
  flipY: boolean = false,
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
    flipX: flipX === true,
    flipY: flipY === true,
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

function resolveFontUrl(cfg: ElementConfig): string | undefined {
  const direct = cfg.textConfig?.font;
  if (direct) return direct;
  if (cfg.fontId == null || !cfg.fonts?.length) return undefined;
  const match = cfg.fonts.find(
    (f) => String(f.order) === String(cfg.fontId),
  );
  return match?.value;
}

function resolveOutlineColor(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) return trimmed;
    try {
      const parsed = JSON.parse(trimmed) as { hex?: string };
      return parsed?.hex ?? null;
    } catch {
      return trimmed;
    }
  }
  if (typeof value === "object" && value !== null && "hex" in value) {
    const hex = (value as { hex?: string }).hex;
    return hex ?? null;
  }
  return null;
}

interface CircularTextInput {
  text: string;
  centerX: number;
  centerY: number;
  rotationDeg: number;
  horizontalDiameter: number;
  verticalDiameter: number;
  startAngleDeg: number;
  endAngleDeg: number;
  isConcave: boolean;
  fontSize: number;
  fontFamily: string;
  fill: string;
  textAlign?: string;
  outlineWidth?: number;
  outlineColor?: string | null;
  tracking?: number;
}

function buildArcPath(
  startAngleDeg: number,
  endAngleDeg: number,
  centerX: number,
  centerY: number,
  horizontalDiameter: number,
  verticalDiameter: number,
  rotationDeg: number,
  isConcave: boolean,
): { path: fabric.Path; length: number } {
  const isCircle = Math.round(horizontalDiameter) === Math.round(verticalDiameter);

  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;
  let radiusStart: number;
  let radiusEnd: number;
  let pathRotation: number;

  if (isCircle) {
    const radius = Math.max(horizontalDiameter, verticalDiameter) / 2;
    radiusStart = radius;
    radiusEnd = radius;
    pathRotation = 0;
    const startAngleRad = (startAngleDeg - 90 + rotationDeg) * Math.PI / 180;
    const endAngleRad = (endAngleDeg - 90 + rotationDeg) * Math.PI / 180;
    startX = centerX + radius * Math.cos(startAngleRad);
    startY = centerY + radius * Math.sin(startAngleRad);
    endX = centerX + radius * Math.cos(endAngleRad);
    endY = centerY + radius * Math.sin(endAngleRad);
  } else {
    const rx = horizontalDiameter / 2;
    const ry = verticalDiameter / 2;
    radiusStart = rx;
    radiusEnd = ry;
    pathRotation = rotationDeg;

    const startAngleRad = (startAngleDeg - 90) * Math.PI / 180;
    const endAngleRad = (endAngleDeg - 90) * Math.PI / 180;
    const sx = centerX + rx * Math.cos(startAngleRad);
    const sy = centerY + ry * Math.sin(startAngleRad);
    const ex = centerX + rx * Math.cos(endAngleRad);
    const ey = centerY + ry * Math.sin(endAngleRad);

    const rotationRad = rotationDeg * Math.PI / 180;
    const cos = Math.cos(rotationRad);
    const sin = Math.sin(rotationRad);
    const rotate = (x: number, y: number) => {
      const dx = x - centerX;
      const dy = y - centerY;
      return {
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos,
      };
    };
    const p1 = rotate(sx, sy);
    const p2 = rotate(ex, ey);
    startX = p1.x;
    startY = p1.y;
    endX = p2.x;
    endY = p2.y;
  }

  const deltaAngle = Math.abs(startAngleDeg - endAngleDeg);
  const sweepFlag = isConcave ? 1 : 0;
  let largeArcFlag: number;
  if (startAngleDeg > endAngleDeg) {
    largeArcFlag = deltaAngle > 180 ? (isConcave ? 0 : 1) : (isConcave ? 1 : 0);
  } else {
    largeArcFlag = deltaAngle > 180 ? (isConcave ? 1 : 0) : (isConcave ? 0 : 1);
  }

  const pathString = `M ${startX} ${startY} A ${radiusStart} ${radiusEnd} ${pathRotation} ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
  const arcPath = new fabric.Path(pathString, {
    fill: "",
    stroke: "transparent",
    strokeWidth: 1,
  });

  const fabricUtil = fabric.util as unknown as {
    getPathSegmentsInfo?: (path: unknown) => Array<{ length?: number }>;
  };
  const arcWithPath = arcPath as unknown as {
    path: unknown;
    segmentsInfo?: Array<{ length?: number }>;
  };
  let length = 0;
  if (fabricUtil.getPathSegmentsInfo) {
    const segs = fabricUtil.getPathSegmentsInfo(arcWithPath.path);
    arcWithPath.segmentsInfo = segs;
    if (segs.length > 0) length = segs[segs.length - 1].length ?? 0;
  }
  return { path: arcPath, length };
}

function measureCircularTextWidth(input: CircularTextInput): number {
  const measure = new fabric.Text(input.text, {
    fontSize: input.fontSize,
    fontFamily: input.fontFamily,
  });
  if (input.tracking) measure.set("charSpacing", input.tracking);
  const maybeInit = measure as unknown as { initDimensions?: () => void };
  if (typeof maybeInit.initDimensions === "function") maybeInit.initDimensions();
  return measure.width ?? 0;
}

/* Arc length từ một góc xuất phát theo span đã ký (signed degrees). */
function ellipseArcLengthFromSpan(
  rx: number,
  ry: number,
  startAngleDeg: number,
  spanDeg: number,
  steps = 240,
): number {
  if (rx === ry) return rx * Math.abs(spanDeg * Math.PI / 180);
  const startRad = (startAngleDeg - 90) * Math.PI / 180;
  const spanRad = spanDeg * Math.PI / 180;
  const dt = spanRad / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const t = startRad + dt * (i + 0.5);
    sum += Math.sqrt((rx * Math.sin(t)) ** 2 + (ry * Math.cos(t)) ** 2);
  }
  return sum * Math.abs(dt);
}

/**
 * Tính visibleSpan và visibleMid của arc THẬT mà fabric sẽ vẽ
 * dựa trên cùng truth-table với buildArcPath.
 */
function computeVisibleArc(
  startAngleDeg: number,
  endAngleDeg: number,
  isConcave: boolean,
): { visibleSpan: number; visibleMid: number } {
  const rawDelta = endAngleDeg - startAngleDeg;
  const absDelta = Math.abs(rawDelta);
  const startGreater = startAngleDeg > endAngleDeg;
  const deltaOver180 = absDelta > 180;

  let isLargeArc: boolean;
  if (startGreater) {
    isLargeArc = deltaOver180 ? !isConcave : isConcave;
  } else {
    isLargeArc = deltaOver180 ? isConcave : !isConcave;
  }

  const directSpan = rawDelta;
  const wrapSpan = rawDelta >= 0 ? rawDelta - 360 : rawDelta + 360;
  const shortSpan = absDelta < 180 ? directSpan : wrapSpan;
  const longSpan = absDelta < 180 ? wrapSpan : directSpan;
  const visibleSpan = isLargeArc ? longSpan : shortSpan;
  const visibleMid = startAngleDeg + visibleSpan / 2;
  return { visibleSpan, visibleMid };
}

function makeCircularText(input: CircularTextInput): fabric.Object {
  const {
    text,
    centerX,
    centerY,
    rotationDeg,
    horizontalDiameter,
    verticalDiameter,
    isConcave,
  } = input;
  let { startAngleDeg, endAngleDeg } = input;

  /**
   * Strategy ưu tiên giữ design intent (arc gốc):
   *   1. Nếu text > arc gốc → shrink fontSize để fit (min = 50% font gốc, abs min 6px).
   *   2. Nếu sau shrink vẫn chưa fit (font chạm sàn) → expand arc đối xứng,
   *      soft cap = max(originalSpan × 2, 180°), hard cap 320°.
   *   3. Nếu vẫn chưa fit → shrink font tiếp xuống abs min 6px.
   */
  const textWidth = measureCircularTextWidth(input);
  const rx = horizontalDiameter / 2;
  const ry = verticalDiameter / 2;
  let finalFontSize = input.fontSize;
  if (rx > 0 && ry > 0 && textWidth > 0) {
    const arcInfo = computeVisibleArc(startAngleDeg, endAngleDeg, isConcave);
    const visibleMid = arcInfo.visibleMid;
    let visibleSpan = arcInfo.visibleSpan;
    if (Math.abs(visibleSpan) < 0.5) visibleSpan = visibleSpan >= 0 ? 1 : -1;

    const originalSpan = Math.abs(visibleSpan);
    const initialSegStart = visibleMid - visibleSpan / 2;
    const originalArcLen = ellipseArcLengthFromSpan(rx, ry, initialSegStart, visibleSpan);
    const targetWidth = textWidth * 1.04;

    const ABS_MIN_FONT = 6;
    const SOFT_MIN_FONT = Math.max(ABS_MIN_FONT, Math.floor(input.fontSize * 0.5));

    if (originalArcLen > 0 && targetWidth > originalArcLen) {
      /* Bước 1: shrink fontSize tới SOFT_MIN_FONT để vừa arc gốc */
      finalFontSize = Math.max(
        SOFT_MIN_FONT,
        Math.floor(input.fontSize * (originalArcLen / textWidth) * 0.96),
      );

      /* Tính textWidth mới sau shrink (linear theo fontSize ratio) */
      const shrunkTextWidth = textWidth * (finalFontSize / input.fontSize);
      const shrunkTarget = shrunkTextWidth * 1.04;

      if (shrunkTarget > originalArcLen) {
        /* Bước 2: font đã chạm sàn 50% — expand arc để đỡ phần còn thiếu */
        const SOFT_MAX = Math.min(320, Math.max(originalSpan * 2, 180));
        for (let iter = 0; iter < 6; iter++) {
          if (Math.abs(visibleSpan) >= SOFT_MAX) break;
          const ss = visibleMid - visibleSpan / 2;
          const arcLen = ellipseArcLengthFromSpan(rx, ry, ss, visibleSpan);
          if (arcLen >= shrunkTarget) break;
          const sign = Math.sign(visibleSpan) || 1;
          const ratio = arcLen > 0 ? shrunkTarget / arcLen : 2;
          const newSpanMag = Math.min(SOFT_MAX, Math.abs(visibleSpan) * ratio);
          visibleSpan = newSpanMag * sign;
        }

        /* Bước 3: nếu sau expand vẫn chưa đủ → shrink font tiếp xuống abs min */
        const finalSegStart = visibleMid - visibleSpan / 2;
        const finalArcLen = ellipseArcLengthFromSpan(rx, ry, finalSegStart, visibleSpan);
        if (finalArcLen > 0 && shrunkTarget > finalArcLen) {
          finalFontSize = Math.max(
            ABS_MIN_FONT,
            Math.floor(input.fontSize * (finalArcLen / textWidth) * 0.96),
          );
        }
      }
    }

    startAngleDeg = visibleMid - visibleSpan / 2;
    endAngleDeg = visibleMid + visibleSpan / 2;
  }

  const arc = buildArcPath(
    startAngleDeg,
    endAngleDeg,
    centerX,
    centerY,
    horizontalDiameter,
    verticalDiameter,
    rotationDeg,
    isConcave,
  );

  const arcPath = arc.path;

  const textOptions = {
    path: arcPath,
    top: arcPath.top,
    left: arcPath.left,
    fontSize: finalFontSize,
    fontFamily: input.fontFamily,
    fill: input.fill,
    selectable: false,
    evented: false,
  } as unknown as fabric.ITextOptions;
  const textObject = new fabric.Text(text, textOptions);

  if (input.textAlign) {
    textObject.set("textAlign", input.textAlign);
  }
  if (input.tracking) {
    textObject.set("charSpacing", input.tracking);
  }
  if (input.outlineColor) {
    textObject.set("stroke", input.outlineColor);
  }
  if (input.outlineWidth && input.outlineWidth > 0) {
    textObject.set("strokeWidth", input.outlineWidth);
    textObject.set("paintFirst", "stroke");
  }

  textObject.setCoords();
  return textObject;
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
    const gifthubImg = (cfg.images ?? []).find(
      (img) => String(img.order) === String(cfg.imageId),
    );
    return gifthubImg?.value ?? cfg.imageUrl;
  }
  return cfg.staticPath || cfg.imageUrl;
}

function elementFingerprint(el: TemplateElement): string {
  const cfg = el.config;
  const flip = `${cfg.flipX === true ? 1 : 0}${cfg.flipY === true ? 1 : 0}`;
  if (el.type === "text_box_circular") {
    const tc = cfg.textConfig;
    const outline = typeof tc?.outlineColor === "object" ? tc?.outlineColor?.hex : tc?.outlineColor;
    return `tc|${tc?.text}|${tc?.fill}|${tc?.fontSize}|${tc?.font}|${cfg.fontId}|${tc?.textAlign}|${tc?.outlineWidth}|${outline}|${tc?.tracking}|${tc?.horizontalDiameter}|${tc?.verticalDiameter}|${tc?.startAngle}|${tc?.endAngle}|${tc?.convex}|${cfg.centerX}|${cfg.centerY}|${cfg.rotation}|${flip}`;
  }
  if (el.type === "text_box" || el.type === "text") {
    return `text|${cfg.textConfig?.text}|${cfg.textConfig?.fill}|${cfg.textConfig?.fontSize}|${cfg.textConfig?.font}|${cfg.fontId}|${cfg.textConfig?.multiline}|${cfg.centerX}|${cfg.centerY}|${cfg.sWidth}|${cfg.rotation}|${flip}`;
  }
  const url = getImageUrl(el);
  if (el.source === "callie") {
    const ci = (cfg.images ?? []).find((img) => String(img.order) === String(cfg.imageId));
    return `img|${url}|${ci?.scaleX}|${ci?.scaleY}|${ci?.left}|${ci?.top}|${cfg.centerX}|${cfg.centerY}|${cfg.sWidth}|${cfg.sHeight}|${cfg.rotation}|${flip}`;
  }
  return `img|${url}|${cfg.centerX}|${cfg.centerY}|${cfg.sWidth}|${cfg.sHeight}|${cfg.rotation}|${flip}`;
}

/* ─── Image cache ─────────────────────────────────────────────────────── */

const imageCache = new Map<string, fabric.Image>();

async function getCachedImage(url: string): Promise<fabric.Image | null> {
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

    // --- Xử lý baseFile ---
    if (template.baseFile) {
      const elId = "baseFile";
      newElementIds.add(elId);
      const fp = `baseFile|${template.baseFile}`;
      const existing = objectMap.get(elId);

      if (!existing || existing.fingerprint !== fp) {
        if (existing) {
          canvas.remove(existing.fabricObj);
          objectMap.delete(elId);
        }

        const oImg = await getCachedImage(template.baseFile);
        if (oImg) {
          if (myRender !== renderCounterRef.current) return;
          oImg.set({
            scaleX: CANVAS_PX / (oImg.width || 1),
            scaleY: (templateHeight * scale) / (oImg.height || 1),
            left: 0,
            top: 0,
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
          });
          objectMap.set(elId, { fingerprint: fp, fabricObj: oImg });
          pendingAdds.push({ id: elId, order: -9999, obj: oImg });
        }
      }
    }

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

      /* ── Circular text on ellipse path ─────────────────────────────── */
      if (el.type === "text_box_circular") {
        const tc = cfg.textConfig;
        const text = tc?.text ?? "";
        if (!text.trim()) continue;

        const horizontalDiameter = (tc?.horizontalDiameter ?? 0) * scale;
        const verticalDiameter = (tc?.verticalDiameter ?? 0) * scale;
        if (horizontalDiameter <= 0 || verticalDiameter <= 0) continue;

        const fontUrl = resolveFontUrl(cfg);
        await loadFont(fontUrl, fontUrl);
        if (myRender !== renderCounterRef.current) return;

        const obj = makeCircularText({
          text,
          centerX: (cfg.centerX ?? 0) * scale,
          centerY: (cfg.centerY ?? 0) * scale,
          rotationDeg: cfg.rotation ?? 0,
          horizontalDiameter,
          verticalDiameter,
          startAngleDeg: tc?.startAngle ?? 0,
          endAngleDeg: tc?.endAngle ?? 360,
          isConcave: tc?.convex === false || tc?.convex === "false",
          fontSize: (tc?.fontSize ?? 16) * scale,
          fontFamily: fontUrl || tc?.fontFamily || "sans-serif",
          fill: tc?.fill ?? "#000000",
          textAlign: tc?.textAlign,
          outlineWidth: (tc?.outlineWidth ?? 0) * scale,
          outlineColor: resolveOutlineColor(tc?.outlineColor),
          tracking: tc?.tracking ?? undefined,
        });

        if (cfg.flipX === true) obj.set("flipX", true);
        if (cfg.flipY === true) obj.set("flipY", true);

        objectMap.set(elId, { fingerprint: fp, fabricObj: obj });
        pendingAdds.push({ id: elId, order: el.order, obj });
        continue;
      }

      /* ── Text ──────────────────────────────────────────────────────── */
      if (el.type === "text_box" || el.type === "text") {
        const text = cfg.textConfig?.text ?? "";
        if (!text.trim()) continue;
        const fontUrl = resolveFontUrl(cfg);
        await loadFont(fontUrl, fontUrl);
        if (myRender !== renderCounterRef.current) return;
        let isMultiline = cfg.textConfig?.multiline;
        if (!isMultiline && cfg.textConfig?.text?.toString().trim().includes('\n')) {
          isMultiline = true;
        }

        const configs = {
          fontSize: (cfg.textConfig?.fontSize ?? 16) * scale,
          fontFamily: fontUrl || cfg.textConfig?.fontFamily || "sans-serif",
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

        if (cfg.flipX === true) obj.set("flipX", true);
        if (cfg.flipY === true) obj.set("flipY", true);

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

      /* ── callie image ──────────────────────────────────────────────── */
      if (el.source === "callie") {
        const gifthubImage = (cfg.images ?? []).find(
          (img) => String(img.order) === String(cfg.imageId),
        );
        const url = gifthubImage?.value ?? cfg.imageUrl;
        if (!url) continue;

        const oImg = await getCachedImage(url);
        if (myRender !== renderCounterRef.current) return;
        if (!oImg) continue;

        let sWidth: number, sHeight: number, centerX: number, centerY: number;

        if (gifthubImage?.scaleX !== undefined && gifthubImage?.scaleY !== undefined) {
          const naturalW = oImg.width ?? 1;
          const naturalH = oImg.height ?? 1;
          sWidth = naturalW * gifthubImage.scaleX;
          sHeight = naturalH * gifthubImage.scaleY;
          centerX = sWidth / 2 + (gifthubImage.left ?? 0);
          centerY = sHeight / 2 + (gifthubImage.top ?? 0);
        } else {
          sWidth = cfg.sWidth ?? (oImg.width ?? 1);
          sHeight = cfg.sHeight ?? (oImg.height ?? 1);
          centerX = cfg.centerX ?? 0;
          centerY = cfg.centerY ?? 0;
        }

        placeImage(
          oImg,
          centerX,
          centerY,
          sWidth,
          sHeight,
          scale,
          cfg.rotation ?? 0,
          cfg.flipX === true,
          cfg.flipY === true,
        );
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
        cfg.flipX === true,
        cfg.flipY === true,
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
    const allTracked = Array.from(objectMap.entries())
      .map(([id, tracked]) => {
        let order = 0;
        if (id === "baseFile") {
          order = -9999;
        } else {
          const el = elements.find((e) => String(e.elementId) === String(id));
          order = el ? el.order : 0;
        }
        return { tracked, order };
      })
      .sort((a, b) => a.order - b.order);

    allTracked.forEach((item, index) => {
      canvas.moveTo(item.tracked.fabricObj, index);
    });

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
