import { DashboardHeader } from "@/components/dashboard-header"
import { SiteIdentityList } from "@/components/site-identity-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Identitas Website Pura",
        description: "Kelola informasi dasar website Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Identitas Website Yayasan",
        description: "Kelola informasi dasar website Yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Identitas Website Pasraman",
        description: "Kelola informasi dasar website Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SiteIdentityPage({ searchParams }: Props) {
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
                    { label: "Identitas Web" }
                ]}
                title={config.title}
                description={config.description}
            />
            <SiteIdentityList />
        </div>
    )
}