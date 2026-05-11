import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoImage from '../../imports/778eeba4879db61f25a5ee2de1d2f9c2.png';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1F1410]/80 backdrop-blur-lg border-b border-[#C44536]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="AlphaMind Logo"
              className="h-12 w-auto"
            />
          </div>

        </div>

      </div>
    </nav>
  );
}
