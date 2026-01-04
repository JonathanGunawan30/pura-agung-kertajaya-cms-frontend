import { DashboardHeader } from "@/components/dashboard-header"
import { ArticlesList } from "@/components/articles-list"

export default function ArticlesPage() {
    return (
        <div className="space-y-4">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Artikel & Berita" }
                ]}
                title="Manajemen Artikel"
                description="Buat dan kelola artikel, berita, serta pengumuman terbaru."
            />

            <ArticlesList />
        </div>
    )
}