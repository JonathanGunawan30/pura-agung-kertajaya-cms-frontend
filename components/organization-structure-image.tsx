"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Upload,
    Image as ImageIcon,
    Loader2,
    Info,
    Edit2,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    ExternalLink,
    X,
    UploadCloud
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { validateFile } from "@/lib/validation"
import { organizationImageApi, storageApi } from "@/lib/api-client"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import type { EntityType, OrganizationDetail } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OrganizationStructureImageProps {
    entityType: EntityType
    initialImageUrl: string | null
    initialData: OrganizationDetail | null
}

export function OrganizationStructureImage({ entityType, initialImageUrl, initialData }: OrganizationStructureImageProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl)
    const [isUploading, setIsUploading] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const router = useRouter()

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const themeConfig = {
        pura: {
            iconBg: "bg-orange-50",
            iconText: "text-orange-600",
            borderColor: "border-orange-100",
            buttonBg: "bg-orange-600",
            buttonHover: "hover:bg-orange-700",
            hoverBorder: "hover:border-orange-500/50",
            uploadIconBg: "bg-orange-50",
            uploadIconText: "text-orange-600"
        },
        yayasan: {
            iconBg: "bg-blue-50",
            iconText: "text-blue-600",
            borderColor: "border-blue-100",
            buttonBg: "bg-blue-600",
            buttonHover: "hover:bg-blue-700",
            hoverBorder: "hover:border-blue-500/50",
            uploadIconBg: "bg-blue-50",
            uploadIconText: "text-blue-600"
        },
        pasraman: {
            iconBg: "bg-emerald-50",
            iconText: "text-emerald-600",
            borderColor: "border-emerald-100",
            buttonBg: "bg-emerald-600",
            buttonHover: "hover:bg-emerald-700",
            hoverBorder: "hover:border-emerald-500/50",
            uploadIconBg: "bg-emerald-50",
            uploadIconText: "text-emerald-600"
        }
    }

    const theme = themeConfig[entityType] || themeConfig.pura

    useEffect(() => {
        setImageUrl(initialImageUrl)
    }, [initialImageUrl])

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

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const errorCheck = validateFile(file, "Image", 5)
        if (errorCheck) {
            await showErrorAlert("File Invalid", errorCheck.message)
            return
        }

        setIsUploading(true)

        try {
            const uploadResponse = await storageApi.upload(file)
            const variants = uploadResponse.variants || {}
            const path = variants.original || variants.fhd || variants["2xl"] || variants.xl || variants.lg || Object.values(variants)[0]

            if (!path) throw new Error("Gagal mendapatkan URL gambar dari server.")

            const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""
            const cleanPath = path.startsWith("/") ? path.substring(1) : path
            const newFullUrl = `${baseUrl}${cleanPath}`

            if (imageUrl && imageUrl !== newFullUrl) {
                await handleCleanupStorage(imageUrl)
            }

            const payload = {
                entity_type: entityType,
                structure_image_url: newFullUrl,
                vision: initialData?.vision || "",
                mission: initialData?.mission || "",
                vision_mission_image_url: initialData?.vision_mission_image_url || "",
                work_program: initialData?.work_program || "",
                work_program_image_url: initialData?.work_program_image_url || "",
                rules: initialData?.rules || "",
                rules_image_url: initialData?.rules_image_url || ""
            }

            await organizationImageApi.update(entityType, payload)

            setImageUrl(newFullUrl)
            await showSuccessAlert("Berhasil!", "Gambar struktur organisasi berhasil diperbarui.")
            router.refresh()

        } catch (error) {
            console.error('Upload error:', error)
            const msg = error instanceof Error ? error.message : "Gagal mengupload gambar"
            await showErrorAlert("Error", msg)
        } finally {
            setIsUploading(false)
            e.target.value = ""
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mb-8 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-muted/30 border-b p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                    <div className={cn("p-2.5 rounded-lg border shadow-sm", theme.iconBg, theme.iconText, theme.borderColor)}>
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground leading-tight">
                            Visual Bagan Struktur
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Upload gambar visual struktur organisasi untuk <span className={cn("capitalize font-semibold", theme.iconText)}>{entityType}</span>.
                        </p>
                    </div>
                </div>
            </div>

            <CardContent className="pt-8 px-6 md:px-8 bg-card">
                {imageUrl ? (
                    <div className="space-y-4">
                        <div
                            className="relative w-full rounded-xl border bg-muted/5 overflow-hidden group cursor-zoom-in"
                            onClick={() => {
                                setPreviewImage(imageUrl)
                                setZoom(1)
                            }}
                        >
                            <div className="relative min-h-[200px] max-h-[600px] flex items-center justify-center bg-black/5 p-4">
                                <img
                                    key={imageUrl}
                                    src={imageUrl}
                                    alt="Struktur Organisasi"
                                    className="w-auto h-auto max-w-full max-h-[500px] object-contain shadow-sm rounded-lg"
                                />

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                                    <div className="bg-black/60 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-2">
                                        <ZoomIn className="w-4 h-4" /> Klik untuk memperbesar
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                <span>Pastikan gambar jelas dan mudah dibaca.</span>
                            </div>

                            <div className="relative">
                                <input
                                    id="structure-upload-change"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUpload}
                                    disabled={isUploading}
                                />
                                <Button
                                    asChild
                                    size="sm"
                                    disabled={isUploading}
                                    className={cn("h-9 text-white shadow-sm cursor-pointer min-w-[140px]", theme.buttonBg, theme.buttonHover)}
                                >
                                    <label htmlFor="structure-upload-change">
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4 mr-2" />}
                                        {isUploading ? "Mengupload..." : "Ganti Gambar"}
                                    </label>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        "rounded-xl border-2 border-dashed border-border/60 bg-muted/5 p-8 transition-colors hover:bg-muted/10",
                        theme.hoverBorder
                    )}>
                        <label className="flex flex-col items-center justify-center min-h-[200px] cursor-pointer">
                            <div className={cn(
                                "p-4 rounded-full mb-4 transition-transform group-hover:scale-110",
                                theme.uploadIconBg, theme.uploadIconText
                            )}>
                                <UploadCloud className="w-10 h-10" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Upload Bagan Struktur</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
                                Seret file kesini atau klik untuk memilih. <br/>
                                <span className="text-xs opacity-70">Format: JPG, PNG (Max 5MB)</span>
                            </p>

                            <div className={cn(
                                "h-10 px-6 rounded-md flex items-center justify-center text-sm font-medium transition-all shadow-sm",
                                isUploading
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                    : cn("text-white hover:shadow-md", theme.buttonBg, theme.buttonHover)
                            )}>
                                {isUploading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengupload...</>
                                ) : (
                                    <><Upload className="w-4 h-4 mr-2" /> Pilih Gambar</>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={isUploading}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}
            </CardContent>

            {previewImage && (
                <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">Preview Bagan Struktur</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                                onClick={() => setZoom((z) => clamp(z - 0.25, 0.5, 4))}
                                title="Zoom out"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>

                            <div className="text-xs font-medium text-white px-2 min-w-[3.5rem] text-center select-none">
                                {Math.round(zoom * 100)}%
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                                onClick={() => setZoom((z) => clamp(z + 0.25, 0.5, 4))}
                                title="Zoom in"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6 bg-white/20 mx-1" />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                                onClick={() => setZoom(1)}
                                title="Reset zoom"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                                onClick={() => window.open(previewImage, "_blank")}
                                title="Open in new tab"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6 bg-white/20 mx-1" />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-red-500/20 text-white hover:text-red-400 transition-colors"
                                onClick={() => {
                                    setPreviewImage(null)
                                    setZoom(1)
                                }}
                                title="Close (ESC)"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div
                        className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 cursor-grab active:cursor-grabbing"
                        onClick={() => setPreviewImage(null)}
                    >
                        <img
                            src={previewImage}
                            alt="Full Preview"
                            className="select-none transition-transform duration-200 shadow-2xl rounded-sm"
                            style={{
                                transform: `scale(${zoom})`,
                                maxWidth: zoom <= 1 ? "100%" : "none",
                                maxHeight: zoom <= 1 ? "100%" : "none",
                            }}
                            draggable={false}
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                                setZoom(zoom === 1 ? 2 : 1)
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-none">
                        <p className="text-xs text-gray-300 text-center font-medium tracking-wide">
                            Double-click image to zoom • Click outside or X to close
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}