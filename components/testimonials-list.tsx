"use client"

import { useState, useEffect } from "react"
import type { Testimonial } from "@/lib/types"
import { testimonialsApi, storageApi } from "@/lib/api-client"
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
    Star,
    Quote
} from "lucide-react"
import { TestimonialForm } from "./testimonial-form"
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

export function TestimonialsList() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)

    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const limit = 6

    const fetchTestimonials = async () => {
        try {
            setLoading(true)
            const data = await testimonialsApi.getAll()
            setTestimonials(data || [])
        } catch (error) {
            console.error("Failed to fetch testimonials:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTestimonials()
    }, [])

    useEffect(() => {
        setPage(1)
    }, [searchQuery])

    const handleDelete = async (id: string, avatarUrl: string) => {
        const result = await showConfirmAlert("Hapus Testimonial", "Apakah Anda yakin? Data yang dihapus tidak dapat dikembalikan.")
        if (!result.isConfirmed) return

        try {
            if (avatarUrl) {
                const key = avatarUrl.split("/").pop()
                if (key) {
                    await storageApi.delete(`uploads/${key}`)
                }
            }

            await testimonialsApi.delete(id)
            setTestimonials((prev) => prev.filter((t) => t.id !== id))
            await showSuccessAlert("Terhapus!", "Testimonial berhasil dihapus.")
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Gagal menghapus testimonial"
            await showErrorAlert("Error", errorMsg)
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchTestimonials()
    }

    const filteredTestimonials = testimonials.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.comment.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const startIdx = (page - 1) * limit
    const paginated = filteredTestimonials.slice(startIdx, startIdx + limit)
    const totalPages = Math.ceil(filteredTestimonials.length / limit)

    if (showForm || editingId) {
        return <TestimonialForm testimonialId={editingId || undefined} onClose={handleFormClose} />
    }

    return (
        <div className="space-y-6">

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-5 bg-background/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau isi ulasan..."
                            className="pl-10 h-10 bg-background border-input focus-visible:ring-orange-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto h-10 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Tambah Testimonial
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-xl border bg-card shadow-sm h-[320px] p-6 flex flex-col space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-800" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800" />
                                    <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800" />
                                </div>
                            </div>
                            <Skeleton className="h-24 w-full bg-gray-200 dark:bg-gray-800" />

                            <div className="mt-auto flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-800" />
                                <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-800" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredTestimonials.length === 0 ? (
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                        <Search className="w-8 h-8 text-orange-600/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Tidak ditemukan</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                        Tidak ada ulasan yang cocok dengan "{searchQuery}" atau belum ada data.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                        >
                            <Quote className="absolute top-4 right-4 w-12 h-12 text-muted/20 rotate-180 pointer-events-none" />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <div
                                        className="relative cursor-zoom-in group/avatar"
                                        onClick={() => testimonial.avatar_url && setPreviewImage(testimonial.avatar_url)}
                                    >
                                        {testimonial.avatar_url ? (
                                            <img
                                                src={testimonial.avatar_url}
                                                alt={testimonial.name}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-sm group-hover/avatar:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border-2 border-background shadow-sm">
                                                <User className="w-7 h-7" />
                                            </div>
                                        )}
                                        {testimonial.avatar_url && (
                                            <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <ZoomIn className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base text-foreground truncate pr-6">
                                            {testimonial.name}
                                        </h3>
                                        <div className="flex items-center gap-0.5 mt-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3.5 h-3.5 ${i < testimonial.rating ? "fill-orange-400 text-orange-400" : "fill-muted text-muted"}`}
                                                />
                                            ))}
                                            <span className="text-xs text-muted-foreground ml-2 font-medium">
                                                ({testimonial.rating}/5)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 right-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => setEditingId(testimonial.id)} className="cursor-pointer">
                                                    <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(testimonial.id, testimonial.avatar_url)}
                                                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                >
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="bg-muted/30 p-4 rounded-lg flex-1 border border-border/40">
                                    <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-4">
                                        "{testimonial.comment}"
                                    </p>
                                </div>
                            </div>

                            <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <LayoutList className="w-3.5 h-3.5" />
                                    <span>
                                        Urutan:{" "}
                                        <span className="text-foreground font-semibold">{testimonial.order_index}</span>
                                    </span>
                                </div>
                                <StatusBadge isActive={testimonial.is_active} />
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
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">Preview Avatar</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10" onClick={() => setZoom((z) => clamp(z - 0.25, 0.5, 4))}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-white px-2">{Math.round(zoom * 100)}%</span>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10" onClick={() => setZoom((z) => clamp(z + 0.25, 0.5, 4))}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-white/20 mx-1" />
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:bg-red-500/20" onClick={() => { setPreviewImage(null); setZoom(1); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="select-none transition-transform duration-200 cursor-default shadow-2xl rounded-full border-4 border-white/10"
                            style={{
                                transform: `scale(${zoom})`,
                                maxWidth: zoom <= 1 ? "300px" : "none",
                                maxHeight: zoom <= 1 ? "300px" : "none",
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
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border cursor-help select-none ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {isActive ? "Active" : "Hidden"}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                    {isActive ? "Ditampilkan di website" : "Disembunyikan (Draft)"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}