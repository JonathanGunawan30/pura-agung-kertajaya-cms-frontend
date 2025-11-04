import { DashboardHeader } from "@/components/dashboard-header"
import { ContactInfoList } from "@/components/contact-info-list"

export default function ContactInfoPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Contact Information" description="Kelola informasi kontak dan jam kunjung pura" />
      <ContactInfoList />
    </div>
  )
}
