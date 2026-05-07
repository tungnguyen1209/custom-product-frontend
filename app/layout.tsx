import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gifthub | Personalized Gifts for Your Loved Ones",
  description:
    "Discover unique, personalized gifts for family, friends, and pets at Gifthub. Custom designs that tell your story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-800">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
