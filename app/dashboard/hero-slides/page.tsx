import { DashboardHeader } from "@/components/dashboard-header"
import { HeroSlidesList } from "@/components/hero-slides-list"

export default function HeroSlidesPage() {
  return (
    <div className="space-y-4">
        <DashboardHeader
            breadcrumbs={[{ label: "Dashboard" }, { label: "Hero Slides" }]}
            title="Hero Slides"
            description="Kelola slide banner utama di halaman depan website."
        >
        </DashboardHeader>

        <HeroSlidesList />
    </div>
  )
}
