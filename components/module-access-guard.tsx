"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { canAccessModule } from "@/lib/role-utils"
import { EntityType } from "@/lib/types"

interface ModuleAccessGuardProps {
    moduleName: string
    entityType: EntityType
    children: React.ReactNode
}

export function ModuleAccessGuard({ moduleName, entityType, children }: ModuleAccessGuardProps) {
    const router = useRouter()
    const { user } = useAuth()

    useEffect(() => {
        if (!canAccessModule(user, moduleName, entityType)) {
            router.replace("/dashboard")
        }
    }, [user, moduleName, entityType, router])

    if (!canAccessModule(user, moduleName, entityType)) {
        return null
    }

    return <>{children}</>
}
