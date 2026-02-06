import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"


export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-(--background)/95 backdrop-blur-sm border-b" style={{borderColor:'var(--border)'}}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-(--primary)">Open Trivia</h1>

        {/* Navigation links */}
        <div className="hidden sm:flex gap-6 text-(--muted)">
          <a href="/" className="hover:text-white transition">Dashboard</a>
          <a href="/categories" className="hover:text-white transition">Categories</a>
          <a href="/favorites" className="hover:text-white transition">Favorites</a>
          <a href="/preferences" className="hover:text-white transition">Preferences</a>
        </div>

        {/* Button */}
        <div className="ml-4">
          <Button variant="default" className="rounded-full px-4 py-2 shadow-sm hover:shadow-md transform transition">
            Start Quiz
          </Button>
        </div>
      </div>
      <Separator />
    </nav>
  )
}
