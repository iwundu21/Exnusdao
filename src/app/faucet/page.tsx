"use client";

import React, { useState, useEffect } from 'react';
import { Coins, CircleDollarSign, Wallet, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';

const DAY_MS = 24 * 60 * 60 * 1000;

export default function FaucetPage() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, isLoaded, setFeedback, updateUserBalance, updateFaucetClaim, lastExnFaucetClaim, lastUsdcFaucetClaim } = useProtocolState();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !isLoaded) return null;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-10 py-40 space-y-8 animate-in fade-in duration-500">
         <div className="p-6 bg-primary/10 rounded-full border border-primary/20">
           <Wallet className="w-12 h-12 text-primary" />
         </div>
         <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">Wallet Required</h1>
      </div>
    );
  }

  const exnTimeLeft = Math.max(0, (lastExnFaucetClaim || 0) + DAY_MS - now);
  const usdcTimeLeft = Math.max(0, (lastUsdcFaucetClaim || 0) + DAY_MS - now);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const handleClaimExn = () => {
    if (exnTimeLeft > 0) return setFeedback('warning', `Cooldown: ${formatTime(exnTimeLeft)}.`);
    updateUserBalance(walletAddress, state.faucetExnLimit, 0);
    updateFaucetClaim(walletAddress, 'exn');
    setFeedback('success', `${state.faucetExnLimit.toLocaleString()} EXN provisioned.`);
  };

  const handleClaimUsdc = () => {
    if (usdcTimeLeft > 0) return setFeedback('warning', `Cooldown: ${formatTime(usdcTimeLeft)}.`);
    updateUserBalance(walletAddress, 0, state.faucetUsdcLimit);
    updateFaucetClaim(walletAddress, 'usdc');
    setFeedback('success', `${state.faucetUsdcLimit.toLocaleString()} USDC provisioned.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase">Token Faucet</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="exn-card p-8 space-y-8 border-primary/20 bg-primary/5">
          <div className="flex justify-between items-start">
             <Coins className="w-8 h-8 text-primary" />
             {exnTimeLeft > 0 && <span className="text-[9px] text-amber-500 font-black uppercase">Ready in {formatTime(exnTimeLeft)}</span>}
          </div>
          <h3 className="text-2xl font-bold uppercase">{state.faucetExnLimit.toLocaleString()} EXN</h3>
          <button onClick={handleClaimExn} disabled={exnTimeLeft > 0} className={`w-full h-14 uppercase font-black transition-all ${exnTimeLeft === 0 ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}>Request EXN</button>
        </div>

        <div className="exn-card p-8 space-y-8 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex justify-between items-start">
             <CircleDollarSign className="w-8 h-8 text-emerald-500" />
             {usdcTimeLeft > 0 && <span className="text-[9px] text-amber-500 font-black uppercase">Ready in {formatTime(usdcTimeLeft)}</span>}
          </div>
          <h3 className="text-2xl font-bold uppercase">{state.faucetUsdcLimit.toLocaleString()} USDC</h3>
          <button onClick={handleClaimUsdc} disabled={usdcTimeLeft > 0} className={`w-full h-14 uppercase font-black transition-all ${usdcTimeLeft === 0 ? 'exn-button bg-none border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}>Request USDC</button>
        </div>
      </div>
    </div>
  );
}
