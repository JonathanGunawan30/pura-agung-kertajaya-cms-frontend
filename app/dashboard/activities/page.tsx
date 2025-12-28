import { DashboardHeader } from "@/components/dashboard-header"
import { ActivitiesList } from "@/components/activities-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Kegiatan Pura",
        description: "Kelola jadwal kegiatan, upacara, dan acara keagamaan di Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Kegiatan Yayasan",
        description: "Kelola agenda kegiatan sosial dan program kerja yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Jadwal Belajar",
        description: "Kelola jadwal kegiatan belajar mengajar dan aktivitas siswa."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ActivitiesPage({ searchParams }: Props) {
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
                    { label: "Manajemen Kegiatan"}
                ]}
                title={config.title}
                description={config.description}
            >
            </DashboardHeader>

            <ActivitiesList />
        </div>
    )
}