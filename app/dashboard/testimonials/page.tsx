import { DashboardHeader } from "@/components/dashboard-header"
import { TestimonialsList } from "@/components/testimonials-list"

export default function TestimonialsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Testimonials" description="Kelola testimonial dari pelanggan atau pengunjung pura" />
      <TestimonialsList />
    </div>
  )
}
