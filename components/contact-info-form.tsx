"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { contactInfoApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface ContactInfoFormProps {
  itemId?: string
  onClose: () => void
}

export function ContactInfoForm({ itemId, onClose }: ContactInfoFormProps) {
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    email: "",
    visiting_hours: "",
    map_embed_url: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (itemId) {
      const fetchItem = async () => {
        try {
          const data = await contactInfoApi.getById(itemId)
          setFormData(data)
        } catch (err) {
          setError("Failed to load contact info")
        }
      }
      fetchItem()
    }
  }, [itemId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (itemId) {
        await contactInfoApi.update(itemId, formData)
      } else {
        await contactInfoApi.create(formData)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact info")
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
          <CardTitle>{itemId ? "Edit Contact Info" : "Add Contact Info"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jalan Pura No. 123"
                className="bg-input border-border/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62 123 456 789"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@pura.com"
                  className="bg-input border-border/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Visiting Hours</label>
              <Input
                value={formData.visiting_hours}
                onChange={(e) => setFormData({ ...formData, visiting_hours: e.target.value })}
                placeholder="Monday - Friday: 08:00 - 17:00"
                className="bg-input border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Map Embed URL</label>
              <Input
                value={formData.map_embed_url}
                onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="bg-input border-border/50"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {loading ? "Saving..." : "Save Contact Info"}
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
