"use client"

import { useState, useEffect, useMemo } from "react"
import type { OrganizationMember } from "@/lib/types"
import { organizationMembersApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Plus, Search } from "lucide-react"
import { OrganizationMemberForm } from "./organization-member-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"
import { Input } from "@/components/ui/input"

export function OrganizationMembersList() {
    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)

    const [page, setPage] = useState(1)
    const limit = 10

    const [search, setSearch] = useState("")

    const fetchMembers = async () => {
        try {
            setLoading(true)
            const data = await organizationMembersApi.getAll()
            setMembers(data || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMembers()
    }, [])

    const handleDelete = async (id: string) => {
        const result = await showConfirmAlert("Delete Member", "Are you sure?")
        if (!result.isConfirmed) return

        try {
            await organizationMembersApi.delete(id)
            setMembers((prev) => prev.filter((m) => m.id !== id))
            await showSuccessAlert("Success", "Member deleted.")
        } catch {
            await showErrorAlert("Error", "Failed to delete member.")
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchMembers()
    }

    const sortedMembers = useMemo(() => {
        return [...members].sort((a, b) => {
            const aPosOrder = (a as any).position_order ?? Number.MAX_SAFE_INTEGER
            const bPosOrder = (b as any).position_order ?? Number.MAX_SAFE_INTEGER
            if (aPosOrder !== bPosOrder) return aPosOrder - bPosOrder

            const aOrder = a.order_index ?? Number.MAX_SAFE_INTEGER
            const bOrder = b.order_index ?? Number.MAX_SAFE_INTEGER
            if (aOrder !== bOrder) return aOrder - bOrder

            const posCompare =
                (a.position || "").localeCompare(b.position || "", undefined, { sensitivity: "base" })
            if (posCompare !== 0) return posCompare

            return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
        })
    }, [members])

    const filteredMembers = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return sortedMembers
        return sortedMembers.filter(
            (m) =>
                (m.name && m.name.toLowerCase().includes(term)) ||
                (m.position && m.position.toLowerCase().includes(term))
        )
    }, [sortedMembers, search])

    useEffect(() => {
        setPage(1)
    }, [search])

    const startIdx = (page - 1) * limit
    const paginated = filteredMembers.slice(startIdx, startIdx + limit)
    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / limit))

    if (showForm || editingId) {
        return (
            <OrganizationMemberForm
                memberId={editingId || undefined}
                onClose={handleFormClose}
            />
        )
    }

    if (loading) {
        return <p className="text-center py-8 text-muted-foreground">Loading...</p>
    }

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Organization Members</h2>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </Button>
            </div>

            <div className="w-full md:w-80">
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or position..."
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border/50">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium text-foreground">No</th>
                        <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-foreground">Position</th>
                        <th className="px-4 py-3 text-left font-medium text-foreground">Position Order</th>
                        <th className="px-4 py-3 text-left font-medium text-foreground">Order Index</th>
                        <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                        <th className="px-4 py-3 text-right font-medium text-foreground">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>
                                No results{search ? ` for "${search}"` : ""}.
                            </td>
                        </tr>
                    ) : (
                        paginated.map((member, idx) => (
                            <tr key={member.id} className="border-b border-border/30">
                                <td className="px-4 py-3">{startIdx + idx + 1}</td>
                                <td className="px-4 py-3">{member.name}</td>
                                <td className="px-4 py-3 text-accent">{member.position}</td>

                                <td className="px-4 py-3">{member.position_order}</td>

                                <td className="px-4 py-3">{member.order_index}</td>

                                <td className="px-4 py-3">
                            <span
                                className={`text-xs px-2 py-1 rounded ${
                                    member.is_active
                                        ? "bg-green-500/20 text-green-700"
                                        : "bg-gray-500/20 text-gray-700"
                                }`}
                            >
                                {member.is_active ? "Active" : "Inactive"}
                            </span>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingId(member.id)}
                                            className="border-border/50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(member.id)}
                                            className="border-border/50 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>


            <div className="flex justify-center gap-3 pt-4">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Previous
                </Button>

                <span className="px-3 py-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
