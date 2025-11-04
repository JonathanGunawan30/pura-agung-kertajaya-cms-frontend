import { DashboardHeader } from "@/components/dashboard-header"
import { UserProfileForm } from "@/components/user-profile-form"

export default function UserProfilePage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="User Profile"
        description="Kelola profil Anda dan ganti password"
      />
      <UserProfileForm />
    </div>
  )
}
