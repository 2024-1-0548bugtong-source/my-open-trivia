import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type FontSize = "small" | "medium" | "large";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultFontSize?: FontSize;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  fontSize: "medium",
  setTheme: () => null,
  setFontSize: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultFontSize = "medium",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [fontSize, setFontSize] = useState<FontSize>(
    () => (localStorage.getItem(`${storageKey}-fontsize`) as FontSize) || defaultFontSize
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    // Reset font size classes
    root.classList.remove("text-sm", "text-base", "text-lg");
    
    // We'll use data attributes for more control or tailwind classes on body
    // But for simplicity let's set a CSS variable or class
    if (fontSize === 'small') root.style.fontSize = '14px';
    if (fontSize === 'medium') root.style.fontSize = '16px';
    if (fontSize === 'large') root.style.fontSize = '18px';

    localStorage.setItem(`${storageKey}-fontsize`, fontSize);
  }, [fontSize, storageKey]);

  const value = {
    theme,
    fontSize,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setFontSize: (size: FontSize) => {
      setFontSize(size);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
