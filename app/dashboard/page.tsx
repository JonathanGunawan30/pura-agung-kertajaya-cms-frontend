"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  testimonialsApi,
  heroSlidesApi,
  galleryApi,
  activitiesApi,
  facilitiesApi,
} from "@/lib/api-client"
import {
  MessageSquare,
  ImageIcon,
  Layers,
  Calendar,
  Building,
  Plus,
} from "lucide-react"
import Link from "next/link"
import type {
  Testimonial,
  HeroSlide,
  Gallery,
  Activity,
  Facility,
} from "@/lib/types"

interface Stats {
  testimonials: number
  heroSlides: number
  gallery: number
  activities: number
  facilities: number
}

interface ActivityItem {
  id: string
  type: string
  content: string
  createdAt: number
  icon: React.ElementType
  color: string
  href: string
}

function formatTimeAgo(timestamp: number | null | undefined): string {
  if (timestamp === null || timestamp === undefined || timestamp <= 0 || isNaN(timestamp)) {
    return "Baru saja"
  }

  const now = Date.now()
  const seconds = (now - timestamp) / 1000

  if (seconds < 5) return "Baru saja"
  if (seconds < 60) return `${Math.floor(seconds)} detik lalu`
  const minutes = seconds / 60
  if (minutes < 60) return `${Math.floor(minutes)} menit lalu`
  const hours = minutes / 60
  if (hours < 24) return `${Math.floor(hours)} jam lalu`
  const days = hours / 24
  return `${Math.floor(days)} hari lalu`
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    testimonials: 0,
    heroSlides: 0,
    gallery: 0,
    activities: 0,
    facilities: 0,
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [testimonials, heroSlides, gallery, activities, facilities] =
          await Promise.all([
            testimonialsApi.getAll(),
            heroSlidesApi.getAll(),
            galleryApi.getAll(),
            activitiesApi.getAll(),
            facilitiesApi.getAll(),
          ])

        setStats({
          testimonials: testimonials?.length || 0,
          heroSlides: heroSlides?.length || 0,
          gallery: gallery?.length || 0,
          activities: activities?.length || 0,
          facilities: facilities?.length || 0,
        })

        const mappedTestimonials = (testimonials || []).map((item: Testimonial) => ({
          id: item.id,
          type: "Testimonial",
          content: item.name,
          createdAt: new Date(item.created_at).getTime(),
          icon: MessageSquare,
          color: "text-blue-500",
          href: "/dashboard/testimonials",
        }))

        const mappedHeroSlides = (heroSlides || []).map((item: HeroSlide) => ({
          id: item.id,
          type: "Hero Slide",
          content: `Slide (Order: ${item.order_index})`,
          createdAt: new Date(item.created_at).getTime(),
          icon: ImageIcon,
          color: "text-purple-500",
          href: "/dashboard/hero-slides",
        }))

        const mappedGallery = (gallery || []).map((item: Gallery) => ({
          id: item.id,
          type: "Gallery Item",
          content: item.title,
          createdAt: new Date(item.created_at).getTime(),
          icon: Layers,
          color: "text-green-500",
          href: "/dashboard/gallery",
        }))

        const mappedActivities = (activities || []).map((item: Activity) => ({
          id: item.id,
          type: "Activity",
          content: item.title,
          createdAt: new Date(item.created_at).getTime(),
          icon: Calendar,
          color: "text-orange-500",
          href: "/dashboard/activities",
        }))

        const mappedFacilities = (facilities || []).map((item: Facility) => ({
          id: item.id,
          type: "Facility",
          content: item.name,
          createdAt: new Date(item.created_at).getTime(),
          icon: Building,
          color: "text-sky-500",
          href: "/dashboard/facilities",
        }))

        const allActivity = [
          ...mappedTestimonials,
          ...mappedHeroSlides,
          ...mappedGallery,
          ...mappedActivities,
          ...mappedFacilities,
        ]

        const sortedActivity = allActivity.sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        )

        setRecentActivity(sortedActivity.slice(0, 7))
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Testimonials",
      value: stats.testimonials,
      icon: MessageSquare,
      color: "text-blue-500",
      href: "/dashboard/testimonials",
    },
    {
      title: "Hero Slides",
      value: stats.heroSlides,
      icon: ImageIcon,
      color: "text-purple-500",
      href: "/dashboard/hero-slides",
    },
    {
      title: "Gallery",
      value: stats.gallery,
      icon: Layers,
      color: "text-green-500",
      href: "/dashboard/gallery",
    },
    {
      title: "Activities",
      value: stats.activities,
      icon: Calendar,
      color: "text-orange-500",
      href: "/dashboard/activities",
    },
    {
      title: "Facilities",
      value: stats.facilities,
      icon: Building,
      color: "text-sky-500",
      href: "/dashboard/facilities",
    },
  ]

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Dashboard"
        description="Kelola konten website Pura Agung Kertajaya"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-border/50 h-full">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading ? "-" : stat.value}
                    </p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-lg bg-accent/10 ${stat.color}`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="border-border/50 hover:border-accent/50 hover:bg-accent/10 transition-colors cursor-pointer h-full">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-28 gap-2">
                      <Icon className={`w-7 h-7 ${action.color}`} />
                      <p className="text-sm font-medium text-foreground">
                        Add {action.title}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading activity feed...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    href={item.href}
                    key={item.id}
                    className="flex items-center gap-3 p-3 -m-1 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-accent/10 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        New {item.type}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground self-start">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

