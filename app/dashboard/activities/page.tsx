import { DashboardHeader } from "@/components/dashboard-header"
import { ActivitiesList } from "@/components/activities-list"

export default function ActivitiesPage() {
    return (
        <div className="space-y-4">
            <DashboardHeader
                breadcrumbs={[{ label: "Dashboard" }, { label: "Activities" }]}
                title="Activities"
                description="Kelola jadwal kegiatan, upacara, dan acara di Pura."
            >
            </DashboardHeader>

            <ActivitiesList />
        </div>
    )
}