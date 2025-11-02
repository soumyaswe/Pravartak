"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  
  // Check if we're on a dashboard page
  const isDashboardPage = pathname?.startsWith('/dashboard') || 
                         pathname?.startsWith('/resume') || 
                         pathname?.startsWith('/ai-cover-letter') ||
                         pathname?.startsWith('/cv-analyser') ||
                         pathname?.startsWith('/interview') ||
                         pathname?.startsWith('/mock-interview') ||
                         pathname?.startsWith('/industry-insights') ||
                         pathname?.startsWith('/roadmap') ||
                         pathname?.startsWith('/analytics');
  
  // Get sidebar state from localStorage (synced across components)
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  
  React.useEffect(() => {
    // Read initial state from localStorage
    const stored = localStorage.getItem('sidebar-expanded');
    if (stored !== null) {
      setSidebarExpanded(stored === 'true');
    }
    
    // Listen for storage changes (when sidebar toggles in other components)
    const handleStorageChange = (e) => {
      if (e.key === 'sidebar-expanded') {
        setSidebarExpanded(e.newValue === 'true');
      }
    };
    
    // Custom event for same-tab updates
    const handleSidebarToggle = (e) => {
      setSidebarExpanded(e.detail.isExpanded);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sidebar-toggle', handleSidebarToggle);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebar-toggle', handleSidebarToggle);
    };
  }, []);

  if (loading) {
    return (
      <header className={cn(
        "fixed top-0 border-b border-border/20 bg-background/60 backdrop-blur-xl z-40 supports-[backdrop-filter]:bg-background/40 transition-all duration-300",
        isDashboardPage ? (sidebarExpanded ? "left-0 md:left-64 right-0" : "left-0 md:left-20 right-0") : "left-0 right-0 w-full"
      )}>
        <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="ml-16 md:ml-20">
            <Link href="/">
              <Image
                src={"/logo.png"}
                alt="Pravartak Logo"
                width={220}
                height={70}
                className="h-14 py-1 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="animate-pulse">
            <div className="h-10 w-20 bg-gray-300 rounded"></div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className={cn(
      "fixed top-0 border-b border-border/20 bg-background/60 backdrop-blur-xl z-40 supports-[backdrop-filter]:bg-background/40 transition-all duration-300",
      isDashboardPage ? (sidebarExpanded ? "left-0 md:left-64 right-0" : "left-0 md:left-20 right-0") : "left-0 right-0 w-full"
    )}>
      <nav className="container mx-auto px-3 h-20 flex items-center justify-between">
        <div>
          <Link href="/">
            <Image
              src={"/logo.png"}
              alt="Pravartak Logo"
              width={220}
              height={70}
              className="h-14 py-1 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.displayName && (
                        <p className="font-medium">{user.displayName}</p>
                      )}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
