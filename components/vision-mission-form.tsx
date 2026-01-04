"use client"

import type React from "react"
import { useState } from "react"
import { visionMissionApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import type { EntityType, OrganizationDetail } from "@/lib/types"

import {
    ArrowLeft,
    Save,
    Target,
    Goal,
    Edit2 as EditIcon,
    ImageIcon,
    UploadCloud
} from "lucide-react"

interface VisionMissionFormProps {
    initialData: OrganizationDetail | null
    entityType: EntityType
    onClose: () => void
}

export function VisionMissionForm({ initialData, entityType, onClose }: VisionMissionFormProps) {
    const [formData, setFormData] = useState({
        vision: initialData?.vision || "",
        mission: initialData?.mission || "",
        vision_mission_image_url: initialData?.vision_mission_image_url || "",
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.vision_mission_image_url || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleCleanupStorage = async (url: string) => {
        if (!url) return
        try {
            const filenameWithExt = url.split("/").pop() || ""
            const baseName = filenameWithExt.replace(/_(xs|sm|md|lg|xl|2xl|fhd|thumb|avatar|original|blur)\./, ".")
            const parts = baseName.split('.')
            const ext = parts.pop()
            const nameNoExt = parts.join('.')

            const variants = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'fhd', 'thumb', 'avatar', 'original', 'blur']

            await Promise.all(variants.map(v =>
                storageApi.delete(`uploads/${nameNoExt}_${v}.${ext}`).catch(() => null)
            ))
        } catch (err) {
            console.error("Cleanup failed", err)
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const errorCheck = validateFile(file, "Image", 5)
        if (errorCheck) {
            setError(errorCheck.message)
            return
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            let finalImageUrl = formData.vision_mission_image_url
            const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""

            if (selectedFile) {
                const uploadResult = await storageApi.upload(selectedFile)
                const variants = uploadResult.variants

                const selectedPath = variants.lg || variants.md || variants.fhd || Object.values(variants)[0] as string
                const cleanPath = selectedPath.startsWith("/") ? selectedPath.substring(1) : selectedPath
                const newImageUrl = `${baseUrl}${cleanPath}`

                if (initialData?.vision_mission_image_url && initialData.vision_mission_image_url !== newImageUrl) {
                    await handleCleanupStorage(initialData.vision_mission_image_url)
                }

                finalImageUrl = newImageUrl
            }

            const payload = {
                entity_type: entityType,
                vision: formData.vision,
                mission: formData.mission,
                vision_mission_image_url: finalImageUrl,
            }

            await visionMissionApi.update(entityType, payload)
            await showSuccessAlert("Berhasil!", "Visi & Misi berhasil diperbarui.")

            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Gagal menyimpan data."
            setError(message)
            await showErrorAlert("Error", message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="group pl-0 hover:bg-transparent text-muted-foreground hover:text-orange-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Kembali ke Tampilan
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="bg-muted/30 border-b p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-lg border shadow-sm bg-blue-50 text-blue-600 border-blue-100">
                            <EditIcon className="w-5 h-5"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                Edit Visi & Misi
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Tentukan arah dan tujuan organisasi untuk <span className="capitalize font-bold text-orange-600">{entityType}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="pt-8 px-6 md:px-8 bg-card">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-4">
                                <Label className="flex items-center gap-2 font-semibold">
                                    <ImageIcon className="w-4 h-4"/> Foto Pendukung
                                </Label>

                                <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/5 p-4 hover:bg-muted/10 transition-colors">
                                    {previewUrl ? (
                                        <div className="relative group">
                                            <div className="rounded-lg overflow-hidden border shadow-sm relative aspect-[4/3] w-full flex items-center justify-center bg-black/5">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <label className="cursor-pointer bg-white/90 p-2 rounded-full shadow-md border hover:text-orange-600 transition-colors" title="Ganti Foto">
                                                    <EditIcon className="w-4 h-4" />
                                                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                                            <div className="bg-orange-50 p-4 rounded-full mb-3 text-orange-600">
                                                <UploadCloud className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm font-medium">Klik untuk upload foto</p>
                                            <p className="text-xs text-muted-foreground mt-1 text-center">Format: JPG, PNG<br/>(Max 5MB)</p>
                                            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Foto ini akan ditampilkan di halaman Visi & Misi.
                                </p>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="vision" className="flex items-center gap-2 font-semibold text-base text-orange-700">
                                        <Target className="w-5 h-5"/> Visi
                                    </Label>
                                    <Textarea
                                        id="vision"
                                        value={formData.vision}
                                        onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                                        placeholder="Tuliskan Visi organisasi..."
                                        className="bg-background min-h-[200px] resize-y focus-visible:ring-orange-500 text-sm leading-relaxed"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="mission" className="flex items-center gap-2 font-semibold text-base text-blue-700">
                                        <Goal className="w-5 h-5"/> Misi
                                    </Label>
                                    <Textarea
                                        id="mission"
                                        value={formData.mission}
                                        onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                                        placeholder="Tuliskan poin-poin Misi di sini..."
                                        className="bg-background min-h-[200px] resize-y focus-visible:ring-orange-500 text-sm leading-relaxed"
                                        required
                                    />
                                    <div className="text-xs text-muted-foreground bg-blue-50 text-blue-700 p-3 rounded-md border border-blue-100">
                                        <strong>Tips:</strong> Gunakan "Enter" untuk membuat paragraf baru atau memisahkan poin-poin visi & misi.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 pb-6 mt-8 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-10 px-6"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-10 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all"
                            >
                                {loading ? "Menyimpan..." : (
                                    <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </div>
    )
}