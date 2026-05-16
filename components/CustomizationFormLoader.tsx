"use client";

import dynamic from "next/dynamic";
import CustomizationFormSkeleton from "./CustomizationFormSkeleton";
import type { ProductCustomizationData } from "@/lib/api";

const CustomizationForm = dynamic(
  () => import("./CustomizationForm"),
  { ssr: false, loading: () => <CustomizationFormSkeleton /> },
);

interface Props {
  productId: string;
  productName?: string;
  basePrice?: number;
  /** First gallery image URL — used as the thumbnail in the sticky CTA. */
  imageUrl?: string | null;
  customization?: ProductCustomizationData | null;
  customizationError?: boolean;
  /** Sanitized HTML for the Size Guide popup. Pass `null` to hide the link. */
  sizeChartHtml?: string | null;
}

export default function CustomizationFormLoader(props: Props) {
  return <CustomizationForm {...props} />;
}
