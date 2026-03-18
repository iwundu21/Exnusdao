"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Droplets, ShieldCheck, Ticket, BookOpen } from 'lucide-react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useFakeWallet } from '@/hooks/use-fake-wallet';

const EPOCH_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export function Footer() {
  const { state } = useProtocolState();
  const { publicKey } = useFakeWallet();
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
    <footer className="fixed bottom-0 left-0 w-full z-40 border-t border-border bg-black/80 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-xs font-black exn-gradient-text tracking-[0.2em] leading-none uppercase">EXNUS</h2>
            <span className="text-[7px] text-white/40 tracking-[0.3em] font-black uppercase mt-1">PROTOCOL LAYER</span>
          </div>
          <div className="hidden lg:flex items-center gap-4 border-l border-white/20 pl-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">LIVE SIMULATION</span>
            </div>
            <span className="text-[8px] text-white/60 uppercase font-black tracking-widest">
              {state.networkStartDate ? `ACTIVE EPOCH ${currentEpoch}` : 'ESTABLISHING HANDSHAKE'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 text-[8px] text-white/60 uppercase font-black tracking-[0.2em]">
          <Link href="/" className="hover:text-primary transition-all">DASHBOARD</Link>
          <Link href="/docs/protocol-spec" className="flex items-center gap-1.5 hover:text-primary transition-all">
            <BookOpen className="w-3 h-3" /> HOW IT WORKS
          </Link>
          <Link href="/purchase-license" className="flex items-center gap-1.5 hover:text-primary transition-all">
            <Ticket className="w-3 h-3" /> BUY XNODE
          </Link>
          <Link href="/faucet" className="flex items-center gap-1.5 hover:text-primary transition-all">
            <Droplets className="w-3 h-3" /> FAUCET
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1.5 text-primary hover:opacity-80 transition-all">
              <ShieldCheck className="w-3 h-3" /> AUTHORITY
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
