import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrakShop | Minimalist ve Şık Giyim",
  description: "Yeni sezon T-shirt ve Kazak koleksiyonunu keşfedin. Sadelik ve şıklığın adresi OrakShop.",
  applicationName: "OrakShop",
  keywords: ["giyim", "t-shirt", "kazak", "minimalist", "orakshop", "moda"],
  verification: {
    google: "dcJi6iC8BMRF2jJkcal30IlCAqAGT0DLLB8DC2_yukQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
