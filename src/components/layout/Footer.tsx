
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Droplets, ShieldCheck, Ticket } from 'lucide-react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';

const EPOCH_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export function Footer() {
  const { state } = useProtocolState();
  const { publicKey } = useWallet();
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

  const isAdmin = walletAddress === state.adminWallet;

  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 border-t border-border bg-background shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <div className="flex flex-col">
            <h2 className="text-xs font-bold exn-gradient-text tracking-widest leading-none uppercase">EXNUS</h2>
            <span className="text-[7px] text-foreground/40 tracking-[0.2em] font-bold uppercase">Protocol | Network</span>
          </div>
          <div className="hidden lg:flex items-center gap-3 border-l border-border pl-5">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-500 uppercase">Demo</span>
            </div>
            <span className="text-[8px] text-muted-foreground uppercase font-black">
              {state.networkStartDate ? `Epoch ${currentEpoch}` : 'Active'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 text-[8px] text-muted-foreground uppercase font-black tracking-widest">
            <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/purchase-license" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Ticket className="w-2.5 h-2.5" /> Buy XNode
            </Link>
            <Link href="/faucet" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Droplets className="w-2.5 h-2.5" /> Faucet
            </Link>
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1 hover:text-primary transition-colors">
                <ShieldCheck className="w-2.5 h-2.5" /> Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
