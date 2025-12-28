"use client"

import {useState, useEffect} from "react"
import {useSearchParams, useRouter} from "next/navigation"
import Image from "next/image"
import type {HeroSlide, EntityType} from "@/lib/types"
import {heroSlidesApi, storageApi} from "@/lib/api-client"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
    Edit2,
    Trash2,
    Plus,
    Search,
    MoreHorizontal,
    Image as ImageIcon,
    LayoutList,
    Eye,
    EyeOff,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    ExternalLink,
    X,
    Building2,
} from "lucide-react"
import {HeroSlideForm} from "./hero-slide-form"
import {showSuccessAlert, showErrorAlert, showConfirmAlert} from "@/lib/sweet-alert"
import {Skeleton} from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function HeroSlidesList() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const queryType = searchParams.get("type") as EntityType | null
    const defaultType: EntityType = (queryType && ["pura", "yayasan", "pasraman"].includes(queryType))
        ? queryType
        : "pura"

    const [entityType, setEntityType] = useState<EntityType>(defaultType)
    const [slides, setSlides] = useState<HeroSlide[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)

    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const limit = 6

    useEffect(() => {
        if (queryType && ["pura", "yayasan", "pasraman"].includes(queryType)) {
            setEntityType(queryType)
        }
    }, [queryType])

    const fetchSlides = async () => {
        try {
            setLoading(true)
            const data = await heroSlidesApi.getAll(entityType)
            setSlides(data || [])
        } catch (error) {
            console.error("Failed to fetch hero slides:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSlides()
    }, [entityType])

    useEffect(() => {
        setPage(1)
    }, [searchQuery, entityType])

    const handleTabChange = (type: EntityType) => {
        setEntityType(type)
        router.push(`?type=${type}`, { scroll: false })
    }

    const handleDelete = async (id: string, imageUrl: string) => {
        const result = await showConfirmAlert("Hapus Slide", "Apakah Anda yakin? Data yang dihapus tidak dapat dikembalikan.")
        if (!result.isConfirmed) return

        try {
            if (imageUrl) {
                const key = imageUrl.split("/").pop()
                if (key) {
                    await storageApi.delete(`uploads/${key}`)
                }
            }

            await heroSlidesApi.delete(id)
            setSlides((prev) => prev.filter((s) => s.id !== id))
            await showSuccessAlert("Terhapus!", "Slide berhasil dihapus.")
        } catch (error) {
            const err = error instanceof Error ? error.message : "Gagal menghapus slide"
            await showErrorAlert("Error", err)
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchSlides()
    }

    const filteredSlides = slides.filter((slide) =>
        slide.order_index.toString().includes(searchQuery)
    )

    const startIdx = (page - 1) * limit
    const paginated = filteredSlides.slice(startIdx, startIdx + limit)
    const totalPages = Math.ceil(filteredSlides.length / limit)

    if (showForm || editingId) {
        return <HeroSlideForm slideId={editingId || undefined} entityType={entityType} onClose={handleFormClose}/>
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
                <div
                    className="p-5 bg-background/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder={`Cari urutan slide ${entityType} (angka)...`}
                            className="pl-10 h-10 bg-background border-input focus-visible:ring-orange-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            type="number"
                            min={1}
                        />
                    </div>

                    <Button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto h-10 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2"/> Tambah Slide
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="rounded-xl border bg-card shadow-sm overflow-hidden h-[350px] flex flex-col"
                        >
                            <Skeleton className="h-48 w-full bg-gray-200 dark:bg-gray-800"/>
                            <div className="p-5 space-y-3 flex-1">
                                <Skeleton className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800"/>
                                <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-800"/>
                            </div>
                            <div className="px-5 pb-5 pt-0 flex justify-between">
                                <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-800"/>
                                <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-800"/>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredSlides.length === 0 ? (
                <div
                    className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                        <Search className="w-8 h-8 text-orange-600/50"/>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Tidak ditemukan</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                        Tidak ada slide untuk <strong>{entityType}</strong> dengan urutan "{searchQuery}".
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
                        >
                            <div
                                className="relative h-52 w-full overflow-hidden bg-muted border-b cursor-zoom-in group/image"
                                onClick={() => {
                                    if (slide.image_url) {
                                        setPreviewImage(slide.image_url)
                                        setZoom(1)
                                    }
                                }}
                            >
                                {slide.image_url ? (
                                    <>
                                        <Image
                                            src={slide.image_url}
                                            alt="Hero Slide"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            priority={index < 4}
                                        />

                                        <div
                                            className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100 duration-300">
                                            <div
                                                className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white transform translate-y-2 group-hover/image:translate-y-0 transition-transform">
                                                <ZoomIn className="w-6 h-6"/>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center text-muted-foreground cursor-default">
                                        <ImageIcon className="w-12 h-12 opacity-20"/>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h3
                                        className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-orange-600 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (slide.image_url) {
                                                setPreviewImage(slide.image_url)
                                                setZoom(1)
                                            }
                                        }}
                                    >
                                        Hero Slide
                                    </h3>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 -mr-2 -mt-1 text-muted-foreground hover:text-orange-600"
                                            >
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem
                                                onClick={() => setEditingId(slide.id)}
                                                className="cursor-pointer"
                                            >
                                                <Edit2 className="mr-2 h-3.5 w-3.5"/> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(slide.id, slide.image_url)}
                                                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-3.5 w-3.5"/> Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Banner halaman utama (Urutan ke-{slide.order_index})
                                </p>
                            </div>

                            <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <LayoutList className="w-3.5 h-3.5"/>
                                    <span>
                                        Urutan:{" "}
                                        <span className="text-foreground font-semibold">{slide.order_index}</span>
                                    </span>
                                </div>
                                <StatusBadge isActive={slide.is_active}/>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-2">
                    <Button variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 1} className="h-9 px-4 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors">
                        Previous
                    </Button>
                    <div className="text-sm font-medium text-muted-foreground px-4">
                        Page {page} of {totalPages}
                    </div>
                    <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="h-9 px-4 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors">
                        Next
                    </Button>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
                    <div
                        className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">Preview Slide</p>
                            <p className="text-xs text-gray-400 truncate">
                                {previewImage.split("/").pop()}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                                onClick={() => setZoom((z) => clamp(z - 0.25, 0.5, 4))}
                                title="Zoom out"
                            >
                                <ZoomOut className="h-4 w-4"/>
                            </Button>

                            <div className="text-xs font-medium text-white px-2 min-w-[3.5rem] text-center select-none">
                                {Math.round(zoom * 100)}%
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                                onClick={() => setZoom((z) => clamp(z + 0.25, 0.5, 4))}
                                title="Zoom in"
                            >
                                <ZoomIn className="h-4 w-4"/>
                            </Button>

                            <div className="w-px h-6 bg-white/20 mx-1"/>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                                onClick={() => setZoom(1)}
                                title="Reset zoom"
                            >
                                <RotateCcw className="h-4 w-4"/>
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                                onClick={() => window.open(previewImage, "_blank")}
                                title="Open in new tab"
                            >
                                <ExternalLink className="h-4 w-4"/>
                            </Button>

                            <div className="w-px h-6 bg-white/20 mx-1"/>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-red-500/20 text-white hover:text-red-400 transition-colors"
                                onClick={() => {
                                    setPreviewImage(null)
                                    setZoom(1)
                                }}
                                title="Close (ESC)"
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8"
                         onClick={() => setPreviewImage(null)}>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="select-none transition-transform duration-200 cursor-default shadow-2xl rounded-sm"
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

                    <div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-none">
                        <p className="text-xs text-gray-300 text-center font-medium tracking-wide">
                            Double-click image to zoom • Click outside or X to close
                        </p>
                    </div>
                </div>
            )}

        </div>
    )
}

function StatusBadge({isActive}: { isActive: boolean }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div
                        className={`
                              flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border cursor-help select-none
                              ${
                            isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        }
                        `}
                    >
                        {isActive ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3"/>}
                        {isActive ? "Active" : "Hidden"}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-foreground text-background text-xs">
                    {isActive ? "Ditampilkan di website" : "Disembunyikan (Draft)"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}