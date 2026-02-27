"use client";

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';

const LICENSE_PRICE = 500;

export default function PurchaseLicensePage() {
  const { state, setState, isLoaded } = useProtocolState();

  const handlePurchase = () => {
    if (state.licenses.length >= state.licenseLimit) {
      return toast({ 
        title: "Registration Capped", 
        description: "All protocol license slots have been filled for this epoch.", 
        variant: "destructive" 
      });
    }

    if (state.usdcBalance < LICENSE_PRICE) {
      return toast({ title: "Insufficient USDC", variant: "destructive" });
    }

    const uniqueId = `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const newLicense = {
      id: uniqueId,
      owner: 'ExnUs...d2f1',
      is_claimed: false,
    };

    setState(prev => ({
      ...prev,
      usdcBalance: prev.usdcBalance - LICENSE_PRICE,
      licenses: [...prev.licenses, newLicense]
    }));

    toast({ 
      title: "License Generated", 
      description: `Your unique ID is ${uniqueId}. Keep it safe for node registration.` 
    });
  };

  if (!isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] space-y-4">
      <div className="w-16 h-16 border-4 border-[#00f5ff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const purchasedCount = state.licenses.length;
  const totalLimit = state.licenseLimit || 21;
  const remainingSlots = totalLimit - purchasedCount;

  return (
    <main className="min-h-screen pb-20">
      <Navbar 
        exnBalance={state.exnBalance} 
        usdcBalance={state.usdcBalance}
        toggleAdmin={() => {}}
      />
      
      <div className="max-w-3xl mx-auto px-10 py-20 space-y-12">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase">Node Licensing</h1>
          <p className="text-white/40 max-w-xl">
            To register a validator node on the Exnus network, you must first purchase a unique license. 
            Each license allows for the registration of exactly one node.
          </p>
        </div>

        <div className="exn-card p-10 space-y-8 border-[#00f5ff]/20">
          <div className="flex justify-between items-center border-b border-white/10 pb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#00f5ff]/10 rounded-xl border border-[#00f5ff]/20">
                <Ticket className="w-6 h-6 text-[#00f5ff]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Protocol License</p>
                <p className="text-xs text-white/40 uppercase">Unique Identity Token</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-400">500 USDC</p>
              <p className="text-[10px] text-white/30 uppercase font-bold">One-time payment</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                 <span className="text-white/40">License Availability</span>
                 <div className="flex items-center gap-1.5 font-black">
                   <span className={remainingSlots > 0 ? "text-[#00f5ff]" : "text-red-400"}>
                     {purchasedCount}
                   </span>
                   <span className="text-white/20">/</span>
                   <span className="text-white/60">
                     {totalLimit}
                   </span>
                 </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full exn-gradient-bg transition-all duration-500 shadow-[0_0_10px_rgba(0,245,255,0.3)]" 
                  style={{ width: `${Math.min(100, (purchasedCount / totalLimit) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/40 uppercase tracking-widest">Available Balance:</span>
              <span className="text-white font-bold">{state.usdcBalance.toLocaleString()} USDC</span>
            </div>
            
            <button 
              onClick={handlePurchase}
              disabled={remainingSlots <= 0}
              className={`w-full h-14 text-sm tracking-[0.2em] font-black uppercase flex items-center justify-center gap-3 transition-all ${remainingSlots > 0 ? 'exn-button' : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'}`}
            >
              {remainingSlots > 0 ? 'Purchase License' : 'Registration Capped'}
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Your Purchased Licenses</h3>
            <div className="space-y-3">
              {state.licenses.length === 0 ? (
                <p className="text-[10px] text-white/20 uppercase text-center py-4">No licenses found in wallet</p>
              ) : (
                state.licenses.map((lic) => (
                  <div key={lic.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="font-mono text-xs text-[#00f5ff]">{lic.id}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${lic.is_claimed ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {lic.is_claimed ? 'Claimed' : 'Active'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
