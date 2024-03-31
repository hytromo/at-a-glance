"use client";

import { Inter } from "next/font/google";
import MainLayout from "../components/MainLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ position: "relative" }}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

export default RootLayout;
