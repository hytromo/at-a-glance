"use client";
import { Inter } from "next/font/google";
import ToggleTheme from "../components/ToggleTheme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ position: "relative" }}>
        <ToggleTheme />
        {children}
      </body>
    </html>
  );
}
