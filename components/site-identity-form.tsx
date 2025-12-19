"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { siteIdentityApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { validateRequired, validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

import {
    ArrowLeft,
    Save,
    Globe,
    Edit2 as EditIcon,
    ImageIcon,
    UploadCloud,
    Type,
    MousePointerClick,
    Link as LinkIcon
} from "lucide-react"
interface SiteIdentityFormProps {
    itemId?: string
    onClose: () => void
}

interface SiteIdentity {
    id: string
    site_name: string
    logo_url: string
    tagline: string
    primary_button_text: string
    primary_button_link: string
    secondary_button_text: string
    secondary_button_link: string
}

export function SiteIdentityForm({ itemId, onClose }: SiteIdentityFormProps) {
    const [formData, setFormData] = useState({
        site_name: "",
        logo_url: "",
        tagline: "",
        primary_button_text: "",
        primary_button_link: "",
        secondary_button_text: "",
        secondary_button_link: "",
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [oldLogoUrl, setOldLogoUrl] = useState<string>("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!itemId

    useEffect(() => {
        if (isEditMode) {
            const fetchItem = async () => {
                try {
                    const data: SiteIdentity = await siteIdentityApi.getById(itemId)
                    setFormData(data)
                    setPreviewUrl(data.logo_url)
                    setOldLogoUrl(data.logo_url)
                } catch (err) {
                    const msg = "Gagal memuat identitas website."
                    setError(msg)
                    await showErrorAlert("Error", msg)
                }
            }
            fetchItem()
        }
    }, [itemId, isEditMode])

    const validateForm = (): boolean => {
        const siteNameError = validateRequired(formData.site_name, "Nama Website")
        if (siteNameError) {
            setError(siteNameError.message)
            return false
        }

        if (!isEditMode && !selectedFile) {
            setError("Logo wajib diupload untuk identitas baru.")
            return false
        }

        const primaryButtonError = validateRequired(formData.primary_button_text, "Teks Tombol Utama")
        if (primaryButtonError) {
            setError(primaryButtonError.message)
            return false
        }
        const primaryLinkError = validateRequired(formData.primary_button_link, "Link Tombol Utama")
        if (primaryLinkError) {
            setError(primaryLinkError.message)
            return false
        }

        const secondaryButtonError = validateRequired(formData.secondary_button_text, "Teks Tombol Kedua")
        if (secondaryButtonError) {
            setError(secondaryButtonError.message)
            return false
        }
        const secondaryLinkError = validateRequired(formData.secondary_button_link, "Link Tombol Kedua")
        if (secondaryLinkError) {
            setError(secondaryLinkError.message)
            return false
        }

        return true
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const fileError = validateFile(file, "Logo", 2)
        if (fileError) {
            setError(fileError.message)
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
            let finalLogoUrl = formData.logo_url

            if (selectedFile) {
                const result = await storageApi.upload(selectedFile)
                finalLogoUrl = result.url

                if (isEditMode && oldLogoUrl && oldLogoUrl !== finalLogoUrl) {
                    const key = oldLogoUrl.split("/").pop()
                    if (key) await storageApi.delete(`uploads/${key}`)
                }
            }

            const payload = {
                ...formData,
                logo_url: finalLogoUrl,
            }

            if (isEditMode) {
                await siteIdentityApi.update(itemId!, payload)
                await showSuccessAlert("Berhasil Diupdate!", "Identitas website berhasil diperbarui.")
            } else {
                await siteIdentityApi.create(payload)
                await showSuccessAlert("Berhasil Ditambah!", "Identitas website berhasil disimpan.")
            }

            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Gagal menyimpan identitas"
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
                            {isEditMode ? <EditIcon className="w-5 h-5"/> : <Globe className="w-5 h-5"/>}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                {isEditMode ? "Edit Identitas Website" : "Atur Identitas Baru"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola logo, nama, tagline, dan tombol aksi utama website.
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

                            <div className="space-y-6 lg:border-r lg:pr-8 border-border/50">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4"/> Branding
                                </h3>

                                <div className="space-y-4">
                                    <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/5 p-4 transition-colors hover:bg-muted/10 hover:border-orange-500/50">
                                        {previewUrl ? (
                                            <div className="relative group flex justify-center">
                                                <div className="rounded-lg overflow-hidden bg-[url('https://ui.shadcn.com/pattern.svg')] dark:bg-black/20 border shadow-sm relative w-32 h-32 flex items-center justify-center">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Logo Preview"
                                                        className="max-w-full max-h-full object-contain p-2"
                                                    />
                                                </div>
                                                <div className="absolute top-0 right-0 lg:right-auto lg:left-24 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label
                                                        htmlFor="change-logo"
                                                        className="cursor-pointer bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md border hover:text-orange-600 transition-colors"
                                                        title="Ganti Logo"
                                                    >
                                                        <EditIcon className="w-3.5 h-3.5" />
                                                        <input
                                                            id="change-logo"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageSelect}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                                                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full mb-2 text-orange-600">
                                                    <UploadCloud className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs text-muted-foreground">Upload Logo</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="site_name" className="text-xs font-semibold uppercase text-muted-foreground">Nama Website <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="site_name"
                                                value={formData.site_name}
                                                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                                                placeholder="Contoh: Pura Agung Kertajaya"
                                                className="bg-background focus-visible:ring-orange-500"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="tagline" className="text-xs font-semibold uppercase text-muted-foreground">Tagline / Deskripsi Singkat <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                id="tagline"
                                                value={formData.tagline}
                                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                                placeholder="Contoh: Pusat kegiatan rohani dan kebudayaan Hindu dengan nilai-nilai dharma..."
                                                className="bg-background min-h-[100px] resize-y focus-visible:ring-orange-500 leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <MousePointerClick className="w-4 h-4"/> Tombol Utama (Primary)
                                    </h3>

                                    <div className="p-4 rounded-lg bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/20 space-y-3 transition-colors">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="primary_text" className="text-xs">Teks Tombol <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Type className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="primary_text"
                                                    value={formData.primary_button_text}
                                                    onChange={(e) => setFormData({ ...formData, primary_button_text: e.target.value })}
                                                    placeholder="Contoh: Pelajari Lebih Lanjut"
                                                    className="pl-9 bg-background focus-visible:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="primary_link" className="text-xs">Link Tujuan <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="primary_link"
                                                    value={formData.primary_button_link}
                                                    onChange={(e) => setFormData({ ...formData, primary_button_link: e.target.value })}
                                                    placeholder="/kontak atau #about"
                                                    className="pl-9 bg-background focus-visible:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <MousePointerClick className="w-4 h-4"/> Tombol Kedua (Secondary)
                                    </h3>

                                    <div className="p-4 rounded-lg bg-muted/30 border space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="secondary_text" className="text-xs">Teks Tombol <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Type className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="secondary_text"
                                                    value={formData.secondary_button_text}
                                                    onChange={(e) => setFormData({ ...formData, secondary_button_text: e.target.value })}
                                                    placeholder="Contoh: Lihat Gallery"
                                                    className="pl-9 bg-background focus-visible:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="secondary_link" className="text-xs">Link Tujuan <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="secondary_link"
                                                    value={formData.secondary_button_link}
                                                    onChange={(e) => setFormData({ ...formData, secondary_button_link: e.target.value })}
                                                    placeholder="/gallery atau #gallery"
                                                    className="pl-9 bg-background focus-visible:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t">
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
                                    <><Save className="w-4 h-4 mr-2" /> Simpan Konfigurasi</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </div>
    )
}