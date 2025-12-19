"use client"

import { useState, useEffect } from "react"
import type { AboutSection } from "@/lib/types"
import { aboutApi, storageApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Edit2,
  Trash2,
  Plus,
  Image as ImageIcon,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  X,
  ListChecks,
  CheckCircle2,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react"
import { AboutSectionForm } from "./about-section-form"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/sweet-alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AboutSectionList() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

  const fetchSections = async () => {
    try {
      setLoading(true)
      const data = await aboutApi.getAll()
      setSections(data || [])
    } catch (error) {
      console.error("Failed to fetch about sections:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const handleDelete = async (id: string, imageUrl: string) => {
    const result = await showConfirmAlert(
        "Hapus Bagian About",
        "Apakah Anda yakin? Data yang dihapus tidak dapat dikembalikan."
    )

    if (!result.isConfirmed) return

    try {
      if (imageUrl) {
        const key = imageUrl.split("/").pop()
        if (key) {
          await storageApi.delete(`uploads/${key}`)
        }
      }

      await aboutApi.delete(id)
      setSections(sections.filter((s) => s.id !== id))
      await showSuccessAlert("Terhapus!", "Bagian About berhasil dihapus.")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Gagal menghapus data"
      await showErrorAlert("Error", errorMsg)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    fetchSections()
  }

  if (showForm || editingId) {
    return <AboutSectionForm sectionId={editingId || undefined} onClose={handleFormClose} />
  }

  return (
      <div className="space-y-6">

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-5 bg-background/50 backdrop-blur-sm flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Informasi Tentang Pura</span>
            </div>

            {sections.length === 0 && !loading && (
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Informasi
                </Button>
            )}
          </div>
        </div>
        {loading ? (
            <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-9 w-9 bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-8">
                <Skeleton className="w-full lg:w-[350px] h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            </div>
        ) : sections.length === 0 ? (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full mb-4">
                <Info className="w-8 h-8 text-orange-600/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Belum ada informasi</h3>
              <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                Silakan tambahkan informasi "Tentang Kami" untuk ditampilkan di website.
              </p>
            </div>
        ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                  <div
                      key={section.id}
                      className="group rounded-xl border bg-card shadow-sm overflow-hidden"
                  >
                    <div className="p-6 border-b bg-muted/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
                          {section.title}

                          <StatusBadge isActive={section.is_active} />
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Informasi Utama Website
                        </p>
                      </div>

                      <div className="flex gap-2 self-end sm:self-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(section.id)}
                            className="h-9 border-border/50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                        >
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(section.id, section.image_url)}
                            className="h-9 border-border/50 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">

                      <div className="w-full lg:w-[350px] shrink-0 space-y-4">
                        <div
                            className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border shadow-sm cursor-zoom-in group/image bg-muted"
                            onClick={() => {
                              if (section.image_url) {
                                setPreviewImage(section.image_url)
                                setZoom(1)
                              }
                            }}
                        >
                          {section.image_url ? (
                              <>
                                <img
                                    src={section.image_url}
                                    alt={section.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100 duration-300">
                                  <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white">
                                    <ZoomIn className="w-6 h-6" />
                                  </div>
                                </div>
                              </>
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="w-16 h-16 opacity-20" />
                              </div>
                          )}
                        </div>
                        <div className="text-xs text-center text-muted-foreground italic">
                          Klik gambar untuk memperbesar
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                          {section.description}
                        </div>

                        {section.values && section.values.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-dashed">
                              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider mb-4">
                                <ListChecks className="w-4 h-4 text-orange-600" /> Nilai & Prinsip
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {section.values.map((val) => (
                                    <div
                                        key={val.id}
                                        className="flex gap-3 p-3 rounded-lg bg-muted/30 border hover:border-orange-200 transition-colors"
                                    >
                                      <div className="shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-5 h-5 text-orange-600" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-foreground text-sm">
                                          {val.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                                          {val.value}
                                        </p>
                                      </div>
                                    </div>
                                ))}
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {previewImage && (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">Preview Image</p>
                  <p className="text-xs text-gray-400 truncate">
                    {previewImage.split("/").pop()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                      onClick={() => setZoom((z) => clamp(z - 0.25, 0.5, 4))}
                      title="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <div className="text-xs font-medium text-white px-2 min-w-[3.5rem] text-center select-none">
                    {Math.round(zoom * 100)}%
                  </div>

                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                      onClick={() => setZoom((z) => clamp(z + 0.25, 0.5, 4))}
                      title="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <div className="w-px h-6 bg-white/20 mx-1" />

                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                      onClick={() => setZoom(1)}
                      title="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-white/10 text-white transition-colors"
                      onClick={() => window.open(previewImage, "_blank")}
                      title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  <div className="w-px h-6 bg-white/20 mx-1" />

                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-red-500/20 text-white hover:text-red-400 transition-colors"
                      onClick={() => {
                        setPreviewImage(null)
                        setZoom(1)
                      }}
                      title="Close (ESC)"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8" onClick={() => setPreviewImage(null)}>
                <img
                    src={previewImage}
                    alt="Preview"
                    className="select-none transition-transform duration-200 cursor-default shadow-2xl rounded-sm"
                    style={{
                      transform: `scale(${zoom})`,
                      maxWidth: zoom <= 1 ? "100%" : "none",
                      maxHeight: zoom <= 1 ? "100%" : "none",
                    }}
                    draggable={false}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      setZoom(zoom === 1 ? 2 : 1)
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-none">
                <p className="text-xs text-gray-300 text-center font-medium tracking-wide">
                  Double-click image to zoom • Click outside or X to close
                </p>
              </div>
            </div>
        )}
      </div>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border cursor-help select-none ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}>
              {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {isActive ? "Active" : "Hidden"}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isActive ? "Ditampilkan di website" : "Disembunyikan (Draft)"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  )
}