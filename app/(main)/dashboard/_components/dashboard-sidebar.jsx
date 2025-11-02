'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Mail,
  Search,
  MessageCircle,
  Mic,
  Video,
  TrendingUp,
  Map,
  BarChart3,
  User,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from './dashboard-layout';
import { useAuth } from '@/contexts/auth-context';

const dashboardNavigation = [
  {
    section: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }
    ]
  },
  {
    section: "Documents",
    items: [
      { name: "Resume Builder", icon: FileText, href: "/resume" },
      { name: "Cover Letter", icon: Mail, href: "/ai-cover-letter" },
      { name: "CV Analyzer", icon: Search, href: "/cv-analyser" }
    ]
  },
  {
    section: "Interview Prep",
    items: [
      { name: "Practice Questions", icon: MessageCircle, href: "/interview" },
      { name: "Mock Interviews", icon: Mic, href: "/mock-interview" },
      { name: "Interview Simulator", icon: Video, href: "/interview-simulator" }
    ]
  },
  {
    section: "Career Growth",
    items: [
      { name: "Industry Insights", icon: TrendingUp, href: "/industry-insights" },
      { name: "Career Roadmap", icon: Map, href: "/roadmap" },
      { name: "Progress Analytics", icon: BarChart3, href: "/analytics" }
    ]
  }
];

export default function DashboardSidebar() {
  const { isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile hamburger button - positioned below header */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-24 left-4 z-50 md:hidden bg-card hover:bg-muted border border-border text-foreground"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-20 h-[calc(100vh-5rem)] bg-card border-r border-border transition-all duration-300 z-40',
          // Desktop behavior
          'hidden md:flex flex-col',
          isExpanded ? 'w-64' : 'w-20',
          // Mobile behavior
          'md:translate-x-0',
          isMobileOpen ? 'flex w-64 translate-x-0 top-0 h-full' : 'md:flex -translate-x-full'
        )}
      >
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {dashboardNavigation.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Header with Toggle Button (only for Overview) */}
              <div className={cn(
                'px-2 mb-1 flex items-center justify-between',
                !isExpanded && sectionIndex !== 0 && 'md:opacity-0 md:h-0 md:overflow-hidden'
              )}>
                <h3 className={cn(
                  'text-[11px] font-semibold text-muted-foreground uppercase tracking-wider',
                  !isExpanded && 'md:opacity-0 md:w-0 md:overflow-hidden'
                )}>
                  {section.section}
                </h3>
                
                {/* Toggle button beside Overview */}
                {sectionIndex === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'hidden md:flex h-5 w-5 p-0 text-muted-foreground hover:text-foreground hover:bg-muted',
                      !isExpanded && 'md:mx-auto'
                    )}
                    onClick={toggleExpanded}
                    title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {isExpanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </Button>
                )}
              </div>
              
              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors group relative',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                        !isExpanded && 'md:justify-center md:px-0'
                      )}
                    >
                      <Icon className={cn(
                        'h-4 w-4 flex-shrink-0',
                        !isExpanded && 'md:h-4 md:w-4'
                      )} />
                      <span
                        className={cn(
                          'text-sm whitespace-nowrap transition-all duration-300',
                          !isExpanded && 'md:opacity-0 md:w-0 md:overflow-hidden md:absolute'
                        )}
                      >
                        {item.name}
                      </span>

                      {/* Tooltip for collapsed state */}
                      {!isExpanded && (
                        <div className="absolute left-full ml-2 px-2.5 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden md:block border border-border shadow-lg">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="p-2.5 border-t border-border mt-auto">
          <div className={cn(
            'flex items-center gap-2.5',
            !isExpanded && 'md:justify-center'
          )}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-medium text-sm">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div className={cn(
              'min-w-0 flex-1 transition-all duration-300',
              !isExpanded && 'md:opacity-0 md:w-0 md:overflow-hidden md:absolute'
            )}>
              <p className="text-foreground text-sm font-medium truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}