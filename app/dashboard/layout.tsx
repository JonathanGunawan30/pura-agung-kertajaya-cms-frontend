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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto md:ml-64 pt-20 md:pt-0">
          <div className="p-4 md:p-8 w-full">
            {children}
          </div>
        </main>
      </div>
  )
}