
"use client";

import React, { useState, useEffect } from 'react';
import { Coins, CircleDollarSign, Wallet, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function FaucetPage() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { 
    state, 
    isLoaded, 
    setFeedback, 
    claimFaucetAssets, 
    lastExnFaucetClaim, 
    lastUsdcFaucetClaim 
  } = useProtocolState();
  
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [reviewType, setReviewType] = useState<'exn' | 'usdc' | null>(null);

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
           <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Wallet Required</h1>
           <p className="text-muted-foreground max-w-md mx-auto">Connect your wallet to receive protocol test tokens.</p>
         </div>
      </div>
    );
  }

  const exnLimit = state.faucetExnLimit || 16000000;
  const usdcLimit = state.faucetUsdcLimit || 10000;

  const exnTimeLeft = Math.max(0, (lastExnFaucetClaim || 0) + DAY_MS - now);
  const usdcTimeLeft = Math.max(0, (lastUsdcFaucetClaim || 0) + DAY_MS - now);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const initiateClaim = (type: 'exn' | 'usdc') => {
    const timeLeft = type === 'exn' ? exnTimeLeft : usdcTimeLeft;
    if (timeLeft > 0) return setFeedback('warning', `Cooldown active. Ready in ${formatTime(timeLeft)}.`);
    setReviewType(type);
  };

  const confirmClaim = () => {
    if (!reviewType) return;
    if (reviewType === 'exn') {
      claimFaucetAssets(walletAddress, exnLimit, 0, 'exn');
    } else {
      claimFaucetAssets(walletAddress, 0, usdcLimit, 'usdc');
    }
    setReviewType(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">Token Faucet</h1>
        <p className="text-muted-foreground max-w-xl text-xs leading-relaxed">
          Generate testnet assets. Limits: **{exnLimit.toLocaleString()} EXN** and **{usdcLimit.toLocaleString()} USDC** every 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="exn-card p-10 space-y-10 border-primary/20 bg-primary/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-all" />
          
          <div className="flex justify-between items-start relative z-10">
             <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
               <Coins className="w-8 h-8 text-primary" />
             </div>
             {exnTimeLeft > 0 && (
               <div className="flex items-center gap-2 text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                 <Clock className="w-3 h-3" />
                 {formatTime(exnTimeLeft)}
               </div>
             )}
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Dynamic Supply</p>
            <h3 className="text-2xl font-bold text-foreground font-mono">{exnLimit.toLocaleString()} <span className="text-[10px] text-primary font-black uppercase">EXN</span></h3>
          </div>

          <button 
            onClick={() => initiateClaim('exn')} 
            disabled={exnTimeLeft > 0} 
            className={`w-full h-16 uppercase tracking-[0.2em] font-black transition-all rounded-xl relative z-10 text-[10px] ${exnTimeLeft === 0 ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {exnTimeLeft > 0 ? 'Cooldown Active' : 'Generate EXN Drop'}
          </button>
        </div>

        <div className="exn-card p-10 space-y-10 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex justify-between items-start relative z-10">
             <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
               <CircleDollarSign className="w-8 h-8 text-emerald-500" />
             </div>
             {usdcTimeLeft > 0 && (
               <div className="flex items-center gap-2 text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                 <Clock className="w-3 h-3" />
                 {formatTime(usdcTimeLeft)}
               </div>
             )}
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Dynamic Supply</p>
            <h3 className="text-2xl font-bold text-foreground font-mono">{usdcLimit.toLocaleString()} <span className="text-[10px] text-emerald-500 font-black uppercase">USDC</span></h3>
          </div>

          <button 
            onClick={() => initiateClaim('usdc')} 
            disabled={usdcTimeLeft > 0} 
            className={`w-full h-16 uppercase tracking-[0.2em] font-black transition-all rounded-xl relative z-10 text-[10px] ${usdcTimeLeft === 0 ? 'exn-button bg-none border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {usdcTimeLeft > 0 ? 'Cooldown Active' : 'Generate USDC Drop'}
          </button>
        </div>
      </div>

      {/* Faucet Review Dialog */}
      <AlertDialog open={reviewType !== null} onOpenChange={() => setReviewType(null)}>
        <AlertDialogContent className="exn-card border-primary/40 bg-black/90 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-3">
              <ShieldCheck className="w-6 h-6" />
              Review Drop Request
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-6 pt-4">
              <div className="p-6 bg-foreground/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                  <span className="text-muted-foreground">Action</span>
                  <span className="text-foreground font-black">Dynamic Asset Generation</span>
                </div>
                <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                  <span className="text-muted-foreground">Asset</span>
                  <span className={reviewType === 'exn' ? "text-primary font-bold" : "text-emerald-500 font-bold"}>
                    {reviewType === 'exn' ? 'EXN Protocol Token' : 'USDC Stablecoin'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground font-mono font-bold">
                    {reviewType === 'exn' ? exnLimit.toLocaleString() : usdcLimit.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold">
                Faucet drops are restricted to once every 24 hours per asset. Confirming this request will initiate the on-chain minting of these testnet tokens to your active wallet address.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="exn-button-outline text-[10px] h-12 uppercase font-black">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClaim} className="exn-button text-[10px] h-12 uppercase font-black">Confirm Request</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
