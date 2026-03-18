
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Settings, LayoutDashboard, Hammer, Coins, CircleDollarSign, Menu, Ticket, Droplets, ShieldCheck, Wallet, Power, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFakeWallet } from '@/hooks/use-fake-wallet';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { shortenAddress } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { connected, publicKey, connect, disconnect, isConnecting } = useFakeWallet();
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
  
  const hasLicense = useMemo(() => {
    if (!walletAddress || !state.licenses) return false;
    return state.licenses.some(l => l.owner === walletAddress && !l.is_burned);
  }, [state.licenses, walletAddress]);

  const NavLinks = () => (
    <div className="flex items-center gap-8">
      <Link href="/" className="flex items-center gap-2 text-white hover:text-primary transition-all font-black text-[11px] uppercase tracking-widest">
        <LayoutDashboard className="w-3.5 h-3.5" /> DASHBOARD
      </Link>
      
      {hasLicense && (
        <>
          <Link href="/register-node" className="flex items-center gap-2 text-white hover:text-primary transition-all font-black text-[11px] uppercase tracking-widest">
            <Hammer className="w-3.5 h-3.5" /> REGISTER XNODE
          </Link>
          <Link href="/manage-node" className="flex items-center gap-2 text-white hover:text-primary transition-all font-black text-[11px] uppercase tracking-widest">
            <Settings className="w-3.5 h-3.5" /> XNODE MANAGEMENT
          </Link>
        </>
      )}
    </div>
  );

  const MobileLinks = () => (
    <div className="flex flex-col gap-6 mt-10">
      <Link href="/" className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-white hover:text-primary transition-all">
        <LayoutDashboard className="w-5 h-5" /> DASHBOARD
      </Link>
      
      {hasLicense && (
        <>
          <Link href="/register-node" className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-white hover:text-primary transition-all">
            <Hammer className="w-5 h-5" /> REGISTER XNODE
          </Link>
          <Link href="/manage-node" className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-white hover:text-primary transition-all">
            <Settings className="w-5 h-5" /> XNODE MANAGEMENT
          </Link>
        </>
      )}
      
      <div className="h-px w-full bg-white/40 my-2" />
      
      <Link href="/purchase-license" className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-white hover:text-primary transition-all">
        <Ticket className="w-5 h-5" /> BUY LICENSE
      </Link>
      <Link href="/faucet" className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-white hover:text-primary transition-all">
        <Droplets className="w-5 h-5" /> FAUCET
      </Link>
      
      {isAdmin && (
        <Link href="/admin" className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all">
          <ShieldCheck className="w-5 h-5" /> ADMIN TERMINAL
        </Link>
      )}
    </div>
  );

  return (
    <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/20 backdrop-blur-3xl fixed top-0 left-0 w-full z-50 bg-black/90">
      <div className="flex items-center gap-6">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2.5 bg-primary/10 rounded-xl border border-primary/30 hover:bg-primary/20 transition-all shadow-2xl">
                <Menu className="w-5 h-5 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="exn-card border-r border-primary/40 bg-black/95 backdrop-blur-3xl p-8">
              <SheetHeader className="text-left border-b border-white/40 pb-8">
                <SheetTitle className="text-2xl font-black exn-gradient-text tracking-[0.2em] uppercase">NETWORK</SheetTitle>
              </SheetHeader>
              <MobileLinks />
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-black exn-gradient-text tracking-[0.2em] leading-none uppercase text-white">EXNUS</h1>
            <span className="text-[10px] text-white font-black uppercase tracking-[0.4em]">PROTOCOL LAYER</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-8 lg:gap-12">
        <div className="hidden lg:flex items-center">
          <NavLinks />
        </div>

        {mounted && connected && isLoaded && (
          <div className="flex items-center gap-4 lg:gap-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white/10 rounded-xl border border-white/30 shadow-2xl">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-[12px] font-black text-primary font-mono tracking-tighter">{exnBalance.toLocaleString()}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-white/10 rounded-xl border border-white/30 shadow-2xl">
              <CircleDollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-[12px] font-black text-emerald-500 font-mono tracking-tighter">{usdcBalance.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {mounted && (
            <button 
              onClick={connected ? disconnect : connect} 
              disabled={isConnecting}
              className={`flex items-center gap-3 px-6 h-11 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl ${connected ? 'bg-destructive/20 text-destructive border border-destructive/50 hover:bg-destructive hover:text-white' : 'exn-button'}`}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : connected ? (
                <>
                  <Power className="w-4 h-4" />
                  {shortenAddress(walletAddress)}
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  IDENTITY LINK
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
