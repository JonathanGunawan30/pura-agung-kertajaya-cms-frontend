"use client"

import { useState, useEffect } from "react"
import type { HeroSlide } from "@/lib/types"
import { heroSlidesApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus, Image } from "lucide-react"
import { HeroSlideForm } from "./hero-slide-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"

export function HeroSlidesList() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchSlides = async () => {
    try {
      setLoading(true)
      const data = await heroSlidesApi.getAll()
      setSlides(data || [])
    } catch (error) {
      console.error("Failed to fetch hero slides:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const handleDelete = async (id: string, imageUrl: string) => {
    const result = await showConfirmAlert("Delete Hero Slide", "Are you sure you want to delete this slide?")

    if (!result.isConfirmed) return

    try {
      if (imageUrl) {
        const key = imageUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      await heroSlidesApi.delete(id)
      setSlides(slides.filter((s) => s.id !== id))
      await showSuccessAlert("Success", "Hero slide deleted successfully")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete slide"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchSlides()
  }

  if (showForm || editingId) {
    return <HeroSlideForm slideId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Hero Slides</h2>
        <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="w-4 h-4" />
          Add Slide
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : slides.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No hero slides yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <Card key={slide.id} className="border-border/50 flex flex-col h-full">
              <CardContent className="p-6 flex-1 flex flex-col">
                {slide.image_url ? (
                  <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={slide.image_url}
                      alt="Hero slide"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 mb-4 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Image className="w-10 h-10" />
                  </div>
                )}
                <div className="flex-1"></div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Order: {slide.order_index}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        slide.is_active ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"
                      }`}
                    >
                      {slide.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(slide.id)}
                      className="border-border/50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(slide.id, slide.image_url)}
                      className="border-border/50 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
