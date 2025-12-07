import { MenuIcon, XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface Link {
  href: string;
  label: string;
}

interface MobileMenuProps {
  currentPath: string;
  links: Link[];
}
export default function MobileMenu({ currentPath, links }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow =  isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isMounted) return null;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Trigger Button */}
      <Button type="button" variant="ghost" className="text-base font-semibold gap-2 bg-transparent hover:cursor-pointer" onClick={toggleMenu}>
        <MenuIcon className="size-6" />
      </Button>

      {/* Full Screen Overlay */}
      {isMounted && createPortal(
        <div className={cn('fixed inset-0 bg-black/50 z-50 transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
          {/* Top Bar */}
          <div className="max-w-7xl mx-auto px-6 h-32 w-full flex items-center justify-end">
            <Button type="button" variant='ghost' className="text-white hover:bg-white/10 rounded-full p-2" onClick={closeMenu}>
              <XIcon className="size-6" />
            </Button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-8">
            {links.map((link) => (
              <a href={link.href} key={link.href} onClick={closeMenu}
                className={cn('text-2xl font-semibold uppercase tracking-[0.35em] transition-all duration-300 px-6 py-3 rounded-lg', currentPath == link.href ? 'text-white font-bold bg-white/10 translate-x-2': 'text-white/60')}
              >{link.label}</a>
            ))}
          </nav>
        </div>,
        document.body
      )}
    </div>
  );
}