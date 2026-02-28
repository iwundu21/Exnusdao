"use client";

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand and Tagline */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold exn-gradient-text tracking-wider leading-none uppercase">EXNUS</h1>
                <span className="text-[10px] text-foreground/40 tracking-[0.3em] font-bold uppercase">Protocol | Network</span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Next-generation decentralized validation network powering the future of Solana staking. 
              Secure, high-yield, and governed by the community.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors"><Twitter className="w-4 h-4" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><MessageSquare className="w-4 h-4" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Github className="w-4 h-4" /></Link>
            </div>
          </div>

          {/* Protocol Links */}
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/60">Protocol</h3>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/purchase-license" className="text-muted-foreground hover:text-primary transition-colors">Node Licensing</Link></li>
              <li><Link href="/register-node" className="text-muted-foreground hover:text-primary transition-colors">Validator Registration</Link></li>
              <li><Link href="/manage-node" className="text-muted-foreground hover:text-primary transition-colors">Node Management</Link></li>
            </ul>
          </div>

          {/* Ecosystem Links */}
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/60">Ecosystem</h3>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">Documentation <ExternalLink className="w-3 h-3" /></Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">Protocol Specs <ExternalLink className="w-3 h-3" /></Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">Explorer <ExternalLink className="w-3 h-3" /></Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Network Stats */}
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/60">Network Status</h3>
            <div className="space-y-4">
              <div className="p-4 bg-foreground/5 rounded-xl border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase font-black">Mainnet-Beta</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase font-black">Epoch</span>
                  <span className="text-[10px] font-mono text-foreground font-bold">732</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground uppercase font-bold px-2">
                <ShieldCheck className="w-3 h-3 text-primary" />
                Audited Protocol Smart Contracts
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            © {currentYear} Exnus Protocol | Network. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              <span>SOLANA MAINNET</span>
              <div className="w-1 h-1 bg-border rounded-full" />
              <span>STAKING-V2</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
