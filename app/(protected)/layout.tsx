'use client'

import { ReactNode } from "react"
import NavMenu from "@/components/nav-menu"
import NavProjects from "@/components/nav-project"

import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar"

function DashboardHeader() {
    const { toggleSidebar, isMobile } = useSidebar()
    return <NavMenu onToggleSidebarAction={isMobile ? toggleSidebar : undefined} />
}

function ResponsiveNavProjects() {
    const { isMobile } = useSidebar()

    if (isMobile) {
        return (
            <Sidebar collapsible="offcanvas">
                <NavProjects />
            </Sidebar>
        )
    }

    return (
        <aside className="hidden w-fit shrink-0 md:block">
            <NavProjects />
        </aside>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: ReactNode
}) {

    return (
        <SidebarProvider>
            <div className="flex min-h-svh w-screen flex-col bg-muted/40">
                {/* NAV TOP */}
                <DashboardHeader />

                <div className="flex w-full flex-1 gap-6 px-3 sm:px-4 py-6">
                    {/* LEFT */}
                    <ResponsiveNavProjects />

                    {/* CONTENT */}
                    <main className="min-w-0 w-full flex-1">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    )
}
