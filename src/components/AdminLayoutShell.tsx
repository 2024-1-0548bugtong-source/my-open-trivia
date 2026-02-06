"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import AdminHeader from "@/components/AdminHeader";
import { AdminNav } from "@/components/AdminNav";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background admin-area">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <div className="flex h-full max-h-screen flex-col">
            {/* Sidebar header */}
            <div className="flex h-14 items-center border-b border-border px-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-sm">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground leading-none block">Admin</span>
                  <span className="text-[11px] text-muted-foreground leading-none">Panel</span>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 px-3 py-4 overflow-y-auto">
              <AdminNav />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <SidebarInset className="flex-1 overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <div className="flex-1">
              <AdminHeader />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
