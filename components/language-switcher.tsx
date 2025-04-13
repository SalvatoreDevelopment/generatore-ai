"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { translations } from "@/lib/translations"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "it" : "en")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-[#0a0f1f]/50 border border-gray-800"
    >
      <Globe className="h-4 w-4 mr-2" />
      {translations[language === "en" ? "it" : "en"].languageName}
    </Button>
  )
}
