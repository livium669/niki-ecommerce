 'use client';
 import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CartPanel from './CartPanel';
import { useCart } from './CartContext';
import { useSession, signOut } from '@/lib/auth-client';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { open, openCart, closeCart, totalCount } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  const navLinks = [
    { name: 'Collection', href: '/products' },
    { name: 'Technology', href: '#technology' },
    { name: 'Story', href: '#story' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled || mobileMenuOpen ? 'bg-black/90 backdrop-blur-md py-4' : 'bg-transparent py-6 md:py-8'}`}>
        <div className="w-full px-6 md:px-16 flex justify-between items-center">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 -ml-2 text-white z-50 relative hover:text-gray-300 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>

          <Link href="/" className="text-2xl font-black tracking-tighter z-50 relative">NIKI</Link>
          
          <div className="hidden md:flex items-center space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[10px] uppercase tracking-[0.3em] font-bold hover:text-gray-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4 z-50">
            {session ? (
              <div className="flex items-center gap-1 mr-2">
                <Link href="/profile" className="flex items-center gap-3 hover:opacity-70 transition-opacity group" title="My Profile">
                  <Image 
                    src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=27272a&color=ffffff`}
                    alt={session.user.name} 
                    width={32}
                    height={32}
                    className="rounded-full border border-white/20 object-cover group-hover:border-white transition-colors"
                  />
                  <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:block group-hover:text-gray-300 transition-colors">
                    {session.user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    router.refresh();
                  }}
                  className="relative p-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors ml-2"
                  aria-label="Logout"
                  title="Sign Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" x2="9" y1="12" y2="12"/>
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="relative p-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors mr-2"
                aria-label="Login"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            )}

            <Link
              href={session ? "/wishlist" : "/login?callbackUrl=/wishlist"}
              className="relative p-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors mr-2"
              aria-label="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </Link>

            <button
              type="button"
              aria-label="Open cart"    
              onClick={openCart}
              className="relative p-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4h-2l-1 2h-2v2h2l3.6 7.59-1.35 2.41c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2h-11.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.74c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.05-.08.07-.18.07-.27 0-.28-.22-.5-.5-.5h-16.07l-.94-2zm5 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-500 md:hidden ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ zIndex: 9999, height: '100dvh' }}
        >
          <div className="absolute top-6 right-6">
            <button 
              className="text-white p-2 hover:text-gray-300 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center space-y-12 w-full px-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-4xl uppercase tracking-[0.2em] font-black text-white hover:text-gray-400 transition-all duration-500 text-center block"
                style={{ 
                  transitionDelay: mobileMenuOpen ? `${100 + index * 100}ms` : '0ms',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <CartPanel open={open} onClose={closeCart} />
    </>
  );
};

export default Navbar;
