"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { ContactInfo, EntityType } from "@/lib/types"
import { contactInfoApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Edit2,
  Trash2,
  Plus,
  MapPin,
  Phone,
  Mail,
  Clock,
  Contact,
  Map as MapIcon,
  Globe,
  Building2
} from "lucide-react"
import { ContactInfoForm } from "./contact-info-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function ContactInfoList() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const queryType = searchParams.get("type") as EntityType | null
  const defaultType: EntityType = (queryType && ["pura", "yayasan", "pasraman"].includes(queryType))
      ? queryType
      : "pura"

  const [entityType, setEntityType] = useState<EntityType>(defaultType)
  const [items, setItems] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (queryType && ["pura", "yayasan", "pasraman"].includes(queryType)) {
      setEntityType(queryType)
    }
  }, [queryType])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await contactInfoApi.getAll(entityType)
      setItems(data || [])
    } catch (error) {
      console.error("Failed to fetch contact info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [entityType])

  const handleTabChange = (type: EntityType) => {
    setEntityType(type)
    router.push(`?type=${type}`, { scroll: false })
  }

  const handleDelete = async (id: string) => {
    const result = await showConfirmAlert(
        "Hapus Kontak",
        "Apakah Anda yakin? Data ini akan dihapus permanen."
    )

    if (!result.isConfirmed) return

    try {
      await contactInfoApi.delete(id)
      setItems(items.filter((i) => i.id !== id))
      await showSuccessAlert("Terhapus", "Informasi kontak berhasil dihapus.")
    } catch (error) {
      console.error("Failed to delete contact info:", error)
      const errorMsg = error instanceof Error ? error.message : "Gagal menghapus data"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchItems()
  }

  if (showForm || editingId) {
    return <ContactInfoForm itemId={editingId || undefined} entityType={entityType} onClose={handleFormClose} />
  }

  return (
      <div className="space-y-6">

        {!queryType && (
            <div className="flex flex-wrap gap-2">
              {(["pura", "yayasan", "pasraman"] as EntityType[]).map((type) => (
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
          <div className="p-5 bg-background/50 backdrop-blur-sm flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Contact className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Informasi Kontak <span className="capitalize">{entityType}</span></span>
            </div>

            {!loading && items.length === 0 && (
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Kontak
                </Button>
            )}
          </div>
        </div>

        {loading ? (
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <div className="flex justify-between mb-6">
                <Skeleton className="h-8 w-1/4 bg-gray-200 dark:bg-gray-800" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-9 w-9 bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-800" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800" />
                          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-800" />
                        </div>
                      </div>
                  ))}
                </div>
                <Skeleton className="w-full h-64 lg:h-full rounded-xl bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
        ) : items.length === 0 ? (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                <Contact className="w-8 h-8 text-orange-600/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Belum ada data kontak</h3>
              <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                Tambahkan alamat, telepon, dan peta lokasi <strong>{entityType}</strong> agar mudah dihubungi.
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
                          <Globe className="w-5 h-5 text-orange-600" /> Kontak & Lokasi
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Data ini akan ditampilkan di footer dan halaman kontak website.
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
                            onClick={() => handleDelete(item.id)}
                            className="h-9 border-border/50 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                      <div className="space-y-6">

                        <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-orange-200 transition-colors">
                          <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                              <MapPin className="w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                              Alamat Lengkap
                            </p>
                            <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">
                              {item.address}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          <div className="flex gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-orange-200 transition-colors">
                            <div className="shrink-0">
                              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <Phone className="w-4.5 h-4.5" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Telepon / WA</p>
                              <p className="text-sm font-medium text-foreground truncate">{item.phone}</p>
                            </div>
                          </div>

                          <div className="flex gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-orange-200 transition-colors">
                            <div className="shrink-0">
                              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <Mail className="w-4.5 h-4.5" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
                              <p className="text-sm font-medium text-foreground truncate">{item.email}</p>
                            </div>
                          </div>

                          <div className="sm:col-span-2 flex gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-orange-200 transition-colors">
                            <div className="shrink-0">
                              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <Clock className="w-4.5 h-4.5" />
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Jam Operasional / Kunjungan</p>
                              <p className="text-sm font-medium text-foreground">{item.visiting_hours}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col h-full min-h-[300px]">
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                          <MapIcon className="w-4 h-4" /> Preview Peta Lokasi
                        </div>

                        {item.map_embed_url ? (
                            <div className="relative w-full flex-1 rounded-xl overflow-hidden border shadow-sm bg-muted group/map">
                              <iframe
                                  src={item.map_embed_url}
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0, minHeight: "300px" }}
                                  allowFullScreen={true}
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                  className="w-full h-full filter grayscale-[20%] group-hover/map:grayscale-0 transition-all duration-500"
                              ></iframe>

                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] px-2 py-1 rounded border shadow-sm text-muted-foreground pointer-events-none">
                                Google Maps
                              </div>
                            </div>
                        ) : (
                            <div className="w-full flex-1 min-h-[300px] rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                              <MapIcon className="w-10 h-10 opacity-20" />
                              <p className="text-sm">Link Peta belum dimasukkan</p>
                            </div>
                        )}
                      </div>

                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  )
}