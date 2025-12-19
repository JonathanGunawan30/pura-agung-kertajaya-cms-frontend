"use client"

import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import {useAuth} from "@/app/auth-context"
import {Button} from "@/components/ui/button"
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
    Lock,
} from "lucide-react"
import {useState} from "react"
import Image from "next/image"

const menuCategories = [
    {
        title: null,
        items: [{href: "/dashboard", label: "Dashboard", icon: LayoutDashboard}],
    },
    {
        title: "Kelola Konten",
        items: [
            {href: "/dashboard/activities", label: "Kegiatan", icon: Calendar},
            {href: "/dashboard/facilities", label: "Fasilitas", icon: Building},
            {href: "/dashboard/gallery", label: "Galeri Foto", icon: Layers},
            {href: "/dashboard/hero-slides", label: "Hero Slides", icon: ImageIcon},
            {href: "/dashboard/testimonials", label: "Testimoni", icon: MessageSquare},
        ],
    },
    {
        title: "Konfigurasi",
        items: [
            {href: "/dashboard/about", label: "Tentang Pura", icon: Info},
            {href: "/dashboard/contact-info", label: "Kontak & Lokasi", icon: MapPin},
            {href: "/dashboard/organization", label: "Struktur Organisasi", icon: Users},
            {href: "/dashboard/site-identity", label: "Identitas Website", icon: Settings},
        ],
    },
    {
        title: "Akun",
        items: [{href: "/dashboard/user-profile", label: "Ganti Password", icon: Lock}],
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const {logout, user} = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    return (
        <>
            <header
                className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 flex items-center px-4 justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 -ml-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-md transition-colors"
                    >
                        <Menu className="w-6 h-6"/>
                    </button>

                    <div className="flex items-center gap-2">
                        <Image
                            src="/sdhd_banjar_tangerang.svg"
                            alt="Logo"
                            width={24}
                            height={24}
                            className="object-contain"
                        />
                        <span className="font-bold text-foreground text-sm">Pura Admin</span>
                    </div>
                </div>
            </header>

            <aside
                className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border shadow-xl transition-transform duration-300 ease-in-out z-50 md:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full">

                    <div
                        className="h-16 flex items-center justify-between px-5 border-b border-border bg-orange-50/50 dark:bg-orange-950/10">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div
                                className="relative w-8 h-8 flex items-center justify-center bg-background rounded-lg shadow-sm border border-orange-100 dark:border-orange-900 group-hover:border-orange-200 dark:group-hover:border-orange-700 transition-colors">
                                <Image
                                    src="/sdhd_banjar_tangerang.svg"
                                    alt="Logo"
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="leading-tight">
                                <h1 className="font-bold text-foreground text-base">Pura Admin</h1>
                                <p className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-500 tracking-wide">CMS
                                    Dashboard</p>
                            </div>
                        </Link>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-border">
                        {menuCategories.map((category, index) => (
                            <div key={index}>
                                {category.title && (
                                    <h3 className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest font-sans">
                                        {category.title}
                                    </h3>
                                )}
                                <div className="space-y-0.5">
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
                                                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-orange-600 text-white shadow-md shadow-orange-200 dark:shadow-none"
                                                        : "text-muted-foreground hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400"
                                                }`}
                                            >
                                                <Icon className={`w-5 h-5 transition-colors ${
                                                    isActive ? "text-white" : "text-muted-foreground/70 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                                                }`}/>

                                                <span className="flex-1 truncate">{item.label}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="p-3 border-t border-border bg-muted/20">
                        <div className="bg-background border border-border rounded-lg p-2.5 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div
                                    className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border border-orange-200 dark:border-orange-800 shrink-0">
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                            {user?.email?.charAt(0).toUpperCase() || "A"}
                        </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-medium text-muted-foreground">Login sebagai</p>
                                    <p className="text-xs font-bold text-foreground truncate" title={user?.email || ""}>
                                        {user?.email || "Admin"}
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="w-full justify-center gap-2 h-8 text-xs border-border hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 transition-colors bg-background text-foreground"
                            >
                                <LogOut className="w-3.5 h-3.5"/>
                                Keluar
                            </Button>
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