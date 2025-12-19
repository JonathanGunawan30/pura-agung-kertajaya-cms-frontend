import { DashboardHeader } from "@/components/dashboard-header"
import { SiteIdentityList } from "@/components/site-identity-list"

export default function SiteIdentityPage() {
  return (
        <div className="space-y-4">
            <DashboardHeader
                breadcrumbs={[{ label: "Dashboard" }, { label: "Site Identity" }]}
                title="Site Identity"
                description="Kelola identitas dan branding website pura."
            >
            </DashboardHeader>
      <SiteIdentityList />
    </div>
  )
}
