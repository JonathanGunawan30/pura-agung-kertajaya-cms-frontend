"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import type { SiteIdentity, EntityType } from "@/lib/types"
import { siteIdentityApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
    Edit2,
    Globe,
    LayoutTemplate,
    ImageIcon,
    MousePointerClick,
    Link as LinkIcon,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    ExternalLink,
    X,
    ArrowRight
} from "lucide-react"
import { SiteIdentityForm } from "./site-identity-form"
import { Skeleton } from "@/components/ui/skeleton"

export function SiteIdentityList() {
    const searchParams = useSearchParams()
    const queryType = searchParams.get("type") as EntityType | null
    const entityType: EntityType = (queryType && ["pura", "yayasan", "pasraman"].includes(queryType))
        ? queryType
        : "pura"

    const [data, setData] = useState<SiteIdentity | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await siteIdentityApi.get(entityType)
            setData(result)
        } catch (error) {
            console.error("Failed to fetch site identity:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [entityType])

    const handleFormClose = () => {
        setShowForm(false)
        fetchData()
    }

    if (showForm) {
        return <SiteIdentityForm initialData={data} entityType={entityType} onClose={handleFormClose} />
    }

    return (
        <div className="space-y-6">

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-5 bg-background/50 backdrop-blur-sm flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium">Identitas Website <span className="capitalize font-bold text-foreground">{entityType}</span></span>
                    </div>

                    {!loading && (
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                        >
                            <Edit2 className="w-4 h-4 mr-2" /> {data ? "Edit Identitas" : "Buat Identitas"}
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border bg-card p-6 flex flex-col lg:flex-row gap-8">
                    <Skeleton className="w-full lg:w-[300px] h-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="w-1/3 h-8 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="w-full h-20 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="w-1/3 h-8 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="w-full h-12 bg-gray-200 dark:bg-gray-800" />
                    </div>
                </div>
            ) : !data ? (
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                        <LayoutTemplate className="w-8 h-8 text-orange-600/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Identitas {entityType} belum diatur</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto text-sm">
                        Data ini digunakan untuk menampilkan nama, logo, dan tombol aksi di halaman depan modul {entityType}.
                    </p>
                    <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4 border-orange-200 text-orange-600 hover:bg-orange-50">
                        Buat Identitas Baru
                    </Button>
                </div>
            ) : (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">

                        <div className="w-full lg:w-[300px] shrink-0 space-y-3">
                            <div
                                className="relative w-full aspect-square rounded-lg overflow-hidden border shadow-sm bg-muted group/image cursor-pointer flex items-center justify-center bg-[url('https://ui.shadcn.com/pattern.svg')]"
                                onClick={() => data.logo_url && setPreviewImage(data.logo_url)}
                            >
                                {data.logo_url ? (
                                    <>
                                        <div className="relative w-3/4 h-3/4">
                                            <Image
                                                src={data.logo_url}
                                                alt="Logo Website"
                                                fill
                                                className="object-contain transition-transform duration-500 group-hover/image:scale-105"
                                                priority
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100 duration-300">
                                            <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white">
                                                <ZoomIn className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <ImageIcon className="w-12 h-12 opacity-20" />
                                        <p className="text-xs">Tidak ada logo</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wider">
                                Logo Website
                            </p>
                        </div>

                        <div className="flex-1 min-w-0 space-y-6">

                            <div className="pb-6 border-b border-border/60">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                    Informasi Utama
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Nama Website</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{data.site_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tagline / Slogan</p>
                                        <p className="text-base text-foreground italic mt-1">"{data.tagline}"</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    Konfigurasi Tombol Hero
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MousePointerClick className="w-4 h-4 text-orange-600" />
                                            <span className="font-semibold text-sm">Tombol Utama</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground block text-xs">Label:</span>
                                            <span className="font-medium">{data.primary_button_text}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground block text-xs">Link Tujuan:</span>
                                            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded text-blue-600 flex items-center gap-1 w-fit mt-0.5">
                                                <LinkIcon className="w-3 h-3"/> {data.primary_button_link}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MousePointerClick className="w-4 h-4 text-slate-500" />
                                            <span className="font-semibold text-sm">Tombol Kedua</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground block text-xs">Label:</span>
                                            <span className="font-medium">{data.secondary_button_text}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground block text-xs">Link Tujuan:</span>
                                            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded text-blue-600 flex items-center gap-1 w-fit mt-0.5">
                                                <LinkIcon className="w-3 h-3"/> {data.secondary_button_link}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
                        <p className="text-sm font-semibold text-white truncate flex-1">Preview Logo</p>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(z => clamp(z - 0.25, 0.5, 4))}><ZoomOut className="w-4 h-4" /></Button>
                            <span className="text-xs text-white w-12 text-center">{Math.round(zoom * 100)}%</span>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(z => clamp(z + 0.25, 0.5, 4))}><ZoomIn className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(1)}><RotateCcw className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => window.open(previewImage, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-red-500/20 hover:text-red-400" onClick={() => { setPreviewImage(null); setZoom(1); }}><X className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                        <img
                            src={previewImage}
                            alt="Full Preview"
                            className="transition-transform duration-200 shadow-sm rounded-sm cursor-default object-contain"
                            style={{ transform: `scale(${zoom})`, maxWidth: zoom <= 1 ? "100%" : "none" }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}