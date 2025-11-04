import { DashboardHeader } from "@/components/dashboard-header"
import { SiteIdentityList } from "@/components/site-identity-list"

export default function SiteIdentityPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Site Identity" description="Kelola identitas dan branding website pura" />
      <SiteIdentityList />
    </div>
  )
}
