import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-store",
    },
  ),
);

export function applyTheme(theme: Theme): void {
  const root = window.document.documentElement;

  // Remove all theme classes
  root.classList.remove("light", "dark");

  // If system preference, check for dark mode
  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

// Watch for system theme changes
export function setupThemeWatcher(): () => void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const listener = () => {
    const theme = useThemeStore.getState().theme;
    if (theme === "system") {
      applyTheme("system");
    }
  };

  mediaQuery.addEventListener("change", listener);

  return () => mediaQuery.removeEventListener("change", listener);
}
