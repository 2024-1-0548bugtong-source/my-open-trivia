import type { ReactNode } from "react"
import Navbar from "@/components/Navbar"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen px-4 py-8 bg-(--background)/0">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  )
}
