
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  UploadCloud,
  PieChart,
  Menu,
  X,
  LogIn,
  ExternalLink
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onUploadClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onUploadClick }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const routes = [
    {
      label: 'Block Wise Data',
      icon: BarChart3,
      href: '/',
      active: location.pathname === '/' || location.pathname === '/dashboard',
    },
    {
      label: 'Finance',
      icon: PieChart,
      href: '/finance',
      active: location.pathname === '/finance',
    },
  ];

  const externalLinks = [
    {
      label: 'PIAL',
      icon: ExternalLink,
      href: 'http://portal.microirrigation.site',
    },
    {
      label: 'Admin Login',
      icon: LogIn,
      href: 'http://portal.microirrigation.site/admin',
    },
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col bg-white border-r transition-transform duration-300 ease-in-out",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4 py-2">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center">
            {/* Logo placeholder - replace with actual logo */}
            <img src="/logo.png" alt="PMKSY-BKSY Logo" className="h-full" />
          </div>
          <span className="text-lg font-semibold">PMKSY-BKSY</span>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {/* Main Navigation Links */}
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-scheme-light",
                route.active ? "bg-scheme-light text-scheme-pmksy" : "text-gray-700"
              )}
            >
              <route.icon className={cn(
                "h-4 w-4",
                route.active ? "text-scheme-pmksy" : "text-gray-400"
              )} />
              {route.label}
            </Link>
          ))}
          
          {/* Upload Button - Triggers Login Modal */}
          <button
            onClick={() => {
              onUploadClick();
              isMobile && setIsOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-scheme-light",
              location.pathname === "/upload" ? "bg-scheme-light text-scheme-pmksy" : "text-gray-700"
            )}
          >
            <UploadCloud className={cn(
              "h-4 w-4",
              location.pathname === "/upload" ? "text-scheme-pmksy" : "text-gray-400"
            )} />
            Upload
          </button>
          
          {/* External Links */}
          {externalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-scheme-light text-gray-700"
            >
              <link.icon className="h-4 w-4 text-gray-400" />
              {link.label}
            </a>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <div className="rounded-md bg-scheme-light px-3 py-4">
          <h4 className="mb-1 text-sm font-medium">Need Help?</h4>
          <p className="mb-3 text-xs text-gray-500">
            If you need assistance with the system, please contact the administrator.
          </p>
          <Button
            size="sm"
            className="w-full bg-scheme-pmksy hover:bg-scheme-pmksy/90"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
