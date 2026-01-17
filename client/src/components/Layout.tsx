import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { clsx } from "clsx";
import { GraduationCap, LayoutDashboard, Users } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    // Future expansion: { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Mobile-First Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <img src="/logo.png" alt="Imaiyavarman Silambam Logo" className="w-8 h-8 rounded-lg object-contain" />
          <h1 className="font-display font-bold text-lg tracking-tight text-slate-900 truncate">
            Imaiyavarman Training Center
          </h1>
        </div>
        
        {/* <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={clsx(
                "p-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50"
              )}>
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav> */}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
