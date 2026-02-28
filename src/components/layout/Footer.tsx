
"use client";

import React from 'react';
import Link from 'next/link';
import { Twitter, MessageSquare, ExternalLink, ShieldCheck, Globe } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 border-t border-border bg-background shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold exn-gradient-text tracking-widest leading-none uppercase">EXNUS</h2>
            <span className="text-[8px] text-foreground/40 tracking-[0.2em] font-bold uppercase">Protocol | Network</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors"><Twitter className="w-3.5 h-3.5" /></Link>
            <Link href="#" className="hover:text-primary transition-colors"><MessageSquare className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="hidden lg:flex items-center gap-4 border-l border-border pl-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase">Mainnet-Beta</span>
            </div>
            <span className="text-[9px] text-muted-foreground uppercase font-black">Epoch 732</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-6 text-[9px] text-muted-foreground uppercase font-black tracking-widest">
            <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="#" className="hover:text-primary transition-colors flex items-center gap-1">Docs <ExternalLink className="w-2.5 h-2.5" /></Link>
          </div>
          
          <div className="flex items-center gap-4 border-l border-border pl-6">
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground uppercase font-bold">
              <ShieldCheck className="w-3 h-3 text-primary" />
              Audited
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block absolute bottom-0 right-0 p-1">
         <p className="text-[7px] text-foreground/20 uppercase font-bold px-2">
           © {currentYear} Exnus Network
         </p>
      </div>
    </footer>
  );
}
