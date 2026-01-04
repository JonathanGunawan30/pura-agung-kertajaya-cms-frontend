"use client"

import { useState, useEffect } from "react"
import type { Category } from "@/lib/types"
import { categoriesApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Edit2,
    Trash2,
    Plus,
    Search,
    Tags,
    MoreHorizontal
} from "lucide-react"
import { CategoryForm } from "./category-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CategoriesList() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const data = await categoriesApi.getAll()
            setCategories(data || [])
        } catch (error) {
            console.error("Failed to fetch categories")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleDelete = async (id: string) => {
        const result = await showConfirmAlert(
            "Hapus Kategori",
            "Yakin hapus? Artikel yang menggunakan kategori ini mungkin akan kehilangan referensinya."
        )
        if (!result.isConfirmed) return

        try {
            await categoriesApi.delete(id)
            setCategories(prev => prev.filter(c => c.id !== id))
            await showSuccessAlert("Terhapus!", "Kategori berhasil dihapus.")
        } catch (error) {
            await showErrorAlert("Error", "Gagal menghapus kategori.")
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchCategories()
    }

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (showForm || editingId) {
        return <CategoryForm categoryId={editingId || undefined} onClose={handleFormClose} />
    }

    return (
        <div className="space-y-6 w-full">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-5 bg-background/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari kategori..."
                            className="pl-10 focus-visible:ring-orange-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Tambah Kategori
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[50px] text-center">No</TableHead>
                            <TableHead className="w-[40%]">Nama Kategori</TableHead>
                            <TableHead className="w-[40%]">Slug</TableHead>
                            <TableHead className="w-[100px] text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell className="text-center">
                                        <Skeleton className="h-4 w-4 mx-auto bg-gray-200 dark:bg-gray-800" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-48 bg-gray-200 dark:bg-gray-800" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-800" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end pr-2">
                                            <Skeleton className="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-800" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                                            <Tags className="w-8 h-8 opacity-50" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground">Tidak ditemukan</p>
                                            <p className="text-sm">Belum ada kategori yang dibuat.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((cat, i) => (
                                <TableRow key={cat.id} className="group hover:bg-muted/5 transition-colors">
                                    <TableCell className="text-center text-muted-foreground text-sm font-medium">{i + 1}</TableCell>
                                    <TableCell className="font-semibold text-foreground">{cat.name}</TableCell>
                                    <TableCell>
                                        <code className="px-2 py-1 rounded bg-muted text-xs text-muted-foreground font-mono">
                                            {cat.slug}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuItem onClick={() => setEditingId(cat.id)} className="cursor-pointer">
                                                    <Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Hapus</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}