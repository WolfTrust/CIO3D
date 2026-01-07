"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useTravelStore } from "@/lib/travel-store"
import { Camera, X, Plus, ImageIcon, Trash2, ZoomIn } from "lucide-react"

interface PhotoGalleryProps {
  countryId: string
}

export function PhotoGallery({ countryId }: PhotoGalleryProps) {
  const tripData = useTravelStore((state) => state.tripData)
  const updateTripData = useTravelStore((state) => state.updateTripData)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const photos = tripData[countryId]?.photos || []

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        const currentPhotos = tripData[countryId]?.photos || []
        updateTripData(countryId, {
          photos: [...currentPhotos, base64],
        })
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const deletePhoto = (index: number) => {
    const currentPhotos = tripData[countryId]?.photos || []
    updateTripData(countryId, {
      photos: currentPhotos.filter((_, i) => i !== index),
    })
    setSelectedPhoto(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-pink-500" />
          <span className="font-medium text-sm">Fotos</span>
          <span className="text-xs text-muted-foreground">({photos.length})</span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Hinzufügen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer group"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo || "/placeholder.svg"} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 bg-secondary/30 rounded-xl">
          <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Noch keine Fotos</p>
        </div>
      )}

      {/* Fullscreen Photo Viewer */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const index = photos.indexOf(selectedPhoto)
              if (index !== -1) deletePhoto(index)
            }}
            className="absolute top-4 left-4 p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
          <img
            src={selectedPhoto || "/placeholder.svg"}
            alt="Vollbild"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}
