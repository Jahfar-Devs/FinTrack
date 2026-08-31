"use client";

import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReminderPopup } from "@/components/ReminderPopup";
import { useOneSignal } from "@/hooks/useOneSignal";

/** Runs side-effects that require auth context (OneSignal, etc.) */
function AppInitializer() {
  useOneSignal();
  return null;
}

/**
 * OneSignalSDKWorker.js is the single service worker for this PWA.
 * It imports OneSignal's push SDK AND contains the PWA caching logic,
 * so there is exactly ONE worker at scope "/" — no conflicts on any device.
 */
function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register("/OneSignalSDKWorker.js", { scope: "/" })
          .then((reg) => console.log("[SW] Registered:", reg.scope))
          .catch((err) => console.error("[SW] Registration failed:", err));
      };
      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register);
        return () => window.removeEventListener("load", register);
      }
    }
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <AppInitializer />
            <ServiceWorkerRegister />
            {children}
            <ReminderPopup />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
