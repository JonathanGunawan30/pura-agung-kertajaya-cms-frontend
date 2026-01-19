"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    activitiesApi,
    galleryApi,
    facilitiesApi,
    organizationMembersApi,
    heroSlidesApi
} from "@/lib/api-client"
import { EntityType } from "@/lib/types"
import { isSuperUser, getAllowedEntityTypes } from "@/lib/role-utils"
import {
    BarChart3,
    Image as ImageIcon,
    Calendar,
    Building2,
    TrendingUp,
    Layers
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface EntityStats {
    totalActivities: number
    totalGallery: number
    totalFacilities: number
    totalMembers: number
    totalHeroSlides: number
}

interface DashboardStatsProps {
    entityType?: EntityType
}

export function DashboardStats({ entityType }: DashboardStatsProps) {
    const { user } = useAuth()
    const [stats, setStats] = useState<Record<EntityType, EntityStats>>({
        pura: { totalActivities: 0, totalGallery: 0, totalFacilities: 0, totalMembers: 0, totalHeroSlides: 0 },
        yayasan: { totalActivities: 0, totalGallery: 0, totalFacilities: 0, totalMembers: 0, totalHeroSlides: 0 },
        pasraman: { totalActivities: 0, totalGallery: 0, totalFacilities: 0, totalMembers: 0, totalHeroSlides: 0 }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                const entitiesToFetch = entityType ? [entityType] : (['pura', 'yayasan', 'pasraman'] as EntityType[])

                const statsPromises = entitiesToFetch.map(async (type) => {
                    const [activities, gallery, facilities, members, heroSlides] = await Promise.all([
                        activitiesApi.getAll(type).catch(() => []),
                        galleryApi.getAll(type).catch(() => []),
                        facilitiesApi.getAll(type).catch(() => []),
                        organizationMembersApi.getAll(type).catch(() => []),
                        heroSlidesApi.getAll(type).catch(() => [])
                    ])

                    return {
                        type,
                        stats: {
                            totalActivities: activities.length,
                            totalGallery: gallery.length,
                            totalFacilities: facilities.length,
                            totalMembers: members.length,
                            totalHeroSlides: heroSlides.length
                        }
                    }
                })

                const results = await Promise.all(statsPromises)
                const newStats = { ...stats }
                results.forEach(({ type, stats: entityStats }) => {
                    newStats[type] = entityStats
                })
                setStats(newStats)
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [entityType])

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-3">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (isSuperUser(user) && !entityType) {
        const combined = {
            totalActivities: stats.pura.totalActivities + stats.yayasan.totalActivities + stats.pasraman.totalActivities,
            totalGallery: stats.pura.totalGallery + stats.yayasan.totalGallery + stats.pasraman.totalGallery,
            totalFacilities: stats.pura.totalFacilities + stats.yayasan.totalFacilities + stats.pasraman.totalFacilities,
            totalMembers: stats.pura.totalMembers + stats.yayasan.totalMembers + stats.pasraman.totalMembers,
            totalItems: 0
        }
        combined.totalItems = combined.totalActivities + combined.totalGallery + combined.totalFacilities

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Konten"
                        value={combined.totalItems}
                        icon={Layers}
                        description="Semua entity"
                        colorClass="text-orange-600 bg-orange-50"
                    />
                    <StatCard
                        title="Total Foto"
                        value={combined.totalGallery}
                        icon={ImageIcon}
                        description="Galeri semua"
                        colorClass="text-blue-600 bg-blue-50"
                    />
                    <StatCard
                        title="Total Aktivitas"
                        value={combined.totalActivities}
                        icon={Calendar}
                        description="Semua kegiatan"
                        colorClass="text-emerald-600 bg-emerald-50"
                    />
                    <StatCard
                        title="Total Anggota"
                        value={combined.totalMembers}
                        icon={Building2}
                        description="Organisasi semua"
                        colorClass="text-purple-600 bg-purple-50"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EntityStatsCard title="Pura" stats={stats.pura} colorClass="border-orange-500" />
                    <EntityStatsCard title="Yayasan" stats={stats.yayasan} colorClass="border-blue-500" />
                    <EntityStatsCard title="Pasraman" stats={stats.pasraman} colorClass="border-emerald-500" />
                </div>
            </div>
        )
    }

    const userEntityType = entityType || getAllowedEntityTypes(user)[0] || 'pura'
    const entityStats = stats[userEntityType]
    const totalItems = entityStats.totalActivities + entityStats.totalGallery + entityStats.totalFacilities

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Konten"
                value={totalItems}
                icon={Layers}
                description="Aktivitas, Galeri, Fasilitas"
                colorClass="text-orange-600 bg-orange-50"
            />
            <StatCard
                title="Foto Galeri"
                value={entityStats.totalGallery}
                icon={ImageIcon}
                description="Total foto yang diupload"
                colorClass="text-blue-600 bg-blue-50"
            />
            <StatCard
                title="Aktivitas"
                value={entityStats.totalActivities}
                icon={Calendar}
                description="Kegiatan yang terdaftar"
                colorClass="text-emerald-600 bg-emerald-50"
            />
            <StatCard
                title="Fasilitas"
                value={entityStats.totalFacilities}
                icon={Building2}
                description="Fasilitas yang tersedia"
                colorClass="text-purple-600 bg-purple-50"
            />
        </div>
    )
}

function StatCard({ title, value, icon: Icon, description, colorClass }: any) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}

function EntityStatsCard({ title, stats, colorClass }: { title: string, stats: EntityStats, colorClass: string }) {
    const totalItems = stats.totalActivities + stats.totalGallery + stats.totalFacilities

    return (
        <Card className={`border-l-4 ${colorClass}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Konten</span>
                    <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Aktivitas</span>
                    <span className="font-semibold">{stats.totalActivities}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Foto</span>
                    <span className="font-semibold">{stats.totalGallery}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fasilitas</span>
                    <span className="font-semibold">{stats.totalFacilities}</span>
                </div>
            </CardContent>
        </Card>
    )
}
