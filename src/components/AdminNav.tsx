"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, BarChart3, Shield, Home, User, Settings } from "lucide-react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Admin dashboard overview"
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: User,
    description: "Admin account settings"
  },
  {
    title: "Preferences",
    href: "/admin/preferences",
    icon: Settings,
    description: "Admin preferences"
  },
  {
    title: "Stats",
    href: "/admin/stats",
    icon: BarChart3,
    description: "Daily aggregated statistics"
  },
  {
    title: "Moderation",
    href: "/admin/moderation",
    icon: Shield,
    description: "Nickname moderation tools"
  }
];

function NavLink({ item, pathname }: { item: typeof adminNavItems[number]; pathname: string | null }) {
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        isActive
          ? "bg-violet-100 dark:bg-violet-800/30"
          : "bg-muted/60 group-hover:bg-muted"
      )}>
        <item.icon className={cn(
          "h-3.5 w-3.5",
          isActive
            ? "text-violet-600 dark:text-violet-400"
            : "text-muted-foreground group-hover:text-foreground"
        )} strokeWidth={2} />
      </div>
      <span>{item.title}</span>
      {isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
      )}
    </Link>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {/* Overview */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
          Overview
        </p>
        {adminNavItems.slice(0, 1).map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>

      {/* Account */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
          Account
        </p>
        {adminNavItems.slice(1, 3).map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>

      {/* Tools */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
          Tools
        </p>
        {adminNavItems.slice(3).map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
