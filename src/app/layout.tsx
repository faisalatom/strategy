import type { Metadata } from "next";
import { Share_Tech_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const techMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-tech-mono",
});

export const metadata: Metadata = {
  title: "ANGLE//OM",
  description: "Generate HUD-style presentation graphics from prompts with ANGLE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${grotesk.variable} ${techMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
