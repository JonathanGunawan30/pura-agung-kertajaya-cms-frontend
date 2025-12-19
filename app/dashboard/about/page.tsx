import { DashboardHeader } from "@/components/dashboard-header"
import { AboutSectionList } from "@/components/about-section-list"

export default function AboutPage() {
  return (
    <div className="space-y-4">
        <DashboardHeader
            breadcrumbs={[{ label: "Dashboard" }, { label: "About" }]}
            title="About"
            description="Kelola bagian About di website."
        >
        </DashboardHeader>

        <AboutSectionList />
    </div>
  )
}
