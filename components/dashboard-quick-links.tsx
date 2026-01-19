"use client"

import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { canAccessModule, getAllowedEntityTypes, isSuperUser } from "@/lib/role-utils"
import { EntityType } from "@/lib/types"
import {
    Calendar,
    Layers,
    ImageIcon,
    Users,
    Building2,
    MessageSquareQuote,
    Target,
    ClipboardList,
    Info,
    MapPin,
    Settings,
    ArrowRight,
    Armchair
} from "lucide-react"
import Link from "next/link"

interface QuickLink {
    href: string
    label: string
    icon: any
    module: string
}

const MODULE_LINKS: Record<string, QuickLink> = {
    activities: { href: "/dashboard/activities", label: "Aktivitas", icon: Calendar, module: "activities" },
    gallery: { href: "/dashboard/gallery", label: "Galeri Foto", icon: Layers, module: "gallery" },
    "hero-slides": { href: "/dashboard/hero-slides", label: "Hero Slides", icon: ImageIcon, module: "hero-slides" },
    remarks: { href: "/dashboard/remarks", label: "Kata Sambutan", icon: MessageSquareQuote, module: "remarks" },
    organization: { href: "/dashboard/organization", label: "Struktur Organisasi", icon: Users, module: "organization" },
    facilities: { href: "/dashboard/facilities", label: "Fasilitas", icon: Armchair, module: "facilities" },
    programs: { href: "/dashboard/programs", label: "Program Kerja", icon: ClipboardList, module: "programs" },
    "vision-mission": { href: "/dashboard/vision-mission", label: "Visi & Misi", icon: Target, module: "vision-mission" },
    about: { href: "/dashboard/about", label: "Tentang Kami", icon: Info, module: "about" },
    "contact-info": { href: "/dashboard/contact-info", label: "Kontak & Lokasi", icon: MapPin, module: "contact-info" },
    "site-identity": { href: "/dashboard/site-identity", label: "Identitas Web", icon: Settings, module: "site-identity" }
}

// Module order per entity type (based on sidebar)
const ENTITY_MODULES: Record<EntityType, string[]> = {
    pura: ['activities', 'gallery', 'hero-slides', 'remarks', 'organization', 'facilities', 'about', 'contact-info', 'site-identity'],
    yayasan: ['activities', 'gallery', 'hero-slides', 'programs', 'vision-mission', 'facilities', 'remarks', 'organization', 'about', 'contact-info', 'site-identity'],
    pasraman: ['activities', 'gallery', 'hero-slides', 'remarks', 'vision-mission', 'facilities', 'organization', 'about', 'contact-info', 'site-identity']
}

export function DashboardQuickLinks() {
    const { user } = useAuth()
    const entityType = getAllowedEntityTypes(user)[0] || 'pura'

    if (isSuperUser(user)) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EntityQuickLinks entityType="pura" title="Pura Agung" colorClass="text-orange-600 bg-orange-50 border-orange-200" />
                <EntityQuickLinks entityType="yayasan" title="Yayasan Vidya" colorClass="text-blue-600 bg-blue-50 border-blue-200" />
                <EntityQuickLinks entityType="pasraman" title="Pasraman" colorClass="text-emerald-600 bg-emerald-50 border-emerald-200" />
            </div>
        )
    }

    const titles: Record<EntityType, string> = {
        pura: 'Pura Agung',
        yayasan: 'Yayasan Vidya',
        pasraman: 'Pasraman'
    }

    const colors: Record<EntityType, string> = {
        pura: 'text-orange-600 bg-orange-50 border-orange-200',
        yayasan: 'text-blue-600 bg-blue-50 border-blue-200',
        pasraman: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }

    return (
        <EntityQuickLinks
            entityType={entityType}
            title={titles[entityType]}
            colorClass={colors[entityType]}
            fullWidth
        />
    )
}

function EntityQuickLinks({
    entityType,
    title,
    colorClass,
    fullWidth = false
}: {
    entityType: EntityType
    title: string
    colorClass: string
    fullWidth?: boolean
}) {
    const { user } = useAuth()
    const modules = ENTITY_MODULES[entityType]

    const accessibleModules = modules.filter(module =>
        canAccessModule(user, module, entityType)
    )

    return (
        <Card className={`border-l-4 ${colorClass.split(' ').pop()}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
                <CardDescription>Akses cepat ke modul {title.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent className={`grid gap-2 ${fullWidth ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
                {accessibleModules.map((moduleKey) => {
                    const link = MODULE_LINKS[moduleKey]
                    if (!link) return null

                    const href = `${link.href}?type=${entityType}`
                    const Icon = link.icon

                    return (
                        <Button
                            key={moduleKey}
                            variant="outline"
                            className="w-full justify-between h-auto py-3 px-4 group border-gray-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700"
                            asChild
                        >
                            <Link href={href}>
                                <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4 text-gray-500 group-hover:text-orange-600" />
                                    <span className="text-sm">{link.label}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />
                            </Link>
                        </Button>
                    )
                })}
            </CardContent>
        </Card>
    )
}
