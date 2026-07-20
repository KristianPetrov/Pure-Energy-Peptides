"use client";

import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "./theme-toggle";

/** Keeps the theme context at the interactive control instead of wrapping the app. */
export function ThemeControl() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeToggle />
    </ThemeProvider>
  );
}
