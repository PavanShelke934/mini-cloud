import React from 'react';
import { Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors duration-300">
              <Cloud size={24} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Aura Cloud
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          
          <ProfileDropdown />
        </div>
        
      </div>
    </header>
  );
};

export default Navbar;
