import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";
import { Analytics } from "@vercel/analytics/next";

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
        <Analytics />
      </body>
    </html>
  );
}
