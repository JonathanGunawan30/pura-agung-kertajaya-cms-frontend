"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import type { Remark, EntityType } from "@/lib/types"
import { remarksApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Edit2,
    Trash2,
    Plus,
    Search,
    MoreHorizontal,
    User,
    LayoutList,
    Eye,
    EyeOff,
    ZoomIn,
    ZoomOut,
    X,
    Briefcase,
    Quote,
    Building2
} from "lucide-react"
import { RemarksForm } from "./remarks-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"
import { Skeleton } from "@/components/ui/skeleton"
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

export function RemarksList() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const queryType = searchParams.get("type") as EntityType | null
    const defaultType: EntityType = (queryType && ["pura", "yayasan", "pasraman"].includes(queryType))
        ? queryType
        : "pura"

    const [entityType, setEntityType] = useState<EntityType>(defaultType)
    const [remarks, setRemarks] = useState<Remark[]>([])
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

    const fetchRemarks = async () => {
        try {
            setLoading(true)
            const data = await remarksApi.getAll(entityType)
            setRemarks(data || [])
        } catch (error) {
            console.error("Failed to fetch remarks:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRemarks()
    }, [entityType])

    useEffect(() => {
        setPage(1)
    }, [searchQuery, entityType])

    const handleTabChange = (type: EntityType) => {
        setEntityType(type)
        router.push(`?type=${type}`, { scroll: false })
    }

    const handleDelete = async (id: string, imageUrl: string | null) => {
        const result = await showConfirmAlert(
            "Hapus Kata Sambutan",
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

            await remarksApi.delete(id)
            setRemarks((prev) => prev.filter((t) => t.id !== id))
            await showSuccessAlert("Terhapus!", "Kata sambutan berhasil dihapus.")
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Gagal menghapus data"
            await showErrorAlert("Error", errorMsg)
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchRemarks()
    }

    const filteredRemarks = remarks.filter(
        (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const startIdx = (page - 1) * limit
    const paginated = filteredRemarks.slice(startIdx, startIdx + limit)
    const totalPages = Math.ceil(filteredRemarks.length / limit)

    if (showForm || editingId) {
        return <RemarksForm remarkId={editingId || undefined} entityType={entityType} onClose={handleFormClose} />
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
                <div className="p-5 bg-background/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Cari tokoh ${entityType}...`}
                            className="pl-10 h-10 bg-background border-input focus-visible:ring-orange-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto h-10 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Tambah Sambutan
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border bg-card shadow-sm h-[350px] p-6 flex flex-col space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800" />
                                    <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800" />
                                </div>
                            </div>
                            <Skeleton className="h-32 w-full bg-gray-200 dark:bg-gray-800" />
                        </div>
                    ))}
                </div>
            ) : filteredRemarks.length === 0 ? (
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                        <Search className="w-8 h-8 text-orange-600/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Tidak ditemukan</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                        Belum ada kata sambutan untuk <strong>{entityType}</strong> atau tidak cocok dengan pencarian.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.map((remark) => (
                        <div
                            key={remark.id}
                            className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500/10 group-hover:bg-orange-500 transition-colors" />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="relative cursor-zoom-in group/avatar w-16 h-16 shrink-0"
                                            onClick={() => remark.image_url && setPreviewImage(remark.image_url)}
                                        >
                                            {remark.image_url ? (
                                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-muted/20 group-hover/avatar:border-orange-200 transition-colors">
                                                    <Image
                                                        src={remark.image_url}
                                                        alt={remark.name}
                                                        fill
                                                        sizes="64px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border-4 border-muted/20">
                                                    <User className="w-8 h-8" />
                                                </div>
                                            )}
                                            {remark.image_url && (
                                                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                                                    <ZoomIn className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="font-bold text-lg text-foreground truncate max-w-[150px]">
                                                {remark.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 mt-0.5">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold truncate max-w-[150px] uppercase tracking-wide">
                                                    {remark.position}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-orange-600 -mr-2 -mt-2"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => setEditingId(remark.id)} className="cursor-pointer">
                                                <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(remark.id, remark.image_url)}
                                                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="relative">
                                    <Quote className="absolute -top-1 -left-1 w-6 h-6 text-orange-200 dark:text-orange-900/40 rotate-180" />
                                    <div className="pl-6 relative z-10">
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 italic">
                                            "{remark.content}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <LayoutList className="w-3.5 h-3.5" />
                                    <span>
                                        Urutan:{" "}
                                        <span className="text-foreground font-semibold">{remark.order_index}</span>
                                    </span>
                                </div>
                                <StatusBadge isActive={remark.is_active} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page === 1}
                        className="h-9 px-4 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                    >
                        Previous
                    </Button>
                    <div className="text-sm font-medium text-muted-foreground px-4">
                        Page {page} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page === totalPages}
                        className="h-9 px-4 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                    >
                        Next
                    </Button>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">Preview Foto Tokoh</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-white hover:bg-white/10"
                                onClick={() => setZoom((z) => clamp(z - 0.25, 0.5, 4))}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-white px-2">{Math.round(zoom * 100)}%</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-white hover:bg-white/10"
                                onClick={() => setZoom((z) => clamp(z + 0.25, 0.5, 4))}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-white/20 mx-1" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-red-400 hover:bg-red-500/20"
                                onClick={() => {
                                    setPreviewImage(null)
                                    setZoom(1)
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div
                        className="flex-1 overflow-auto flex items-center justify-center p-4"
                        onClick={() => setPreviewImage(null)}
                    >
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="select-none transition-transform duration-200 cursor-default shadow-2xl rounded-lg border-4 border-white/10"
                            style={{
                                transform: `scale(${zoom})`,
                                maxWidth: zoom <= 1 ? "80%" : "none",
                                maxHeight: zoom <= 1 ? "80%" : "none",
                            }}
                            draggable={false}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border cursor-help select-none ${
                            isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                    >
                        {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {isActive ? "Active" : "Hidden"}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">{isActive ? "Ditampilkan di website" : "Disembunyikan (Draft)"}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}