"use client";

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';

const LICENSE_PRICE = 500;

export default function PurchaseLicensePage() {
  const { state, setState, isLoaded } = useProtocolState();

  const handlePurchase = () => {
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

  if (!isLoaded) return null;

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

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/40 uppercase tracking-widest">Available Balance:</span>
              <span className="text-white font-bold">{state.usdcBalance.toLocaleString()} USDC</span>
            </div>
            
            <button 
              onClick={handlePurchase}
              className="w-full h-14 exn-button text-sm tracking-[0.2em] font-black uppercase flex items-center justify-center gap-3"
            >
              Purchase License
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
