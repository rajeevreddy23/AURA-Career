'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  Menu,
  X,
  Search,
  Bell,
  BookOpen,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                {APP_NAME}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.slice(0, 7).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-input bg-background text-sm text-muted-foreground hover:border-primary/50 transition-colors min-w-[200px]"
              >
                <Search className="h-4 w-4" />
                <span>Search courses...</span>
                <kbd className="ml-auto hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Avatar
                        src={profile?.photoURL}
                        fallback={profile?.displayName}
                        size="sm"
                      />
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>

                    {isProfileOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-64 z-50 rounded-xl border border-border bg-card shadow-xl animate-scale-in">
                          <div className="p-3 border-b border-border">
                            <p className="font-medium text-sm">{profile?.displayName}</p>
                            <p className="text-xs text-muted-foreground">{profile?.email}</p>
                          </div>
                          <div className="p-1">
                            {[
                              { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                              { href: '/profile', icon: User, label: 'Profile' },
                              { href: '/settings', icon: Settings, label: 'Settings' },
                            ].map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                              >
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                          <div className="p-1 border-t border-border">
                            <button
                              onClick={logout}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 w-full transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-background border-t border-border overflow-y-auto animate-slide-up">
            <div className="p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              {user ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-500/10 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full" size="lg">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="w-full">
                    <Button variant="primary" className="w-full" size="lg">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
          <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 animate-scale-in">
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses, lessons, concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 text-xs text-muted-foreground">
                  ESC
                </kbd>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Quick Links</div>
                {[
                  { icon: BookOpen, label: 'Python Programming', href: '/courses/python' },
                  { icon: BookOpen, label: 'Deep Learning', href: '/courses/deep-learning' },
                  { icon: BookOpen, label: 'Web Development', href: '/courses/web-development' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
