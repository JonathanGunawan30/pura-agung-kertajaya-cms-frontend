"use client"

import {useEffect, useState} from "react"
import {DashboardHeader} from "@/components/dashboard-header"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import {
    testimonialsApi,
    heroSlidesApi,
    galleryApi,
    activitiesApi,
    facilitiesApi,
} from "@/lib/api-client"
import {
    MessageSquare,
    ImageIcon,
    Layers,
    Calendar,
    Building,
    ArrowRight,
    Settings2,
    PlusCircle,
    Clock,
    ExternalLink,
    Save
} from "lucide-react"
import Link from "next/link"
import {showSuccessAlert} from "@/lib/sweet-alert"
import {Skeleton} from "@/components/ui/skeleton"

interface Stats {
    testimonials: number
    heroSlides: number
    gallery: number
    activities: number
    facilities: number
}

interface ActivityItem {
    id: string
    type: string
    content: string
    createdAt: number
    icon: React.ElementType
    color: string
    bg: string
    href: string
}

const AVAILABLE_ACTIONS = [
    {
        id: "act_activities",
        label: "Tambah Kegiatan",
        href: "/dashboard/activities",
        icon: Calendar,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
        id: "act_facilities",
        label: "Tambah Fasilitas",
        href: "/dashboard/facilities",
        icon: Building,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
        id: "act_gallery",
        label: "Upload Galeri",
        href: "/dashboard/gallery",
        icon: Layers,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/20"
    },
    {
        id: "act_hero",
        label: "Update Banner",
        href: "/dashboard/hero-slides",
        icon: ImageIcon,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
        id: "act_testimonials",
        label: "Kelola Testimoni",
        href: "/dashboard/testimonials",
        icon: MessageSquare,
        color: "text-pink-600 dark:text-pink-400",
        bg: "bg-pink-100 dark:bg-pink-900/20"
    },
]

function formatTimeAgo(timestamp: number | null | undefined): string {
    if (!timestamp || timestamp <= 0) return "Baru saja"
    const now = Date.now()
    const seconds = (now - timestamp) / 1000

    if (seconds < 60) return "Baru saja"
    const minutes = seconds / 60
    if (minutes < 60) return `${Math.floor(minutes)} menit lalu`
    const hours = minutes / 60
    if (hours < 24) return `${Math.floor(hours)} jam lalu`
    const days = hours / 24
    return `${Math.floor(days)} hari lalu`
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        testimonials: 0, heroSlides: 0, gallery: 0, activities: 0, facilities: 0,
    })
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)

    const [visibleActionIds, setVisibleActionIds] = useState<string[]>([
        "act_activities", "act_gallery", "act_hero" // Default actions
    ])
    const [tempActionIds, setTempActionIds] = useState<string[]>([])
    const [isConfigOpen, setIsConfigOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [testimonials, heroSlides, gallery, activities, facilities] =
                    await Promise.all([
                        testimonialsApi.getAll(),
                        heroSlidesApi.getAll(),
                        galleryApi.getAll(),
                        activitiesApi.getAll(),
                        facilitiesApi.getAll(),
                    ])

                setStats({
                    testimonials: testimonials?.length || 0,
                    heroSlides: heroSlides?.length || 0,
                    gallery: gallery?.length || 0,
                    activities: activities?.length || 0,
                    facilities: facilities?.length || 0,
                })

                const mapItem = (item: any, type: string, icon: any, color: string, bg: string, href: string) => ({
                    id: item.id,
                    type,
                    content: item.title || item.name || item.description || "Item Baru",
                    createdAt: new Date(item.created_at).getTime(),
                    icon, color, bg, href
                })

                const allActivity = [
                    ...(testimonials || []).map((i: any) => mapItem(i, "Testimonial", MessageSquare, "text-pink-600 dark:text-pink-400", "bg-pink-50 dark:bg-pink-900/20", "/dashboard/testimonials")),
                    ...(heroSlides || []).map((i: any) => mapItem(i, "Hero Slide", ImageIcon, "text-purple-600 dark:text-purple-400", "bg-purple-50 dark:bg-purple-900/20", "/dashboard/hero-slides")),
                    ...(gallery || []).map((i: any) => mapItem(i, "Galeri", Layers, "text-emerald-600 dark:text-emerald-400", "bg-emerald-50 dark:bg-emerald-900/20", "/dashboard/gallery")),
                    ...(activities || []).map((i: any) => mapItem(i, "Kegiatan", Calendar, "text-orange-600 dark:text-orange-400", "bg-orange-50 dark:bg-orange-900/20", "/dashboard/activities")),
                    ...(facilities || []).map((i: any) => mapItem(i, "Fasilitas", Building, "text-blue-600 dark:text-blue-400", "bg-blue-50 dark:bg-blue-900/20", "/dashboard/facilities")),
                ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)

                setRecentActivity(allActivity)
            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        const saved = localStorage.getItem("dashboard_quick_actions")
        if (saved) {
            setVisibleActionIds(JSON.parse(saved))
        }
    }, [])

    const handleOpenConfig = () => {
        setTempActionIds([...visibleActionIds])
        setIsConfigOpen(true)
    }

    const handleToggleAction = (id: string) => {
        if (tempActionIds.includes(id)) {
            setTempActionIds(tempActionIds.filter(item => item !== id))
        } else {
            setTempActionIds([...tempActionIds, id])
        }
    }

    const handleSaveConfig = () => {
        setVisibleActionIds(tempActionIds)
        localStorage.setItem("dashboard_quick_actions", JSON.stringify(tempActionIds))
        setIsConfigOpen(false)
        showSuccessAlert("Tersimpan", "Konfigurasi Quick Actions berhasil diperbarui.")
    }

    const activeQuickActions = AVAILABLE_ACTIONS.filter(action => visibleActionIds.includes(action.id))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHeader
                title="Dashboard Overview"
                description="Selamat datang kembali, Admin. Berikut ringkasan konten website Pura Agung Kertajaya."
            />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    {
                        label: "Kegiatan",
                        val: stats.activities,
                        icon: Calendar,
                        color: "text-orange-600 dark:text-orange-400",
                        bg: "bg-orange-50 dark:bg-orange-900/20",
                        href: "/dashboard/activities"
                    },
                    {
                        label: "Fasilitas",
                        val: stats.facilities,
                        icon: Building,
                        color: "text-blue-600 dark:text-blue-400",
                        bg: "bg-blue-50 dark:bg-blue-900/20",
                        href: "/dashboard/facilities"
                    },
                    {
                        label: "Galeri",
                        val: stats.gallery,
                        icon: Layers,
                        color: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-50 dark:bg-emerald-900/20",
                        href: "/dashboard/gallery"
                    },
                    {
                        label: "Slides",
                        val: stats.heroSlides,
                        icon: ImageIcon,
                        color: "text-purple-600 dark:text-purple-400",
                        bg: "bg-purple-50 dark:bg-purple-900/20",
                        href: "/dashboard/hero-slides"
                    },
                    {
                        label: "Testimoni",
                        val: stats.testimonials,
                        icon: MessageSquare,
                        color: "text-pink-600 dark:text-pink-400",
                        bg: "bg-pink-50 dark:bg-pink-900/20",
                        href: "/dashboard/testimonials"
                    },
                ].map((stat, idx) => {
                    const Icon = stat.icon
                    return (
                        <Link href={stat.href} key={idx} className="block group">
                            <Card
                                className="border-border/60 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all cursor-pointer h-full bg-card">
                                <CardContent className="p-5 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div
                                            className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-5 h-5"/>
                                        </div>
                                        {loading ? (
                                            <Skeleton className="h-8 w-12"/>
                                        ) : (
                                            <span className="text-2xl font-bold text-foreground">{stat.val}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-orange-600 dark:text-orange-500"/> Aksi Cepat
                        </h3>
                        <Button variant="outline" size="sm" onClick={handleOpenConfig}
                                className="gap-2 h-8 text-xs border-dashed border-border text-muted-foreground hover:text-foreground">
                            <Settings2 className="w-3.5 h-3.5"/> Atur Menu
                        </Button>
                    </div>

                    <Card className="border-border/60 shadow-sm bg-card">
                        <CardContent className="p-6">
                            {activeQuickActions.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                                    <p className="text-muted-foreground mb-2">Belum ada aksi cepat yang dipilih.</p>
                                    <Button onClick={handleOpenConfig} variant="link"
                                            className="text-orange-600 dark:text-orange-400">Pilih Aksi</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {activeQuickActions.map((action) => {
                                        const Icon = action.icon
                                        return (
                                            <Link key={action.id} href={action.href}>
                                                <div
                                                    className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-border bg-background hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer h-full text-center">
                                                    <div
                                                        className={`p-3 rounded-full ${action.bg} ${action.color} group-hover:ring-4 ring-orange-50 dark:ring-orange-900/30 transition-all`}>
                                                        <Icon className="w-6 h-6"/>
                                                    </div>
                                                    <span
                                                        className="text-sm font-semibold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400">
                                                        {action.label}
                                                    </span>
                                                    <div
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <PlusCircle
                                                            className="w-4 h-4 text-orange-300 dark:text-orange-700"/>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-500"/> Aktivitas Terbaru
                    </h3>

                    <Card
                        className="border-border/60 shadow-sm h-full max-h-[400px] overflow-hidden flex flex-col bg-card">
                        <CardContent className="p-0 flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-6 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="h-10 w-10 rounded-lg"/>
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-3/4"/>
                                                <Skeleton className="h-3 w-1/2"/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                                    <p className="text-sm text-muted-foreground">Belum ada aktivitas tercatat.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {recentActivity.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <Link href={item.href} key={item.id}
                                                  className="block hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start gap-3 p-4">
                                                    <div
                                                        className={`mt-0.5 p-2 rounded-lg shrink-0 ${item.bg} ${item.color}`}>
                                                        <Icon className="w-4 h-4"/>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate pr-2">
                                                            {item.content}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span
                                                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border">
                                                                {item.type}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                • {formatTimeAgo(item.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight
                                                        className="w-4 h-4 text-muted-foreground/50 self-center"/>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle>Kustomisasi Aksi Cepat</DialogTitle>
                        <DialogDescription>
                            Pilih menu pintasan yang ingin ditampilkan di halaman dashboard utama.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {AVAILABLE_ACTIONS.map((action) => {
                            const Icon = action.icon
                            const isSelected = tempActionIds.includes(action.id)
                            return (
                                <div
                                    key={action.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                                        : 'border-border hover:border-orange-200 dark:hover:border-orange-800'
                                    }`}
                                    onClick={() => handleToggleAction(action.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${action.bg} ${action.color}`}>
                                            <Icon className="w-4 h-4"/>
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label
                                                className="text-sm font-medium cursor-pointer text-foreground">{action.label}</Label>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isSelected}
                                        onCheckedChange={() => handleToggleAction(action.id)}
                                        className="data-[state=checked]:bg-orange-600"
                                    />
                                </div>
                            )
                        })}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="h-9">Batal</Button>
                        </DialogClose>
                        <Button onClick={handleSaveConfig} className="bg-orange-600 hover:bg-orange-700 text-white h-9">
                            <Save className="w-4 h-4 mr-2"/> Simpan Tampilan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}