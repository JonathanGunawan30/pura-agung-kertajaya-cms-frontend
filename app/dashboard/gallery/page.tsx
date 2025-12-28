import { DashboardHeader } from "@/components/dashboard-header"
import { GalleryList } from "@/components/gallery-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Galeri Pura",
        description: "Kelola dokumentasi foto dan video kegiatan di Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Galeri Yayasan",
        description: "Kelola dokumentasi kegiatan sosial dan program yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Galeri Pasraman",
        description: "Kelola dokumentasi kegiatan belajar mengajar di Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GalleryPage({ searchParams }: Props) {
    const params = await searchParams
    const rawType = typeof params.type === 'string' ? params.type : 'pura'
    const entityType = (['pura', 'yayasan', 'pasraman'].includes(rawType) ? rawType : 'pura') as EntityType

    const config = PAGE_CONFIG[entityType]

    return (
        <div className="space-y-8">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: config.label },
                    { label: "Galeri Foto" }
                ]}
                title={config.title}
                description={config.description}
            />
            <GalleryList />
        </div>
    )
}