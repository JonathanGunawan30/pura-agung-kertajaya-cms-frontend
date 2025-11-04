"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { siteIdentityApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"
import { validateRequired, validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

interface SiteIdentityFormProps {
  itemId?: string
  onClose: () => void
}

interface SiteIdentity {
  id: string
  site_name: string
  logo_url: string
  tagline: string
  primary_button_text: string
  primary_button_link: string
  secondary_button_text: string
  secondary_button_link: string
}

export function SiteIdentityForm({ itemId, onClose }: SiteIdentityFormProps) {
  const [formData, setFormData] = useState({
    site_name: "",
    logo_url: "",
    tagline: "",
    primary_button_text: "",
    primary_button_link: "",
    secondary_button_text: "",
    secondary_button_link: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [oldLogoUrl, setOldLogoUrl] = useState("")

  useEffect(() => {
    if (itemId) {
      const fetchItem = async () => {
        try {
          const data: SiteIdentity = await siteIdentityApi.getById(itemId)
          setFormData(data)
          setPreviewUrl(data.logo_url)
          setOldLogoUrl(data.logo_url)
        } catch (err) {
          setError("Failed to load site identity")
        }
      }
      fetchItem()
    }
  }, [itemId])

  const validateForm = (): boolean => {
    const siteNameError = validateRequired(formData.site_name, "Site Name")
    if (siteNameError) {
      setError(siteNameError.message)
      return false
    }

    if (!itemId && !formData.logo_url) {
      setError("Logo is required for new site identity")
      return false
    }

    const primaryButtonError = validateRequired(formData.primary_button_text, "Primary Button Text")
    if (primaryButtonError) {
      setError(primaryButtonError.message)
      return false
    }

    const primaryLinkError = validateRequired(formData.primary_button_link, "Primary Button Link")
    if (primaryLinkError) {
      setError(primaryLinkError.message)
      return false
    }

    return true
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileError = validateFile(file, "Logo", 2)
    if (fileError) {
      setError(fileError.message)
      return
    }

    setUploadingImage(true)
    setError("")

    try {
      const result = await storageApi.upload(file)

      if (itemId && oldLogoUrl && oldLogoUrl !== result.url) {
        const key = oldLogoUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      setFormData({ ...formData, logo_url: result.url })
      setPreviewUrl(result.url)
      setOldLogoUrl(result.url)

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
      if (itemId) {
        await siteIdentityApi.update(itemId, formData)
        await showSuccessAlert("Success", "Site identity updated successfully")
      } else {
        await siteIdentityApi.create(formData)
        await showSuccessAlert("Success", "Site identity created successfully")
      }
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save site identity"
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
          <CardTitle>{itemId ? "Edit Site Identity" : "Add Site Identity"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Logo (Max 2MB) *</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {uploadingImage ? "Uploading..." : "Click to upload logo"}
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
                <label className="text-sm font-medium text-foreground">Site Name *</label>
                <Input
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  placeholder="Pura Agung Kertajaya"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tagline</label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Your tagline here"
                  className="bg-input border-border/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Primary Button Text *</label>
                <Input
                  value={formData.primary_button_text}
                  onChange={(e) => setFormData({ ...formData, primary_button_text: e.target.value })}
                  placeholder="Gallery"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Primary Button Link *</label>
                <Input
                  value={formData.primary_button_link}
                  onChange={(e) => setFormData({ ...formData, primary_button_link: e.target.value })}
                  placeholder="/gallery"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Secondary Button Text</label>
                <Input
                  value={formData.secondary_button_text}
                  onChange={(e) => setFormData({ ...formData, secondary_button_text: e.target.value })}
                  placeholder="Learn More"
                  className="bg-input border-border/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Secondary Button Link</label>
                <Input
                  value={formData.secondary_button_link}
                  onChange={(e) => setFormData({ ...formData, secondary_button_link: e.target.value })}
                  placeholder="/about"
                  className="bg-input border-border/50"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? "Saving..." : "Save Identity"}
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
