import { DashboardHeader } from "@/components/dashboard-header"
import { OrganizationMembersList } from "@/components/organization-members-list"
import { EntityType } from "@/lib/types"

const PAGE_CONFIG: Record<EntityType, { title: string; description: string; label: string }> = {
    pura: {
        label: "Pura",
        title: "Struktur Organisasi Pura",
        description: "Kelola Struktur Organisasi Pura."
    },
    yayasan: {
        label: "Yayasan",
        title: "Struktur Organisasi Yayasan",
        description: "Kelola Struktur Organisasi Yayasan."
    },
    pasraman: {
        label: "Pasraman",
        title: "Struktur Organisasi Pasraman",
        description: "Kelola Struktur Organisasi Pasraman."
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OrganizationPage({ searchParams }: Props) {
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
                    { label: "Struktur Organisasi" }
                ]}
                title={config.title}
                description={config.description}
            />
            <OrganizationMembersList />
        </div>
    )
}