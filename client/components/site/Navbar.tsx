"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

interface NavbarProps {
  onGetScore: () => void;
}

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Solutions", href: "#solutions" },
  { label: "Stories", href: "#stories" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
];

export function Navbar({ onGetScore }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
      data-testid="navbar"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group" data-testid="logo">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3D5AFE] shadow-[0_0_18px_rgba(61,90,254,0.5)] group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            SKILL<span className="gradient-text">EZO</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm text-[#8A90A6] hover:text-white transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#00D9C0] hover:after:w-full after:transition-all"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
        <Link
  href="/login"
  data-testid="login-btn"
  className="text-sm text-white/80 hover:text-white transition-colors px-3 cursor-pointer"
>
  Login
</Link>
          <Button
            onClick={onGetScore}
            data-testid="nav-cta-btn"
            className="rounded-full bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 hover:shadow-[0_0_20px_rgba(61,90,254,0.45)] transition-all font-semibold"
          >
            Get started
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/login"
            data-testid="mobile-top-login-btn"
            className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Login
          </Link>
          <button
            className="text-white p-1.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden glass-strong border-t border-white/5 mt-3"
            data-testid="mobile-menu"
          >
            <div className="px-6 py-6 flex flex-col gap-3">
              {LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-white/85 py-1"
                >
                  {l.label}
                </a>
              ))}

              <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10 mt-1">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  data-testid="mobile-drawer-login-btn"
                  className="w-full text-center py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Login
                </Link>
                <Button
                  onClick={() => {
                    setOpen(false);
                    onGetScore();
                  }}
                  className="w-full rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 py-2.5 text-white font-semibold"
                  data-testid="mobile-cta-btn"
                >
                  Get started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
