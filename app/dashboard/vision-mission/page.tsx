import { DashboardHeader } from "@/components/dashboard-header"
import { VisionMissionList } from "@/components/vision-mission-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Visi & Misi Pura",
        description: "Kelola visi, misi, dan tujuan jangka panjang Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Visi & Misi Yayasan",
        description: "Kelola arah kebijakan dan tujuan Yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Visi & Misi Pasraman",
        description: "Kelola tujuan pendidikan dan kurikulum Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VisionMissionPage({ searchParams }: Props) {
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
                    { label: "Visi & Misi" }
                ]}
                title={config.title}
                description={config.description}
            />
            <VisionMissionList />
        </div>
    )
}