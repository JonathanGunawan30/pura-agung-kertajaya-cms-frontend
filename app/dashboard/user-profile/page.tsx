import {DashboardHeader} from "@/components/dashboard-header"
import {UserProfileForm} from "@/components/user-profile-form"

export default function UserProfilePage() {
    return (
        <div className="space-y-4">
            <DashboardHeader
                breadcrumbs={[{label: "Dashboard"}, {label: "User Profile"}]}
                title="User Profile"
                description="Kelola profil Anda dan ganti password."
            >
            </DashboardHeader>
            <UserProfileForm/>
        </div>
    )
}
