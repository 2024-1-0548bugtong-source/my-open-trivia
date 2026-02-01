"use client";

import { ThemeProvider } from "@/hooks/use-theme";
import { UserProvider } from "@/context/UserContext";
import NicknameGate from "@/components/NicknameGate";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="next-ui-theme">
      <UserProvider>
        <NicknameGate>{children}</NicknameGate>
      </UserProvider>
    </ThemeProvider>
  );
}
