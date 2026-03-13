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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-black uppercase tracking-[0.4em] animate-pulse text-[10px]">SYNCING_CLOUD_ASSETS</p>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-10 py-32 space-y-6 animate-in fade-in duration-500">
         <div className="p-6 bg-primary/15 rounded-3xl border border-primary/30 shadow-2xl">
           <Wallet className="w-12 h-12 text-primary" />
         </div>
         <div className="space-y-4">
           <h1 className="text-3xl font-black uppercase tracking-tighter text-white">AUTHENTICATION_REQUIRED</h1>
           <p className="text-white font-black text-[11px] uppercase tracking-[0.4em]">Connect your wallet to receive protocol test tokens.</p>
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
    const type = reviewType;
    setReviewType(null);
    setIsProcessing(true);
    
    setTimeout(() => {
      if (type === 'exn') {
        claimFaucetAssets(walletAddress, exnLimit, 0, 'exn');
      } else {
        claimFaucetAssets(walletAddress, 0, usdcLimit, 'usdc');
      }
      setIsProcessing(false);
    }, 6000);
  };

  return (
    <div className="max-w-6xl mx-auto px-10 py-16 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors uppercase text-[10px] font-black tracking-[0.3em]">
        <ArrowLeft className="w-4 h-4" /> EXIT_TERMINAL
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-black exn-gradient-text tracking-tighter uppercase text-white leading-none">TOKEN_FAUCET</h1>
        <p className="text-white font-black text-[11px] uppercase tracking-[0.5em] max-w-lg leading-relaxed">
          Generate testnet assets for protocol verification. Distribution limited to 24h intervals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="exn-card p-10 space-y-12 border-white/20 bg-black/90 backdrop-blur-3xl relative overflow-hidden group shadow-3xl">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/15 blur-3xl group-hover:bg-primary/25 transition-all" />
          
          <div className="flex justify-between items-start relative z-10">
             <div className="p-5 bg-primary/15 rounded-2xl border border-primary/30 shadow-xl">
               <Coins className="w-10 h-10 text-primary" />
             </div>
             {exnTimeLeft > 0 && (
               <div className="flex items-center gap-3 text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/15 px-4 py-2 rounded-xl border border-amber-500/40 shadow-lg">
                 <Clock className="w-4 h-4" />
                 {formatTime(exnTimeLeft)}
               </div>
             )}
          </div>

          <div className="space-y-2.5 relative z-10">
            <p className="text-[11px] text-white uppercase font-black tracking-[0.5em]">DYNAMIC_ASSET_DROP</p>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter">{exnLimit.toLocaleString()} <span className="text-xs text-primary font-black uppercase ml-2">EXN</span></h3>
          </div>

          <button 
            onClick={() => initiateClaim('exn')} 
            disabled={exnTimeLeft > 0 || isProcessing} 
            className={`w-full h-16 uppercase tracking-[0.6em] font-black transition-all rounded-2xl relative z-10 text-[12px] shadow-3xl ${exnTimeLeft === 0 && !isProcessing ? 'exn-button' : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed'}`}
          >
            {isProcessing ? 'PROCESSING...' : (exnTimeLeft > 0 ? 'COOLDOWN_ACTIVE' : 'GENERATE_EXN')}
          </button>
        </div>

        <div className="exn-card p-10 space-y-12 border-white/20 bg-black/90 backdrop-blur-3xl relative overflow-hidden group shadow-3xl">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/15 blur-3xl group-hover:bg-emerald-500/25 transition-all" />

          <div className="flex justify-between items-start relative z-10">
             <div className="p-5 bg-emerald-500/15 rounded-2xl border border-emerald-500/30 shadow-xl">
               <CircleDollarSign className="w-10 h-10 text-emerald-500" />
             </div>
             {usdcTimeLeft > 0 && (
               <div className="flex items-center gap-3 text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/15 px-4 py-2 rounded-xl border border-amber-500/40 shadow-lg">
                 <Clock className="w-4 h-4" />
                 {formatTime(usdcTimeLeft)}
               </div>
             )}
          </div>

          <div className="space-y-2.5 relative z-10">
            <p className="text-[11px] text-white uppercase font-black tracking-[0.5em]">STABLE_ASSET_DROP</p>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter">{usdcLimit.toLocaleString()} <span className="text-xs text-emerald-500 font-black uppercase ml-2">USDC</span></h3>
          </div>

          <button 
            onClick={() => initiateClaim('usdc')} 
            disabled={usdcTimeLeft > 0 || isProcessing} 
            className={`w-full h-16 uppercase tracking-[0.6em] font-black transition-all rounded-2xl relative z-10 text-[12px] shadow-3xl ${usdcTimeLeft === 0 && !isProcessing ? 'bg-emerald-500 text-black hover:opacity-90 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed'}`}
          >
            {isProcessing ? 'PROCESSING...' : (usdcTimeLeft > 0 ? 'COOLDOWN_ACTIVE' : 'GENERATE_USDC')}
          </button>
        </div>
      </div>

      <AlertDialog open={reviewType !== null} onOpenChange={() => setReviewType(null)}>
        <AlertDialogContent className="exn-card border-primary/60 bg-black/95 backdrop-blur-3xl p-0 overflow-hidden max-w-sm">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" />
                VERIFY_DROP_REQUEST
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/15 space-y-4 shadow-3xl">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em] font-black">
                      <span className="text-white/60">OP_CODE</span>
                      <span className="text-white font-mono">FAUCET_GEN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em] font-black">
                      <span className="text-white/60">ASSET_TYPE</span>
                      <span className={reviewType === 'exn' ? "text-primary" : "text-emerald-500"}>
                        {reviewType === 'exn' ? 'PROTOCOL_EXN' : 'STABLE_USDC'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em] font-black">
                      <span className="text-white/60">QUANTITY</span>
                      <span className="text-white font-mono text-[13px]">
                        {reviewType === 'exn' ? exnLimit.toLocaleString() : usdcLimit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-white/80 uppercase leading-relaxed font-black tracking-tight">
                    CONFIRMING WILL INITIATE ATOMIC ASSET GENERATION TO YOUR CONNECTED WALLET ADDRESS.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 text-[10px] h-11 uppercase font-black border-white/20 text-white">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmClaim} className="exn-button flex-1 h-11 text-[10px] uppercase font-black">CONFIRM_REQUEST</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}