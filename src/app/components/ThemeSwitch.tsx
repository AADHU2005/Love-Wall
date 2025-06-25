"use client";
import { useEffect, useState } from "react";

function setThemeVars(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.style.setProperty("--background", "#55002c");
    root.style.setProperty("--foreground", "#171717"); 
    root.style.setProperty("--accent", "#181024");
    root.style.setProperty("--accent-strong", "#a21caf");
  } else {
    root.style.setProperty("--background", "#f8c9e4");
    root.style.setProperty("--foreground", "#171717"); 
    root.style.setProperty("--accent", "#fff");
    root.style.setProperty("--accent-strong", "#f9a8d4");
  }
  root.classList.toggle("dark", isDark);
}

export default function ThemeSwitch() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const stored = localStorage.getItem("theme");
      const isDark = stored
        ? stored === "dark"
        : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(isDark);
      setThemeVars(isDark);
    };
    updateTheme();
    window.addEventListener("storage", updateTheme);
    return () => window.removeEventListener("storage", updateTheme);
  }, []);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      setThemeVars(next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <button
      aria-label="Toggle light/dark mode"
      className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full p-2 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      onClick={toggleTheme}
      type="button"
    >
      {dark ? (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="#FBBF24"/></svg>
      ) : (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#FBBF24"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/></svg>
      )}
    </button>
  );
}
