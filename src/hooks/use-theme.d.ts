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
export declare function ThemeProvider({ children, defaultTheme, defaultFontSize, storageKey, ...props }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const useTheme: () => ThemeProviderState;
export {};
//# sourceMappingURL=use-theme.d.ts.map