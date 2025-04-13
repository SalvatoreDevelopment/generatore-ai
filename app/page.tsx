import ImageGenerator from "@/components/image-generator"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/contexts/theme-context"
import Navbar from "@/components/navbar"
import AdminPanel from "@/components/admin-panel"
import ParticlesBackground from "@/components/particles-background"

export default function Home() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <main className="min-h-screen bg-gray-50 dark:bg-[#010817] text-gray-900 dark:text-white flex flex-col">
          <ParticlesBackground />
          <Navbar />
          <div className="flex-1 p-4 md:p-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <ImageGenerator />
            </div>
          </div>
          <AdminPanel />
        </main>
      </ThemeProvider>
    </LanguageProvider>
  )
}
