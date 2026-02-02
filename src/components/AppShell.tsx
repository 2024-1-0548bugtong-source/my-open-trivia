"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Star, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import UserHeader from "@/components/UserHeader";
import dynamic from "next/dynamic";

// Dynamically import AuthDevPanel to avoid SSR issues
const AuthDevPanel = dynamic(() => import("@/components/dev/AuthDevPanel"), {
  ssr: false,
});


const ApplicationSidebarGroup = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      url: "/",
    },
    {
      title: "Categories",
      icon: List,
      url: "/categories",
    },
    {
      title: "Leaderboard",
      icon: Trophy,
      url: "/leaderboard",
    },
    {
      title: "Favorites",
      icon: Star,
      url: "/favorites",
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-foreground/70">
        Application
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url} className="group">
                  <item.icon 
                    className="transition-colors" 
                    size={20} 
                    strokeWidth={2}
                  />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Auth pages that should not show sidebar
  const authPages = ['/login', '/signup', '/reset-password'];
  const isAuthPage = authPages.includes(pathname ?? '');

  // If on auth page, show simplified layout without sidebar
  if (isAuthPage) {
    return (
      <>
        <main className="min-h-screen bg-background">
          {children}
        </main>
        <Toaster />
        {/* DEV-ONLY: Auth testing panel (only visible in development) */}
        <AuthDevPanel />
      </>
    );
  }

  // Normal layout with sidebar for authenticated app pages
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/40 bg-sidebar">
          <SidebarHeader>
            <div className="p-4 pb-2">
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-foreground">
                Open Trivia
              </h1>
            </div>
            <Separator className="opacity-50" />
          </SidebarHeader>
          <SidebarContent>
            <ApplicationSidebarGroup />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              © 2026 Open Trivia<br />
              Built with Next.js + Firebase
            </p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-15">
            <SidebarTrigger />
            <div className="flex-1">
              <UserHeader />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-muted/10">
            {children}
          </main>
        </SidebarInset>
      </div>
      <Toaster />
      {/* DEV-ONLY: Auth testing panel (only visible in development) */}
      <AuthDevPanel />
    </SidebarProvider>
  );
}
