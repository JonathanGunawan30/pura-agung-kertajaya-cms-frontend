import { DashboardHeader } from "@/components/dashboard-header"
import { AboutSectionList } from "@/components/about-section-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Tentang Pura",
        description: "Kelola profil, sejarah, dan informasi detail mengenai Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Tentang Yayasan",
        description: "Kelola profil, visi misi, dan sejarah berdirinya Yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Tentang Pasraman",
        description: "Kelola profil dan informasi mengenai Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AboutPage({ searchParams }: Props) {
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
                    { label: "Halaman About" }
                ]}
                title={config.title}
                description={config.description}
            />
            <AboutSectionList />
        </div>
    )
}