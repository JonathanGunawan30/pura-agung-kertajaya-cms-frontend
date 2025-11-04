"use client"

import { useState, useEffect } from "react"
import type { SiteIdentity } from "@/lib/types"
import { siteIdentityApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus } from "lucide-react"
import { SiteIdentityForm } from "./site-identity-form"

export function SiteIdentityList() {
  const [items, setItems] = useState<SiteIdentity[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await siteIdentityApi.getAll()
      setItems(data || [])
    } catch (error) {
      console.error("Failed to fetch site identity:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus identitas situs ini?")) return

    try {
      await siteIdentityApi.delete(id)
      setItems(items.filter((i) => i.id !== id))
    } catch (error) {
      console.error("Failed to delete site identity:", error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchItems()
  }

  if (showForm || editingId) {
    return <SiteIdentityForm itemId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Site Identity</h2>
        <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="w-4 h-4" />
          Add Identity
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No site identity configured yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-border/50 hover:border-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {item.logo_url && (
                        <img
                          src={item.logo_url || "/placeholder.svg"}
                          alt={item.site_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground">{item.site_name}</h3>
                        <p className="text-sm text-muted-foreground">{item.tagline}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Primary Button: </span>
                        <span className="text-foreground">{item.primary_button_text}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Secondary Button: </span>
                        <span className="text-foreground">{item.secondary_button_text}</span>
                      </div>
                    </div>
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
                      onClick={() => handleDelete(item.id)}
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
