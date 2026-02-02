"use client";

import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="next-ui-theme">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
