import { DashboardHeader } from "@/components/dashboard-header"
import { ProgramsList } from "@/components/programs-list"
import { ModuleAccessGuard } from "@/components/module-access-guard"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Program Kerja Pura",
        description: "Kelola daftar rencana kegiatan dan program kerja Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Program Kerja Yayasan",
        description: "Kelola program kerja jangka pendek dan jangka panjang Yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Program Kerja Pasraman",
        description: "Kelola kurikulum dan rencana kegiatan belajar Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProgramsPage({ searchParams }: Props) {
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
                    { label: "Program Kerja" }
                ]}
                title={config.title}
                description={config.description}
            />
            <ModuleAccessGuard moduleName="programs" entityType={entityType}>
                <ProgramsList />
            </ModuleAccessGuard>
        </div>
    )
}