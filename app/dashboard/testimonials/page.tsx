import { DashboardHeader } from "@/components/dashboard-header"
import { TestimonialsList } from "@/components/testimonials-list"

export default function TestimonialsPage() {
  return (
    <div className="space-y-4">
        <DashboardHeader
            breadcrumbs={[{ label: "Dashboard" }, { label: "Testimonials" }]}
            title="Testimonials"
            description="Kelola testimonial dari pelanggan atau pengunjung pura."
        >
        </DashboardHeader>

        <TestimonialsList />
    </div>
  )
}
