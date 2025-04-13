"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageGalleryProps {
  images: string[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Se non ci sono immagini, non mostrare nulla
  if (images.length === 0) {
    return null
  }

  // Prendi solo l'immagine più recente (la prima nell'array)
  const latestImage = images[0]

  const handleDownload = (imageUrl: string) => {
    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `ai-generated-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">
        <span className="text-gray-900 dark:text-white">{t("generatedImages").split(" ")[0]} </span>
        <span className="text-[#9333EA]">{t("generatedImages").split(" ")[1]}</span>
      </h2>

      <div className="max-w-lg mx-auto">
        <div className="relative group overflow-hidden rounded-md bg-white/80 dark:bg-[#0a0f1f]/80 border border-gray-300 dark:border-gray-800 transition-all duration-300 hover:border-[#9333EA]">
          <div className="aspect-square relative cursor-pointer" onClick={() => setSelectedImage(latestImage)}>
            <Image
              src={latestImage || "/placeholder.svg"}
              alt={t("image")}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownload(latestImage)
              }}
              className="p-3 text-white hover:text-[#9333EA] transition-colors"
              aria-label={t("downloadImage")}
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => handleDownload(latestImage)} className="bg-[#9333EA] hover:bg-[#7928CA]">
            <Download className="h-4 w-4 mr-2" />
            {t("downloadImage")}
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#010817] border-gray-300 dark:border-gray-800">
          {selectedImage && (
            <div className="relative w-full">
              <div className="relative aspect-square">
                <Image src={selectedImage || "/placeholder.svg"} alt={t("image")} fill className="object-contain" />
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => handleDownload(selectedImage)} className="bg-[#9333EA] hover:bg-[#7928CA]">
                  <Download className="h-4 w-4 mr-2" />
                  {t("downloadImage")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
