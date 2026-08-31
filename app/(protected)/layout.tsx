"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PageLoader } from "@/components/LoadingSpinner";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { useIsMobile } from "@/hooks/use-mobile";

function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="FinTrack logo"
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="font-semibold">FinTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20">{children}</main>
        <MobileBottomNav />
      </div>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 px-4 py-2 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <PWAInstallButton />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // original ProtectedRoute used wouter setLocation("/") — push semantics
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
