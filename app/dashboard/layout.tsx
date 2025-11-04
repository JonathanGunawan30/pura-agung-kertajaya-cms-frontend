"use client"

import type React from "react"
import { useAuth } from "@/app/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { useEffect } from "react"

import AppLoader from "@/components/app-loader"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <AppLoader />
  }
  if (!isAuthenticated) {
    return null
  }
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
