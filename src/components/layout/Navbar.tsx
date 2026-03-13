"use client";

import React, { useEffect, useState } from 'react';
import { Settings, LayoutDashboard, Hammer, Coins, CircleDollarSign, Menu, Ticket, Droplets, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useProtocolState } from '@/hooks/use-protocol-state';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, isLoaded, registerUser, exnBalance, usdcBalance } = useProtocolState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && walletAddress && isLoaded) {
      registerUser(walletAddress);
    }
  }, [connected, walletAddress, isLoaded, registerUser]);

  const isAdmin = walletAddress === state.adminWallet;

  const NavLinks = () => (
    <>
      <Link href="/" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
        <LayoutDashboard className="w-4 h-4" /> Dashboard
      </Link>
      <Link href="/register-node" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
        <Hammer className="w-4 h-4" /> Register XNode
      </Link>
      <Link href="/manage-node" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
        <Settings className="w-4 h-4" /> Manage XNode
      </Link>
    </>
  );

  const MobileLinks = () => (
    <div className="flex flex-col gap-6 mt-10">
      <Link href="/" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all">
        <LayoutDashboard className="w-5 h-5" /> Dashboard
      </Link>
      <Link href="/register-node" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all">
        <Hammer className="w-5 h-5" /> Register XNode
      </Link>
      <Link href="/manage-node" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all">
        <Settings className="w-5 h-5" /> Manage XNode
      </Link>
      <div className="h-px w-full bg-white/5 my-2" />
      <Link href="/purchase-license" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all">
        <Ticket className="w-5 h-5" /> Buy XNode License
      </Link>
      <Link href="/faucet" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all">
        <Droplets className="w-5 h-5" /> Faucet
      </Link>
      {isAdmin && (
        <Link href="/admin" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all">
          <ShieldCheck className="w-5 h-5" /> Admin Terminal
        </Link>
      )}
    </div>
  );

  return (
    <nav className="flex items-center justify-between px-6 lg:px-10 py-6 border-b border-border backdrop-blur-md fixed top-0 left-0 w-full z-50 bg-background/80">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 bg-foreground/5 rounded-lg border border-border hover:bg-foreground/10 transition-all">
                <Menu className="w-5 h-5 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="exn-card border-r border-primary/20 bg-black/95 backdrop-blur-2xl">
              <SheetHeader className="text-left border-b border-white/5 pb-6">
                <SheetTitle className="text-2xl font-bold exn-gradient-text tracking-wider uppercase">Protocol Menu</SheetTitle>
              </SheetHeader>
              <MobileLinks />
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold exn-gradient-text tracking-wider leading-none">EXNUS</h1>
            <span className="text-[8px] lg:text-[10px] text-foreground/40 tracking-[0.3em] font-bold uppercase">Protocol | Network</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden lg:flex items-center gap-6 text-xs uppercase font-bold tracking-widest">
          <NavLinks />
        </div>

        {mounted && connected && isLoaded && (
          <div className="flex items-center gap-2 lg:gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 bg-foreground/5 rounded-full border border-border">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] lg:text-xs font-bold text-primary">{exnBalance.toLocaleString()}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 bg-foreground/5 rounded-full border border-border">
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] lg:text-xs font-bold text-emerald-500">{usdcBalance.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {mounted ? (
            <WalletMultiButton className="exn-wallet-button" />
          ) : (
            <div className="h-10 w-24 lg:w-32 bg-foreground/5 rounded-lg animate-pulse" />
          )}
        </div>
      </div>

      <style jsx global>{`
        .exn-wallet-button {
          background: linear-gradient(to right, #00f5ff, #a855f7) !important;
          color: black !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 8px !important;
          letter-spacing: 0.1em !important;
          height: 36px !important;
          line-height: 36px !important;
          border-radius: 8px !important;
          padding: 0 12px !important;
          transition: all 0.3s ease !important;
        }
        @media (min-width: 1024px) {
          .exn-wallet-button {
            font-size: 10px !important;
            height: 40px !important;
            line-height: 40px !important;
            padding: 0 20px !important;
          }
        }
        .exn-wallet-button:hover {
          opacity: 0.9 !important;
          transform: scale(0.98) !important;
        }
      `}</style>
    </nav>
  );
}
