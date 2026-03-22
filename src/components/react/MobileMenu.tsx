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
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <div className="md:hidden">
      {/* Trigger Button */}
      <Button
        type="button"
        variant="ghost"
        className="text-white/50 hover:text-white hover:bg-transparent hover:cursor-pointer p-2"
        onClick={toggleMenu}
      >
        <MenuIcon className="size-5" />
      </Button>

      {/* Full Screen Overlay */}
      {isMounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            'fixed inset-0 bg-[#140810]/90 backdrop-blur-md z-50 transition-opacity duration-500',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Top Bar */}
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-20 w-full flex items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-transparent p-2"
              onClick={closeMenu}
            >
              <XIcon className="size-5" />
            </Button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col items-center justify-center mt-20">
            {links.map((link, i) => (
              <div key={link.href} className="w-full max-w-xs flex flex-col items-center">
                {i === 0 && (
                  <span className="w-full h-px bg-white/10" aria-hidden="true" />
                )}
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    'relative w-full text-center py-7 text-sm uppercase tracking-[0.3em] font-sans font-semibold transition-colors duration-300',
                    currentPath === link.href
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/70'
                  )}
                >
                  {currentPath === link.href && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#D462A6] shadow-[0_0_8px_rgba(212,98,166,0.5)]" />
                  )}
                  {link.label}
                </a>
                <span className="w-full h-px bg-white/10" aria-hidden="true" />
              </div>
            ))}
          </nav>
        </div>,
        document.body
      )}
    </div>
  );
}
