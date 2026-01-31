import { Home, List, Settings, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
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
  SidebarInset
} from '@/components/ui/sidebar';
import { Switch, Route, Link, useLocation } from "wouter";
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Questions from './pages/Questions';
import Favorites from './pages/Favorites';
import Preferences from './pages/Preference';
import NotFound from './pages/not-found';
import { Toaster } from '@/components/ui/toaster';

const ApplicationSidebarGroup = () => {
  const [location] = useLocation();
  
  const menuItems = [
    {
      title: "Home",
      icon: Home,
      url: '/',
    },
    {
      title: "Categories",
      icon: List,
      url: '/categories'
    },
    {
      title: "Favorites",
      icon: Star,
      url: '/favorites'
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location === item.url}>
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
  const [location] = useLocation();

  const menuItems = [
    {
      title: "Preferences",
      icon: Settings,
      url: '/preferences'
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings ⚙️</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location === item.url}>
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

import { ThemeProvider } from './hooks/use-theme';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
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
            <Separator className="opacity-50"/>
          </SidebarHeader>
          <SidebarContent>
            <ApplicationSidebarGroup />
            <SettingsSidebarGroup />
          </SidebarContent>
          <SidebarFooter className="p-4">
            <p className="text-xs text-muted-foreground/60 text-center">
              WMAD-302 Group 5 <br/>
              &copy; 2025
            </p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
            <SidebarTrigger />
            <div className="flex-1">
               {/* Breadcrumbs or Header content could go here */}
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto bg-muted/10">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/categories" component={Categories} />
              <Route path="/questions/:id" component={Questions} />
              <Route path="/favorites" component={Favorites} />
              <Route path="/preferences" component={Preferences} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </SidebarInset>
      </div>
      <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
