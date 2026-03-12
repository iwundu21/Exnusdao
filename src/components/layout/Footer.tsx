"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Droplets, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';

const EPOCH_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { state } = useProtocolState();
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const [currentEpoch, setCurrentEpoch] = useState(1);

  useEffect(() => {
    if (!state.networkStartDate) return;
    const updateEpoch = () => {
      const now = Date.now();
      const elapsed = now - state.networkStartDate!;
      const epoch = Math.floor(elapsed / EPOCH_DURATION) + 1;
      setCurrentEpoch(epoch);
    };

    updateEpoch();
    const timer = setInterval(updateEpoch, 60000);
    return () => clearInterval(timer);
  }, [state.networkStartDate]);

  const isAdmin = state.adminWallet === walletAddress;

  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 border-t border-border bg-background shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold exn-gradient-text tracking-widest leading-none uppercase">EXNUS</h2>
            <span className="text-[8px] text-foreground/40 tracking-[0.2em] font-bold uppercase">Protocol | Network</span>
          </div>
          <div className="hidden lg:flex items-center gap-4 border-l border-border pl-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase">Demo</span>
            </div>
            <span className="text-[9px] text-muted-foreground uppercase font-black">
              {state.networkStartDate ? `Epoch ${currentEpoch}` : 'Active'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6 text-[9px] text-muted-foreground uppercase font-black tracking-widest">
            <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/faucet" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Droplets className="w-3 h-3" /> Faucet
            </Link>
            {(isAdmin || connected) && (
              <Link href="/admin" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <ShieldCheck className="w-3 h-3" /> Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4 border-l border-border pl-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
