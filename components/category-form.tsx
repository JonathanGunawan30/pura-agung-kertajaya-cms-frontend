"use client"

import { useState, useEffect, type FormEvent } from "react"
import { categoriesApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { validateRequired } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import { ArrowLeft, Save, Tags, Edit2 } from "lucide-react"

interface CategoryFormProps {
    categoryId?: string
    onClose: () => void
}

export function CategoryForm({ categoryId, onClose }: CategoryFormProps) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!categoryId

    useEffect(() => {
        if (isEditMode) {
            const fetchCategory = async () => {
                try {
                    const data = await categoriesApi.getById(categoryId)
                    setName(data.name)
                } catch (err) {
                    console.error(err)
                    setError("Gagal memuat data kategori.")
                }
            }
            fetchCategory()
        }
    }, [categoryId, isEditMode])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")

        const validationError = validateRequired(name, "Nama Kategori")
        if (validationError) {
            setError(validationError.message)
            return
        }

        setLoading(true)
        try {
            const payload = { name }

            if (isEditMode) {
                await categoriesApi.update(categoryId!, payload)
                await showSuccessAlert("Berhasil Diupdate!", "Kategori berhasil diperbarui.")
            } else {
                await categoriesApi.create(payload)
                await showSuccessAlert("Berhasil Ditambah!", "Kategori baru berhasil disimpan.")
            }
            onClose()
        } catch (err) {
            console.error("Save Error:", err)
            const message = err instanceof Error ? err.message : "Gagal menyimpan kategori"
            setError(message)
            await showErrorAlert("Gagal Menyimpan", message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="group pl-0 hover:bg-transparent text-muted-foreground hover:text-orange-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Kembali ke Daftar
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="bg-muted/30 border-b p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-lg border shadow-sm bg-orange-50 text-orange-600 border-orange-100">
                            {isEditMode ? <Edit2 className="w-5 h-5"/> : <Tags className="w-5 h-5"/>}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                {isEditMode ? "Edit Kategori" : "Tambah Kategori Baru"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Buat label kategori untuk mengelompokkan artikel dan berita.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="pt-8 pb-8 px-6 md:px-8 bg-card">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Nama Kategori <span className="text-red-500">*</span></Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Misal: Kegiatan, Pengumuman, Artikel..."
                                    className="h-11 bg-background focus-visible:ring-orange-500"
                                    autoFocus
                                />
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Nama kategori ini akan tampil di menu artikel/berita website.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-10 px-6 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-10 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all"
                            >
                                {loading ? "Menyimpan..." : (
                                    <><Save className="w-4 h-4 mr-2" /> Simpan Data</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </div>
    )
}