"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { heroSlidesApi, storageApi } from "@/lib/api-client"
import type { EntityType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent } from "@/components/ui/card"
import { validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

import {
    ArrowLeft,
    Save,
    LayoutList,
    Edit2 as EditIcon,
    Image as ImageIcon,
    UploadCloud
} from "lucide-react"

interface HeroSlideFormProps {
    slideId?: string
    entityType: EntityType
    onClose: () => void
}

export function HeroSlideForm({ slideId, entityType, onClose }: HeroSlideFormProps) {
    const [formData, setFormData] = useState({
        entity_type: entityType,
        images: null as any,
        order_index: 1,
        is_active: true,
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!slideId

    useEffect(() => {
        if (!slideId) {
            setFormData(prev => ({ ...prev, entity_type: entityType }))
        }
    }, [entityType, slideId])

    useEffect(() => {
        if (isEditMode) {
            const fetchSlide = async () => {
                try {
                    const data = await heroSlidesApi.getById(slideId)
                    setFormData({
                        entity_type: data.entity_type,
                        images: data.images,
                        order_index: data.order_index,
                        is_active: data.is_active,
                    })

                    const imgs = data.images as any
                    if (imgs) {
                        const url = imgs.fhd || imgs["2xl"] || imgs.xl || imgs.lg || imgs.md || Object.values(imgs)[0]
                        if (typeof url === 'string') {
                            setPreviewUrl(url)
                        }
                    }
                } catch (err) {
                    const msg = "Gagal memuat data slide."
                    setError(msg)
                    await showErrorAlert("Error", msg)
                }
            }

            fetchSlide()
        }
    }, [slideId, isEditMode])

    const validateForm = (): boolean => {
        setError("")
        if (!isEditMode && !selectedFile) {
            setError("Foto slide wajib diupload untuk slide baru.")
            return false
        }
        return true
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validationError = validateFile(file, "Image", 10)
        if (validationError) {
            setError(validationError.message)
            return
        }

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
                entity_type: formData.entity_type,
                order_index: formData.order_index,
                is_active: formData.is_active,
                images: finalImages,
            }

            if (isEditMode) {
                await heroSlidesApi.update(slideId!, payload)
                await showSuccessAlert("Berhasil Diupdate!", "Slide berhasil diperbarui.")
            } else {
                await heroSlidesApi.create(payload)
                await showSuccessAlert("Berhasil Ditambah!", "Slide baru berhasil disimpan.")
            }

            onClose()
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan slide."
            setError(errorMsg)
            await showErrorAlert("Error", errorMsg)
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
                            {isEditMode ? <EditIcon className="w-5 h-5"/> : <ImageIcon className="w-5 h-5"/>}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                {isEditMode ? "Edit Hero Slide" : "Tambah Hero Slide"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Upload gambar banner utama untuk halaman beranda <span className="capitalize font-semibold text-orange-600">{entityType}</span>.
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

                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4"/> Foto Slide <span className="text-red-500">*</span>
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
                                        <label className="flex flex-col items-center justify-center h-64 cursor-pointer">
                                            <div className="bg-orange-50 p-4 rounded-full mb-3 text-orange-600">
                                                <UploadCloud className="w-10 h-10" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">Klik untuk upload foto banner</p>
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

                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <LayoutList className="w-4 h-4"/> Pengaturan
                                </h3>

                                <div className="space-y-5 p-5 bg-muted/20 rounded-lg border">
                                    <div className="space-y-2">
                                        <Label htmlFor="order" className="flex items-center gap-2">
                                            <LayoutList className="w-3.5 h-3.5 text-muted-foreground" /> Urutan Tampilan
                                        </Label>
                                        <Input
                                            id="order"
                                            type="number"
                                            min={1}
                                            value={formData.order_index}
                                            onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) || 1 })}
                                            className="bg-background"
                                            required
                                        />
                                        <p className="text-[11px] text-muted-foreground leading-tight pt-1">
                                            Menentukan urutan slide saat ditampilkan. <br/>
                                            <span className="text-orange-600 font-medium">Angka 1 = Slide Pertama.</span>
                                        </p>
                                    </div>

                                    <div className="h-px bg-border/60 my-2"></div>

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
                                                ? "Slide ini TAMPIL di beranda."
                                                : "Slide ini DISEMBUNYIKAN."}
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