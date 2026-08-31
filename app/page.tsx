"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/LoadingSpinner";
import AuthPage from "@/views/auth";

export default function AuthRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // wouter's <Redirect> pushes by default — keep the same history semantics
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <PageLoader />;
  }

  return <AuthPage />;
}
