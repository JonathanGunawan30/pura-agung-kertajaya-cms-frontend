"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { organizationMembersApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"
import { validateRequired, validateNumber, validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

interface OrganizationMemberFormProps {
  memberId?: string
  onClose: () => void
}

interface OrganizationMember {
  id: string
  name: string
  position: string
  position_order: number
  order_index: number
  photo_url: string | null
  description: string | null
  is_active: boolean
}

export function OrganizationMemberForm({ memberId, onClose }: OrganizationMemberFormProps) {
  const [formData, setFormData] = useState<OrganizationMember>({
    id: "",
    name: "",
    position: "",
    position_order: 1,
    order_index: 1,
    photo_url: "",
    description: "",
    is_active: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [oldPhotoUrl, setOldPhotoUrl] = useState("")

  useEffect(() => {
    if (memberId) {
      const fetchMember = async () => {
        try {
          const data: OrganizationMember = await organizationMembersApi.getById(memberId)
          setFormData(data)
          setPreviewUrl(data.photo_url ?? "")
          setOldPhotoUrl(data.photo_url ?? "")

        } catch (err) {
          setError("Failed to load member")
        }
      }
      fetchMember()
    }
  }, [memberId])

  const validateForm = (): boolean => {
    const nameError = validateRequired(formData.name, "Name")
    if (nameError) {
      setError(nameError.message)
      return false
    }

    const positionError = validateRequired(formData.position, "Position")
    if (positionError) {
      setError(positionError.message)
      return false
    }

    const positionOrderError = validateNumber(formData.position_order, "Position Order", 1)
    if (positionOrderError) {
      setError(positionOrderError.message)
      return false
    }

    return true
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileError = validateFile(file, "Photo", 2)
    if (fileError) {
      setError(fileError.message)
      return
    }

    setUploadingImage(true)
    setError("")

    try {
      const result = await storageApi.upload(file)

      if (memberId && oldPhotoUrl && oldPhotoUrl !== result.url) {
        const key = oldPhotoUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      setFormData({ ...formData, photo_url: result.url })
      setPreviewUrl(result.url)
      setOldPhotoUrl(result.url)

      await showSuccessAlert("Success", "Image uploaded successfully")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload image"
      setError(errorMsg)
      await showErrorAlert("Upload Failed", errorMsg)
    } finally {
      setUploadingImage(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setLoading(true)

    try {
      if (memberId) {
        await organizationMembersApi.update(memberId, formData)
        await showSuccessAlert("Success", "Organization member updated successfully")
      } else {
        await organizationMembersApi.create(formData)
        await showSuccessAlert("Success", "Organization member created successfully")
      }
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save member"
      setError(errorMsg)
      await showErrorAlert("Error", errorMsg)
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
          <CardTitle>{memberId ? "Edit Organization Member" : "Add Organization Member"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Member Photo (Max 2MB)</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {uploadingImage ? "Uploading..." : "Click to upload photo"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage || loading}
                      className="hidden"
                    />
                  </label>
                </div>
                {previewUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Position *</label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Chairman"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Position Order</label>
                <Input
                  type="number"
                  value={formData.position_order}
                  onChange={(e) => setFormData({ ...formData, position_order: Number.parseInt(e.target.value) })}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={formData.description ?? ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write a description..."
                className="w-full p-3 rounded-lg bg-input border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                rows={3}
              />
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
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? "Saving..." : "Save Member"}
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
