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
import { validateRequired, validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

import {
    ArrowLeft,
    Save,
    LayoutList,
    User,
    Edit2 as EditIcon,
    Image as ImageIcon,
    UploadCloud,
    MessageSquareQuote
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
    const [oldImageUrl, setOldImageUrl] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!remarkId

    useEffect(() => {
        if (!remarkId) {
            setFormData(prev => ({ ...prev, entity_type: entityType }))
        }
    }, [entityType, remarkId])

    useEffect(() => {
        if (isEditMode && remarkId) {
            const fetchRemark = async () => {
                try {
                    const data: any = await remarksApi.getById(remarkId!)

                    let activeStatus = true
                    if (data.is_active !== undefined && data.is_active !== null) {
                        activeStatus = Boolean(data.is_active)
                    } else if (data.IsActive !== undefined && data.IsActive !== null) {
                        activeStatus = Boolean(data.IsActive)
                    }

                    setFormData({
                        entity_type: data.entity_type,
                        name: data.name || "",
                        position: data.position || "",
                        image_url: data.image_url || "",
                        content: data.content || "",
                        is_active: activeStatus,
                        order_index: data.order_index || 1,
                    })

                    setPreviewUrl(data.image_url || "")
                    setOldImageUrl(data.image_url || "")
                } catch (err) {
                    console.error(err)
                    const msg = "Gagal memuat data kata sambutan."
                    setError(msg)
                    await showErrorAlert("Error", msg)
                }
            }
            fetchRemark()
        }
    }, [remarkId, isEditMode])

    const validateForm = (): boolean => {
        const nameError = validateRequired(formData.name, "Nama Tokoh")
        if (nameError) { setError(nameError.message); return false }

        const positionError = validateRequired(formData.position, "Jabatan")
        if (positionError) { setError(positionError.message); return false }

        const contentError = validateRequired(formData.content, "Isi Sambutan")
        if (contentError) { setError(contentError.message); return false }

        if (!isEditMode && !selectedFile) {
            setError("Foto tokoh wajib diupload untuk data baru.")
            return false
        }
        return true
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const fileError = validateFile(file, "Foto", 2)
        if (fileError) { setError(fileError.message); return }
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setError("")
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
                is_active: formData.is_active
            }

            if (isEditMode) {
                await remarksApi.update(remarkId!, payload)
                await showSuccessAlert("Berhasil Diupdate!", "Kata sambutan berhasil diperbarui.")
            } else {
                await remarksApi.create(payload)
                await showSuccessAlert("Berhasil Ditambah!", "Kata sambutan baru berhasil disimpan.")
            }
            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Gagal menyimpan data"
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
                    Kembali ke Daftar
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="bg-muted/30 border-b p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg border shadow-sm ${isEditMode ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                            {isEditMode ? <EditIcon className="w-5 h-5"/> : <MessageSquareQuote className="w-5 h-5"/>}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                {isEditMode ? "Edit Kata Sambutan" : "Tambah Sambutan Baru"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola pesan sambutan atau kutipan tokoh untuk <span className="capitalize font-semibold text-orange-600">{entityType}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="pt-8 px-6 md:px-8 bg-card">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4"/> Foto Tokoh <span className="text-red-500">*</span>
                                    </h3>
                                    <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/5 p-6 transition-colors hover:bg-muted/10 hover:border-orange-500/50">
                                        {previewUrl ? (
                                            <div className="relative group flex justify-center">
                                                <div className="rounded-full overflow-hidden bg-white border-4 border-white shadow-md relative w-48 h-48 flex items-center justify-center">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute top-0 right-0 lg:right-1/4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label htmlFor="change-image" className="cursor-pointer bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md border hover:text-orange-600 transition-colors" title="Ganti Foto">
                                                        <EditIcon className="w-4 h-4" />
                                                        <input id="change-image" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                                                <div className="bg-orange-50 p-4 rounded-full mb-3 text-orange-600">
                                                    <UploadCloud className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm font-medium text-foreground">Klik untuk upload foto</p>
                                                <p className="text-xs text-muted-foreground mt-1">Format: JPG, PNG (Max 2MB)</p>
                                                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <User className="w-4 h-4"/> Detail Tokoh
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nama Tokoh <span className="text-red-500">*</span></Label>
                                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama lengkap..." className="bg-background focus-visible:ring-orange-500" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="position">Jabatan / Posisi <span className="text-red-500">*</span></Label>
                                                <Input id="position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Contoh: Ketua Banjar..." className="bg-background focus-visible:ring-orange-500" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="content">Isi Sambutan <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                id="content"
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                placeholder="Tuliskan kata-kata sambutan atau kutipan..."
                                                className="bg-background min-h-[150px] resize-y focus-visible:ring-orange-500 font-sans"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <LayoutList className="w-4 h-4"/> Pengaturan
                                </h3>
                                <div className="space-y-5 p-5 bg-muted/20 rounded-lg border">
                                    <div className="space-y-2">
                                        <Label htmlFor="order" className="flex items-center gap-2">
                                            <LayoutList className="w-3.5 h-3.5 text-muted-foreground" /> Urutan Tampil
                                        </Label>
                                        <Input id="order" type="number" min={1} value={formData.order_index} onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })} className="bg-background" required />
                                        <p className="text-[11px] text-muted-foreground leading-tight pt-1">Urutan lebih kecil akan tampil lebih dulu.</p>
                                    </div>

                                    <div className="h-px bg-border/60 my-2"></div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="is_active" className="cursor-pointer">Status Aktif</Label>
                                            <Switch
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                                className="data-[state=checked]:bg-emerald-600"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {formData.is_active ? "Data ini akan DITAMPILKAN di website." : "Data ini DISEMBUNYIKAN (Draft)."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 pb-6 mt-8 border-t">
                            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors">Batal</Button>
                            <Button type="submit" disabled={loading} className="h-10 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all">
                                {loading ? "Menyimpan..." : (<><Save className="w-4 h-4 mr-2" /> Simpan Data</>)}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </div>
    )
}