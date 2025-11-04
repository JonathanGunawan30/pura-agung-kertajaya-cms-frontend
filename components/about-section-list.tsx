"use client"

import { useState, useEffect } from "react"
import type { AboutSection } from "@/lib/types"
import { aboutApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus, Image as ImageIcon } from "lucide-react"
import { AboutSectionForm } from "./about-section-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"

export function AboutSectionList() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchSections = async () => {
    try {
      setLoading(true)
      const data = await aboutApi.getAll()
      setSections(data || [])
    } catch (error) {
      console.error("Failed to fetch about sections:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const handleDelete = async (id: string, imageUrl: string) => {
    const result = await showConfirmAlert(
      "Delete About Section",
      "Are you sure you want to delete this section?"
    )

    if (!result.isConfirmed) return

    try {
      if (imageUrl) {
        const key = imageUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      await aboutApi.delete(id)
      setSections(sections.filter((s) => s.id !== id))
      await showSuccessAlert("Success", "About section deleted successfully")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete section"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchSections()
  }

  if (showForm || editingId) {
    return <AboutSectionForm sectionId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">About Sections</h2>
        {sections.length === 0 && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : sections.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No 'About' section found. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sections.map((section) => (
            <Card key={section.id} className="border-border/50 flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                {section.image_url ? (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={section.image_url}
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 mb-4 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-xl mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>

                  <h4 className="font-semibold text-foreground mb-2">Values</h4>
                  <div className="space-y-2">
                    {section.values.map((val) => (
                      <div key={val.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <p className="font-medium text-foreground">{val.title}</p>
                        <p className="text-sm text-muted-foreground">{val.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      section.is_active
                        ? "bg-green-500/20 text-green-700"
                        : "bg-gray-500/20 text-gray-700"
                    }`}
                  >
                    {section.is_active ? "Active" : "Inactive"}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(section.id)}
                      className="border-border/50"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(section.id, section.image_url)}
                      className="border-border/50 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
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
