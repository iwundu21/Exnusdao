
"use client";

import React, { useState, useEffect } from 'react';
import { Ticket, Flame, Wallet, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress, getExplorerLink } from '@/lib/utils';

export default function PurchaseLicensePage() {
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, setState, isLoaded, setFeedback } = useProtocolState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const licensePrice = state.licensePrice || 500;

  const handlePurchase = () => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    const activeNodes = state.validators.length;
    if (activeNodes >= state.licenseLimit) {
      return setFeedback('warning', 'Protocol registration cap reached.');
    }
    if (state.usdcBalance < licensePrice) {
      return setFeedback('error', `Insufficient USDC balance. Required: ${licensePrice} USDC.`);
    }
    const uniqueId = `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const newLicense = { id: uniqueId, owner: walletAddress, is_claimed: false, is_burned: false };
    setState(prev => ({
      ...prev,
      usdcBalance: prev.usdcBalance - licensePrice,
      usdcVaultBalance: prev.usdcVaultBalance + licensePrice,
      licenses: [...prev.licenses, newLicense]
    }));
    setFeedback('success', `License ${uniqueId} generated successfully.`);
  };

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
           <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">Wallet Connection Required</h1>
           <p className="text-muted-foreground max-w-md mx-auto">Please connect your Solana wallet to purchase a protocol node license.</p>
         </div>
      </div>
    );
  }

  const activeNodeCount = state.validators.length;
  const totalLimit = state.licenseLimit || 21;
  const remainingSlots = totalLimit - activeNodeCount;

  return (
    <div className="max-w-3xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">Node Licensing</h1>
        <p className="text-muted-foreground max-xl flex items-center gap-2 flex-wrap">
          Register your validator for wallet 
          <a href={getExplorerLink(walletAddress)} target="_blank" rel="noopener noreferrer" className="text-foreground font-mono text-[10px] bg-foreground/5 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-primary/20 transition-all">
            {shortenAddress(walletAddress)} <ExternalLink className="w-2.5 h-2.5" />
          </a>.
        </p>
      </div>

      <div className="exn-card p-10 space-y-8 border-primary/20">
        <div className="flex justify-between items-center border-b border-border pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground uppercase tracking-widest">Protocol License</p>
              <p className="text-xs text-muted-foreground uppercase">Unique Identity Token</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-500">{licensePrice.toLocaleString()} USDC</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
               <span className="text-muted-foreground">Active Nodes / Total Slots</span>
               <div className="flex items-center gap-1.5 font-black">
                 <span className={remainingSlots > 0 ? "text-primary" : "text-destructive"}>{activeNodeCount}</span>
                 <span className="text-muted-foreground/40">/</span>
                 <span className="text-muted-foreground">{totalLimit}</span>
               </div>
            </div>
            <div className="w-full h-1.5 bg-foreground/5 rounded-full">
              <div className="h-full exn-gradient-bg transition-all duration-500" style={{ width: `${Math.min(100, (activeNodeCount / totalLimit) * 100)}%` }} />
            </div>
          </div>
          <button onClick={handlePurchase} disabled={activeNodeCount >= totalLimit} className={`w-full h-14 text-sm tracking-[0.2em] font-black uppercase flex items-center justify-center gap-3 transition-all ${activeNodeCount < totalLimit ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}>
            Purchase License
          </button>
        </div>

        <div className="p-4 bg-foreground/5 rounded-xl border border-border">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Your Purchased Licenses</h3>
          <div className="space-y-3">
            {state.licenses.filter(l => l.owner === walletAddress).length === 0 ? (
              <p className="text-[10px] text-muted-foreground uppercase text-center py-4">No licenses found for this wallet</p>
            ) : (
              state.licenses.filter(l => l.owner === walletAddress).map((lic) => (
                <div key={lic.id} className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg border border-border">
                  <span className="font-mono text-xs text-primary">{lic.id}</span>
                  <div className="flex items-center gap-2">
                    {lic.is_burned ? (
                      <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black uppercase bg-destructive/10 text-destructive border border-destructive/20">
                        Burned 🔥
                      </span>
                    ) : (
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${lic.is_claimed ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {lic.is_claimed ? 'Claimed' : 'Active'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
