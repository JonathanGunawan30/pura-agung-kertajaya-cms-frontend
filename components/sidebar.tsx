"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/auth-context"
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
    Building2,
    Briefcase,
    GraduationCap,
    Info,
    Lock,
    MessageSquareQuote,
    ChevronRight,
    Armchair,
    ClipboardList,
    Target,
    ScrollText
} from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type MenuItem = {
    href: string
    label: string
    icon: any
    typeParam?: "pura" | "yayasan" | "pasraman"
}

type MenuGroup = {
    title: string
    key: string
    icon?: any
    themeColor: string
    activeBg: string
    activeText: string
    dotClass: string
    hoverClass: string
    items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
    {
        title: "Pura",
        key: "pura",
        icon: Building2,
        themeColor: "text-orange-600",
        activeBg: "bg-orange-50 dark:bg-orange-900/20",
        activeText: "text-orange-700 dark:text-orange-400",
        dotClass: "bg-orange-600",
        hoverClass: "hover:bg-orange-50/50 hover:text-orange-700 dark:hover:bg-orange-950/30",
        items: [
            { href: "/dashboard/activities", label: "Kegiatan Pura", icon: Calendar, typeParam: "pura" },
            { href: "/dashboard/gallery", label: "Galeri Foto", icon: Layers, typeParam: "pura" },
            { href: "/dashboard/hero-slides", label: "Hero Slides", icon: ImageIcon, typeParam: "pura" },
            { href: "/dashboard/testimonials", label: "Testimoni Umat", icon: MessageSquare, typeParam: "pura" },
            { href: "/dashboard/remarks", label: "Kata Sambutan", icon: MessageSquareQuote, typeParam: "pura" },
            { href: "/dashboard/organization", label: "Struktur Organisasi", icon: Users, typeParam: "pura" },
            { href: "/dashboard/facilities", label: "Fasilitas", icon: Armchair, typeParam: "pura" },
            { href: "/dashboard/rules", label: "Tata Tertib", icon: ScrollText, typeParam: "pura" },
            { href: "/dashboard/about", label: "Tentang Pura", icon: Info, typeParam: "pura" },
            { href: "/dashboard/contact-info", label: "Kontak & Lokasi", icon: MapPin, typeParam: "pura" },
            { href: "/dashboard/site-identity", label: "Identitas Web", icon: Settings, typeParam: "pura" },
        ],
    },
    {
        title: "Yayasan",
        key: "yayasan",
        icon: Briefcase,
        themeColor: "text-blue-600",
        activeBg: "bg-blue-50 dark:bg-blue-900/20",
        activeText: "text-blue-700 dark:text-blue-400",
        dotClass: "bg-blue-600",
        hoverClass: "hover:bg-blue-50/50 hover:text-blue-700 dark:hover:bg-blue-950/30",
        items: [
            { href: "/dashboard/gallery", label: "Galeri Foto", icon: Layers, typeParam: "yayasan" },
            { href: "/dashboard/hero-slides", label: "Hero Slides", icon: ImageIcon, typeParam: "yayasan" },
            { href: "/dashboard/programs", label: "Proker", icon: ClipboardList, typeParam: "yayasan" },
            { href: "/dashboard/vision-mission", label: "Visi & Misi", icon: Target, typeParam: "yayasan" },
            { href: "/dashboard/remarks", label: "Kata Sambutan", icon: MessageSquareQuote, typeParam: "yayasan" },
            { href: "/dashboard/organization", label: "Struktur Organisasi", icon: Users, typeParam: "yayasan" },
            { href: "/dashboard/about", label: "Tentang Yayasan", icon: Info, typeParam: "yayasan" },
            { href: "/dashboard/contact-info", label: "Kontak & Lokasi", icon: MapPin, typeParam: "yayasan" },
            { href: "/dashboard/site-identity", label: "Identitas Web", icon: Settings, typeParam: "yayasan" },
        ],
    },
    {
        title: "Pasraman",
        key: "pasraman",
        icon: GraduationCap,
        themeColor: "text-emerald-600",
        activeBg: "bg-emerald-50 dark:bg-emerald-900/20",
        activeText: "text-emerald-700 dark:text-emerald-400",
        dotClass: "bg-emerald-600",
        hoverClass: "hover:bg-emerald-50/50 hover:text-emerald-700 dark:hover:bg-emerald-950/30",
        items: [
            { href: "/dashboard/activities", label: "Kegiatan Pasraman", icon: Calendar, typeParam: "pasraman" },
            { href: "/dashboard/gallery", label: "Galeri Foto", icon: Layers, typeParam: "pasraman" },
            { href: "/dashboard/hero-slides", label: "Hero Slides", icon: ImageIcon, typeParam: "pasraman" },
            { href: "/dashboard/remarks", label: "Kata Sambutan", icon: MessageSquareQuote, typeParam: "pasraman" },
            { href: "/dashboard/vision-mission", label: "Visi & Misi", icon: Target, typeParam: "pasraman" },
            { href: "/dashboard/facilities", label: "Fasilitas Belajar", icon: Armchair, typeParam: "pasraman" },
            { href: "/dashboard/organization", label: "Struktur Organisasi", icon: Users, typeParam: "pasraman" },
            { href: "/dashboard/about", label: "Tentang Pasraman", icon: Info, typeParam: "pasraman" },
            { href: "/dashboard/contact-info", label: "Kontak & Lokasi", icon: MapPin, typeParam: "pasraman" },
            { href: "/dashboard/site-identity", label: "Identitas Web", icon: Settings, typeParam: "pasraman" },
        ],
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { logout, user } = useAuth()

    const [isOpen, setIsOpen] = useState(false)
    const [activeGroupKey, setActiveGroupKey] = useState<string>("pura")

    useEffect(() => {
        const typeParam = searchParams.get("type") || searchParams.get("entity_type")

        if (typeParam && ["pura", "yayasan", "pasraman"].includes(typeParam)) {
            setActiveGroupKey(typeParam)
        } else if (pathname.includes("site-identity")) {
            setActiveGroupKey("global")
        }
    }, [searchParams, pathname])

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    const toggleGroup = (key: string) => {
        setActiveGroupKey(key)
    }

    const isLinkActive = (item: MenuItem) => {
        const pathMatches = pathname === item.href
        if (item.typeParam) {
            const currentType = searchParams.get("type") || searchParams.get("entity_type")
            return pathMatches && currentType === item.typeParam
        }
        return pathname.startsWith(item.href)
    }

    const getHref = (item: MenuItem) => {
        if (item.typeParam) {
            return `${item.href}?type=${item.typeParam}`
        }
        return item.href
    }

    return (
        <>
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 flex items-center px-4 justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 -ml-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-md transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Image src="/sdhd_banjar_tangerang.svg" alt="Logo" width={24} height={24} className="object-contain" />
                        <span className="font-bold text-foreground text-sm">Admin Panel</span>
                    </div>
                </div>
            </header>

            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen w-64 bg-background border-r border-border shadow-xl transition-transform duration-300 ease-in-out z-50 md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">

                    <div className="h-16 flex items-center justify-between px-5 border-b border-border bg-gradient-to-r from-background to-muted/30">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="relative w-8 h-8 flex items-center justify-center bg-background rounded-lg shadow-sm border group-hover:border-orange-200 transition-colors">
                                <Image src="/sdhd_banjar_tangerang.svg" alt="Logo" width={20} height={20} className="object-contain" priority />
                            </div>
                            <div className="leading-tight">
                                <h1 className="font-bold text-foreground text-base">Admin Panel</h1>
                                <p className="text-[10px] text-muted-foreground">Pura Agung Kertajaya</p>
                            </div>
                        </Link>
                        <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-muted-foreground hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-border">

                        <Link
                            href="/dashboard"
                            onClick={() => {
                                setIsOpen(false)
                                setActiveGroupKey("")
                            }}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-6",
                                pathname === "/dashboard"
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-accent"
                            )}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard Utama
                        </Link>

                        <div className="space-y-4">
                            {menuGroups.map((group) => {
                                const isExpanded = activeGroupKey === group.key
                                const GroupIcon = group.icon

                                return (
                                    <div
                                        key={group.key}
                                        className={cn(
                                            "rounded-xl transition-all duration-300 border",
                                            isExpanded
                                                ? "bg-card border-border shadow-sm pb-2"
                                                : "border-transparent hover:bg-muted/30"
                                        )}
                                    >
                                        <button
                                            onClick={() => toggleGroup(group.key)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-bold transition-colors group select-none",
                                                isExpanded ? group.themeColor : "text-muted-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-1.5 rounded-md transition-colors",
                                                    isExpanded ? `bg-current/10 ${group.themeColor}` : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                                                )}>
                                                    {GroupIcon && <GroupIcon className="w-4 h-4" />}
                                                </div>
                                                <span>{group.title}</span>
                                            </div>
                                            <ChevronRight className={cn(
                                                "w-4 h-4 transition-transform duration-200",
                                                isExpanded ? "rotate-90" : "text-muted-foreground/50"
                                            )} />
                                        </button>

                                        <div
                                            className={cn(
                                                "overflow-hidden transition-all duration-300 ease-in-out px-2",
                                                isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                                            )}
                                        >
                                            <div className="space-y-1 pt-1 ml-4 mb-2">
                                                {group.items.map((item) => {
                                                    const Icon = item.icon
                                                    const active = isLinkActive(item)
                                                    const fullHref = getHref(item)

                                                    return (
                                                        <Link
                                                            key={item.label + item.typeParam}
                                                            href={fullHref}
                                                            onClick={() => setIsOpen(false)}
                                                            className={cn(
                                                                "group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                                                active
                                                                    ? cn(group.activeBg, group.activeText)
                                                                    : cn("text-muted-foreground", group.hoverClass)
                                                            )}
                                                        >
                                                            {active ? (
                                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", group.dotClass)} />
                                                            ) : (
                                                                <Icon className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground/70 shrink-0" />
                                                            )}

                                                            <span className={cn(
                                                                active ? "translate-x-0 font-semibold" : "-translate-x-1 group-hover:translate-x-0 transition-transform"
                                                            )}>
                                                                {item.label}
                                                            </span>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8 pt-4 border-t border-border px-1">
                            <Link
                                href="/dashboard/user-profile"
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    pathname === "/dashboard/user-profile"
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-accent"
                                )}
                            >
                                <Lock className="w-4 h-4" />
                                Ganti Password
                            </Link>
                        </div>
                    </nav>

                    <div className="p-3 border-t border-border bg-muted/10">
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center border border-orange-200 shrink-0 shadow-sm">
                                <span className="text-sm font-bold text-orange-700">
                                    {user?.email?.charAt(0).toUpperCase() || "A"}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-foreground truncate">
                                    {user?.email || "Admin"}
                                </p>
                                <button
                                    onClick={handleLogout}
                                    className="text-[10px] text-red-500 hover:underline font-medium flex items-center gap-1 mt-0.5"
                                >
                                    <LogOut className="w-3 h-3" /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}