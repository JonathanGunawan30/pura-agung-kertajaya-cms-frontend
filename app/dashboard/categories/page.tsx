import { DashboardHeader } from "@/components/dashboard-header"
import { CategoriesList } from "@/components/categories-list"

export default function CategoriesPage() {
    return (
        <div className="space-y-4">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Kategori Artikel" }
                ]}
                title="Kategori Artikel"
                description="Kelola pengelompokan artikel untuk memudahkan pencarian."
            />
            <CategoriesList />
        </div>
    )
}