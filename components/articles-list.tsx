"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Article, Category } from "@/lib/types"
import { articlesApi, categoriesApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Edit2,
    Trash2,
    Plus,
    Search,
    MoreHorizontal,
    Image as ImageIcon,
    FileText,
    Calendar,
    User,
    Star,
    Eye,
    EyeOff,
    FilterX
} from "lucide-react"
import { ArticlesForm } from "./articles-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function ArticlesList() {
    const [articles, setArticles] = useState<Article[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)

    const [searchQuery, setSearchQuery] = useState("")
    const [filterCategory, setFilterCategory] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterFeatured, setFilterFeatured] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [page, setPage] = useState(1)

    const limit = 6

    const fetchData = async () => {
        try {
            setLoading(true)
            const [articlesData, categoriesData] = await Promise.all([
                articlesApi.getAll(),
                categoriesApi.getAll()
            ])
            setArticles(articlesData || [])
            setCategories(categoriesData || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        setPage(1)
    }, [searchQuery, filterCategory, filterStatus, filterFeatured, startDate, endDate])

    const handleDelete = async (id: string, images: any) => {
        const result = await showConfirmAlert(
            "Hapus Artikel",
            "Apakah Anda yakin? Data yang dihapus tidak dapat dikembalikan."
        )
        if (!result.isConfirmed) return

        try {
            if (images && typeof images === 'object') {
                const urls = Object.values(images) as string[]
                await Promise.all(urls.map(async (url) => {
                    if (typeof url === 'string') {
                        const key = url.split("/").pop()
                        if (key) await storageApi.delete(`uploads/${key}`)
                    }
                }))
            }

            await articlesApi.delete(id)
            setArticles((prev) => prev.filter((a) => a.id !== id))
            await showSuccessAlert("Terhapus!", "Artikel berhasil dihapus.")
        } catch (error) {
            await showErrorAlert("Error", "Gagal menghapus artikel")
        }
    }

    const resetFilters = () => {
        setSearchQuery("")
        setFilterCategory("all")
        setFilterStatus("all")
        setFilterFeatured("all")
        setStartDate("")
        setEndDate("")
    }

    const filteredArticles = articles.filter((article) => {
        const matchesSearch =
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.author_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory =
            filterCategory === "all" || article.category?.id === filterCategory

        const matchesStatus =
            filterStatus === "all" || article.status === filterStatus

        const matchesFeatured =
            filterFeatured === "all" ||
            (filterFeatured === "yes" && article.is_featured) ||
            (filterFeatured === "no" && !article.is_featured)

        let matchesDate = true
        if (startDate && article.published_at) {
            matchesDate = matchesDate && new Date(article.published_at) >= new Date(startDate)
        }
        if (endDate && article.published_at) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            matchesDate = matchesDate && new Date(article.published_at) <= end
        }

        return matchesSearch && matchesCategory && matchesStatus && matchesFeatured && matchesDate
    })

    const startIdx = (page - 1) * limit
    const paginated = filteredArticles.slice(startIdx, startIdx + limit)
    const totalPages = Math.ceil(filteredArticles.length / limit)

    if (showForm || editingId) {
        return <ArticlesForm articleId={editingId || undefined} onClose={() => {
            setShowForm(false)
            setEditingId(null)
            fetchData()
        }} />
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4 items-end">
                    <div className="relative flex-1 w-full">
                        <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1.5 block">Cari Artikel</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Ketik judul atau penulis..."
                                className="pl-10 focus-visible:ring-orange-500 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="w-full lg:w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all h-10 px-6">
                        <Plus className="w-5 h-5 mr-2" /> Tambah Artikel Baru
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-dashed">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-muted-foreground block">Kategori</label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="bg-background focus:ring-orange-500 h-9">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-muted-foreground block">Status</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="bg-background focus:ring-orange-500 h-9">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                                <SelectItem value="DRAFT">DRAFT</SelectItem>
                                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-muted-foreground block">Featured</label>
                        <Select value={filterFeatured} onValueChange={setFilterFeatured}>
                            <SelectTrigger className="bg-background focus:ring-orange-500 h-9">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="yes">Unggulan</SelectItem>
                                <SelectItem value="no">Biasa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-muted-foreground block">Rentang Tanggal</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                className="bg-background focus-visible:ring-orange-500 h-9 text-[12px] px-2"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-muted-foreground text-xs">s/d</span>
                            <Input
                                type="date"
                                className="bg-background focus-visible:ring-orange-500 h-9 text-[12px] px-2"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="w-full h-9 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200 transition-all border-dashed"
                        >
                            <FilterX className="w-4 h-4 mr-2" /> Reset Filter
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-xl border bg-card shadow-sm h-[420px] p-0 overflow-hidden flex flex-col">
                            <Skeleton className="h-48 w-full bg-gray-200" />
                            <div className="p-5 space-y-4 flex-1">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20 bg-gray-200" />
                                    <Skeleton className="h-6 w-full bg-gray-200" />
                                    <Skeleton className="h-6 w-2/3 bg-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-full bg-gray-100" />
                                    <Skeleton className="h-3 w-full bg-gray-100" />
                                    <Skeleton className="h-3 w-4/5 bg-gray-100" />
                                </div>
                                <div className="pt-4 border-t flex justify-between">
                                    <Skeleton className="h-4 w-24 bg-gray-100" />
                                    <Skeleton className="h-4 w-24 bg-gray-100" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="rounded-xl border bg-card py-24 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Tidak ditemukan</h3>
                    <p className="text-muted-foreground">Tidak ada artikel yang sesuai dengan kriteria filter Anda.</p>
                    <Button variant="link" onClick={resetFilters} className="text-orange-600">Tampilkan Semua</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.map((article) => {
                        const images = article.images as any
                        const thumbnail = images?.md || images?.lg || Object.values(images || {})[0]

                        return (
                            <div key={article.id} className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
                                <div className="relative h-48 w-full bg-muted border-b">
                                    {thumbnail ? (
                                        <Image
                                            src={thumbnail as string}
                                            alt={article.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <ImageIcon className="w-10 h-10 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'} className={article.status === 'PUBLISHED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                                            {article.status === 'PUBLISHED' ? <Eye className="w-3 h-3 mr-1"/> : <EyeOff className="w-3 h-3 mr-1"/>}
                                            {article.status}
                                        </Badge>
                                        {article.is_featured && (
                                            <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                                                <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-orange-600 border-orange-200 bg-orange-50">
                                                {article.category?.name || "Tanpa Kategori"}
                                            </Badge>
                                            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
                                                {article.title}
                                            </h3>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingId(article.id)}>
                                                    <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Artikel
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(article.id, article.images)} className="text-red-600 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus Artikel
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {article.excerpt || "Tidak ada ringkasan."}
                                    </p>

                                    <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3 h-3 text-orange-500" />
                                            <span className="font-medium truncate max-w-[100px]">{article.author_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-orange-500" />
                                            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "Draft"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 1}
                    >
                        Sebelumnya
                    </Button>
                    <div className="text-xs font-medium px-4">Halaman {page} dari {totalPages}</div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page === totalPages}
                    >
                        Selanjutnya
                    </Button>
                </div>
            )}
        </div>
    )
}