
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
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-black uppercase tracking-[0.4em] animate-pulse text-[9px]">SYNCING_CLOUD_ASSETS</p>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-10 py-32 space-y-6 animate-in fade-in duration-500">
         <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 shadow-2xl">
           <Wallet className="w-10 h-10 text-primary" />
         </div>
         <div className="space-y-3">
           <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground">AUTHENTICATION_REQUIRED</h1>
           <p className="text-muted-foreground text-[10px] uppercase font-black tracking-[0.3em]">Connect your wallet to receive protocol test tokens.</p>
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
    <div className="max-w-6xl mx-auto px-10 py-16 space-y-10 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-[9px] font-black tracking-[0.2em]">
        <ArrowLeft className="w-3.5 h-3.5" /> EXIT_TERMINAL
      </Link>

      <div className="space-y-3">
        <h1 className="text-4xl font-black exn-gradient-text tracking-tighter uppercase text-foreground leading-none">TOKEN_FAUCET</h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] max-w-lg">
          Generate testnet assets for protocol verification. Distribution limited to 24h intervals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="exn-card p-10 space-y-10 border-white/10 bg-black/40 backdrop-blur-3xl relative overflow-hidden group shadow-3xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all" />
          
          <div className="flex justify-between items-start relative z-10">
             <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-xl">
               <Coins className="w-8 h-8 text-primary" />
             </div>
             {exnTimeLeft > 0 && (
               <div className="flex items-center gap-2 text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 shadow-lg">
                 <Clock className="w-3.5 h-3.5" />
                 {formatTime(exnTimeLeft)}
               </div>
             )}
          </div>

          <div className="space-y-1.5 relative z-10">
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em]">DYNAMIC_ASSET_DROP</p>
            <h3 className="text-2xl font-black text-foreground font-mono tracking-tighter">{exnLimit.toLocaleString()} <span className="text-[10px] text-primary font-black uppercase ml-1.5">EXN</span></h3>
          </div>

          <button 
            onClick={() => initiateClaim('exn')} 
            disabled={exnTimeLeft > 0} 
            className={`w-full h-14 uppercase tracking-[0.5em] font-black transition-all rounded-xl relative z-10 text-[11px] shadow-2xl ${exnTimeLeft === 0 ? 'exn-button' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed'}`}
          >
            {exnTimeLeft > 0 ? 'COOLDOWN' : 'GENERATE_EXN'}
          </button>
        </div>

        <div className="exn-card p-10 space-y-10 border-white/10 bg-black/40 backdrop-blur-3xl relative overflow-hidden group shadow-3xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex justify-between items-start relative z-10">
             <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-xl">
               <CircleDollarSign className="w-8 h-8 text-emerald-500" />
             </div>
             {usdcTimeLeft > 0 && (
               <div className="flex items-center gap-2 text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 shadow-lg">
                 <Clock className="w-3.5 h-3.5" />
                 {formatTime(usdcTimeLeft)}
               </div>
             )}
          </div>

          <div className="space-y-1.5 relative z-10">
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em]">STABLE_ASSET_DROP</p>
            <h3 className="text-2xl font-black text-foreground font-mono tracking-tighter">{usdcLimit.toLocaleString()} <span className="text-[10px] text-emerald-500 font-black uppercase ml-1.5">USDC</span></h3>
          </div>

          <button 
            onClick={() => initiateClaim('usdc')} 
            disabled={usdcTimeLeft > 0} 
            className={`w-full h-14 uppercase tracking-[0.5em] font-black transition-all rounded-xl relative z-10 text-[11px] shadow-2xl ${usdcTimeLeft === 0 ? 'bg-emerald-500 text-black hover:opacity-90 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed'}`}
          >
            {usdcTimeLeft > 0 ? 'COOLDOWN' : 'GENERATE_USDC'}
          </button>
        </div>
      </div>

      {/* Faucet Review Dialog */}
      <AlertDialog open={reviewType !== null} onOpenChange={() => setReviewType(null)}>
        <AlertDialogContent className="exn-card border-primary/50 bg-black/95 backdrop-blur-3xl p-0 overflow-hidden max-w-md">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" />
                VERIFY_DROP_REQUEST
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-6">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4 shadow-3xl">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                      <span className="text-white/30 font-black">OP_CODE</span>
                      <span className="text-white font-black font-mono">FAUCET_ASSET_GEN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                      <span className="text-white/30 font-black">ASSET_TYPE</span>
                      <span className={reviewType === 'exn' ? "text-primary font-black" : "text-emerald-500 font-black"}>
                        {reviewType === 'exn' ? 'PROTOCOL_EXN' : 'STABLE_USDC'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                      <span className="text-white/30 font-black">QUANTITY</span>
                      <span className="text-white font-mono font-black text-sm">
                        {reviewType === 'exn' ? exnLimit.toLocaleString() : usdcLimit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-white/40 uppercase leading-relaxed font-black tracking-tight">
                    CONFIRMING WILL INITIATE ATOMIC MINTING TO YOUR CONNECTED WALLET ADDRESS.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 text-[10px] h-12 uppercase font-black border-white/20 text-white hover:bg-white/10">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmClaim} className="exn-button flex-1 text-[10px] h-12 uppercase font-black">CONFIRM_REQUEST</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
