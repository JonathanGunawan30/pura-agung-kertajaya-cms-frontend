import { DashboardHeader } from "@/components/dashboard-header"
import { RulesList } from "@/components/rules-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Tata Tertib & Himbauan Pura",
        description: "Kelola aturan perilaku, tata tertib persembahyangan, dan himbauan untuk umat."
    },
    yayasan: {
        label: "Yayasan",
        title: "Peraturan & Kebijakan Yayasan",
        description: "Kelola dokumen peraturan, SK, dan kebijakan internal Yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Tata Tertib Siswa Pasraman",
        description: "Kelola aturan kedisiplinan, tata tertib belajar, dan panduan siswa."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RulesPage({ searchParams }: Props){
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
                    { label: "Tata Tertib" }
                ]}
                title={config.title}
                description={config.description}
            />

            <RulesList />
        </div>
    )
}