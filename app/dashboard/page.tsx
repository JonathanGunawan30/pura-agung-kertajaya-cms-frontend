"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Newspaper, // Saya ganti ikon Calendar jadi Newspaper biar lebih cocok dengan "Berita"
    ImageIcon,
    Users,
    Building2,
    Briefcase,
    GraduationCap,
    ArrowRight,
    MapPin,
    FileText
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <DashboardHeader
                title="Selamat Datang, Admin!"
                description="Silakan pilih menu di bawah ini untuk mulai mengelola konten website."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <MenuCard
                    title="Pura Agung"
                    description="Kelola berita, galeri, & organisasi pura."
                    icon={Building2}
                    colorClass="text-orange-600 bg-orange-50 border-orange-200"
                    headerClass="border-orange-100"
                >
                    <MenuButton href="/dashboard/articles?type=pura" icon={Newspaper} label="Update Berita" />

                    <MenuButton href="/dashboard/gallery?type=pura" icon={ImageIcon} label="Upload Galeri Foto" />
                    <MenuButton href="/dashboard/organization?type=pura" icon={Users} label="Struktur Organisasi" />
                    <MenuButton href="/dashboard/facilities" icon={Building2} label="Data Fasilitas Pura" variant="ghost" />
                </MenuCard>

                <MenuCard
                    title="Yayasan Vidya"
                    description="Kelola berita yayasan & program kerja."
                    icon={Briefcase}
                    colorClass="text-blue-600 bg-blue-50 border-blue-200"
                    headerClass="border-blue-100"
                >
                    <MenuButton href="/dashboard/articles?type=yayasan" icon={Newspaper} label="Update Berita" />

                    <MenuButton href="/dashboard/programs?type=yayasan" icon={FileText} label="Program Kerja" />
                    <MenuButton href="/dashboard/organization?type=yayasan" icon={Users} label="Pengurus Yayasan" />
                    <MenuButton href="/dashboard/gallery?type=yayasan" icon={ImageIcon} label="Galeri Foto" variant="ghost" />
                </MenuCard>

                <MenuCard
                    title="Pasraman"
                    description="Kelola berita pendidikan & fasilitas."
                    icon={GraduationCap}
                    colorClass="text-emerald-600 bg-emerald-50 border-emerald-200"
                    headerClass="border-emerald-100"
                >
                    <MenuButton href="/dashboard/articles?type=pasraman" icon={Newspaper} label="Update Berita" />

                    <MenuButton href="/dashboard/facilities?type=pasraman" icon={Building2} label="Fasilitas Pasraman" />
                    <MenuButton href="/dashboard/organization?type=pasraman" icon={Users} label="Guru & Pengurus" />
                    <MenuButton href="/dashboard/site-identity?type=pasraman" icon={MapPin} label="Identitas Pasraman" variant="ghost" />
                </MenuCard>

            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <h3 className="text-sm font-semibold text-gray-900">Butuh bantuan?</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Jika Anda bingung atau ada kendala, silakan hubungi pengembang website.
                </p>
            </div>
        </div>
    )
}


function MenuCard({ title, description, icon: Icon, children, colorClass, headerClass }: any) {
    return (
        <Card className={`shadow-sm hover:shadow-md transition-all border-l-4 ${colorClass.split(" ").pop()}`}>
            <CardHeader className={`pb-4 border-b ${headerClass}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                        <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid gap-3">
                {children}
            </CardContent>
        </Card>
    )
}

function MenuButton({ href, icon: Icon, label, variant = "outline" }: any) {
    const isGhost = variant === "ghost"

    return (
        <Button
            variant={isGhost ? "ghost" : "outline"}
            className={`w-full justify-between h-auto py-3 px-4 group ${
                isGhost
                    ? "text-muted-foreground hover:text-foreground font-normal"
                    : "border-gray-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 bg-white"
            }`}
            asChild
        >
            <Link href={href}>
                <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isGhost ? "opacity-50" : "text-gray-500 group-hover:text-orange-600"}`} />
                    <span className="text-sm">{label}</span>
                </div>
                {!isGhost && <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />}
            </Link>
        </Button>
    )
}