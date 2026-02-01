import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Open Trivia",
  description: "Open Trivia App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
