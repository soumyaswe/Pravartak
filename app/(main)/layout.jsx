"use client";

import React from "react";
import ProtectedRoute from "@/components/protected-route";
import FeatureNavigation from "@/components/feature-navigation";
import { usePathname } from "next/navigation";

const MainLayout = ({ children }) => {
  const pathname = usePathname();
  
  // Don't show navigation on dashboard or onboarding
  const showNavigation = !pathname.includes("/dashboard") && !pathname.includes("/onboarding");

  return (
    <ProtectedRoute>
      {showNavigation && <FeatureNavigation />}
      <div className={showNavigation ? "mt-[136px] px-3 sm:px-4 md:px-6 mb-12" : "container mx-auto mt-24 mb-20"}>
        {children}
      </div>
    </ProtectedRoute>
  );
};

export default MainLayout;
