"use client";

import React, { useState, useEffect } from 'react';
import { Coins, CircleDollarSign, Wallet, ArrowLeft, Clock } from 'lucide-react';
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

  if (!mounted || !isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Syncing Network State</p>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-10 py-40 space-y-8 animate-in fade-in duration-500">
         <div className="p-6 bg-primary/10 rounded-full border border-primary/20">
           <Wallet className="w-12 h-12 text-primary" />
         </div>
         <div className="space-y-4">
           <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">Wallet Required</h1>
           <p className="text-muted-foreground max-w-md mx-auto">Connect your wallet to receive protocol test tokens.</p>
         </div>
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
    if (exnTimeLeft > 0) return setFeedback('warning', `Cooldown active. Ready in ${formatTime(exnTimeLeft)}.`);
    updateUserBalance(walletAddress, state.faucetExnLimit, 0);
    updateFaucetClaim(walletAddress, 'exn');
    setFeedback('success', `${state.faucetExnLimit.toLocaleString()} EXN provisioned to your wallet.`);
  };

  const handleClaimUsdc = () => {
    if (usdcTimeLeft > 0) return setFeedback('warning', `Cooldown active. Ready in ${formatTime(usdcTimeLeft)}.`);
    updateUserBalance(walletAddress, 0, state.faucetUsdcLimit);
    updateFaucetClaim(walletAddress, 'usdc');
    setFeedback('success', `${state.faucetUsdcLimit.toLocaleString()} USDC provisioned to your wallet.`);
  };

  return (
    <div className="max-w-5xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">Token Faucet</h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Request testnet assets to participate in the Exnus network. Limits: **{state.faucetExnLimit.toLocaleString()} EXN** and **{state.faucetUsdcLimit.toLocaleString()} USDC** every 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* EXN Faucet Card */}
        <div className="exn-card p-10 space-y-10 border-primary/20 bg-primary/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-all" />
          
          <div className="flex justify-between items-start relative z-10">
             <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
               <Coins className="w-8 h-8 text-primary" />
             </div>
             {exnTimeLeft > 0 && (
               <div className="flex items-center gap-2 text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                 <Clock className="w-3 h-3" />
                 {formatTime(exnTimeLeft)}
               </div>
             )}
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Available Supply</p>
            <h3 className="text-4xl font-bold text-foreground">{state.faucetExnLimit.toLocaleString()} <span className="text-xs text-primary font-black uppercase">EXN</span></h3>
          </div>

          <button 
            onClick={handleClaimExn} 
            disabled={exnTimeLeft > 0} 
            className={`w-full h-16 uppercase tracking-[0.2em] font-black transition-all rounded-xl relative z-10 ${exnTimeLeft === 0 ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {exnTimeLeft > 0 ? 'Cooldown Active' : 'Request EXN Drop'}
          </button>
        </div>

        {/* USDC Faucet Card */}
        <div className="exn-card p-10 space-y-10 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex justify-between items-start relative z-10">
             <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
               <CircleDollarSign className="w-8 h-8 text-emerald-500" />
             </div>
             {usdcTimeLeft > 0 && (
               <div className="flex items-center gap-2 text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                 <Clock className="w-3 h-3" />
                 {formatTime(usdcTimeLeft)}
               </div>
             )}
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Available Supply</p>
            <h3 className="text-4xl font-bold text-foreground">{state.faucetUsdcLimit.toLocaleString()} <span className="text-xs text-emerald-500 font-black uppercase">USDC</span></h3>
          </div>

          <button 
            onClick={handleClaimUsdc} 
            disabled={usdcTimeLeft > 0} 
            className={`w-full h-16 uppercase tracking-[0.2em] font-black transition-all rounded-xl relative z-10 ${usdcTimeLeft === 0 ? 'exn-button bg-none border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {usdcTimeLeft > 0 ? 'Cooldown Active' : 'Request USDC Drop'}
          </button>
        </div>
      </div>

      <div className="p-8 bg-primary/5 border border-primary/20 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <Wallet className="w-5 h-5" />
          <h4 className="text-sm font-black uppercase tracking-widest">Protocol Transparency</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed uppercase font-black tracking-tighter">
          Faucet distributions are finalized on the cloud ledger. Cooldown timers are globally enforced based on your wallet address. If you encounter issues, ensure your wallet is connected to the Mainnet cluster.
        </p>
      </div>
    </div>
  );
}
