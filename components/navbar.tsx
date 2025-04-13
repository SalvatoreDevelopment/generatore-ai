"use client"

import Link from "next/link"
import { Globe, Sun, Moon } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "@/contexts/theme-context"

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "it" : "en")
  }

  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between border-b border-gray-800/50 dark:border-gray-800/50 border-gray-300/50">
      <Link
        href="http://salvatoreguerra.it/"
        className="text-[#9333EA] text-xl font-semibold hover:text-[#a855f7] transition-colors"
      >
        Salvatore Guerra
      </Link>

      <div className="flex items-center space-x-6">
        <Link
          href="http://salvatoreguerra.it/"
          className="text-gray-700 dark:text-gray-300 hover:text-[#9333EA] dark:hover:text-white transition-colors"
        >
          {t("home")}
        </Link>

        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-[#9333EA] dark:hover:text-white transition-colors"
          aria-label={language === "en" ? "Switch to Italian" : "Switch to English"}
        >
          <Globe className="h-4 w-4" />
        </button>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-[#9333EA] dark:hover:text-white transition-colors"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </nav>
  )
}
