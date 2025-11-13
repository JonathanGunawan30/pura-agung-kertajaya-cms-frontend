"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { testimonialsApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"
import { validateRequired, validateNumber, validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import {Textarea} from "@/components/ui/textarea";

interface TestimonialFormProps {
    testimonialId?: string
    onClose: () => void
}

interface Testimonial {
    id: string
    name: string
    avatar_url: string
    rating: number
    comment: string
    is_active: boolean
    order_index: number
}

export function TestimonialForm({ testimonialId, onClose }: TestimonialFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        avatar_url: "",
        rating: 5,
        comment: "",
        is_active: true,
        order_index: 1,
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [oldAvatarUrl, setOldAvatarUrl] = useState<string>("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!testimonialId

    useEffect(() => {
        if (isEditMode) {
            const fetchTestimonial = async () => {
                try {
                    const data: Testimonial = await testimonialsApi.getById(testimonialId)
                    setFormData({
                        name: data.name,
                        avatar_url: data.avatar_url,
                        rating: data.rating,
                        comment: data.comment,
                        is_active: data.is_active,
                        order_index: data.order_index,
                    })

                    setPreviewUrl(data.avatar_url)
                    setOldAvatarUrl(data.avatar_url)
                } catch (err) {
                    setError("Failed to load testimonial")
                }
            }

            fetchTestimonial()
        }
    }, [testimonialId, isEditMode])

    const validateForm = (): boolean => {
        const nameError = validateRequired(formData.name, "Name")
        if (nameError) {
            setError(nameError.message)
            return false
        }

        const ratingError = validateNumber(formData.rating, "Rating", 1, 5)
        if (ratingError) {
            setError(ratingError.message)
            return false
        }

        const commentError = validateRequired(formData.comment, "Comment")
        if (commentError) {
            setError(commentError.message)
            return false
        }

        if (!isEditMode && !selectedFile) {
            setError("Avatar is required for new testimonials")
            return false
        }

        return true
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const fileError = validateFile(file, "Avatar", 2)
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
            let uploadedUrl = formData.avatar_url

            if (selectedFile) {
                const uploadResult = await storageApi.upload(selectedFile)
                uploadedUrl = uploadResult.url

                if (isEditMode && oldAvatarUrl && oldAvatarUrl !== uploadedUrl) {
                    const key = oldAvatarUrl.split("/").pop()
                    if (key) await storageApi.delete(`uploads/${key}`)
                }
            }

            const payload = {
                ...formData,
                avatar_url: uploadedUrl,
            }

            if (isEditMode) {
                await testimonialsApi.update(testimonialId!, payload)
                await showSuccessAlert("Success", "Testimonial updated successfully")
            } else {
                await testimonialsApi.create(payload)
                await showSuccessAlert("Success", "Testimonial created successfully")
            }

            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save testimonial"
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
                    <CardTitle>{isEditMode ? "Edit Testimonial" : "Add New Testimonial"}</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Avatar Image *</label>

                            <div className="flex gap-4">
                                <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-5 h-5 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">Click to choose image</span>
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
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                                        <img src={previewUrl} className="w-full h-full object-cover" />
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
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Rating (1-5) *</label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Order Index *</label>
                                <Input
                                    type="number"
                                    value={formData.order_index}
                                    onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Comment *</label>
                            <Textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                placeholder="Write your testimonial..."
                                rows={4} required
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
                                {loading ? "Saving..." : "Save Testimonial"}
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
