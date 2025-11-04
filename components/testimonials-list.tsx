"use client"

import { useState, useEffect } from "react"
import type { Testimonial } from "@/lib/types"
import { testimonialsApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus, User } from "lucide-react"
import { TestimonialForm } from "./testimonial-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"

export function TestimonialsList() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const data = await testimonialsApi.getAll()
      setTestimonials(data || [])
    } catch (error) {
      console.error("Failed to fetch testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleDelete = async (id: string, avatarUrl: string) => {
    const result = await showConfirmAlert("Delete Testimonial", "Are you sure you want to delete this testimonial?")

    if (!result.isConfirmed) return

    try {
      if (avatarUrl) {
        const key = avatarUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      await testimonialsApi.delete(id)
      setTestimonials(testimonials.filter((t) => t.id !== id))
      await showSuccessAlert("Success", "Testimonial deleted successfully")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete testimonial"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchTestimonials()
  }

  if (showForm || editingId) {
    return <TestimonialForm testimonialId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Testimonials</h2>
        <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="w-4 h-4" />
          Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No testimonials yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-border/50 flex flex-col h-full">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-center mb-4">
                  {testimonial.avatar_url ? (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                  <div className="flex justify-center items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium text-foreground">{testimonial.rating}/5</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 italic">"{testimonial.comment}"</p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Order: {testimonial.order_index}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        testimonial.is_active ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"
                      }`}
                    >
                      {testimonial.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(testimonial.id)}
                      className="border-border/50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id, testimonial.avatar_url)}
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
