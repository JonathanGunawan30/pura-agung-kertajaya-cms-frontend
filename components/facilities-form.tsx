"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { facilitiesApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"
import { validateFile } from "@/lib/validation" 
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import type { Facility } from "@/lib/types" 

interface FacilityFormProps {
  facilityId?: string
  onClose: () => void
}

type FacilityFormData = {
  name: string
  description: string
  image_url: string
  order_index: number
  is_active: boolean
}

export function FacilityForm({ facilityId, onClose }: FacilityFormProps) {
  const [formData, setFormData] = useState<FacilityFormData>({
    name: "",
    description: "",
    image_url: "",
    order_index: 1,
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [oldImageUrl, setOldImageUrl] = useState("");

  const isEditMode = !!facilityId

  useEffect(() => {
    if (isEditMode) {
      const fetchFacility = async () => {
        try {
          const data: Facility = await facilitiesApi.getById(facilityId)
          setFormData({
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            order_index: data.order_index,
            is_active: data.is_active,
          })
          setOldImageUrl(data.image_url)
        } catch (err) {
          setError("Failed to load facility data")
        }
      }
      fetchFacility()
    }
  }, [facilityId, isEditMode])

  const validateForm = (): boolean => {
    setError("")
    if (!formData.name.trim()) {
      setError("Facility Name is required")
      return false
    }
    if (!formData.image_url) {
      setError("Image is required for new facilities")
      return false
    }
    return true
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file, "Image", 2);
    if (fileError) {
      setError(fileError.message);
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const result = await storageApi.upload(file);

      if (isEditMode && oldImageUrl && oldImageUrl !== result.url) {
        const key = oldImageUrl.split("/").pop();
        if (key) {
          await storageApi.delete(`uploads/${key}`);
        }
      }

      setFormData({ ...formData, image_url: result.url });
      setOldImageUrl(result.url);

      await showSuccessAlert("Success", "Image uploaded successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMsg);
      await showErrorAlert("Upload Failed", errorMsg);
    } finally {
      setUploadingImage(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      if (isEditMode) {
        await facilitiesApi.update(facilityId, formData)
        await showSuccessAlert("Success", "Facility updated successfully")
      } else {
        await facilitiesApi.create(formData)
        await showSuccessAlert("Success", "Facility created successfully")
      }
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save facility"
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
          <CardTitle>{isEditMode ? "Edit Facility" : "Add New Facility"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Facility Image (Max 2MB) *</label>
              <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {uploadingImage ? "Uploading..." : "Click to upload image"}
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
              {formData.image_url && (
                <div className="mt-4 rounded-lg overflow-hidden h-48 bg-muted">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Facility Name *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border/50"
                placeholder="e.g., Bale Kulkul"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-input border-border/50"
                placeholder="A brief description of the facility"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Order Index</label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) =>
                    setFormData({ ...formData, order_index: Number.parseInt(e.target.value) || 1 })
                  }
                  className="bg-input border-border/50"
                  min="1"
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
                className="rounded border-border/50 w-4 h-4"
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
                {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Facility"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border/50 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
