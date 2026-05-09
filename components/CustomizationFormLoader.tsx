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
  customization?: ProductCustomizationData | null;
  customizationError?: boolean;
}

export default function CustomizationFormLoader(props: Props) {
  return <CustomizationForm {...props} />;
}
