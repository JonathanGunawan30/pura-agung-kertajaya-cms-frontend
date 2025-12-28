"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import type { OrganizationDetail, EntityType } from "@/lib/types"
import { visionMissionApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
    Edit2,
    Target,
    Building2,
    ImageIcon,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    ExternalLink,
    X,
    Goal
} from "lucide-react"
import { VisionMissionForm } from "./vision-mission-form"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function VisionMissionList() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const queryType = searchParams.get("type") as EntityType | null
    const defaultType: EntityType = (queryType && ["pura", "yayasan", "pasraman"].includes(queryType))
        ? queryType
        : "pura"

    const [entityType, setEntityType] = useState<EntityType>(defaultType)
    const [data, setData] = useState<OrganizationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    useEffect(() => {
        if (queryType && ["pura", "yayasan", "pasraman"].includes(queryType)) {
            setEntityType(queryType)
        }
    }, [queryType])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await visionMissionApi.get(entityType)
            setData(result)
        } catch (error) {
            console.error("Failed to fetch vision mission:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [entityType])

    const handleTabChange = (type: EntityType) => {
        setEntityType(type)
        router.push(`?type=${type}`, { scroll: false })
    }

    const handleFormClose = () => {
        setShowForm(false)
        fetchData()
    }

    if (showForm) {
        return <VisionMissionForm initialData={data} entityType={entityType} onClose={handleFormClose} />
    }

    return (
        <div className="space-y-6">
            {!queryType && (
                <div className="flex flex-wrap gap-2">
                    {(["pura", "yayasan", "pasraman"] as EntityType[]).map((type) => (
                        <Button
                            key={type}
                            variant={entityType === type ? "default" : "outline"}
                            onClick={() => handleTabChange(type)}
                            className={cn(
                                "capitalize transition-all",
                                entityType === type
                                    ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                                    : "hover:text-orange-600 hover:border-orange-200"
                            )}
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            {type}
                        </Button>
                    ))}
                </div>
            )}

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-5 bg-background/50 backdrop-blur-sm flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium">Visi & Misi <span className="capitalize">{entityType}</span></span>
                    </div>

                    {!loading && (
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                        >
                            <Edit2 className="w-4 h-4 mr-2" /> {data?.vision || data?.mission ? "Edit Visi Misi" : "Buat Visi Misi"}
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border bg-card p-6 flex flex-col lg:flex-row gap-8">
                    <Skeleton className="w-full lg:w-[350px] h-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="w-1/3 h-8 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="w-full h-20 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="w-1/3 h-8 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="w-full h-32 bg-gray-200 dark:bg-gray-800" />
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">

                        <div className="w-full lg:w-[350px] shrink-0 space-y-3">
                            <div
                                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border shadow-sm bg-muted group/image cursor-pointer"
                                onClick={() => data?.vision_mission_image_url && setPreviewImage(data.vision_mission_image_url)}
                            >
                                {data?.vision_mission_image_url ? (
                                    <>
                                        <Image
                                            src={data.vision_mission_image_url}
                                            alt="Vision Banner"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover/image:scale-105"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100 duration-300">
                                            <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white">
                                                <ZoomIn className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                        <ImageIcon className="w-12 h-12 opacity-20" />
                                        <p className="text-xs">Tidak ada gambar</p>
                                    </div>
                                )}
                            </div>
                            {data?.vision_mission_image_url && (
                                <p className="text-xs text-center text-muted-foreground italic">
                                    Klik gambar untuk memperbesar
                                </p>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-8">

                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-orange-100 pb-2">
                                    <Target className="w-5 h-5 text-orange-600" />
                                    Visi
                                </h3>
                                {data?.vision ? (
                                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {data.vision}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed text-sm text-muted-foreground">
                                        Visi belum diisi.
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-blue-100 pb-2">
                                    <Goal className="w-5 h-5 text-blue-600" />
                                    Misi
                                </h3>
                                {data?.mission ? (
                                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {data.mission}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed text-sm text-muted-foreground">
                                        Misi belum diisi.
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
                        <p className="text-sm font-semibold text-white truncate flex-1">Preview Image</p>
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
                            className="transition-transform duration-200 shadow-2xl rounded-sm cursor-default"
                            style={{ transform: `scale(${zoom})`, maxWidth: zoom <= 1 ? "100%" : "none" }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}