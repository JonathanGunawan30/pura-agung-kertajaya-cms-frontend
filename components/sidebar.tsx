"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  MessageSquare,
  ImageIcon,
  Layers,
  MapPin,
  Calendar,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Building,
  Info,
  Lock
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const menuCategories = [
  {
    title: null,
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Manage Content",
    items: [
      { href: "/dashboard/activities", label: "Activities", icon: Calendar },
      { href: "/dashboard/facilities", label: "Facilities", icon: Building },
      { href: "/dashboard/gallery", label: "Gallery", icon: Layers },
      { href: "/dashboard/hero-slides", label: "Hero Slides", icon: ImageIcon },
      { href: "/dashboard/testimonials", label: "Testimonials", icon: MessageSquare },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/dashboard/about", label: "About", icon: Info },
      { href: "/dashboard/contact-info", label: "Contact Info", icon: MapPin },
      { href: "/dashboard/organization", label: "Organization", icon: Users },
      { href: "/dashboard/site-identity", label: "Site Identity", icon: Settings },
    ],
  },
  {
    title: "Account",
    items: [{ href: "/dashboard/user-profile", label: "Change Password", icon: Lock }],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-sidebar hover:bg-sidebar/80 text-sidebar-foreground"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/sdhd_banjar_tangerang.svg"
                alt="Logo Pura Admin"
                width={40}
                height={40}
                className="drop-shadow-sm"
                priority
              />
              <div>
                <h1 className="font-bold text-sidebar-foreground">Pura Admin</h1>
                <p className="text-xs text-sidebar-foreground/60">CMS Dashboard</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            {menuCategories.map((category, index) => (
              <div key={index}>
                {category.title && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    {category.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="px-4 py-2 rounded-lg bg-sidebar-accent/10">
              <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/20 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
