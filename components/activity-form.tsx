"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { activitiesApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface ActivityFormProps {
  activityId?: string
  onClose: () => void
}

export function ActivityForm({ activityId, onClose }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time_info: "",
    location: "",
    order_index: 1,
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (activityId) {
      const fetchActivity = async () => {
        try {
          const data = await activitiesApi.getById(activityId)
          setFormData(data)
        } catch (err) {
          setError("Failed to load activity")
        }
      }
      fetchActivity()
    }
  }, [activityId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (activityId) {
        await activitiesApi.update(activityId, formData)
      } else {
        await activitiesApi.create(formData)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onClose} className="border-border/50 gap-2 bg-transparent">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{activityId ? "Edit Activity" : "Add New Activity"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Activity Title"
                className="bg-input border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write a description..."
                className="w-full p-3 rounded-lg bg-input border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Time Info</label>
                <Input
                  value={formData.time_info}
                  onChange={(e) => setFormData({ ...formData, time_info: e.target.value })}
                  placeholder="e.g., Every Monday"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Hall"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Order Index</label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) })}
                  className="bg-input border-border/50"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-border/50"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                Active
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {loading ? "Saving..." : "Save Activity"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="border-border/50 bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
