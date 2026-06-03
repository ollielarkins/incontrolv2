import type { Metadata } from "next";
import { IM_Fell_English } from "next/font/google";
import "./globals.css";

const imFell = IM_Fell_English({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-im-fell",
});

export const metadata: Metadata = {
  title: "InControl",
  description: "Your personal OS for student life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${imFell.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: "#0d0b08" }}>
        {children}
      </body>
    </html>
  );
}
