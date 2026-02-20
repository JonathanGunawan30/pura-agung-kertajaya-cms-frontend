"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { aboutApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent } from "@/components/ui/card"
import { validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import type { AboutValue, EntityType } from "@/lib/types"

import {
    ArrowLeft,
    Save,
    LayoutList,
    Type,
    Edit2 as EditIcon,
    Image as ImageIcon,
    UploadCloud,
    Info,
    ListChecks,
    Plus,
    Trash2,
    GripVertical
} from "lucide-react"

type AboutValueFormData = Omit<AboutValue, "id" | "about_id" | "created_at" | "updated_at">

interface AboutSectionFormData {
    entity_type: EntityType
    title: string
    description: string
    images: any
    is_active: boolean
    values: AboutValueFormData[]
}

interface AboutSectionFormProps {
    sectionId?: string
    entityType: EntityType
    onClose: () => void
}

export function AboutSectionForm({ sectionId, entityType, onClose }: AboutSectionFormProps) {
    const [formData, setFormData] = useState<AboutSectionFormData>({
        entity_type: entityType,
        title: "",
        description: "",
        images: null,
        is_active: true,
        values: [],
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!sectionId

    useEffect(() => {
        if (!sectionId) {
            setFormData(prev => ({ ...prev, entity_type: entityType }))
        }
    }, [entityType, sectionId])

    useEffect(() => {
        if (isEditMode) {
            const fetchSection = async () => {
                try {
                    const data = await aboutApi.getById(sectionId)
                    setFormData({
                        entity_type: data.entity_type,
                        title: data.title,
                        description: data.description,
                        images: data.images,
                        is_active: data.is_active,
                        values: data.values.map((v) => ({
                            title: v.title,
                            value: v.value,
                            order_index: v.order_index,
                        })),
                    })

                    const imgs = data.images as any
                    if (imgs) {
                        const url = imgs.fhd || imgs["2xl"] || imgs.xl || imgs.lg || imgs.md || Object.values(imgs)[0]
                        if (typeof url === 'string') {
                            setPreviewUrl(url)
                        }
                    }
                } catch (err) {
                    const msg = "Gagal memuat data informasi."
                    setError(msg)
                    await showErrorAlert("Error", msg)
                }
            }
            fetchSection()
        }
    }, [sectionId, isEditMode])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const errorCheck = validateFile(file, "Image", 10)
        if (errorCheck) {
            setError(errorCheck.message)
            return
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setError("")
    }

    const handleValueChange = (
        index: number,
        field: "title" | "value" | "order_index",
        value: string | number
    ) => {
        const newValues = [...formData.values]

        if (field === "value" && typeof value === "string") {
            if (value.length > 100) return
        }

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

        if (!formData.title.trim()) {
            setError("Judul wajib diisi.")
            return
        }

        if (!isEditMode && !selectedFile) {
            setError("Foto wajib diupload untuk data baru.")
            return
        }

        const valueTooLong = formData.values.find(v => v.value.length > 100)
        if (valueTooLong) {
            setError(`Keterangan poin "${valueTooLong.title || 'Tanpa Judul'}" melebihi 100 karakter.`)
            return
        }

        setLoading(true)

        try {
            let finalImages = formData.images || {}

            if (selectedFile) {
                const uploadResponse = await storageApi.upload(selectedFile)
                const backendVariants = uploadResponse.variants

                const fullUrlImages: Record<string, string> = {}
                const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""

                Object.keys(backendVariants).forEach((key) => {
                    const path = backendVariants[key]
                    const cleanPath = path.startsWith("/") ? path.substring(1) : path
                    fullUrlImages[key] = `${baseUrl}${cleanPath}`
                })

                finalImages = fullUrlImages
            }

            const payload = {
                ...formData,
                images: finalImages,
            }

            if (isEditMode) {
                await aboutApi.update(sectionId!, payload)
                await showSuccessAlert("Berhasil Diupdate!", "Informasi berhasil diperbarui.")
            } else {
                await aboutApi.create(payload)
                await showSuccessAlert("Berhasil Ditambah!", "Informasi baru berhasil disimpan.")
            }

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
                    Kembali ke Daftar
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">

                <div className="bg-muted/30 border-b p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg border shadow-sm ${isEditMode ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                            {isEditMode ? <EditIcon className="w-5 h-5"/> : <Info className="w-5 h-5"/>}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                {isEditMode ? "Edit Informasi" : "Tambah Informasi Baru"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola sejarah serta nilai-nilai untuk <span className="capitalize font-semibold text-orange-600">{entityType}</span>.
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

                            <div className="lg:col-span-2 space-y-8">

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4"/> Foto Sampul <span className="text-red-500">*</span>
                                    </h3>

                                    <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/5 p-6 transition-colors hover:bg-muted/10 hover:border-orange-500/50">
                                        {previewUrl ? (
                                            <div className="relative group">
                                                <div className="rounded-lg overflow-hidden bg-black/5 border shadow-sm relative min-h-[200px] max-h-[400px] flex items-center justify-center">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain max-h-[400px]"
                                                    />
                                                </div>
                                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label
                                                        htmlFor="change-image"
                                                        className="cursor-pointer bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md border hover:text-orange-600 transition-colors"
                                                        title="Ganti Foto"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                        <input
                                                            id="change-image"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageSelect}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                                                <div className="bg-orange-50 p-4 rounded-full mb-3 text-orange-600">
                                                    <UploadCloud className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm font-medium text-foreground">Klik untuk upload foto</p>
                                                <p className="text-xs text-muted-foreground mt-1">Format: JPG, PNG (Max 10MB)</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <Type className="w-4 h-4"/> Detail Konten
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Judul Bagian <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder={`Contoh: Tentang ${entityType === 'pura' ? 'Pura Agung' : entityType}...`}
                                                className="bg-background focus-visible:ring-orange-500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Deskripsi Lengkap<span className="text-red-500">*</span></Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Tuliskan sejarah, visi misi, atau deskripsi lengkap disini..."
                                                className="bg-background min-h-[150px] resize-y focus-visible:ring-orange-500 leading-relaxed"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5 pt-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <ListChecks className="w-4 h-4"/> Nilai & Prinsip
                                        </h3>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={handleAddValue}
                                            className="h-8 text-xs border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Poin
                                        </Button>
                                    </div>

                                    {formData.values.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-muted rounded-xl bg-muted/5">
                                            <p className="text-sm text-muted-foreground">Belum ada poin nilai/prinsip ditambahkan.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {formData.values.map((value, index) => (
                                                <div
                                                    key={index}
                                                    className="group relative flex flex-col sm:flex-row gap-4 p-5 rounded-xl border bg-card hover:border-orange-200 transition-colors shadow-sm"
                                                >
                                                    <div className="hidden sm:flex flex-col items-center justify-center text-muted-foreground/30 px-1">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>

                                                    <div className="flex-1 space-y-3">
                                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                            <div className="sm:col-span-3 space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground">Judul Poin</Label>
                                                                <Input
                                                                    value={value.title}
                                                                    onChange={(e) => handleValueChange(index, "title", e.target.value)}
                                                                    placeholder="Judul..."
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground">Urutan</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={value.order_index}
                                                                    onChange={(e) => handleValueChange(index, "order_index", Number(e.target.value))}
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between">
                                                                <Label className="text-xs text-muted-foreground">Isi / Keterangan</Label>
                                                                <span className={`text-[10px] ${value.value.length > 100 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                                                    {value.value.length}/100
                                                                </span>
                                                            </div>
                                                            <Textarea
                                                                value={value.value}
                                                                onChange={(e) => handleValueChange(index, "value", e.target.value)}
                                                                placeholder="Jelaskan poin ini (Maksimal 100 karakter)..."
                                                                className={`min-h-[60px] resize-y text-sm ${value.value.length >= 100 ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                                                                maxLength={100}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="absolute top-2 right-2 sm:static sm:flex sm:items-start">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveValue(index)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <LayoutList className="w-4 h-4"/> Pengaturan
                                </h3>

                                <div className="space-y-5 p-5 bg-muted/20 rounded-lg border">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="is_active" className="cursor-pointer">Status Publikasi</Label>
                                            <Switch
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                                className="data-[state=checked]:bg-emerald-600"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {formData.is_active
                                                ? "Bagian ini TAMPIL di website."
                                                : "Bagian ini DISEMBUNYIKAN (Draft)."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 pb-6 mt-8 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-10 px-6 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
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