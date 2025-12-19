"use client"

import { useState, useEffect } from "react"
import type { SiteIdentity } from "@/lib/types"
import { siteIdentityApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
    Edit2,
    Trash2,
    Plus,
    Globe,
    LayoutTemplate,
    MousePointerClick,
    ImageIcon,
    ArrowRight
} from "lucide-react"
import { SiteIdentityForm } from "./site-identity-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"
import { Skeleton } from "@/components/ui/skeleton"

export function SiteIdentityList() {
    const [items, setItems] = useState<SiteIdentity[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)

    const fetchItems = async () => {
        try {
            setLoading(true)
            const data = await siteIdentityApi.getAll()
            setItems(data || [])
        } catch (error) {
            console.error("Failed to fetch site identity:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleDelete = async (id: string, logoUrl?: string) => {
        const result = await showConfirmAlert(
            "Reset Identitas?",
            "Apakah Anda yakin? Data branding website akan dihapus."
        )

        if (!result.isConfirmed) return

        try {
            if (logoUrl) {
                const key = logoUrl.split("/").pop()
                if (key) await storageApi.delete(`uploads/${key}`)
            }

            await siteIdentityApi.delete(id)
            setItems(items.filter((i) => i.id !== id))
            await showSuccessAlert("Terhapus", "Identitas website berhasil di-reset.")
        } catch (error) {
            console.error("Failed to delete site identity:", error)
            const msg = error instanceof Error ? error.message : "Gagal menghapus data"
            await showErrorAlert("Error", msg)
        }
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingId(null)
        fetchItems()
    }

    if (showForm || editingId) {
        return <SiteIdentityForm itemId={editingId || undefined} onClose={handleFormClose} />
    }

    return (
        <div className="space-y-6">

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-5 bg-background/50 backdrop-blur-sm flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium">Identitas & Branding Website</span>
                    </div>

                    {items.length === 0 && !loading && (
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Atur Identitas
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border bg-card shadow-sm p-6 space-y-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-800" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800" />
                            <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-800" />
                    </div>
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                        <LayoutTemplate className="w-8 h-8 text-orange-600/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Identitas belum dikonfigurasi</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                        Tambahkan Logo, Nama Website, dan Tagline agar website terlihat profesional.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="group rounded-xl border bg-card shadow-sm overflow-hidden"
                        >
                            <div className="p-6 border-b bg-muted/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <LayoutTemplate className="w-5 h-5 text-orange-600" /> Konfigurasi Utama
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Pengaturan ini mempengaruhi tampilan Header dan Hero Section website.
                                    </p>
                                </div>

                                <div className="flex gap-2 self-end sm:self-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingId(item.id)}
                                        className="h-9 border-border/50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(item.id, item.logo_url)}
                                        className="h-9 border-border/50 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Reset
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                                <div className="space-y-6">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b pb-2">
                                        Branding
                                    </h4>

                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        <div className="shrink-0 p-1 border rounded-xl bg-white shadow-sm">
                                            {item.logo_url ? (
                                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-[url('https://ui.shadcn.com/pattern.svg')] bg-center bg-repeat relative flex items-center justify-center">
                                                    <img
                                                        src={item.logo_url}
                                                        alt={item.site_name}
                                                        className="max-w-full max-h-full object-contain p-2"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 flex-1 pt-1">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase">Nama Website</p>
                                                <p className="text-xl font-bold text-foreground leading-tight">
                                                    {item.site_name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase">Tagline / Slogan</p>
                                                <p className="text-sm font-medium text-muted-foreground/80 italic">
                                                    "{item.tagline}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b pb-2 flex items-center gap-2">
                                        <MousePointerClick className="w-3.5 h-3.5" /> Preview Tombol (Hero Section)
                                    </h4>

                                    <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-800 bg-gray-900 min-h-[220px] flex items-center justify-center">

                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50 z-0"></div>

                                        <div className="absolute inset-0 bg-[url('https://ui.shadcn.com/pattern.svg')] opacity-10 z-0"></div>

                                        <div className="relative z-10 p-8 flex flex-col items-center justify-center gap-6 text-center w-full">

                                            <div className="space-y-3 max-w-lg mx-auto">
                                                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                                                    {item.site_name || "Nama Website"}
                                                </h3>

                                                <p className="text-sm md:text-base text-gray-200 leading-relaxed font-light">
                                                    {item.tagline || "Tagline website Anda akan muncul di sini dengan warna putih."}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-4 justify-center mt-2">
                                                <div className="px-6 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 cursor-default hover:bg-orange-700 transition-colors">
                                                    {item.primary_button_text || "Pelajari Lebih Lanjut"}
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>

                                                <div className="px-6 py-2.5 bg-transparent border border-white text-white text-sm font-medium rounded-full cursor-default hover:bg-white/10 transition-colors">
                                                    {item.secondary_button_text || "Lihat Gallery"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground italic text-center">
                                        *Tampilan ini hanya simulasi. Hasil akhir akan menyesuaikan dengan gambar background di website.
                                    </p>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}