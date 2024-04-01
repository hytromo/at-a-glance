"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useState } from "react";
import { ThemeContext } from "../app/theme-context";
import ToggleTheme from "./ToggleTheme";

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return window.matchMedia("(max-width: 1000px)").matches;
  });

  useLayoutEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 1000px)").matches);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isMobile, setTheme }}>
      <ToggleTheme />
      <button
        style={{ position: "absolute", top: "1rem", right: "3rem" }}
        onClick={() => {
          document.documentElement.requestFullscreen();
        }}
      >
        Full
      </button>
      {children}
    </ThemeContext.Provider>
  );
}

export default dynamic(() => Promise.resolve(MainLayout), {
  ssr: false,
});
