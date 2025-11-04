"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { aboutApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Upload, Trash2, Plus } from "lucide-react"
import { validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import type { AboutValue } from "@/lib/types"

type AboutValueFormData = Omit<AboutValue, "id" | "about_id" | "created_at" | "updated_at">

interface AboutSectionFormData {
  title: string
  description: string
  image_url: string
  is_active: boolean
  values: AboutValueFormData[]
}

interface AboutSectionFormProps {
  sectionId?: string
  onClose: () => void
}

export function AboutSectionForm({ sectionId, onClose }: AboutSectionFormProps) {
  const [formData, setFormData] = useState<AboutSectionFormData>({
    title: "",
    description: "",
    image_url: "",
    is_active: true,
    values: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [oldImageUrl, setOldImageUrl] = useState("")

  const isEditMode = !!sectionId

  useEffect(() => {
    if (isEditMode) {
      setLoading(true)
      aboutApi
        .getById(sectionId)
        .then((data) => {
          setFormData({
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            is_active: data.is_active,
            values: data.values.map((v) => ({
              title: v.title,
              value: v.value,
              order_index: v.order_index,
            })),
          })
          setOldImageUrl(data.image_url)
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [sectionId, isEditMode])

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

      setFormData(prev => ({ ...prev, image_url: result.url }));
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


  const handleValueChange = (
    index: number,
    field: "title" | "value" | "order_index",
    value: string | number
  ) => {
    const newValues = [...formData.values]
    newValues[index] = { ...newValues[index], [field]: value }
    setFormData((prev) => ({ ...prev, values: newValues }))
  }

  const handleAddValue = () => {
    setFormData((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        { title: "", value: "", order_index: prev.values.length + 1 },
      ],
    }))
  }

  const handleRemoveValue = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isEditMode) {
        await aboutApi.update(sectionId, formData)
        await showSuccessAlert("Success", "About section updated successfully")
      } else {
        await aboutApi.create(formData)
        await showSuccessAlert("Success", "About section created successfully")
      }

      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save section"
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

      <form onSubmit={handleSubmit}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit About Section" : "Add New About Section"}</CardTitle>
            <CardDescription>
              This section includes the main description and dynamic 'values' like Visi and Misi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Sejarah Pura"
                required
                disabled={loading}
                className="bg-input border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description about this section..."
                required
                disabled={loading}
                className="bg-input border-border/50"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Image (Max 2MB)</Label>
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
              {(formData.image_url || oldImageUrl) && (
                <div className="mt-4 rounded-lg overflow-hidden h-48 bg-muted">
                  <img
                    src={formData.image_url || oldImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                disabled={loading}
              />
              <Label htmlFor="is_active" className="text-sm font-medium text-foreground">
                Active
              </Label>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Values</CardTitle>
                <CardDescription>Add key values related to this section.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleAddValue} disabled={loading} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Value
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.values.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No values added yet. Click 'Add Value' to start.
              </p>
            )}
            {formData.values.map((value, index) => (
              <div
                key={index}
                className="p-4 border border-border/50 rounded-lg space-y-3 bg-muted/30"
              >
                <div className="flex justify-between items-center">
                  <Label className="text-base">Value #{index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveValue(index)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`value_title_${index}`}>Title</Label>
                  <Input
                    id={`value_title_${index}`}
                    value={value.title}
                    onChange={(e) => handleValueChange(index, "title", e.target.value)}
                    placeholder="e.g., Nilai Utama"
                    required
                    disabled={loading}
                    className="bg-input border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`value_value_${index}`}>Value</Label>
                  <Textarea
                    id={`value_value_${index}`}
                    value={value.value}
                    onChange={(e) => handleValueChange(index, "value", e.target.value)}
                    placeholder="e.g., Menjadi pusat spiritual..."
                    required
                    disabled={loading}
                    className="bg-input border-border/50"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`value_order_${index}`}>Order</Label>
                  <Input
                    id={`value_order_${index}`}
                    type="number"
                    value={value.order_index}
                    onChange={(e) =>
                      handleValueChange(index, "order_index", Number.parseInt(e.target.value) || 0)
                    }
                    min="1"
                    required
                    disabled={loading}
                    className="bg-input border-border/50"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploadingImage}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Section"}
          </Button>
        </div>
      </form>
    </div>
  )
}
