"use client"

import type React from "react"
import {useState, useEffect} from "react"
import {activitiesApi} from "@/lib/api-client"
import type {EntityType} from "@/lib/types"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {CardContent} from "@/components/ui/card"
import {showSuccessAlert} from "@/lib/sweet-alert"

import {
    ArrowLeft,
    Save,
    MapPin,
    Clock,
    LayoutList,
    Type,
    Edit2 as EditIcon,
    Calendar as CalendarIcon
} from "lucide-react"

interface ActivityFormProps {
    activityId?: string
    entityType: EntityType
    onClose: () => void
}

export function ActivityForm({activityId, entityType, onClose}: ActivityFormProps) {
    const [formData, setFormData] = useState({
        entity_type: entityType,
        title: "",
        description: "",
        time_info: "",
        location: "",
        event_date: "",
        order_index: 1,
        is_active: true,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!activityId) {
            setFormData(prev => ({...prev, entity_type: entityType}))
        }
    }, [entityType, activityId])

    useEffect(() => {
        if (activityId) {
            const fetchActivity = async () => {
                try {
                    const data = await activitiesApi.getById(activityId)
                    let formattedDate = ""
                    if (data.event_date) {
                        formattedDate = data.event_date.split('T')[0]
                    }
                    setFormData({
                        entity_type: data.entity_type,
                        title: data.title,
                        description: data.description,
                        time_info: data.time_info,
                        location: data.location,
                        event_date: formattedDate,
                        order_index: data.order_index,
                        is_active: data.is_active,
                    })
                } catch (err) {
                    setError("Gagal memuat data kegiatan.")
                }
            }
            fetchActivity()
        }
    }, [activityId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const payload = {
                ...formData,
                order_index: Number(formData.order_index)
            }

            if (activityId) {
                await activitiesApi.update(activityId, payload)
                await showSuccessAlert("Berhasil Diupdate!", "Data kegiatan telah berhasil diperbarui.")
            } else {
                await activitiesApi.create(payload)
                await showSuccessAlert("Berhasil Ditambah!", "Kegiatan baru telah berhasil disimpan.")
            }
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan kegiatan.")
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
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"/>
                    Kembali ke Daftar
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">

                <div className="bg-muted/30 border-b p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={`p-2.5 rounded-lg border shadow-sm ${activityId ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                            {activityId ? <EditIcon className="w-5 h-5"/> : <LayoutList className="w-5 h-5"/>}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                                {activityId ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Isi detail informasi kegiatan <span
                                className="capitalize font-semibold text-orange-600">{entityType}</span> di bawah ini.
                                Pastikan data akurat.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="pt-8 px-6 md:px-8 bg-card">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {error && (
                            <div
                                className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <Type className="w-4 h-4"/> Informasi Utama
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Nama Kegiatan <span
                                            className="text-red-500">*</span></Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            placeholder="Nama Kegiatan..."
                                            className="bg-background focus-visible:ring-orange-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Deskripsi Singkat <span
                                            className="text-red-500">*</span></Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Jelaskan secara singkat tentang kegiatan ini..."
                                            className="bg-background min-h-[150px] resize-y focus-visible:ring-orange-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                    <LayoutList className="w-4 h-4"/> Pengaturan
                                </h3>

                                <div className="space-y-5 p-5 bg-muted/20 rounded-lg border">
                                    <div className="space-y-2">
                                        <Label htmlFor="event_date" className="flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5 text-orange-600"/> Tanggal
                                            Pelaksanaan <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="event_date"
                                            type="date"
                                            value={formData.event_date}
                                            onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                                            className="bg-background focus-visible:ring-orange-500"
                                            required
                                        />
                                        <p className="text-[11px] text-muted-foreground leading-tight pt-1">
                                            Wajib diisi agar muncul di Kalender.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time" className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground"/> Waktu Pelaksanaan <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="time"
                                            value={formData.time_info}
                                            onChange={(e) => setFormData({...formData, time_info: e.target.value})}
                                            placeholder="Masukkan waktu pelaksanaan..."
                                            className="bg-background"
                                        />
                                        <div className="text-[11px] text-muted-foreground pt-1.5">
                                            <p className="mb-1 font-medium text-foreground/80">Format pengisian waktu/durasi:</p>
                                            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                                                <li>18:30 WIB s/d Selesai</li>
                                                <li>09:00 - 12:00 WIB</li>
                                                <li>Pagi - Sore Hari</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-muted-foreground"/> Lokasi <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            placeholder="Cth: Aula Utama"
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="order" className="flex items-center gap-2">
                                            <LayoutList className="w-3.5 h-3.5 text-muted-foreground"/> Urutan Tampilan
                                        </Label>
                                        <Input
                                            id="order"
                                            type="number"
                                            min={1}
                                            value={formData.order_index}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                order_index: Number.parseInt(e.target.value)
                                            })}
                                            className="bg-background"
                                            required
                                        />
                                        <p className="text-[11px] text-muted-foreground leading-tight pt-1">
                                            Menentukan posisi di website. <br/>
                                            <span className="text-orange-600 font-medium">Angka 1 = Paling Atas.</span>
                                        </p>
                                    </div>
                                    <div className="h-px bg-border/60 my-2"></div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="is_active" className="cursor-pointer">Status
                                                Publikasi</Label>
                                            <Switch
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={(checked) => setFormData({
                                                    ...formData,
                                                    is_active: checked
                                                })}
                                                className="data-[state=checked]:bg-emerald-600"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {formData.is_active
                                                ? "Kegiatan akan TAMPIL di website."
                                                : "Kegiatan DISEMBUNYIKAN (Draft)."}
                                        </p>
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
                                    <><Save className="w-4 h-4 mr-2"/> Simpan Perubahan</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>
        </div>
    )
}