"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { OrganizationMember, EntityType } from "@/lib/types"
import { organizationMembersApi } from "@/lib/api-client"
import { useAuth } from "@/app/auth-context"
import { validateEntityType, getAllowedEntityTypes, isSuperUser } from "@/lib/role-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Edit2,
    Trash2,
    Plus,
    Search,
    User,
    Users,
    Eye,
    EyeOff,
    MoreHorizontal,
    Layers,
    ListOrdered,
    Filter,
    XCircle,
    Building2,
} from "lucide-react"
import { OrganizationMemberForm } from "./organization-member-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function OrganizationMembersList() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()

    const queryType = searchParams.get("type") as EntityType | null
    const validatedType = validateEntityType(user, queryType)

    const [entityType, setEntityType] = useState<EntityType>(validatedType)
    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)

    const [selectedPositions, setSelectedPositions] = useState<string[]>([])

    const limit = 10

    useEffect(() => {
        const validType = validateEntityType(user, queryType)
        setEntityType(validType)
        if (queryType && validType !== queryType) {
            router.replace(`?type=${validType}`, { scroll: false })
        }
    }, [queryType, user])

    const fetchMembers = async () => {
        try {
            setLoading(true)
            const data = await organizationMembersApi.getAll(entityType)
            setMembers(data || [])
        } catch (error) {
            console.error("Failed to fetch members:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMembers()
    }, [entityType])

    const handleTabChange = (type: EntityType) => {
        const validType = validateEntityType(user, type)
        setEntityType(validType)
        router.push(`?type=${validType}`, { scroll: false })
        setSelectedPositions([])
        setPage(1)
    }

    const handleDelete = async (id: string) => {
        const result = await showConfirmAlert(
            "Hapus Anggota",
            "Apakah Anda yakin? Data ini akan dihapus permanen."
        )
        if (!result.isConfirmed) return

        try {
            await organizationMembersApi.delete(id)
            setMembers((prev) => prev.filter((m) => m.id !== id))
            await showSuccessAlert("Terhapus", "Anggota berhasil dihapus.")
        } catch {
            await showErrorAlert("Error", "Gagal menghapus anggota.")
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchMembers()
    }

    const uniquePositions = useMemo(() => {
        const positions = Array.from(new Set(members.map(m => m.position).filter(Boolean)))
        return positions.sort()
    }, [members])

    const sortedMembers = useMemo(() => {
        return [...members].sort((a, b) => {
            const aPosOrder = (a as any).position_order ?? 9999
            const bPosOrder = (b as any).position_order ?? 9999
            if (aPosOrder !== bPosOrder) return aPosOrder - bPosOrder

            const aOrder = a.order_index ?? 9999
            const bOrder = b.order_index ?? 9999
            if (aOrder !== bOrder) return aOrder - bOrder

            return (a.name || "").localeCompare(b.name || "")
        })
    }, [members])

    const filteredMembers = useMemo(() => {
        const term = searchQuery.trim().toLowerCase()

        return sortedMembers.filter((m) => {
            const matchesSearch =
                (m.name && m.name.toLowerCase().includes(term)) ||
                (m.position && m.position.toLowerCase().includes(term))
            const matchesPosition = selectedPositions.length === 0 || selectedPositions.includes(m.position)

            return matchesSearch && matchesPosition
        })
    }, [sortedMembers, searchQuery, selectedPositions])

    const togglePositionFilter = (position: string) => {
        setSelectedPositions(prev =>
            prev.includes(position)
                ? prev.filter(p => p !== position)
                : [...prev, position]
        )
        setPage(1)
    }

    useEffect(() => {
        setPage(1)
    }, [searchQuery])

    const startIdx = (page - 1) * limit
    const paginated = filteredMembers.slice(startIdx, startIdx + limit)
    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / limit))

    if (showForm || editingId) {
        return <OrganizationMemberForm memberId={editingId || undefined} entityType={entityType} onClose={handleFormClose} />
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
                <div className="p-5 bg-background/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between gap-4 items-center">

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Cari anggota ${entityType}...`}
                                className="pl-10 h-10 bg-background border-input focus-visible:ring-orange-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`h-10 px-3 gap-2 ${selectedPositions.length > 0 ? "border-orange-500 text-orange-600 bg-orange-50" : "border-dashed"}`}
                                >
                                    <Filter className="w-4 h-4" />
                                    <span className="hidden sm:inline">Filter</span>
                                    {selectedPositions.length > 0 && (
                                        <Badge variant="secondary" className="h-5 px-1.5 bg-orange-200 text-orange-800 hover:bg-orange-200">
                                            {selectedPositions.length}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Filter Jabatan</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {uniquePositions.length === 0 ? (
                                    <div className="p-2 text-xs text-muted-foreground text-center">
                                        Belum ada data jabatan
                                    </div>
                                ) : (
                                    uniquePositions.map((pos) => (
                                        <DropdownMenuCheckboxItem
                                            key={pos}
                                            checked={selectedPositions.includes(pos)}
                                            onCheckedChange={() => togglePositionFilter(pos)}
                                            className="cursor-pointer"
                                        >
                                            {pos}
                                        </DropdownMenuCheckboxItem>
                                    ))
                                )}
                                {selectedPositions.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onSelect={() => setSelectedPositions([])}
                                            className="justify-center text-red-600 focus:text-red-700 cursor-pointer"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> Reset Filter
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto h-10 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Tambah Anggota
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl border bg-card flex gap-4 items-center">
                            <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800" />
                                <Skeleton className="h-3 w-1/4 bg-gray-200 dark:bg-gray-800" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : paginated.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground flex flex-col items-center">
                    <Users className="w-12 h-12 text-muted-foreground/20 mb-4" />
                    <p>Tidak ada data anggota untuk <strong>{entityType}</strong>.</p>
                    {selectedPositions.length > 0 && (
                        <Button
                            variant="link"
                            onClick={() => setSelectedPositions([])}
                            className="mt-2 text-orange-600"
                        >
                            Reset Filter Jabatan
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                    <tr>
                                        <th className="px-6 py-4 w-[60px] text-center">No</th>
                                        <th className="px-6 py-4">Nama Anggota</th>
                                        <th className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                Jabatan
                                                {selectedPositions.length > 0 && <Filter className="w-3 h-3 text-orange-600" />}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-center">Level</th>
                                        <th className="px-6 py-4 text-center">Urutan</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {paginated.map((member, idx) => (
                                        <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-center text-muted-foreground font-mono text-xs">
                                                {startIdx + idx + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200 shrink-0">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-foreground">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedPositions.includes(member.position) ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                                    {member.position}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-xs text-muted-foreground">{member.position_order}</td>
                                            <td className="px-6 py-4 text-center font-mono text-xs text-muted-foreground">{member.order_index}</td>
                                            <td className="px-6 py-4 text-center"><StatusBadge isActive={member.is_active} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <ActionMenu onEdit={() => setEditingId(member.id)} onDelete={() => handleDelete(member.id)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {paginated.map((member, idx) => (
                            <div key={member.id} className="bg-card border rounded-xl shadow-sm p-4 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground text-sm line-clamp-1">{member.name}</h4>
                                            <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${selectedPositions.includes(member.position) ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                                {member.position}
                                            </div>
                                        </div>
                                    </div>

                                    <ActionMenu onEdit={() => setEditingId(member.id)} onDelete={() => handleDelete(member.id)} />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-muted/30 border rounded-lg p-2 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                            <Layers className="w-3 h-3" /> Level
                                        </span>
                                        <span className="text-sm font-bold text-foreground">{member.position_order}</span>
                                    </div>
                                    <div className="bg-muted/30 border rounded-lg p-2 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                            <ListOrdered className="w-3 h-3" /> Urut
                                        </span>
                                        <span className="text-sm font-bold text-foreground">{member.order_index}</span>
                                    </div>
                                    <div className="bg-muted/30 border rounded-lg p-2 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] text-muted-foreground uppercase mb-1">Status</span>
                                        <StatusBadge isActive={member.is_active} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
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
        </div>
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
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border cursor-help ${isActive ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                        {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    {isActive ? "Aktif (Tampil)" : "Tidak Aktif (Disembunyikan)"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}