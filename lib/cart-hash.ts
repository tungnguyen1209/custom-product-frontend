/**
 * Cart dedupe key — SHA-256 of a canonical JSON of the customization
 * options plus the visible canvas elements. The hash is sent with each
 * Add-to-Cart call so the backend can merge identical configurations
 * into a single line instead of producing N rows from N clicks.
 *
 * Why a hash and not a stringify of the customization alone:
 *   - Postgres jsonb reorders keys on write, so a round-tripped
 *     customization stringifies differently from the freshly-built one.
 *   - Two designs can share the same option values but differ in the
 *     rendered canvas (uploaded photo, layer toggles). Hashing the
 *     filtered canvas captures those differences.
 *
 * The canvas filter mirrors the editor's "is this a real, user-visible
 * layer" check: `isShow && !isHideVisually && !isCallieHide`. Internal
 * helper layers (guides, hidden defaults) are excluded so they don't
 * perturb the hash between two otherwise-identical orders.
 */

interface CanvasElementLike {
  isShow?: boolean;
  isHideVisually?: boolean;
  isCallieHide?: boolean;
  [key: string]: unknown;
}

interface CanvasLike {
  width?: number;
  height?: number;
  baseFile?: string;
  elements?: CanvasElementLike[];
}

/** Keep only real, user-visible canvas layers — drops helper/hidden
 *  elements the editor uses internally so they don't perturb the hash. */
export function filterVisibleCanvasElements(
  elements: CanvasElementLike[] | undefined,
): CanvasElementLike[] {
  if (!Array.isArray(elements)) return [];
  return elements.filter(
    (el) =>
      el?.isShow === true &&
      !el?.isHideVisually &&
      !el?.isCallieHide,
  );
}

/** Canonical JSON: sorted keys at every object level so equivalent
 *  objects always serialize to the same string regardless of insertion
 *  order or jsonb round-trip reordering. */
function canonicalize(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalize).join(",") + "]";
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
  );
  return (
    "{" +
    entries
      .map(([k, v]) => JSON.stringify(k) + ":" + canonicalize(v))
      .join(",") +
    "}"
  );
}

/** SHA-256 over the canonical (customization + canvas) string. */
export async function computeCartItemHash(
  customization: Record<string, unknown>,
  canvas: CanvasLike | null | undefined,
): Promise<string> {
  const payload = {
    customization,
    canvas: canvas
      ? {
          width: canvas.width ?? null,
          height: canvas.height ?? null,
          baseFile: canvas.baseFile ?? null,
          elements: filterVisibleCanvasElements(canvas.elements),
        }
      : null,
  };
  const buf = new TextEncoder().encode(canonicalize(payload));
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
