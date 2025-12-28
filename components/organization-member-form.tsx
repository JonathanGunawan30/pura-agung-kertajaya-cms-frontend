"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { EntityType } from "@/lib/types"
import { organizationMembersApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent } from "@/components/ui/card"
import { validateRequired, validateNumber } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

import {
    ArrowLeft,
    Save,
    Users,
    User,
    Briefcase,
    Layers,
    ListOrdered,
    Edit2 as EditIcon
} from "lucide-react"

interface OrganizationMemberFormProps {
    memberId?: string
    entityType: EntityType
    onClose: () => void
}

export function OrganizationMemberForm({ memberId, entityType, onClose }: OrganizationMemberFormProps) {
    const [formData, setFormData] = useState({
        entity_type: entityType,
        name: "",
        position: "",
        position_order: 1,
        order_index: 1,
        is_active: true,
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isEditMode = !!memberId

    useEffect(() => {
        if (!memberId) {
            setFormData(prev => ({ ...prev, entity_type: entityType }))
        }
    }, [entityType, memberId])

    useEffect(() => {
        if (isEditMode && memberId) {
            const load = async () => {
                try {
                    const data = await organizationMembersApi.getById(memberId)
                    setFormData({
                        entity_type: data.entity_type,
                        name: data.name,
                        position: data.position,
                        position_order: data.position_order,
                        order_index: data.order_index,
                        is_active: data.is_active,
                    })
                } catch {
                    const msg = "Gagal memuat data anggota."
                    setError(msg)
                    await showErrorAlert("Error", msg)
                }
            }
            load()
        }
    }, [memberId, isEditMode])

    const validateForm = () => {
        const nameError = validateRequired(formData.name, "Nama")
        if (nameError) {
            setError(nameError.message)
            return false
        }

        const posError = validateRequired(formData.position, "Jabatan")
        if (posError) {
            setError(posError.message)
            return false
        }

        const orderErr = validateNumber(formData.position_order, "Level Jabatan", 1)
        if (orderErr) {
            setError(orderErr.message)
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!validateForm()) return

        setLoading(true)
        try {
            const payload = {
                ...formData,
                entity_type: entityType
            }

            if (isEditMode) {
                await organizationMembersApi.update(memberId!, payload)
                await showSuccessAlert("Berhasil Diupdate!", "Data anggota berhasil diperbarui.")
            } else {
                await organizationMembersApi.create(payload)
                await showSuccessAlert("Berhasil Ditambah!", "Anggota baru berhasil disimpan.")
            }
            onClose()
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Gagal menyimpan data"
            setError(msg)
            await showErrorAlert("Error", msg)
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
                        <div className={`p-2.5 rounded-lg border shadow-sm ${isEditMode ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                            {isEditMode ? <EditIcon className="w-5 h-5"/> : <Users className="w-5 h-5"/>}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                {isEditMode ? "Edit Anggota" : "Tambah Anggota Baru"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola data anggota dan struktur organisasi <span className="capitalize font-semibold text-orange-600">{entityType}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="pt-8 px-6 md:px-8 bg-card">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <User className="w-4 h-4"/> Informasi Anggota
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Nama lengkap anggota..."
                                            className="bg-background focus-visible:ring-orange-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="position" className="flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Jabatan <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="position"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            placeholder="Contoh: Ketua, Sekretaris, Pembina..."
                                            className="bg-background focus-visible:ring-orange-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <Layers className="w-4 h-4"/> Struktur
                                </h3>

                                <div className="space-y-5 p-5 bg-muted/20 rounded-lg border">

                                    <div className="space-y-2">
                                        <Label htmlFor="position_order" className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                                            Level Jabatan
                                        </Label>
                                        <Input
                                            id="position_order"
                                            type="number"
                                            min={1}
                                            value={formData.position_order}
                                            onChange={(e) => setFormData({ ...formData, position_order: Number(e.target.value) })}
                                            className="bg-background"
                                            required
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Angka kecil = Jabatan Tinggi.<br/>
                                            Contoh (1 = Pelindung, 2 = Ketua, dst).
                                        </p>
                                    </div>

                                    <div className="h-px bg-border/60 my-2"></div>

                                    <div className="space-y-2">
                                        <Label htmlFor="order_index" className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                                            <ListOrdered className="w-3.5 h-3.5" /> Urutan Tampilan
                                        </Label>
                                        <Input
                                            id="order_index"
                                            type="number"
                                            min={1}
                                            value={formData.order_index}
                                            onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                                            className="bg-background"
                                            required
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Urutan antar anggota dalam satu level jabatan yang sama.
                                        </p>
                                    </div>

                                    <div className="h-px bg-border/60 my-2"></div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="is_active" className="cursor-pointer">Status Aktif</Label>
                                            <Switch
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                                className="data-[state=checked]:bg-emerald-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 pb-6 mt-8 border-t">
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