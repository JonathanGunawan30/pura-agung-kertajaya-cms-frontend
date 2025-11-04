import { DashboardHeader } from "@/components/dashboard-header"
import { HeroSlidesList } from "@/components/hero-slides-list"

export default function HeroSlidesPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Hero Slides" description="Kelola slide banner utama di halaman depan website" />
      <HeroSlidesList />
    </div>
  )
}
