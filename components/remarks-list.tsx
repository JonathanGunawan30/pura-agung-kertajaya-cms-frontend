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
    const defaultType: EntityType = (queryType && ["pura", "yayasan", "pasraman"].includes(queryType)) ? queryType : "pura"

    const [entityType, setEntityType] = useState<EntityType>(defaultType)
    const [remarks, setRemarks] = useState<Remark[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)

    const limit = 6

    const fetchRemarks = async () => {
        try {
            setLoading(true)
            const data = await remarksApi.getAll(entityType)
            setRemarks(data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchRemarks() }, [entityType])

    const handleDelete = async (id: string, imageUrl: string | null) => {
        const result = await showConfirmAlert("Hapus Kata Sambutan", "Seluruh varian foto juga akan dibersihkan dari storage.")
        if (!result.isConfirmed) return

        try {
            if (imageUrl) {
                const filenameWithExt = imageUrl.split("/").pop() || ""
                const baseName = filenameWithExt.replace(/_(xs|sm|md|lg|xl|2xl|fhd|thumb|avatar|original|blur)\./, ".")
                const [nameNoExt, ext] = baseName.split('.')
                const variants = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'fhd', 'thumb', 'avatar', 'original', 'blur']

                await Promise.all(variants.map(v =>
                    storageApi.delete(`uploads/${nameNoExt}_${v}.${ext}`).catch(() => null)
                ))
            }

            await remarksApi.delete(id)
            setRemarks(prev => prev.filter(t => t.id !== id))
            await showSuccessAlert("Terhapus!", "Data dan foto berhasil dibersihkan.")
        } catch (error) {
            await showErrorAlert("Error", "Gagal menghapus data.")
        }
    }

    const filteredRemarks = remarks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const paginated = filteredRemarks.slice((page - 1) * limit, page * limit)
    const totalPages = Math.ceil(filteredRemarks.length / limit)

    if (showForm || editingId) {
        return <RemarksForm remarkId={editingId || undefined} entityType={entityType} onClose={() => { setShowForm(false); setEditingId(null); fetchRemarks(); }} />
    }

    return (
        <div className="space-y-6">
            {!queryType && (
                <div className="flex flex-wrap gap-2">
                    {(["pura", "yayasan", "pasraman"] as EntityType[]).map((type) => (
                        <Button key={type} variant={entityType === type ? "default" : "outline"} onClick={() => { setEntityType(type); router.push(`?type=${type}`, { scroll: false }) }} className={cn("capitalize h-10 px-6", entityType === type ? "bg-orange-600 text-white shadow-md" : "hover:text-orange-600 border-dashed")}>
                            <Building2 className="w-4 h-4 mr-2" /> {type}
                        </Button>
                    ))}
                </div>
            )}

            <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={`Cari tokoh ${entityType}...`} className="pl-10 focus-visible:ring-orange-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-5 h-5 mr-2" /> Tambah Sambutan
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl border bg-card shadow-sm h-[300px] p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-4"><Skeleton className="h-16 w-16 rounded-full bg-gray-200" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-3/4 bg-gray-200" /><Skeleton className="h-3 w-1/2 bg-gray-200" /></div></div>
                            <Skeleton className="h-24 w-full bg-gray-100" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.map((remark) => (
                        <div key={remark.id} className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500/10 group-hover:bg-orange-500 transition-colors" />
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative cursor-zoom-in w-16 h-16 shrink-0" onClick={() => remark.image_url && setPreviewImage(remark.image_url)}>
                                            {remark.image_url ? (
                                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-muted/20 group-hover:border-orange-200"><Image src={remark.image_url} alt={remark.name} fill className="object-cover" /></div>
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border-4 border-muted/20"><User className="w-8 h-8" /></div>
                                            )}
                                        </div>
                                        <div className="min-w-0"><h3 className="font-bold text-lg truncate max-w-[150px]">{remark.name}</h3><div className="flex items-center gap-1.5 text-orange-600 mt-0.5"><Briefcase className="w-3.5 h-3.5" /><span className="text-xs font-semibold uppercase truncate">{remark.position}</span></div></div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setEditingId(remark.id)}><Edit2 className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(remark.id, remark.image_url)} className="text-red-600"><Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus</DropdownMenuItem></DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="relative"><Quote className="absolute -top-1 -left-1 w-6 h-6 text-orange-200 opacity-50 rotate-180" /><div className="pl-6 relative z-10"><p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 italic">"{remark.content}"</p></div></div>
                            </div>
                            <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><LayoutList className="w-3.5 h-3.5" /><span>Urutan: {remark.order_index}</span></div><StatusBadge isActive={remark.is_active} /></div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
                    <div className="text-xs font-medium px-4">Page {page} of {totalPages}</div>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in" onClick={() => setPreviewImage(null)}>
                    <div className="flex items-center justify-between px-5 py-3 bg-black/60 border-b border-white/10"><p className="text-sm font-semibold text-white">Preview Foto Tokoh</p><Button variant="ghost" size="icon" className="text-white hover:text-red-400" onClick={() => setPreviewImage(null)}><X className="h-4 w-4" /></Button></div>
                    <div className="flex-1 overflow-auto flex items-center justify-center p-4"><img src={previewImage} alt="Preview" className="rounded-lg shadow-2xl max-w-[90%] max-h-[90%]" onClick={e => e.stopPropagation()} /></div>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild><div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-help ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}>{isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}{isActive ? "Active" : "Hidden"}</div></TooltipTrigger>
                <TooltipContent side="top">{isActive ? "Tampil di website" : "Disembunyikan"}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}