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
      <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-primary transition-all font-bold">
        <LayoutDashboard className="w-3.5 h-3.5" /> DASHBOARD
      </Link>
      <Link href="/register-node" className="flex items-center gap-2 text-white/80 hover:text-primary transition-all font-bold">
        <Hammer className="w-3.5 h-3.5" /> PROVISION XNODE
      </Link>
      <Link href="/manage-node" className="flex items-center gap-2 text-white/80 hover:text-primary transition-all font-bold">
        <Settings className="w-3.5 h-3.5" /> COMMAND CENTER
      </Link>
    </>
  );

  const MobileLinks = () => (
    <div className="flex flex-col gap-6 mt-8">
      <Link href="/" className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/90 hover:text-primary transition-all">
        <LayoutDashboard className="w-5 h-5" /> DASHBOARD
      </Link>
      <Link href="/register-node" className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/90 hover:text-primary transition-all">
        <Hammer className="w-5 h-5" /> PROVISION XNODE
      </Link>
      <Link href="/manage-node" className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/90 hover:text-primary transition-all">
        <Settings className="w-5 h-5" /> COMMAND CENTER
      </Link>
      <div className="h-px w-full bg-white/20 my-2" />
      <Link href="/purchase-license" className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/90 hover:text-primary transition-all">
        <Ticket className="w-5 h-5" /> BUY LICENSE
      </Link>
      <Link href="/faucet" className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/90 hover:text-primary transition-all">
        <Droplets className="w-5 h-5" /> FAUCET
      </Link>
      {isAdmin && (
        <Link href="/admin" className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-primary hover:opacity-80 transition-all">
          <ShieldCheck className="w-5 h-5" /> ADMIN TERMINAL
        </Link>
      )}
    </div>
  );

  return (
    <nav className="flex items-center justify-between px-6 lg:px-10 py-5 border-b border-white/20 backdrop-blur-2xl fixed top-0 left-0 w-full z-50 bg-black/90">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all shadow-lg">
                <Menu className="w-5 h-5 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="exn-card border-r border-primary/40 bg-black/95 backdrop-blur-3xl">
              <SheetHeader className="text-left border-b border-white/20 pb-6">
                <SheetTitle className="text-2xl font-black exn-gradient-text tracking-[0.2em] uppercase">NETWORK</SheetTitle>
              </SheetHeader>
              <MobileLinks />
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-black exn-gradient-text tracking-[0.2em] leading-none uppercase">EXNUS</h1>
            <span className="text-[10px] text-white/60 tracking-[0.4em] font-black uppercase">PROTOCOL LAYER</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-6 lg:gap-8">
        <div className="hidden lg:flex items-center gap-8 text-[11px] uppercase font-black tracking-[0.2em]">
          <NavLinks />
        </div>

        {mounted && connected && isLoaded && (
          <div className="flex items-center gap-3 lg:gap-5 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 shadow-lg">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-black text-primary font-mono">{exnBalance.toLocaleString()}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 shadow-lg">
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-black text-emerald-500 font-mono">{usdcBalance.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {mounted ? (
            <WalletMultiButton className="exn-wallet-button" />
          ) : (
            <div className="h-10 w-28 lg:w-32 bg-white/10 rounded-lg animate-pulse" />
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
          height: 38px !important;
          line-height: 38px !important;
          border-radius: 10px !important;
          padding: 0 16px !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          border: none !important;
          box-shadow: 0 0 20px rgba(0, 245, 255, 0.4) !important;
        }
        @media (min-width: 1024px) {
          .exn-wallet-button {
            font-size: 11px !important;
            height: 42px !important;
            line-height: 42px !important;
            padding: 0 24px !important;
          }
        }
        .exn-wallet-button:hover {
          opacity: 0.9 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 0 30px rgba(0, 245, 255, 0.6) !important;
        }
      `}</style>
    </nav>
  );
}