"use client"

import { useAuth } from "@/app/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardQuickLinks } from "@/components/dashboard-quick-links"
import { isSuperUser, getAllowedEntityTypes } from "@/lib/role-utils"

export default function DashboardPage() {
    const { user } = useAuth()

    const entityType = getAllowedEntityTypes(user)[0]
    const entityNames = {
        pura: 'Pura Agung Kertajaya',
        yayasan: 'Yayasan Vidya Kertajaya',
        pasraman: 'Pasraman Nonformal Kertajaya'
    }

    const greeting = isSuperUser(user)
        ? "Selamat Datang, Super Admin!"
        : `Selamat Datang, Admin ${entityNames[entityType] || ''}!`

    const description = isSuperUser(user)
        ? "Anda memiliki akses penuh ke semua modul."
        : `Kelola konten ${entityNames[entityType] || ''} dengan mudah.`

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <DashboardHeader
                title={greeting}
                description={description}
            />

            <div>
                <h2 className="text-lg font-semibold mb-4">Akses Cepat</h2>
                <DashboardQuickLinks />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <h3 className="text-sm font-semibold text-gray-900">Butuh bantuan?</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Jika Anda bingung atau ada kendala, silakan hubungi pengembang website.
                </p>
            </div>
        </div>
    )
}