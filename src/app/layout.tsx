"use client";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { useLayoutEffect, useState } from "react";
import ToggleTheme from "../components/ToggleTheme";
import "./globals.css";
import { ThemeContext } from "./theme-context";

const inter = Inter({ subsets: ["latin"] });

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return document.documentElement.classList.contains("light") ||
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useLayoutEffect(() => {
    document.documentElement.classList.remove(
      theme === "light" ? "dark" : "light"
    );
    document.documentElement.classList.add(
      theme === "light" ? "light" : "dark"
    );
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <html lang="en">
        <body className={inter.className} style={{ position: "relative" }}>
          <ToggleTheme />
          {children}
        </body>
      </html>
    </ThemeContext.Provider>
  );
}

export default dynamic(() => Promise.resolve(RootLayout), {
  ssr: false,
});
