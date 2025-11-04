"use client"

import { useState, useEffect } from "react"
import type { Gallery } from "@/lib/types"
import { galleryApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus, Image } from "lucide-react"
import { GalleryForm } from "./gallery-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"

export function GalleryList() {
  const [items, setItems] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await galleryApi.getAll()
      setItems(data || [])
    } catch (error) {
      console.error("Failed to fetch gallery items:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleDelete = async (id: string, imageUrl: string) => {
    const result = await showConfirmAlert("Delete Gallery Item", "Are you sure you want to delete this item?")

    if (!result.isConfirmed) return

    try {
      if (imageUrl) {
        const key = imageUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      await galleryApi.delete(id)
      setItems(items.filter((i) => i.id !== id))
      await showSuccessAlert("Success", "Gallery item deleted successfully")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete item"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchItems()
  }

  if (showForm || editingId) {
    return <GalleryForm itemId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Gallery</h2>
        <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No gallery items yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="border-border/50 flex flex-col h-full">
              <CardContent className="p-6 flex-1 flex flex-col">
                {item.image_url ? (
                  <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 mb-4 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Image className="w-10 h-10" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Order: {item.order_index}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        item.is_active ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(item.id)}
                      className="border-border/50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.image_url)}
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
