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
      <Link href="/" className="flex items-center gap-2.5 text-white/60 hover:text-primary transition-all font-black">
        <LayoutDashboard className="w-4 h-4" /> DASHBOARD
      </Link>
      <Link href="/register-node" className="flex items-center gap-2.5 text-white/60 hover:text-primary transition-all font-black">
        <Hammer className="w-4 h-4" /> PROVISION XNODE
      </Link>
      <Link href="/manage-node" className="flex items-center gap-2.5 text-white/60 hover:text-primary transition-all font-black">
        <Settings className="w-4 h-4" /> COMMAND CENTER
      </Link>
    </>
  );

  const MobileLinks = () => (
    <div className="flex flex-col gap-8 mt-12">
      <Link href="/" className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-white/70 hover:text-primary transition-all">
        <LayoutDashboard className="w-6 h-6" /> DASHBOARD
      </Link>
      <Link href="/register-node" className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-white/70 hover:text-primary transition-all">
        <Hammer className="w-6 h-6" /> PROVISION XNODE
      </Link>
      <Link href="/manage-node" className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-white/70 hover:text-primary transition-all">
        <Settings className="w-6 h-6" /> COMMAND CENTER
      </Link>
      <div className="h-px w-full bg-white/10 my-4" />
      <Link href="/purchase-license" className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-white/70 hover:text-primary transition-all">
        <Ticket className="w-6 h-6" /> BUY LICENSE
      </Link>
      <Link href="/faucet" className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-white/70 hover:text-primary transition-all">
        <Droplets className="w-6 h-6" /> FAUCET
      </Link>
      {isAdmin && (
        <Link href="/admin" className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-80 transition-all">
          <ShieldCheck className="w-6 h-6" /> ADMIN TERMINAL
        </Link>
      )}
    </div>
  );

  return (
    <nav className="flex items-center justify-between px-8 lg:px-12 py-7 border-b border-white/10 backdrop-blur-2xl fixed top-0 left-0 w-full z-50 bg-black/80">
      <div className="flex items-center gap-6">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all shadow-lg">
                <Menu className="w-6 h-6 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="exn-card border-r border-primary/30 bg-black/95 backdrop-blur-3xl">
              <SheetHeader className="text-left border-b border-white/10 pb-8">
                <SheetTitle className="text-3xl font-black exn-gradient-text tracking-[0.2em] uppercase">NETWORK</SheetTitle>
              </SheetHeader>
              <MobileLinks />
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-black exn-gradient-text tracking-[0.2em] leading-none uppercase">EXNUS</h1>
            <span className="text-[10px] lg:text-[11px] text-white/40 tracking-[0.4em] font-black uppercase">PROTOCOL LAYER</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-6 lg:gap-10">
        <div className="hidden lg:flex items-center gap-10 text-[11px] uppercase font-black tracking-[0.2em]">
          <NavLinks />
        </div>

        {mounted && connected && isLoaded && (
          <div className="flex items-center gap-3 lg:gap-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shadow-lg">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-xs lg:text-sm font-black text-primary font-mono">{exnBalance.toLocaleString()}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shadow-lg">
              <CircleDollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-xs lg:text-sm font-black text-emerald-500 font-mono">{usdcBalance.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {mounted ? (
            <WalletMultiButton className="exn-wallet-button" />
          ) : (
            <div className="h-11 w-32 lg:w-40 bg-white/5 rounded-xl animate-pulse" />
          )}
        </div>
      </div>

      <style jsx global>{`
        .exn-wallet-button {
          background: linear-gradient(to right, #00f5ff, #a855f7) !important;
          color: black !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.2em !important;
          height: 44px !important;
          line-height: 44px !important;
          border-radius: 12px !important;
          padding: 0 24px !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          border: none !important;
          box-shadow: 0 0 20px rgba(0, 245, 255, 0.3) !important;
        }
        @media (min-width: 1024px) {
          .exn-wallet-button {
            font-size: 11px !important;
            height: 48px !important;
            line-height: 48px !important;
            padding: 0 32px !important;
          }
        }
        .exn-wallet-button:hover {
          opacity: 0.9 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 0 30px rgba(0, 245, 255, 0.5) !important;
        }
      `}</style>
    </nav>
  );
}