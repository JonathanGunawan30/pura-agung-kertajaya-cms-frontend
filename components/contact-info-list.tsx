"use client"

import { useState, useEffect } from "react"
import type { ContactInfo } from "@/lib/types"
import { contactInfoApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus, MapPin, Phone, Mail, Clock } from "lucide-react"
import { ContactInfoForm } from "./contact-info-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"

export function ContactInfoList() {
  const [items, setItems] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await contactInfoApi.getAll()
      setItems(data || [])
    } catch (error) {
      console.error("Failed to fetch contact info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleDelete = async (id: string) => {
    const result = await showConfirmAlert(
      "Delete Contact Info",
      "Are you sure you want to delete this contact info?"
    )

    if (!result.isConfirmed) return

    try {
      await contactInfoApi.delete(id)
      setItems(items.filter((i) => i.id !== id))
      await showSuccessAlert("Success", "Contact info deleted successfully")
    } catch (error) {
      console.error("Failed to delete contact info:", error)
      const errorMsg = error instanceof Error ? error.message : "Failed to delete info"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchItems()
  }

  if (showForm || editingId) {
    return <ContactInfoForm itemId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
        {items.length === 0 && !loading && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No contact information yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-border/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {" "}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-foreground">{item.address}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-foreground">{item.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-foreground">{item.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Hours</p>
                          <p className="text-foreground text-sm">{item.visiting_hours}</p>
                        </div>
                      </div>
                    </div>
                    {item.map_embed_url && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-1">Map Preview</p>
                        <div className="w-full h-64 rounded-lg overflow-hidden border border-border/50">
                          <iframe
                            src={item.map_embed_url}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>
                      </div>
                    )}
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

