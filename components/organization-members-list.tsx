"use client"

import { useState, useEffect } from "react"
import type { OrganizationMember } from "@/lib/types"
import { organizationMembersApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus, User } from "lucide-react"
import { OrganizationMemberForm } from "./organization-member-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"

export function OrganizationMembersList() {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await organizationMembersApi.getAll()
      setMembers(data || [])
    } catch (error) {
      console.error("Failed to fetch organization members:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleDelete = async (id: string, photoUrl: string | null) => {
    const result = await showConfirmAlert("Delete Member", "Are you sure you want to delete this member?")

    if (!result.isConfirmed) return

    try {
      if (photoUrl) {
        const key = photoUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      await organizationMembersApi.delete(id)
      setMembers(members.filter((m) => m.id !== id))
      await showSuccessAlert("Success", "Organization member deleted successfully")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete member"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchMembers()
  }

  if (showForm || editingId) {
    return <OrganizationMemberForm memberId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Organization Members</h2>
        <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : members.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No organization members yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id} className="border-border/50 flex flex-col h-full">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-center mb-4">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-accent">{member.position}</p>
                  {member.description && (
                    <p className="text-sm text-muted-foreground mt-3 italic">"{member.description}"</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Order: {member.order_index}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        member.is_active ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"
                      }`}
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(member.id)}
                      className="border-border/50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id, member.photo_url)}
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
