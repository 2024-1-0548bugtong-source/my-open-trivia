"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Settings, Star, Trophy } from "lucide-react";
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
import FirestoreTest from "@/components/FirestoreTest";
import UserHeader from "@/components/UserHeader";

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
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const SettingsSidebarGroup = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Preferences",
      icon: Settings,
      url: "/preferences",
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings ⚙️</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
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
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/40">
          <SidebarHeader>
            <div className="p-4 pb-2">
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-primary">
                Open Trivia
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Developed by <em>G5</em>
              </p>
            </div>
            <Separator className="opacity-50" />
          </SidebarHeader>
          <SidebarContent>
            <ApplicationSidebarGroup />
            <SettingsSidebarGroup />
          </SidebarContent>
          <SidebarFooter className="p-4">
            <p className="text-xs text-muted-foreground/60 text-center">
              WMAD-302 Group 5 <br />
              &copy; 2025
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
            <FirestoreTest />
            {children}
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
