import { DashboardHeader } from "@/components/dashboard-header"
import { FacilitiesList } from "@/components/facilities-list" 

export default function FacilitiesPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Facilities"
        description="Kelola fasilitas yang ditampilkan di website"
      />
      <FacilitiesList />
    </div>
  )
}