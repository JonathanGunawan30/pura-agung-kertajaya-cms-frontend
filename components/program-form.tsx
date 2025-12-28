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
    UploadCloud
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
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            let finalImageUrl = formData.work_program_image_url

            if (selectedFile) {
                const uploaded = await storageApi.upload(selectedFile)
                finalImageUrl = uploaded.url

                if (initialData?.work_program_image_url && initialData.work_program_image_url !== finalImageUrl) {
                    const key = initialData.work_program_image_url.split("/").pop()
                    if (key) await storageApi.delete(`uploads/${key}`)
                }
            }

            const payload = {
                entity_type: entityType,
                work_program: formData.work_program,
                work_program_image_url: finalImageUrl,
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
                                Edit Program Kerja
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Update deskripsi program kerja untuk <span className="capitalize font-bold text-orange-600">{entityType}</span>.
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
                                            <p className="text-xs text-muted-foreground mt-1 text-center">Format: JPG, PNG<br/>(Max 2MB)</p>
                                            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Foto ini akan ditampilkan di samping teks program kerja.
                                </p>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <Label htmlFor="work_program" className="flex items-center gap-2 font-semibold">
                                    <ClipboardList className="w-4 h-4"/> Isi Program Kerja
                                </Label>
                                <Textarea
                                    id="work_program"
                                    value={formData.work_program}
                                    onChange={(e) => setFormData({ ...formData, work_program: e.target.value })}
                                    placeholder="Tuliskan daftar program kerja, rencana kegiatan, atau deskripsi lengkap di sini..."
                                    className="bg-background min-h-[400px] resize-y focus-visible:ring-orange-500 leading-relaxed font-sans text-sm p-4"
                                    required
                                />
                                <div className="text-xs text-muted-foreground bg-blue-50 text-blue-700 p-3 rounded-md border border-blue-100">
                                    <strong>Tips:</strong> Gunakan "Enter" untuk membuat paragraf baru atau memisahkan poin-poin kegiatan.
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