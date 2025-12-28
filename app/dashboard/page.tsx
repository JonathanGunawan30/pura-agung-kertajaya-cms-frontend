"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    activitiesApi,
    galleryApi,
    programsApi,
    facilitiesApi,
    heroSlidesApi
} from "@/lib/api-client"
import {
    Calendar,
    Layers,
    Building2,
    Briefcase,
    GraduationCap,
    ArrowRight,
    Plus,
    Clock,
    ClipboardList,
    ImageIcon,
    MapPin
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface EntityStats {
    activities: number
    gallery: number
    heroSlides: number
    extra?: number
}

interface DashboardStats {
    pura: EntityStats
    yayasan: EntityStats
    pasraman: EntityStats
}

interface ActivityItem {
    id: string
    type: string
    entity: "Pura" | "Yayasan" | "Pasraman"
    content: string
    createdAt: number
    href: string
}

function formatTimeAgo(timestamp: number): string {
    const seconds = (Date.now() - timestamp) / 1000
    if (seconds < 60) return "Baru saja"
    const minutes = seconds / 60
    if (minutes < 60) return `${Math.floor(minutes)} mnt lalu`
    const hours = minutes / 60
    if (hours < 24) return `${Math.floor(hours)} jam lalu`
    const days = hours / 24
    return `${Math.floor(days)} hari lalu`
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        pura: { activities: 0, gallery: 0, heroSlides: 0 },
        yayasan: { activities: 0, gallery: 0, heroSlides: 0, extra: 0 },
        pasraman: { activities: 0, gallery: 0, heroSlides: 0, extra: 0 },
    })
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchWithLog = async (promise: Promise<any>, name: string) => {
                    try {
                        const res = await promise
                        return res || []
                    } catch (err) {
                        console.error(`[Dashboard Error] Gagal fetch ${name}:`, err)
                        return []
                    }
                }

                const [
                    puraAct, puraGal, puraHero,
                    yayAct, yayGal, yayHero, yayProg,
                    pasAct, pasGal, pasHero, pasFac
                ] = await Promise.all([
                    fetchWithLog(activitiesApi.getAll("pura"), "Pura Activities"),
                    fetchWithLog(galleryApi.getAll("pura"), "Pura Gallery"),
                    fetchWithLog(heroSlidesApi.getAll("pura"), "Pura Slides"),

                    fetchWithLog(activitiesApi.getAll("yayasan"), "Yayasan Activities"),
                    fetchWithLog(galleryApi.getAll("yayasan"), "Yayasan Gallery"),
                    fetchWithLog(heroSlidesApi.getAll("yayasan"), "Yayasan Slides"),
                    fetchWithLog(programsApi.get("yayasan").then(res => res ? [res] : []), "Yayasan Programs"),

                    fetchWithLog(activitiesApi.getAll("pasraman"), "Pasraman Activities"),
                    fetchWithLog(galleryApi.getAll("pasraman"), "Pasraman Gallery"),
                    fetchWithLog(heroSlidesApi.getAll("pasraman"), "Pasraman Slides"),
                    fetchWithLog(facilitiesApi.getAll("pasraman"), "Pasraman Facilities"),
                ])

                setStats({
                    pura: {
                        activities: puraAct.length,
                        gallery: puraGal.length,
                        heroSlides: puraHero.length
                    },
                    yayasan: {
                        activities: yayAct.length,
                        gallery: yayGal.length,
                        heroSlides: yayHero.length,
                        extra: yayProg.length
                    },
                    pasraman: {
                        activities: pasAct.length,
                        gallery: pasGal.length,
                        heroSlides: pasHero.length,
                        extra: pasFac.length
                    }
                })

                const mapFeed = (items: any[], type: string, entity: "Pura" | "Yayasan" | "Pasraman", hrefBase: string) =>
                    items.map(i => ({
                        id: i.id,
                        type,
                        entity,
                        content: i.title || i.name || i.description || "Item Baru",
                        createdAt: new Date(i.created_at).getTime(),
                        href: `${hrefBase}?type=${entity.toLowerCase()}`
                    }))

                const feed: ActivityItem[] = [
                    ...mapFeed(puraAct, "Kegiatan", "Pura", "/dashboard/activities"),
                    ...mapFeed(puraGal, "Galeri", "Pura", "/dashboard/gallery"),
                    ...mapFeed(yayAct, "Kegiatan", "Yayasan", "/dashboard/activities"),
                    ...mapFeed(yayGal, "Galeri", "Yayasan", "/dashboard/gallery"),
                    ...mapFeed(pasAct, "Kegiatan", "Pasraman", "/dashboard/activities"),
                    ...mapFeed(pasFac, "Fasilitas", "Pasraman", "/dashboard/facilities"),
                ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8)

                setRecentActivity(feed)

            } catch (error) {
                console.error("Critical Dashboard fetch error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <DashboardHeader
                title="Dashboard Overview"
                description="Pusat kontrol manajemen konten Pura, Yayasan, dan Pasraman."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card className="border-orange-200 dark:border-orange-900/50 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/20 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-3 border-b border-orange-100 dark:border-orange-900/30">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 text-orange-600 rounded-lg">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg font-bold text-orange-900 dark:text-orange-100">Pura</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <StatBox label="Kegiatan" value={stats.pura.activities} loading={loading} />
                            <StatBox label="Galeri" value={stats.pura.gallery} loading={loading} />
                            <StatBox label="Slides" value={stats.pura.heroSlides} loading={loading} />
                        </div>
                        <div className="space-y-2 pt-2">
                            <ActionButton href="/dashboard/activities?type=pura" label="Buat Kegiatan" icon={Plus} color="bg-orange-600 hover:bg-orange-700" />
                            <div className="grid grid-cols-2 gap-2">
                                <SecondaryButton href="/dashboard/gallery?type=pura" label="Upload Foto" icon={Layers} />
                                <SecondaryButton href="/dashboard/hero-slides?type=pura" label="Banner" icon={ImageIcon} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-900/30">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-lg">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Yayasan</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <StatBox label="Kegiatan" value={stats.yayasan.activities} loading={loading} />
                            <StatBox label="Proker" value={stats.yayasan.extra} loading={loading} />
                            <StatBox label="Galeri" value={stats.yayasan.gallery} loading={loading} />
                        </div>
                        <div className="space-y-2 pt-2">
                            <ActionButton href="/dashboard/programs?type=yayasan" label="Update Proker" icon={ClipboardList} color="bg-blue-600 hover:bg-blue-700" />
                            <div className="grid grid-cols-2 gap-2">
                                <SecondaryButton href="/dashboard/activities?type=yayasan" label="Kegiatan" icon={Calendar} />
                                <SecondaryButton href="/dashboard/gallery?type=yayasan" label="Galeri" icon={Layers} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-3 border-b border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-lg">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Pasraman</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <StatBox label="Kegiatan" value={stats.pasraman.activities} loading={loading} />
                            <StatBox label="Fasilitas" value={stats.pasraman.extra} loading={loading} />
                            <StatBox label="Galeri" value={stats.pasraman.gallery} loading={loading} />
                        </div>
                        <div className="space-y-2 pt-2">
                            <ActionButton href="/dashboard/activities?type=pasraman" label="Kegiatan Belajar" icon={Calendar} color="bg-emerald-600 hover:bg-emerald-700" />
                            <div className="grid grid-cols-2 gap-2">
                                <SecondaryButton href="/dashboard/facilities?type=pasraman" label="Fasilitas" icon={Building2} />
                                <SecondaryButton href="/dashboard/site-identity?type=pasraman" label="Identitas" icon={MapPin} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <CardTitle className="text-base font-bold">Aktivitas Terbaru</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" asChild>
                                <Link href="/dashboard/activities">Lihat Semua</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />)}
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">Belum ada aktivitas tercatat.</div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {recentActivity.map((item) => (
                                    <Link key={item.id} href={item.href} className="flex items-center gap-4 py-3 hover:bg-muted/50 transition-colors rounded-md px-2 -mx-2 group">
                                        <div className={`p-2 rounded-full shrink-0 ${
                                            item.entity === "Pura" ? "bg-orange-100 text-orange-600" :
                                                item.entity === "Yayasan" ? "bg-blue-100 text-blue-600" :
                                                    "bg-emerald-100 text-emerald-600"
                                        }`}>
                                            {item.type === "Kegiatan" ? <Calendar className="w-4 h-4"/> :
                                                item.type === "Galeri" ? <Layers className="w-4 h-4"/> :
                                                    <ClipboardList className="w-4 h-4"/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${
                                                    item.entity === "Pura" ? "border-orange-200 text-orange-700 bg-orange-50" :
                                                        item.entity === "Yayasan" ? "border-blue-200 text-blue-700 bg-blue-50" :
                                                            "border-emerald-200 text-emerald-700 bg-emerald-50"
                                                }`}>
                                                    {item.entity}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-medium">{item.type}</span>
                                            </div>
                                            <p className="text-sm font-medium text-foreground truncate">{item.content}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs text-muted-foreground">{formatTimeAgo(item.createdAt)}</span>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground/30 ml-auto mt-1 group-hover:text-orange-600 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatBox({ label, value, loading }: { label: string, value: number | undefined, loading: boolean }) {
    return (
        <div className="p-2 rounded-lg bg-background/50 border border-border/50">
            {loading ? (
                <Skeleton className="h-6 w-8 mx-auto mb-1 bg-gray-200 dark:bg-gray-800" />
            ) : (
                <div className="text-xl font-bold text-foreground">{value || 0}</div>
            )}
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">{label}</div>
        </div>
    )
}

function ActionButton({ href, label, icon: Icon, color }: { href: string, label: string, icon: any, color: string }) {
    return (
        <Button className={`w-full justify-start text-white shadow-sm h-9 px-3 ${color}`} asChild>
            <Link href={href}>
                <Icon className="w-4 h-4 mr-2" />
                <span className="truncate">{label}</span>
            </Link>
        </Button>
    )
}

function SecondaryButton({ href, label, icon: Icon }: { href: string, label: string, icon: any }) {
    return (
        <Button variant="outline" className="w-full justify-start h-8 text-xs border-dashed border-border hover:border-solid hover:bg-muted px-2" asChild>
            <Link href={href}>
                <Icon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <span className="truncate">{label}</span>
            </Link>
        </Button>
    )
}