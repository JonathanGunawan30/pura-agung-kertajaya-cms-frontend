import { DashboardHeader } from "@/components/dashboard-header"
import { ContactInfoList } from "@/components/contact-info-list"

export default function ContactInfoPage() {
  return (
    <div className="space-y-4">
        <DashboardHeader
            breadcrumbs={[{ label: "Dashboard" }, { label: "Contact Information" }]}
            title="Contact Information"
            description="Kelola informasi kontak dan jam kunjung pura."
        >
        </DashboardHeader>

        <ContactInfoList />
    </div>
  )
}
