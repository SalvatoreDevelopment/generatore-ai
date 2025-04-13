// Questo è un frammento da aggiungere al file app/page.tsx esistente

// Aggiungi questa importazione all'inizio del file
// Correggi le importazioni per utilizzare i percorsi corretti
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/contexts/theme-context"
import Navbar from "@/components/navbar"
import AdminPanel from "@/components/admin-panel"
import ParticlesBackground from "@/components/particles-background"
import ImageGenerator from "@/components/image-generator"
import SocketDebug from "@/components/socket-debug"

export default function Home() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <main className="min-h-screen bg-gray-50 dark:bg-[#010817] text-gray-900 dark:text-white flex flex-col relative">
          <ParticlesBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 p-4 md:p-8">
              <div className="max-w-4xl mx-auto">
                <ImageGenerator />
              </div>
            </div>
          </div>
          <AdminPanel />
          {process.env.NODE_ENV !== "production" && <SocketDebug />}
        </main>
      </ThemeProvider>
    </LanguageProvider>
  )
}