"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Sun/moon dark-mode toggle. Both icons are always rendered and swapped
 * purely with `dark:` CSS classes, so the server markup never depends on
 * the theme — no hydration mismatch and no flash on load.
 */
export function ThemeToggle ()
{
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:border-aqua"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <Sun
        className="h-4.5 w-4.5 rotate-0 scale-100 text-flame transition-all duration-300 dark:-rotate-90 dark:scale-0"
        strokeWidth={1.8}
      />
      <Moon
        className="absolute h-4.5 w-4.5 rotate-90 scale-0 text-aqua transition-all duration-300 dark:rotate-0 dark:scale-100"
        strokeWidth={1.8}
      />
    </button>
  );
}
