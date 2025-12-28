import { DashboardHeader } from "@/components/dashboard-header"
import { FacilitiesList } from "@/components/facilities-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Fasilitas Pura",
        description: "Kelola fasilitas dan sarana prasarana di area Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Fasilitas Yayasan",
        description: "Kelola aset dan fasilitas milik Yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Fasilitas Pasraman",
        description: "Kelola ruang kelas dan sarana belajar Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FacilitiesPage({ searchParams }: Props) {
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
                    { label: "Fasilitas" }
                ]}
                title={config.title}
                description={config.description}
            />
            <FacilitiesList />
        </div>
    )
}