"use client"

import type React from "react"
import { useState } from "react"
import { programsApi, storageApi } from "@/lib/api-client"
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
    ClipboardList,
    Edit2 as EditIcon,
    ImageIcon,
    UploadCloud,
    Info
    // Trash2 dihapus dari import
} from "lucide-react"

interface ProgramFormProps {
    initialData: OrganizationDetail | null
    entityType: EntityType
    onClose: () => void
}

export function ProgramForm({ initialData, entityType, onClose }: ProgramFormProps) {
    const [formData, setFormData] = useState({
        work_program: initialData?.work_program || "",
        work_program_image_url: initialData?.work_program_image_url || "",
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.work_program_image_url || "")
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
        setFormData(prev => ({ ...prev, work_program_image_url: "PENDING_UPLOAD" }))
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            let finalImageUrl = initialData?.work_program_image_url || ""
            const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""

            if (selectedFile) {
                const uploadResult = await storageApi.upload(selectedFile)
                const variants = uploadResult.variants
                const selectedPath = variants.lg || variants.md || variants.fhd || Object.values(variants)[0] as string
                const cleanPath = selectedPath.startsWith("/") ? selectedPath.substring(1) : selectedPath
                finalImageUrl = `${baseUrl}${cleanPath}`

                if (initialData?.work_program_image_url) {
                    console.log("Menimpa gambar, menghapus yang lama:", initialData.work_program_image_url);
                    await handleCleanupStorage(initialData.work_program_image_url)
                }
            }

            const payload = {
                entity_type: entityType,
                work_program: formData.work_program,
                work_program_image_url: finalImageUrl,
                vision: initialData?.vision || "",
                mission: initialData?.mission || "",
                vision_mission_image_url: initialData?.vision_mission_image_url || "",
                rules: initialData?.rules || "",
                rules_image_url: initialData?.rules_image_url || "",
                structure_image_url: initialData?.structure_image_url || ""
            }

            await programsApi.update(entityType, payload)
            await showSuccessAlert("Berhasil!", "Program kerja berhasil diperbarui.")
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
                <Button variant="ghost" onClick={onClose} className="group pl-0 hover:bg-transparent text-muted-foreground hover:text-orange-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Kembali ke Tampilan
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
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
                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                            </div>

                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <label className="cursor-pointer bg-white/90 p-2 rounded-full shadow-md border hover:text-blue-600 transition-colors inline-flex" title="Ganti Foto">
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
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <Label htmlFor="work_program" className="flex items-center gap-2 font-semibold text-orange-700">
                                    <ClipboardList className="w-5 h-5"/> Isi Program Kerja <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="work_program"
                                    value={formData.work_program}
                                    onChange={(e) => setFormData({ ...formData, work_program: e.target.value })}
                                    placeholder="Tuliskan daftar program kerja, rencana kegiatan, atau deskripsi lengkap di sini..."
                                    className="bg-background min-h-[400px] resize-y focus-visible:ring-orange-500 leading-relaxed font-sans text-sm p-4"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 pb-6 mt-8 border-t">
                            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6">Batal</Button>
                            <Button type="submit" disabled={loading} className="h-10 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all">
                                {loading ? "Menyimpan..." : <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </div>
    )
}