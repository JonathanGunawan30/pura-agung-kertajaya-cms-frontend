import { DashboardHeader } from "@/components/dashboard-header"
import { AboutSectionList } from "@/components/about-section-list"

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="About Page"
        description="Kelola bagian About di website"
      />
      <AboutSectionList />
    </div>
  )
}
