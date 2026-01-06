"use client"

import type React from "react"
import { useState } from "react"
import { siteIdentityApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { validateRequired, validateFile } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import type { EntityType, SiteIdentity } from "@/lib/types"

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
    initialData: SiteIdentity | null
    entityType: EntityType
    onClose: () => void
}

export function SiteIdentityForm({ initialData, entityType, onClose }: SiteIdentityFormProps) {
    const [formData, setFormData] = useState({
        site_name: initialData?.site_name || "",
        logo_url: initialData?.logo_url || "",
        tagline: initialData?.tagline || "",
        primary_button_text: initialData?.primary_button_text || "",
        primary_button_link: initialData?.primary_button_link || "",
        secondary_button_text: initialData?.secondary_button_text || "",
        secondary_button_link: initialData?.secondary_button_link || "",
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.logo_url || "")
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

    const validateForm = (): boolean => {
        const siteNameError = validateRequired(formData.site_name, "Nama Website")
        if (siteNameError) {
            setError(siteNameError.message)
            return false
        }
        if (!initialData?.logo_url && !selectedFile) {
            setError("Logo wajib diupload untuk konfigurasi awal.")
            return false
        }
        return true
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const fileError = validateFile(file, "Logo", 2) // Max 2MB untuk logo biasanya cukup
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
            const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""

            if (selectedFile) {
                const uploadResult = await storageApi.upload(selectedFile)

                const variants = (uploadResult as any).images || (uploadResult as any).variants || {}

                const selectedPath = variants["2xl"] ||
                    variants.fhd ||
                    variants.xl ||
                    variants.lg ||
                    variants.md ||
                    variants.original ||
                    Object.values(variants)[0] as string

                if (!selectedPath) throw new Error("Gagal mendapatkan path gambar.")

                let newLogoUrl = ""
                if (selectedPath.startsWith("http")) {
                    newLogoUrl = selectedPath
                } else {
                    const cleanPath = selectedPath.startsWith("/") ? selectedPath.substring(1) : selectedPath
                    newLogoUrl = `${baseUrl}${cleanPath}`
                }

                if (initialData?.logo_url && initialData.logo_url !== newLogoUrl) {
                    await handleCleanupStorage(initialData.logo_url)
                }

                finalLogoUrl = newLogoUrl
            }

            const payload = {
                ...formData,
                logo_url: finalLogoUrl,
                entity_type: entityType
            }

            if (initialData && initialData.id) {
                await siteIdentityApi.update(initialData.id, payload)
            } else {
                await siteIdentityApi.create(payload)
            }

            await showSuccessAlert("Berhasil!", `Identitas ${entityType} berhasil disimpan.`)
            onClose()
        } catch (err) {
            console.error(err)
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
                    Kembali ke Preview
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">

                <div className="bg-muted/30 border-b p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-lg border shadow-sm bg-orange-50 text-orange-600 border-orange-100">
                            {initialData ? <EditIcon className="w-5 h-5"/> : <Globe className="w-5 h-5"/>}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                {initialData ? "Edit Identitas" : "Konfigurasi Identitas"} <span className="capitalize">{entityType}</span>
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola logo, nama, tagline, dan tombol aksi utama untuk modul ini.
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
                                                <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label className="cursor-pointer bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md border hover:text-orange-600 transition-colors" title="Ganti Logo">
                                                        <EditIcon className="w-3.5 h-3.5" />
                                                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                                                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full mb-2 text-orange-600">
                                                    <UploadCloud className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs text-muted-foreground">Upload Logo</span>
                                                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
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
                                                placeholder={`Contoh: ${entityType === 'pura' ? 'Pura Agung Kertajaya' : 'Yayasan ...'}`}
                                                className="bg-background focus-visible:ring-orange-500"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="tagline" className="text-xs font-semibold uppercase text-muted-foreground">Tagline / Deskripsi Singkat</Label>
                                            <Textarea
                                                id="tagline"
                                                value={formData.tagline}
                                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                                placeholder="Contoh: Pusat kegiatan rohani dan kebudayaan..."
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
                                            <Label htmlFor="primary_text" className="text-xs">Teks Tombol</Label>
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
                                            <Label htmlFor="primary_link" className="text-xs">Link Tujuan</Label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="primary_link"
                                                    value={formData.primary_button_link}
                                                    onChange={(e) => setFormData({ ...formData, primary_button_link: e.target.value })}
                                                    placeholder="/#about"
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
                                            <Label htmlFor="secondary_text" className="text-xs">Teks Tombol</Label>
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
                                            <Label htmlFor="secondary_link" className="text-xs">Link Tujuan</Label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="secondary_link"
                                                    value={formData.secondary_button_link}
                                                    onChange={(e) => setFormData({ ...formData, secondary_button_link: e.target.value })}
                                                    placeholder="/#gallery"
                                                    className="pl-9 bg-background focus-visible:ring-orange-500"
                                                />
                                            </div>
                                        </div>
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