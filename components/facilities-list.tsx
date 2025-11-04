"use client"

import { useState, useEffect } from "react"
import type { Facility } from "@/lib/types"
import { facilitiesApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus, Image } from "lucide-react"
import { FacilityForm } from "./facilities-form"
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

export function FacilitiesList() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const data = await facilitiesApi.getAll()
      setFacilities(data || [])
    } catch (error) {
      console.error("Failed to fetch facilities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilities()
  }, [])

  const handleDelete = async (id: string, imageUrl: string) => {
    const result = await showConfirmAlert(
      "Delete Facility",
      "Are you sure you want to delete this facility?"
    )

    if (!result.isConfirmed) return

    try {
      if (imageUrl) {
        const key = imageUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      await facilitiesApi.delete(id)
      setFacilities(facilities.filter((f) => f.id !== id))
      await showSuccessAlert("Deleted!", "Facility has been deleted successfully.")
    } catch (error) {
      console.error("Failed to delete facility:", error)
      const errorMsg = error instanceof Error ? error.message : "Failed to delete facility"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchFacilities()
  }

  if (showForm || editingId) {
    return <FacilityForm facilityId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Facilities</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Facility
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : facilities.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No facilities yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <Card key={facility.id} className="border-border/50 flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                {facility.image_url ? (
                  <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={facility.image_url}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 mb-4 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Image className="w-10 h-10" />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{facility.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{facility.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      Order: {facility.order_index}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        facility.is_active
                          ? "bg-green-500/20 text-green-700"
                          : "bg-gray-500/20 text-gray-700"
                      }`}
                    >
                      {facility.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(facility.id)}
                      className="border-border/50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(facility.id, facility.image_url)}
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