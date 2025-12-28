import { DashboardHeader } from "@/components/dashboard-header"
import { HeroSlidesList } from "@/components/hero-slides-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Hero Slides Pura",
        description: "Kelola gambar banner slide utama di halaman beranda Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Hero Slides Yayasan",
        description: "Kelola gambar banner slide utama di halaman beranda Yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Hero Slides Pasraman",
        description: "Kelola gambar banner slide utama di halaman beranda Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HeroSlidesPage({ searchParams }: Props) {
    const params = await searchParams
    const rawType = typeof params.type === 'string' ? params.type : 'pura'
    const entityType = (['pura', 'yayasan', 'pasraman'].includes(rawType) ? rawType : 'pura') as EntityType

    const config = PAGE_CONFIG[entityType]

    return (
        <div className="space-y-4">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: config.label },
                    { label: "Hero Slides" }
                ]}
                title={config.title}
                description={config.description}
            />
            <HeroSlidesList />
        </div>
    )
}