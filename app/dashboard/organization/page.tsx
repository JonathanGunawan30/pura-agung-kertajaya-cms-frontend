import { DashboardHeader } from "@/components/dashboard-header"
import { OrganizationMembersList } from "@/components/organization-members-list"

export default function OrganizationPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Organization Members" description="Kelola anggota organisasi dan struktur kepemimpinan" />
      <OrganizationMembersList />
    </div>
  )
}
