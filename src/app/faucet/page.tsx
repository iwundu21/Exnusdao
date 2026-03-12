"use client";

import React, { useState, useEffect } from 'react';
import { Coins, CircleDollarSign, Wallet, ArrowLeft, Clock, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';

const DAILY_EXN_MAX = 16000000;
const DAILY_USDC_MAX = 10000;
const DAY_MS = 24 * 60 * 60 * 1000;

export default function FaucetPage() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { isLoaded, setFeedback, updateUserBalance, updateFaucetClaim, lastExnFaucetClaim, lastUsdcFaucetClaim } = useProtocolState();
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
      <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Initializing Faucet Node</p>
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
           <p className="text-muted-foreground max-w-md mx-auto">Connect your wallet to request demo assets from the Exnus Faucet.</p>
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
    if (exnTimeLeft > 0) return setFeedback('warning', `Faucet cooling down. Available in ${formatTime(exnTimeLeft)}.`);
    
    updateUserBalance(walletAddress, DAILY_EXN_MAX, 0);
    updateFaucetClaim(walletAddress, 'exn');
    setFeedback('success', `${DAILY_EXN_MAX.toLocaleString()} EXN provisioned to wallet.`);
  };

  const handleClaimUsdc = () => {
    if (usdcTimeLeft > 0) return setFeedback('warning', `Faucet cooling down. Available in ${formatTime(usdcTimeLeft)}.`);
    
    updateUserBalance(walletAddress, 0, DAILY_USDC_MAX);
    updateFaucetClaim(walletAddress, 'usdc');
    setFeedback('success', `${DAILY_USDC_MAX.toLocaleString()} USDC provisioned to wallet.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">Token Faucet</h1>
        <p className="text-muted-foreground max-w-xl">
          Request demo assets to interact with the Exnus protocol. Claims are restricted to one request per 24-hour cycle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="exn-card p-8 space-y-8 border-primary/20 bg-primary/5">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
               <Coins className="w-8 h-8 text-primary" />
             </div>
             {exnTimeLeft > 0 && (
               <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-black uppercase">
                 <Clock className="w-3 h-3" /> Ready in {formatTime(exnTimeLeft)}
               </div>
             )}
          </div>
          
          <div className="space-y-1">
             <h3 className="text-2xl font-bold uppercase">EXN Tokens</h3>
             <p className="text-xs text-muted-foreground">Claim 16,000,000 EXN for XNode Registration & Staking.</p>
          </div>

          <div className="p-4 bg-background/40 rounded-xl border border-border/10 flex justify-between items-center">
             <span className="text-[10px] uppercase font-black text-muted-foreground">Daily Allowance</span>
             <span className="text-lg font-bold text-primary">16,000,000 EXN</span>
          </div>

          <button 
            onClick={handleClaimExn}
            disabled={exnTimeLeft > 0}
            className={`w-full h-14 flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all ${exnTimeLeft === 0 ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {exnTimeLeft > 0 ? 'Cycle in Progress' : 'Request EXN Drop'}
          </button>
        </div>

        <div className="exn-card p-8 space-y-8 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <CircleDollarSign className="w-8 h-8 text-emerald-500" />
             </div>
             {usdcTimeLeft > 0 && (
               <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-black uppercase">
                 <Clock className="w-3 h-3" /> Ready in {formatTime(usdcTimeLeft)}
               </div>
             )}
          </div>
          
          <div className="space-y-1">
             <h3 className="text-2xl font-bold uppercase">USDC Tokens</h3>
             <p className="text-xs text-muted-foreground">Claim 10,000 USDC for XNode License Minting.</p>
          </div>

          <div className="p-4 bg-background/40 rounded-xl border border-border/10 flex justify-between items-center">
             <span className="text-[10px] uppercase font-black text-muted-foreground">Daily Allowance</span>
             <span className="text-lg font-bold text-emerald-500">10,000 USDC</span>
          </div>

          <button 
            onClick={handleClaimUsdc}
            disabled={usdcTimeLeft > 0}
            className={`w-full h-14 flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all ${usdcTimeLeft === 0 ? 'exn-button bg-none border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {usdcTimeLeft > 0 ? 'Cycle in Progress' : 'Request USDC Drop'}
          </button>
        </div>
      </div>

      <div className="exn-card p-6 border-primary/20 bg-primary/5 flex items-start gap-4">
         <ShieldCheck className="w-6 h-6 text-primary mt-1" />
         <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-primary">Protocol Simulation Notice</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tokens provisioned by this faucet are purely for protocol testing within the Exnus sandbox environment. These assets have no external market value and are restricted by a 24-hour chronological lock.
            </p>
         </div>
      </div>
    </div>
  );
}
