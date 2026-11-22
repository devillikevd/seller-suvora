import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/common/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SUVORA — Advanced Seller Portal",
  description:
    "Unified commerce platform for local store owners to manage stores, catalog, inventory, orders, customer relationships, and earnings.",
  icons: {
    icon: "/images/suvora-logo.png",
    apple: "/images/suvora-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f8f7fc] text-[#1a1a2e]">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
