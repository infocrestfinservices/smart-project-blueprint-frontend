import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { LogOut, Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "My Reports", to: "/dashboard", auth: true },
];

export default function LandingNavbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  const links = NAV_LINKS.filter((l) => !l.auth || user);
  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <Logo size="md" subtitle="Bank & investor-ready reports" />
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-3.5 py-2 rounded-lg transition-colors ${
                isActive(link.to)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute left-3.5 right-3.5 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="h-9 px-3 gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
              <Link to="/create" className="hidden sm:block">
                <Button size="sm" className="h-9 px-4 gap-1.5">
                  New report <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hidden sm:inline-flex text-muted-foreground"
                onClick={() => logout("/login")}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-9 px-4">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-9 px-4 gap-1.5 shadow-md shadow-primary/20">
                  Create free report <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden border-t border-border glass transition-[max-height] duration-300 ${
          open ? "max-h-[420px]" : "max-h-0 border-transparent"
        }`}
      >
        <nav className="px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.to)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex gap-2 pt-2">
            {user ? (
              <>
                <Link to="/create" className="flex-1">
                  <Button className="w-full gap-1.5">
                    New report <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => logout("/login")}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button className="w-full gap-1.5">
                    Create report <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
