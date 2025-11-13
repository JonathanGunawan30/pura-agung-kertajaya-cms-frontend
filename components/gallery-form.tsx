"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { galleryApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"
import { validateRequired, validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import {Textarea} from "@/components/ui/textarea";

interface GalleryFormProps {
    itemId?: string
    onClose: () => void
}

interface Gallery {
    id: string
    title: string
    description: string
    image_url: string
    order_index: number
    is_active: boolean
}

export function GalleryForm({ itemId, onClose }: GalleryFormProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image_url: "",
        order_index: 1,
        is_active: true,
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [oldImageUrl, setOldImageUrl] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!itemId

    useEffect(() => {
        if (isEditMode) {
            const fetchItem = async () => {
                try {
                    const data: Gallery = await galleryApi.getById(itemId)
                    setFormData({
                        title: data.title,
                        description: data.description,
                        image_url: data.image_url,
                        order_index: data.order_index,
                        is_active: data.is_active,
                    })
                    setOldImageUrl(data.image_url)
                    setPreviewUrl(data.image_url)
                } catch (err) {
                    setError("Failed to load gallery item")
                }
            }
            fetchItem()
        }
    }, [itemId, isEditMode])

    const validateForm = (): boolean => {
        const titleError = validateRequired(formData.title, "Title")
        if (titleError) {
            setError(titleError.message)
            return false
        }

        if (!isEditMode && !selectedFile) {
            setError("Image is required for new items")
            return false
        }

        return true
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const fileError = validateFile(file, "Image", 2)
        if (fileError) {
            setError(fileError.message)
            return
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!validateForm()) return

        setLoading(true)

        try {
            let uploadedUrl = formData.image_url

            if (selectedFile) {
                const uploadResult = await storageApi.upload(selectedFile)
                uploadedUrl = uploadResult.url

                if (isEditMode && oldImageUrl && oldImageUrl !== uploadedUrl) {
                    const key = oldImageUrl.split("/").pop()
                    if (key) await storageApi.delete(`uploads/${key}`)
                }
            }

            const payload = {
                ...formData,
                image_url: uploadedUrl,
            }

            if (isEditMode) {
                await galleryApi.update(itemId!, payload)
                await showSuccessAlert("Success", "Gallery item updated successfully")
            } else {
                await galleryApi.create(payload)
                await showSuccessAlert("Success", "Gallery item created successfully")
            }

            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save item"
            setError(message)
            await showErrorAlert("Error", message)
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
                    <CardTitle>{isEditMode ? "Edit Gallery Item" : "Add New Gallery Item"}</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Gallery Image *</label>

                            <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                <div className="flex flex-col items-center">
                                    <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Click to choose image (Max 2MB)
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    disabled={loading}
                                    className="hidden"
                                />
                            </label>

                            {previewUrl && (
                                <div className="mt-4 rounded-lg overflow-hidden h-48 bg-muted">
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Title *</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Order Index</label>
                            <Input
                                type="number"
                                value={formData.order_index}
                                min={1}
                                onChange={(e) =>
                                    setFormData({ ...formData, order_index: Number(e.target.value) || 1 })
                                }
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded border-border/50"
                            />
                            <label className="text-sm font-medium text-foreground">Active</label>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
                                {loading ? "Saving..." : "Save Item"}
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
