"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { EntityType } from "@/lib/types"
import { remarksApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent } from "@/components/ui/card"
import { validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

import {
    ArrowLeft,
    Save,
    LayoutList,
    User,
    Edit2 as EditIcon,
    Image as ImageIcon,
    UploadCloud,
    MessageSquareQuote,
    Info,
    Type
} from "lucide-react"

interface RemarksFormProps {
    remarkId?: string
    entityType: EntityType
    onClose: () => void
}

export function RemarksForm({ remarkId, entityType, onClose }: RemarksFormProps) {
    const [formData, setFormData] = useState({
        entity_type: entityType,
        name: "",
        position: "",
        image_url: "",
        content: "",
        is_active: true,
        order_index: 1,
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!remarkId

    useEffect(() => {
        if (isEditMode && remarkId) {
            const fetchRemark = async () => {
                try {
                    const data: any = await remarksApi.getById(remarkId!)
                    setFormData({
                        entity_type: data.entity_type || entityType,
                        name: data.name || "",
                        position: data.position || "",
                        image_url: data.image_url || "",
                        content: data.content || "",
                        is_active: Boolean(data.is_active ?? data.IsActive ?? true),
                        order_index: data.order_index || 1,
                    })
                    setPreviewUrl(data.image_url || "")
                } catch (err) {
                    setError("Gagal memuat data kata sambutan.")
                }
            }
            fetchRemark()
        }
    }, [remarkId, isEditMode, entityType])

    const handleCleanupStorage = async (url: string) => {
        if (!url) return
        try {
            const filenameWithExt = url.split("/").pop() || ""
            const baseName = filenameWithExt.replace(/_(xs|sm|md|lg|xl|2xl|fhd|thumb|avatar|original|blur)\./, ".")
            const [nameNoExt, ext] = baseName.split('.')
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
        const fileError = validateFile(file, "Foto", 5)
        if (fileError) { setError(fileError.message); return }
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.name.trim() || !formData.position.trim() || !formData.content.trim()) {
            setError("Mohon lengkapi semua field wajib.")
            return
        }

        setLoading(true)
        try {
            let finalImageUrl = formData.image_url
            const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""

            if (selectedFile) {
                const uploadResult = await storageApi.upload(selectedFile)
                const variants = uploadResult.variants
                const selectedPath = variants.lg || variants.md || variants.fhd || Object.values(variants)[0] as string
                const cleanPath = selectedPath.startsWith("/") ? selectedPath.substring(1) : selectedPath

                const newImageUrl = `${baseUrl}${cleanPath}`

                if (isEditMode && formData.image_url && formData.image_url !== newImageUrl) {
                    await handleCleanupStorage(formData.image_url)
                }

                finalImageUrl = newImageUrl
            }

            const payload = {
                ...formData,
                entity_type: formData.entity_type || entityType,
                image_url: finalImageUrl,
                is_active: Boolean(formData.is_active)
            }

            if (isEditMode) {
                await remarksApi.update(remarkId!, payload)
                await showSuccessAlert("Berhasil!", "Data diperbarui.")
            } else {
                await remarksApi.create(payload)
                await showSuccessAlert("Berhasil!", "Data disimpan.")
            }
            onClose()
        } catch (err) {
            setError("Gagal menyimpan data.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onClose} className="group pl-0 hover:bg-transparent text-muted-foreground hover:text-orange-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Kembali ke Daftar
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="bg-muted/30 border-b p-6 flex items-start gap-4">
                    <div className="p-2.5 rounded-lg border bg-orange-50 text-orange-600 border-orange-100 shadow-sm">
                        <MessageSquareQuote className="w-5 h-5"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground leading-tight">
                            {isEditMode ? "Edit Kata Sambutan" : "Tambah Sambutan Baru"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola pesan sambutan tokoh untuk ditampilkan di halaman <span className="capitalize font-semibold text-orange-600">{entityType}</span>.
                        </p>
                    </div>
                </div>

                <CardContent className="pt-8 px-6 md:px-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium">{error}</div>}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4"/> Foto Tokoh
                                    </h3>
                                    <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/5 p-6 transition-colors hover:bg-muted/10 hover:border-orange-500/50">
                                        {previewUrl ? (
                                            <div className="relative group flex justify-center">
                                                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute top-0 right-0 lg:right-1/4">
                                                    <label className="cursor-pointer bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md border hover:text-orange-600 transition-colors block">
                                                        <EditIcon className="w-4 h-4" />
                                                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-48 w-full cursor-pointer">
                                                <div className="bg-orange-50 p-4 rounded-full mb-3 text-orange-600">
                                                    <UploadCloud className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm font-medium text-foreground">Klik untuk upload foto tokoh</p>
                                                <p className="text-xs text-muted-foreground mt-1">Format: JPG, PNG (Max 5MB)</p>
                                                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <User className="w-4 h-4"/> Informasi Tokoh
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Contoh: Nama Lengkap"
                                                className="focus-visible:ring-orange-500 bg-background"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Jabatan <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={formData.position}
                                                onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))}
                                                placeholder="Contoh: Ketua Yayasan / Pinandita"
                                                className="focus-visible:ring-orange-500 bg-background"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Isi Sambutan / Kutipan <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                                            placeholder="Tuliskan kata sambutan atau pesan bijak tokoh di sini..."
                                            className="min-h-[150px] focus-visible:ring-orange-500 bg-background leading-relaxed"
                                        />
                                        <p className="text-[11px] text-muted-foreground italic">
                                            💡 Sambutan ini akan ditampilkan sebagai teks kutipan utama di halaman profil.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <LayoutList className="w-4 h-4"/> Pengaturan Tampilan
                                </h3>
                                <div className="p-5 bg-muted/20 rounded-lg border space-y-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <LayoutList className="w-3.5 h-3.5" /> Urutan Tampil
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={formData.order_index}
                                            onChange={(e) => setFormData(p => ({ ...p, order_index: Number(e.target.value) }))}
                                            className="bg-background"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            * Angka terkecil akan muncul di posisi teratas.
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-2 border-t border-dashed border-orange-200">
                                        <div className="flex items-center justify-between">
                                            <Label className="cursor-pointer font-bold">Status Aktif</Label>
                                            <Switch
                                                checked={formData.is_active}
                                                onCheckedChange={(c) => setFormData(p => ({ ...p, is_active: c }))}
                                                className="data-[state=checked]:bg-emerald-600"
                                            />
                                        </div>
                                        <div className="flex gap-2 text-[11px] text-muted-foreground bg-white p-2 rounded border border-orange-100">
                                            <Info className="w-3 h-3 shrink-0 text-orange-500 mt-0.5" />
                                            <span>{formData.is_active ? "Data tokoh ini akan dipublikasikan." : "Data hanya tersimpan sebagai draft."}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 pb-6 border-t">
                            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6">Batal</Button>
                            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[150px] h-10 shadow-lg">
                                {loading ? "Menyimpan..." : <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </div>
    )
}