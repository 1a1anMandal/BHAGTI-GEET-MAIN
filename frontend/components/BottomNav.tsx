'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Radio, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on specific routes if needed (e.g. active room singing mode might hide it)
  // But prototype shows it even in some sub-pages. Let's keep it visible unless in specific full-screen views.
  if (pathname.includes('/room/')) {
    // Actually, prototype 2 doesn't show the bottom nav in active singing mode. 
    // It has a bottom action bar instead. So hide BottomNav in room.
    return null;
  }

  const links = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Live Room', href: '/live', icon: Radio },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[480px] bg-bg/90 backdrop-blur-lg border-t border-white/5 pb-safe pointer-events-auto">
        <div className="flex justify-around items-center p-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-muted hover:text-white transition-colors'}`}
              >
                <Icon size={24} className={isActive ? 'fill-primary/20' : ''} />
                <span className="text-[10px] font-medium tracking-wide">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
