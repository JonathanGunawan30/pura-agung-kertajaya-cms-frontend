"use client"

import {useState, useEffect} from "react"
import type {Facility} from "@/lib/types"
import {facilitiesApi, storageApi} from "@/lib/api-client"
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
} from "lucide-react"
import {FacilityForm} from "./facilities-form"
import {showConfirmAlert, showSuccessAlert, showErrorAlert} from "@/lib/sweet-alert"
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

export function FacilitiesList() {
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)

    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const [zoom, setZoom] = useState(1)

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const limit = 6

    const fetchFacilities = async () => {
        try {
            setLoading(true)
            const data = await facilitiesApi.getAll()
            setFacilities(data || [])
        } catch (error) {
            console.error("Failed to fetch facilities:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFacilities()
    }, [])

    useEffect(() => {
        setPage(1)
    }, [searchQuery])

    const handleDelete = async (id: string, imageUrl: string) => {
        const result = await showConfirmAlert(
            "Hapus Fasilitas",
            "Apakah Anda yakin? Data yang dihapus tidak dapat dikembalikan."
        )

        if (!result.isConfirmed) return

        try {
            if (imageUrl) {
                const key = imageUrl.split("/").pop()
                if (key) {
                    await storageApi.delete(`uploads/${key}`)
                }
            }

            await facilitiesApi.delete(id)
            setFacilities((prev) => prev.filter((f) => f.id !== id))
            await showSuccessAlert("Terhapus!", "Fasilitas berhasil dihapus.")
        } catch (error) {
            console.error("Failed to delete facility:", error)
            const errorMsg = error instanceof Error ? error.message : "Gagal menghapus fasilitas"
            await showErrorAlert("Error", errorMsg)
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchFacilities()
    }

    const filteredFacilities = facilities.filter(
        (facility) =>
            facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            facility.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const startIdx = (page - 1) * limit
    const paginated = filteredFacilities.slice(startIdx, startIdx + limit)
    const totalPages = Math.ceil(filteredFacilities.length / limit)

    if (showForm || editingId) {
        return <FacilityForm facilityId={editingId || undefined} onClose={handleFormClose}/>
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div
                    className="p-5 bg-background/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Cari nama fasilitas..."
                            className="pl-10 h-10 bg-background border-input focus-visible:ring-orange-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto h-10 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2"/> Tambah Fasilitas
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="rounded-xl border bg-card shadow-sm overflow-hidden h-[380px] flex flex-col"
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
            ) : filteredFacilities.length === 0 ? (
                <div
                    className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                        <Search className="w-8 h-8 text-orange-600/50"/>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Tidak ditemukan</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                        Tidak ada fasilitas yang cocok dengan "{searchQuery}" atau belum ada data.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.map((facility) => (
                        <div
                            key={facility.id}
                            className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
                        >
                            <div
                                className="relative h-52 w-full overflow-hidden bg-muted border-b cursor-zoom-in group/image"
                                onClick={() => {
                                    if (facility.image_url) {
                                        setPreviewImage(facility.image_url)
                                        setZoom(1)
                                    }
                                }}
                            >
                                {facility.image_url ? (
                                    <>
                                        <img
                                            src={facility.image_url}
                                            alt={facility.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                                <div className="flex justify-between items-start mb-2">
                                    <h3
                                        className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-orange-600 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (facility.image_url) {
                                                setPreviewImage(facility.image_url)
                                                setZoom(1)
                                            }
                                        }}
                                    >
                                        {facility.name}
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
                                                onClick={() => setEditingId(facility.id)}
                                                className="cursor-pointer"
                                            >
                                                <Edit2 className="mr-2 h-3.5 w-3.5"/> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(facility.id, facility.image_url)}
                                                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-3.5 w-3.5"/> Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {facility.description}
                                </p>
                            </div>

                            <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <LayoutList className="w-3.5 h-3.5"/>
                                    <span>
                                        Urutan:{" "}
                                        <span className="text-foreground font-semibold">{facility.order_index}</span>
                                    </span>
                                </div>
                                <StatusBadge isActive={facility.is_active}/>
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
                            <p className="text-sm font-semibold text-white truncate">Preview Image</p>
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
                            onClick={(e) => e.stopPropagation()} // Prevent close on image click
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
                        {isActive ? "Active" : "Inactive"}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-foreground text-background text-xs">
                    {isActive ? "Ditampilkan di website" : "Disembunyikan (Draft)"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}