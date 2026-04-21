import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, Cedarville_Cursive } from "next/font/google"; // Add them here
import "./globals.css";
import BackToTop from "@/components/BackToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Initialize Medieval Fonts
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const cursive = Cedarville_Cursive({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-cursive",
});

export const metadata: Metadata = {
  title: 'The Iron Chronicle | D&D Campaign',
  description: 'A dark fantasy campaign of conquest, betrayal & glory in the fractured kingdom of Valdris',
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${cursive.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col bg-[#1a1208]">
      {children}
      <BackToTop />
      </body>
      </html>
  );
}