"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { Activity, EntityType } from "@/lib/types"
import { activitiesApi } from "@/lib/api-client"
import { useAuth } from "@/app/auth-context"
import { validateEntityType, getAllowedEntityTypes, isSuperUser } from "@/lib/role-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Edit2,
    Trash2,
    Plus,
    Search,
    MapPin,
    Clock,
    MoreHorizontal,
    LayoutList,
    Eye,
    EyeOff,
    Building2
} from "lucide-react"
import { ActivityForm } from "./activity-form"
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
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

export function ActivitiesList() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()

    const queryType = searchParams.get("type") as EntityType | null
    const validatedType = validateEntityType(user, queryType)

    const [entityType, setEntityType] = useState<EntityType>(validatedType)
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)

    const [searchQuery, setSearchQuery] = useState("")
    const [filterMonth, setFilterMonth] = useState("")

    const [page, setPage] = useState(1)

    const limit = 5

    useEffect(() => {
        const validType = validateEntityType(user, queryType)
        setEntityType(validType)
        if (queryType && validType !== queryType) {
            router.replace(`?type=${validType}`, { scroll: false })
        }
    }, [queryType, user])

    const fetchActivities = async () => {
        try {
            setLoading(true)
            const data = await activitiesApi.getAll(entityType)
            setActivities(data || [])
        } catch (error) {
            console.error("Failed to fetch activities:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActivities()
    }, [entityType])

    useEffect(() => {
        setPage(1)
    }, [searchQuery, filterMonth, entityType])

    const handleTabChange = (type: EntityType) => {
        const validType = validateEntityType(user, type)
        setEntityType(validType)
        router.push(`?type=${validType}`, { scroll: false })
    }

    const handleDelete = async (id: string) => {
        const result = await showConfirmAlert(
            "Hapus Kegiatan",
            "Apakah Anda yakin? Data yang dihapus tidak dapat dikembalikan."
        )
        if (!result.isConfirmed) return

        try {
            await activitiesApi.delete(id)
            setActivities((prev) => prev.filter((a) => a.id !== id))
            await showSuccessAlert("Terhapus!", "Kegiatan berhasil dihapus.")
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Gagal menghapus"
            await showErrorAlert("Error", errorMsg)
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchActivities()
    }

    const filteredActivities = activities.filter((activity) => {
        const matchesSearch =
            activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.location?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesMonth = true;
        if (filterMonth) {
            const activityDate = (activity as any).event_date || "";
            matchesMonth = activityDate.startsWith(filterMonth);
        }

        return matchesSearch && matchesMonth;
    })

    const startIdx = (page - 1) * limit
    const paginated = filteredActivities.slice(startIdx, startIdx + limit)
    const totalPages = Math.ceil(filteredActivities.length / limit)

    const getRowNumber = (index: number) => (page - 1) * limit + index + 1;

    if (showForm || editingId) {
        return (
            <ActivityForm
                activityId={editingId || undefined}
                entityType={entityType}
                onClose={handleFormClose}
            />
        )
    }

    return (
        <div className="space-y-6">
            {!queryType && isSuperUser(user) && (
                <div className="flex flex-wrap gap-2">
                    {getAllowedEntityTypes(user).map((type) => (
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
                <div className="p-5 border-b bg-background/50 backdrop-blur-sm flex flex-col xl:flex-row justify-between gap-4 items-start xl:items-center">
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Cari kegiatan ${entityType}...`}
                                className="pl-10 h-10 bg-background border-input focus-visible:ring-orange-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="relative w-full sm:w-48">
                            <Input
                                type="month"
                                className="h-10 bg-background border-input focus-visible:ring-orange-500 cursor-pointer"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                title="Filter berdasarkan bulan"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => setShowForm(true)}
                        className="w-full xl:w-auto h-10 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Tambah Kegiatan
                    </Button>
                </div>

                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b bg-muted/40 text-xs font-bold text-muted-foreground uppercase tracking-wider items-center">
                    <div className="col-span-1 text-center">No</div>
                    <div className="col-span-4">Informasi Kegiatan</div>
                    <div className="col-span-1 text-center flex justify-center">Urutan</div>
                    <div className="col-span-3">Jadwal & Lokasi</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-end">Aksi</div>
                </div>

                {loading ? (
                    <div className="divide-y divide-border/60 bg-background">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-800" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800" />
                                        <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                            <Search className="w-8 h-8 text-orange-600/50" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Tidak ditemukan</h3>
                        <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                            Tidak ada kegiatan yang cocok dengan filter yang Anda pilih.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {paginated.map((activity, index) => (
                            <div
                                key={activity.id}
                                className="group relative transition-all duration-200 bg-background hover:bg-muted/30"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center">
                                    <div className="col-span-1 text-center">
                                        <span className="text-sm font-mono text-muted-foreground font-medium">
                                            {getRowNumber(index)}
                                        </span>
                                    </div>
                                    <div className="col-span-4 pr-4">
                                        <p className="text-base font-semibold text-foreground mb-1 group-hover:text-orange-600 transition-colors">
                                            {activity.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                            {activity.description}
                                        </p>
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <Badge variant="secondary" className="font-mono font-normal">
                                            {(activity as any).order_index ?? "-"}
                                        </Badge>
                                    </div>
                                    <div className="col-span-3 space-y-2">
                                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 text-orange-600/80 shrink-0" />
                                            <span className="truncate">{activity.time_info}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 text-orange-600/80 shrink-0" />
                                            <span className="truncate">{activity.location}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <StatusBadge isActive={activity.is_active} />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <ActionMenu
                                            onEdit={() => setEditingId(activity.id)}
                                            onDelete={() => handleDelete(activity.id)}
                                        />
                                    </div>
                                </div>

                                <div className="flex md:hidden flex-col p-5 space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/60">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs text-muted-foreground h-6 px-2">
                                                No. {getRowNumber(index)}
                                            </Badge>
                                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 hover:bg-orange-100 border-orange-200 h-6 px-2 gap-1.5 text-[10px] uppercase tracking-wider">
                                                <LayoutList className="w-3 h-3" /> Urutan: {(activity as any).order_index ?? "-"}
                                            </Badge>
                                        </div>
                                        <ActionMenu
                                            onEdit={() => setEditingId(activity.id)}
                                            onDelete={() => handleDelete(activity.id)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-3">
                                            <h3 className="text-base font-semibold text-foreground leading-tight group-hover:text-orange-600 transition-colors">
                                                {activity.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {activity.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2 bg-muted/20 p-3 rounded-lg border border-border/40">
                                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                                            <span className="text-xs">{activity.time_info}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                                            <span className="text-xs">{activity.location}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/40">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</span>
                                            <StatusBadge isActive={activity.is_active} compact />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

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
        </div>
    )
}

function StatusBadge({ isActive, compact = false }: { isActive: boolean, compact?: boolean }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Badge
                        variant="outline"
                        className={`
                            font-medium border cursor-help select-none
                            ${compact ? "px-2 py-0 text-[10px] h-5" : "px-3 py-1 text-xs"}
                            ${isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"}
                        `}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-foreground text-background text-xs max-w-[200px] text-center p-3 shadow-xl border-none">
                    <div className="flex flex-col items-center gap-1">
                        <div className="font-semibold flex items-center gap-1.5">
                            {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {isActive ? "Ditampilkan" : "Disembunyikan"}
                        </div>
                        <p className="font-normal opacity-90">
                            {isActive
                                ? "Kegiatan TAMPIL di website pengunjung."
                                : "Kegiatan TIDAK MUNCUL di website (Draft)."}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function ActionMenu({ onEdit, onDelete }: { onEdit: () => void, onDelete: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-600">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 shadow-lg border-border/60">
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer focus:bg-orange-50 focus:text-orange-700">
                    <Edit2 className="mr-2 h-3.5 w-3.5" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 mt-1">
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    <span>Hapus</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}