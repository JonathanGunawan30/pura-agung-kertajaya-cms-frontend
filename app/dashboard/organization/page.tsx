"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrganizationMembersList } from "@/components/organization-members-list"
import { OrganizationStructureImage } from "@/components/organization-structure-image"
import { EntityType, OrganizationDetail } from "@/lib/types"
import { organizationImageApi } from "@/lib/api-client"

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

export default function OrganizationPage() {
    const searchParams = useSearchParams()
    const rawType = searchParams.get('type') || 'pura'
    const entityType = (['pura', 'yayasan', 'pasraman'].includes(rawType) ? rawType : 'pura') as EntityType

    const [orgDetail, setOrgDetail] = useState<OrganizationDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const config = PAGE_CONFIG[entityType]

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)
                const data = await organizationImageApi.get(entityType)
                setOrgDetail(data)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [entityType])

    return (
        <div className="space-y-6 pb-20">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: config.label },
                    { label: "Struktur Organisasi" }
                ]}
                title={config.title}
                description={config.description}
            />

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Daftar Pengurus</h3>
                    <p className="text-sm text-gray-500">Kelola data personalia organisasi.</p>
                </div>
                <OrganizationMembersList />
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <OrganizationStructureImage
                    key={orgDetail?.structure_image_url || 'empty'}
                    entityType={entityType}
                    initialImageUrl={orgDetail?.structure_image_url || null}
                    initialData={orgDetail}
                />
            )}
        </div>
    )
}