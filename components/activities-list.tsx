"use client"

import { useState, useEffect } from "react"
import type { Activity } from "@/lib/types"
import { activitiesApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus } from "lucide-react"
import { ActivityForm } from "./activity-form"
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const data = await activitiesApi.getAll()
      setActivities(data || [])
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleDelete = async (id: string) => {
    const result = await showConfirmAlert(
      "Delete Activity",
      "Are you sure you want to delete this activity?"
    )

    if (!result.isConfirmed) return

    try {
      await activitiesApi.delete(id)
      setActivities(activities.filter((a) => a.id !== id))
      await showSuccessAlert("Deleted!", "Activity has been deleted successfully.")
    } catch (error) {
      console.error("Failed to delete activity:", error)
      const errorMsg = error instanceof Error ? error.message : "Failed to delete activity"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchActivities()
  }

  if (showForm || editingId) {
    return <ActivityForm activityId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Activities</h2>
        <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="w-4 h-4" />
          Add Activity
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : activities.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No activities yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Card key={activity.id} className="border-border/50 flex flex-col h-full">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      <span className="text-foreground">{activity.time_info}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location: </span>
                      <span className="text-foreground">{activity.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Order: {activity.order_index}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        activity.is_active ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"
                      }`}
                    >
                      {activity.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(activity.id)}
                      className="border-border/50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(activity.id)} 
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
