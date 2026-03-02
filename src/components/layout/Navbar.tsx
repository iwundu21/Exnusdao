
"use client";

import React, { useEffect, useState } from 'react';
import { Settings, Coins, CircleDollarSign, LayoutDashboard, Ticket, Hammer, ShieldCheck, Book } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useProtocolState } from '@/hooks/use-protocol-state';

export function Navbar() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, isLoaded } = useProtocolState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentExn = isLoaded ? state.exnBalance : 0;
  const currentUsdc = isLoaded ? state.usdcBalance : 0;
  const isAdmin = isLoaded && state.isInitialized && state.adminWallet === walletAddress;

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-border backdrop-blur-md fixed top-0 left-0 w-full z-50 bg-background/80">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold exn-gradient-text tracking-wider leading-none">EXNUS</h1>
          <span className="text-[10px] text-foreground/40 tracking-[0.3em] font-bold uppercase">Protocol | Network</span>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-6 text-xs uppercase font-bold tracking-widest">
          <Link href="/" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/purchase-license" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <Ticket className="w-4 h-4" /> Buy License
          </Link>
          <Link href="/register-node" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <Hammer className="w-4 h-4" /> Register Node
          </Link>
          <Link href="/manage-node" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <Settings className="w-4 h-4" /> Manage Node
          </Link>
          <Link href="/docs/protocol-spec" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <Book className="w-4 h-4" /> Docs
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 text-primary font-black hover:opacity-80 transition-all">
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>

        {mounted && connected && isLoaded && (
          <div className="hidden lg:flex items-center gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-full border border-border">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">{currentExn.toLocaleString()} EXN</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-full border border-border">
              <CircleDollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">{currentUsdc.toLocaleString()} USDC</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {mounted ? (
            <WalletMultiButton className="exn-wallet-button" />
          ) : (
            <div className="h-10 w-32 bg-foreground/5 rounded-lg animate-pulse" />
          )}
        </div>
      </div>

      <style jsx global>{`
        .exn-wallet-button {
          background: linear-gradient(to right, #00f5ff, #a855f7) !important;
          color: black !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.1em !important;
          height: 40px !important;
          line-height: 40px !important;
          border-radius: 8px !important;
          padding: 0 20px !important;
          transition: all 0.3s ease !important;
        }
        .exn-wallet-button:hover {
          opacity: 0.9 !important;
          transform: scale(0.98) !important;
        }
      `}</style>
    </nav>
  );
}
