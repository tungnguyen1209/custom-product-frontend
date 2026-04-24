"use client";

import dynamic from "next/dynamic";
import CustomizationFormSkeleton from "./CustomizationFormSkeleton";

const CustomizationForm = dynamic(
  () => import("./CustomizationForm"),
  { ssr: false, loading: () => <CustomizationFormSkeleton /> },
);

export default function CustomizationFormLoader() {
  return <CustomizationForm />;
}
