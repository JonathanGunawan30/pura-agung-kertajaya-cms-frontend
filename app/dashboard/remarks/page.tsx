import { DashboardHeader } from "@/components/dashboard-header"
import { RemarksList } from "@/components/remarks-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Kata Sambutan Pura",
        description: "Kelola pesan dan kata sambutan dari pengurus atau tokoh Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Kata Sambutan Yayasan",
        description: "Kelola pesan dari pengurus Yayasan untuk ditampilkan di website."
    },
    pasraman: {
        label: "Pasraman",
        title: "Kata Sambutan Pasraman",
        description: "Kelola pesan motivasi atau sambutan dari pengurus Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RemarksPage({ searchParams }: Props) {
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
                    { label: "Kata Sambutan" }
                ]}
                title={config.title}
                description={config.description}
            />
            <RemarksList />
        </div>
    )
}