"use client"

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react"
import { articlesApi, categoriesApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { validateFile, validateRequired } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import type { Category } from "@/lib/types"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

import {
    ArrowLeft,
    Save,
    LayoutList,
    Type,
    Edit2 as EditIcon,
    Image as ImageIcon,
    UploadCloud,
    User,
    FileText,
    Info
} from "lucide-react"

interface ArticleFormProps {
    articleId?: string
    onClose: () => void
}

const fixImagePaths = (html: string, baseUrl: string): string => {
    return html.replace(
        /src="uploads\//g,
        `src="${baseUrl}uploads/`
    )
}

export function ArticlesForm({ articleId, onClose }: ArticleFormProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const [formData, setFormData] = useState({
        category_id: "",
        title: "",
        author_name: "",
        author_role: "",
        excerpt: "",
        content: "",
        status: "PUBLISHED",
        is_featured: false,
        published_at: "",
        images: null as any,
    })

    const isEditMode = !!articleId

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const cats = await categoriesApi.getAll()
                setCategories(cats || [])

                if (isEditMode) {
                    const data = await articlesApi.getById(articleId!)
                    const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""
                    const fixedContent = fixImagePaths(data.content || "", baseUrl)

                    let formattedDate = ""
                    if (data.published_at) {
                        const dateObj = new Date(data.published_at);
                        const tzoffset = dateObj.getTimezoneOffset() * 60000;
                        formattedDate = new Date(dateObj.getTime() - tzoffset).toISOString().slice(0, 16);
                    }

                    setFormData({
                        category_id: data.category?.id ? String(data.category.id) : "",
                        title: data.title || "",
                        author_name: data.author_name || "",
                        author_role: data.author_role || "",
                        excerpt: data.excerpt || "",
                        content: fixedContent,
                        status: (data.status || "PUBLISHED").toUpperCase(),
                        is_featured: !!data.is_featured,
                        published_at: formattedDate,
                        images: data.images,
                    })

                    if (data.images) {
                        const url = data.images.fhd || data.images.lg || data.images.md || Object.values(data.images)[0]
                        if (typeof url === 'string') setPreviewUrl(url)
                    }
                } else {
                    const now = new Date();
                    const tzoffset = now.getTimezoneOffset() * 60000;
                    const localISOTime = new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);

                    setFormData(prev => ({
                        ...prev,
                        published_at: localISOTime
                    }))
                }
            } catch (err) {
                console.error(err)
                setError("Gagal memuat data.")
            }
        }
        loadInitialData()
    }, [articleId, isEditMode])

    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const fileError = validateFile(file, "Image", 10)
        if (fileError) {
            setError(fileError.message)
            return
        }
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setError("")
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.title) {
            setError("Judul wajib diisi")
            return
        }

        setLoading(true)
        try {
            let finalImages = formData.images || {}

            if (selectedFile) {
                const uploadResponse = await storageApi.upload(selectedFile)
                const backendVariants = uploadResponse.variants
                const fullUrlImages: Record<string, string> = {}
                const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""

                Object.keys(backendVariants).forEach((key) => {
                    const path = backendVariants[key]
                    const cleanPath = path.startsWith("/") ? path.substring(1) : path
                    fullUrlImages[key] = `${baseUrl}${cleanPath}`
                })
                finalImages = fullUrlImages
            }

            const payload = {
                ...formData,
                category_id: formData.category_id,
                status: formData.status.toUpperCase(),
                published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
                images: finalImages,
            }

            if (isEditMode) {
                await articlesApi.update(articleId!, payload)
                await showSuccessAlert("Berhasil Diupdate!", "Artikel berhasil diperbarui.")
            } else {
                await articlesApi.create(payload)
                await showSuccessAlert("Berhasil Ditambah!", "Artikel baru berhasil disimpan.")
            }
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan artikel")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onClose} className="group pl-0 hover:bg-transparent text-muted-foreground hover:text-orange-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Kembali ke Daftar
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="bg-muted/30 border-b p-6 flex items-start gap-4">
                    <div className="p-2.5 rounded-lg border bg-orange-50 text-orange-600 border-orange-100 shadow-sm">
                        <FileText className="w-5 h-5"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground leading-tight">
                            {isEditMode ? "Edit Artikel" : "Tambah Artikel Baru"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola konten berita dan informasi untuk ditampilkan di website.
                        </p>
                    </div>
                </div>

                <CardContent className="pt-8 pb-8 px-6 md:px-8 bg-card">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium">{error}</div>}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4"/> Gambar Utama
                                    </h3>
                                    <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/5 p-6 transition-colors hover:bg-muted/10 hover:border-orange-500/50">
                                        {previewUrl ? (
                                            <div className="relative group">
                                                <img src={previewUrl} alt="Preview" className="w-full h-48 object-contain rounded-lg bg-black/5" />
                                                <div className="absolute top-2 right-2">
                                                    <label className="cursor-pointer bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md border hover:text-orange-600 transition-colors block">
                                                        <EditIcon className="w-4 h-4" />
                                                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                                                <div className="bg-orange-50 p-4 rounded-full mb-3 text-orange-600">
                                                    <UploadCloud className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm font-medium">Klik untuk upload foto</p>
                                                <p className="text-xs text-muted-foreground mt-1">Maksimal 10MB</p>
                                                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 bg-muted/20 rounded-lg border space-y-5">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                        <LayoutList className="w-4 h-4"/> Pengaturan
                                    </h3>
                                    <div className="space-y-2">
                                        <Label>Kategori</Label>
                                        <Select
                                            key={`cat-${formData.category_id}`}
                                            value={formData.category_id}
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
                                        >
                                            <SelectTrigger className="bg-background"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status Publikasi</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                                        >
                                            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PUBLISHED">PUBLISHED (Tampil)</SelectItem>
                                                <SelectItem value="DRAFT">DRAFT (Sembunyi)</SelectItem>
                                                <SelectItem value="ARCHIVED">ARCHIVED (Arsip)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[11px] text-muted-foreground leading-tight italic">* Pilih <b>Published</b> agar artikel langsung terlihat oleh publik.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tanggal Publish</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.published_at}
                                            onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
                                            className="bg-background"
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2 border-t border-dashed border-orange-200">
                                        <div className="flex items-center justify-between">
                                            <Label className="cursor-pointer font-bold">Featured Article?</Label>
                                            <Switch
                                                checked={formData.is_featured}
                                                onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_featured: c }))}
                                                className="data-[state=checked]:bg-orange-600"
                                            />
                                        </div>
                                        <div className="flex gap-2 text-[11px] text-muted-foreground leading-snug bg-orange-50/50 p-2 rounded border border-orange-100">
                                            <Info className="w-3 h-3 shrink-0 text-orange-500 mt-0.5" />
                                            <span>Aktifkan ini agar artikel muncul di <b>Highlight Utama</b> halaman depan.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <Type className="w-4 h-4"/> Konten Artikel
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Judul Artikel <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Tuliskan judul artikel yang menarik..."
                                            className="font-bold text-lg bg-background focus-visible:ring-orange-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nama Penulis</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    value={formData.author_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                                                    placeholder="Nama Lengkap"
                                                    className="pl-9 bg-background"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Jabatan Penulis</Label>
                                            <Input
                                                value={formData.author_role}
                                                onChange={(e) => setFormData(prev => ({ ...prev, author_role: e.target.value }))}
                                                placeholder="Misal: Ketua Pura, Admin, Humas"
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ringkasan Singkat (Excerpt)</Label>
                                        <Textarea
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                            placeholder="Ringkasan pendek yang muncul di halaman daftar berita..."
                                            className="min-h-[80px] bg-background focus-visible:ring-orange-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Isi Konten Lengkap</Label>
                                        <RichTextEditor
                                            value={formData.content}
                                            onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                                            placeholder="Tuliskan isi artikel Anda secara lengkap..."
                                        />
                                        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md border border-dashed">
                                            <p className="text-[11px] text-muted-foreground">
                                                💡 <strong>Tips:</strong> Gunakan <b>Enter</b> untuk paragraf baru. Gunakan ikon <b>Gambar</b> untuk menyisipkan foto.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 pb-6 border-t">
                            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6">Batal</Button>
                            <Button type="submit" disabled={loading} className="h-10 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-lg min-w-[150px]">
                                {loading ? "Memproses..." : <><Save className="w-4 h-4 mr-2" /> Simpan Artikel</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </div>
    )
}