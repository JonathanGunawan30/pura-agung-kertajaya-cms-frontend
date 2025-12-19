import { DashboardHeader } from "@/components/dashboard-header"
import { FacilitiesList } from "@/components/facilities-list" 

export default function FacilitiesPage() {
  return (
    <div className="space-y-4">
        <DashboardHeader
            breadcrumbs={[{ label: "Dashboard" }, { label: "Facilities" }]}
            title="Facilities"
            description="Kelola fasilitas yang ditampilkan di website."
        >
        </DashboardHeader>
      <FacilitiesList />
    </div>
  )
}