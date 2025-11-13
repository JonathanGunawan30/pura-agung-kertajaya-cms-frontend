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

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [oldImageUrl, setOldImageUrl] = useState<string>("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

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
                    setPreviewUrl(data.image_url)
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false))
        }
    }, [sectionId, isEditMode])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const errorCheck = validateFile(file, "Image", 2)
        if (errorCheck) {
            setError(errorCheck.message)
            return
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

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
            let finalImageUrl = formData.image_url

            if (selectedFile) {
                const uploaded = await storageApi.upload(selectedFile)
                finalImageUrl = uploaded.url

                if (isEditMode && oldImageUrl && oldImageUrl !== finalImageUrl) {
                    const key = oldImageUrl.split("/").pop()
                    if (key) await storageApi.delete(`uploads/${key}`)
                }
            }

            const payload = {
                ...formData,
                image_url: finalImageUrl,
            }

            if (isEditMode) {
                await aboutApi.update(sectionId!, payload)
                await showSuccessAlert("Success", "About section updated successfully")
            } else {
                await aboutApi.create(payload)
                await showSuccessAlert("Success", "About section created successfully")
            }

            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save section"
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

            <form onSubmit={handleSubmit}>
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>{isEditMode ? "Edit About Section" : "Add New About Section"}</CardTitle>
                        <CardDescription>This section includes the main description and its values.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={5}
                                className="bg-background border-border/50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Image (Max 2MB)</Label>

                            <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                <div className="flex flex-col items-center">
                                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
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
                                <div className="mt-4 rounded-lg overflow-hidden h-48 bg-muted">
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label className="text-sm font-medium">Active</Label>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 mt-6">
                    <CardHeader>
                        <div className="flex justify-between">
                            <div>
                                <CardTitle>Values</CardTitle>
                                <CardDescription>Add related values such as Visi, Misi, etc.</CardDescription>
                            </div>

                            <Button type="button" variant="outline" onClick={handleAddValue}>
                                <Plus className="w-4 h-4" /> Add Value
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {formData.values.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No values added yet.</p>
                        )}

                        {formData.values.map((value, index) => (
                            <div key={index} className="p-4 rounded-lg border border-border/50 space-y-3 bg-muted/30">
                                <div className="flex justify-between items-center">
                                    <Label>Value #{index + 1}</Label>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveValue(index)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={value.title}
                                        onChange={(e) => handleValueChange(index, "title", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Value</Label>
                                    <Textarea
                                        value={value.value}
                                        onChange={(e) => handleValueChange(index, "value", e.target.value)}
                                        rows={3}
                                        className="bg-background border-border/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Order</Label>
                                    <Input
                                        type="number"
                                        value={value.order_index}
                                        onChange={(e) =>
                                            handleValueChange(index, "order_index", Number(e.target.value) || 1)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-6">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
                        {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Section"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
