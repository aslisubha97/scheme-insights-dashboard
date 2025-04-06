
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="h-screen overflow-hidden bg-scheme-light">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main
        className={`h-full overflow-y-auto transition-all ${
          isMobile ? 'w-full' : 'ml-72'
        }`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">Scheme Insights</span>
            </div>
            <div className="w-8" /> {/* Empty space for alignment */}
          </div>
        )}
        
        {/* Content Wrapper */}
        <div className="container py-6 px-4 md:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
