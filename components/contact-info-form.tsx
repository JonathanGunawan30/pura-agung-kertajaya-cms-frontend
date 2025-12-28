"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { EntityType } from "@/lib/types"
import { contactInfoApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { validateRequired } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

import {
  ArrowLeft,
  Save,
  Contact,
  Edit2 as EditIcon,
  MapPin,
  Phone,
  Mail,
  Clock,
  Map as MapIcon,
  Globe
} from "lucide-react"

interface ContactInfoFormProps {
  itemId?: string
  entityType: EntityType
  onClose: () => void
}

export function ContactInfoForm({ itemId, entityType, onClose }: ContactInfoFormProps) {
  const [formData, setFormData] = useState({
    entity_type: entityType,
    address: "",
    phone: "",
    email: "",
    visiting_hours: "",
    map_embed_url: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEditMode = !!itemId

  useEffect(() => {
    if (!itemId) {
      setFormData(prev => ({ ...prev, entity_type: entityType }))
    }
  }, [entityType, itemId])

  useEffect(() => {
    if (isEditMode) {
      const fetchItem = async () => {
        try {
          const data = await contactInfoApi.getById(itemId)
          setFormData({
            entity_type: data.entity_type,
            address: data.address,
            phone: data.phone,
            email: data.email,
            visiting_hours: data.visiting_hours,
            map_embed_url: data.map_embed_url
          })
        } catch (err) {
          const msg = "Gagal memuat data kontak."
          setError(msg)
          await showErrorAlert("Error", msg)
        }
      }
      fetchItem()
    }
  }, [itemId, isEditMode])

  const validateForm = (): boolean => {
    const addressError = validateRequired(formData.address, "Alamat")
    if (addressError) {
      setError(addressError.message)
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
        await contactInfoApi.update(itemId!, payload)
        await showSuccessAlert("Berhasil Diupdate!", "Informasi kontak berhasil diperbarui.")
      } else {
        await contactInfoApi.create(payload)
        await showSuccessAlert("Berhasil Ditambah!", "Informasi kontak baru berhasil disimpan.")
      }
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan kontak"
      setError(message)
      await showErrorAlert("Error", message)
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
                {isEditMode ? <EditIcon className="w-5 h-5"/> : <Contact className="w-5 h-5"/>}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {isEditMode ? "Edit Kontak" : "Tambah Kontak Baru"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Atur informasi alamat, telepon, dan peta lokasi untuk <span className="capitalize font-semibold text-orange-600">{entityType}</span>.
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4"/> Detail Informasi
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Alamat Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Jalan Pura No..."
                          className="bg-background min-h-[100px] resize-y focus-visible:ring-orange-500"
                          required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Telepon / WA
                        </Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+62..."
                            className="bg-background focus-visible:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="info@pura..."
                            className="bg-background focus-visible:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hours" className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Jam Operasional
                      </Label>
                      <Input
                          id="hours"
                          value={formData.visiting_hours}
                          onChange={(e) => setFormData({ ...formData, visiting_hours: e.target.value })}
                          placeholder="Contoh: Senin - Minggu: 08:00 - 18:00"
                          className="bg-background focus-visible:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                    <MapIcon className="w-4 h-4"/> Peta Lokasi
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="map_url">Google Maps Embed URL (src)</Label>
                      <Input
                          id="map_url"
                          value={formData.map_embed_url}
                          onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
                          placeholder="https://www.google.com/maps/embed?pb=..."
                          className="bg-background focus-visible:ring-orange-500 font-mono text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Salin URL dari menu <strong>Share {'>'} Embed a map</strong> di Google Maps.
                      </p>
                    </div>

                    <div className="rounded-xl border bg-muted overflow-hidden h-[250px] relative group">
                      {formData.map_embed_url ? (
                          <iframe
                              src={formData.map_embed_url}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen={true}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              className="w-full h-full grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                          ></iframe>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                            <MapIcon className="w-10 h-10 opacity-20" />
                            <span className="text-xs">Preview peta akan muncul di sini</span>
                          </div>
                      )}

                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] px-2 py-1 rounded border shadow-sm text-muted-foreground pointer-events-none">
                        Live Preview
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
                      <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </div>
      </div>
  )
}