import { DashboardHeader } from "@/components/dashboard-header"
import { ActivitiesList } from "@/components/activities-list"

export default function ActivitiesPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Activities" description="Kelola kegiatan dan acara-acara di pura" />
      <ActivitiesList />
    </div>
  )
}
