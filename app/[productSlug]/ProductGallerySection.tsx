"use client";

import TemplatePreviewLoader from "@/components/TemplatePreviewLoader";
import StickyPreviewWrapper from "@/components/StickyPreviewWrapper";

interface Props {
  gallery: string[];
  alt: string;
}

export default function ProductGallerySection({ gallery, alt }: Props) {
  return (
    // Gallery owns its own sticky and pins flush against the Header.
    // Sticky offsets equal the Header's measured height so the gallery
    // top edge doesn't clip behind the strips above — mobile = promo
    // `h-9` (36) + main `h-16` (64) = 100; desktop adds nav `h-12`
    // (48) for a total of 148. `StickyPreviewWrapper`'s scroll-detect
    // JS uses the same thresholds for its mobile width-shrink effect.
    //
    // Click + hover zoom interactions live inside `ProductGallery` now
    // (hover = cursor-tracking magnify on the active image, click =
    // full-screen slider modal). The outer wm-request-preview click was
    // only useful when the live `TemplatePreview` canvas was mounted —
    // canvas previews are still reachable via the "Preview Your Design"
    // button in the customization form.
    <StickyPreviewWrapper
      className="sticky top-[100px] lg:top-[148px] z-40 bg-white lg:bg-transparent -mx-4 lg:mx-0 shadow-md lg:shadow-none group"
    >
      <TemplatePreviewLoader gallery={gallery} alt={alt} />
    </StickyPreviewWrapper>
  );
}
