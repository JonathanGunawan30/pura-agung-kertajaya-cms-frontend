import type { EntityType, User } from "./types"

export function getAllowedEntityTypes(user: User | null): EntityType[] {
    if (!user) return []

    const role = user.role.toLowerCase()

    if (role === "super") {
        return ["pura", "yayasan", "pasraman"]
    }

    if (role === "pura" || role === "yayasan" || role === "pasraman") {
        return [role as EntityType]
    }

    return []
}

export function getDefaultEntityType(user: User | null): EntityType {
    const allowed = getAllowedEntityTypes(user)
    return allowed[0] || "pura"
}

export function canAccessEntityType(user: User | null, entityType: EntityType): boolean {
    const allowed = getAllowedEntityTypes(user)
    return allowed.includes(entityType)
}

export function validateEntityType(user: User | null, requestedType: EntityType | null): EntityType {
    if (!requestedType) {
        return getDefaultEntityType(user)
    }

    if (canAccessEntityType(user, requestedType)) {
        return requestedType
    }

    return getDefaultEntityType(user)
}

export function isSuperUser(user: User | null): boolean {
    return user?.role.toLowerCase() === "super"
}

export function canAccessModule(
    user: User | null,
    moduleName: string,
    entityType: EntityType
): boolean {
    const moduleAccess: Record<EntityType, string[]> = {
        pura: [
            'activities',
            'gallery',
            'hero-slides',
            'remarks',
            'organization',
            'facilities',
            'about',
            'contact-info',
            'site-identity'
        ],
        yayasan: [
            'activities',
            'gallery',
            'hero-slides',
            'programs',
            'vision-mission',
            'facilities',
            'remarks',
            'organization',
            'about',
            'contact-info',
            'site-identity'
        ],
        pasraman: [
            'activities',
            'gallery',
            'hero-slides',
            'remarks',
            'vision-mission',
            'facilities',
            'organization',
            'about',
            'contact-info',
            'site-identity'
        ]
    }

    if (moduleName === 'rules') {
        return false
    }

    if (isSuperUser(user)) {
        return true
    }

    return moduleAccess[entityType]?.includes(moduleName) ?? false
}
