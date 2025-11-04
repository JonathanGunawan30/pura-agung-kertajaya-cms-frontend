import { DashboardHeader } from "@/components/dashboard-header"
import { GalleryList } from "@/components/gallery-list"

export default function GalleryPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Gallery" description="Kelola galeri foto dan video dari acara-acara pura" />
      <GalleryList />
    </div>
  )
}
