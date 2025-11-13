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

    const [page, setPage] = useState(1)
    const limit = 6

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
            setFacilities((prev) => prev.filter((f) => f.id !== id))
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

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    if (facilities.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-foreground">Facilities</h2>

                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Facility
                    </Button>
                </div>

                <Card className="border-border/50">
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No facilities yet. Create one to get started!</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const startIdx = (page - 1) * limit
    const paginated = facilities.slice(startIdx, startIdx + limit)
    const totalPages = Math.ceil(facilities.length / limit)

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Facilities</h2>

                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Facility
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginated.map((facility) => (
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

            <div className="flex justify-center gap-3 pt-4">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Previous
                </Button>

                <span className="px-3 py-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </Button>
            </div>

        </div>
    )
}
