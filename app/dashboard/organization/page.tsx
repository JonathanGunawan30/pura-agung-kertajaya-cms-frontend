import { DashboardHeader } from "@/components/dashboard-header"
import { OrganizationMembersList } from "@/components/organization-members-list"

export default function OrganizationPage() {
  return(
    <div className="space-y-4">
        <DashboardHeader
            breadcrumbs={[{ label: "Dashboard" }, { label: "Organization Members" }]}
            title="Organization Members"
            description="Kelola anggota organisasi dan struktur kepemimpinan pura."
        >
        </DashboardHeader>
        <OrganizationMembersList />
    </div>
  )
}
