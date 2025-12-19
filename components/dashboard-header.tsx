"use client"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChevronRight } from "lucide-react"

interface DashboardHeaderProps {
    breadcrumbs?: { label: string; href?: string }[]
    title: string
    description?: string
    children?: React.ReactNode
}

export function DashboardHeader({
                                    breadcrumbs,
                                    title,
                                    description,
                                    children
                                }: DashboardHeaderProps) {
    return (
        <div className="space-y-4 pb-8 md:space-y-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div className="space-y-1.5 flex-1 min-w-0">
                    {breadcrumbs && (
                        <nav className="flex items-center flex-wrap text-xs md:text-sm text-muted-foreground mb-2">
                            {breadcrumbs.map((item, index) => (
                                <div key={index} className="flex items-center">
                                    {index > 0 && <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/50" />}
                                    <span
                                        className={`truncate ${index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </nav>
                    )}

                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl truncate">
                        {title}
                    </h1>

                    {description && (
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-2 md:pt-0">
                    {children}
                    {children && <div className="h-8 w-px bg-border mx-1" />}

                    <ThemeToggle />
                </div>
            </div>

            <div className="h-px w-full bg-border/60" />
        </div>
    )
}