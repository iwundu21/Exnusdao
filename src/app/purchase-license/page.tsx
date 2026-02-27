"use client";

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft, Ticket, Flame } from 'lucide-react';
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
        description: "All protocol license slots have been filled.", 
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
      is_burned: false,
    };

    setState(prev => ({
      ...prev,
      usdcBalance: prev.usdcBalance - LICENSE_PRICE,
      licenses: [...prev.licenses, newLicense]
    }));

    toast({ title: "License Generated", description: `Your ID: ${uniqueId}` });
  };

  if (!isLoaded) return null;

  // Dynamically calculate active nodes against total slot limit
  const activeNodeCount = state.validators.length;
  const totalLimit = state.licenseLimit || 21;
  const remainingSlots = totalLimit - activeNodeCount;

  return (
    <main className="min-h-screen pb-20">
      <Navbar exnBalance={state.exnBalance} usdcBalance={state.usdcBalance} />
      
      <div className="max-w-3xl mx-auto px-10 py-20 space-y-12">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase">Node Licensing</h1>
          <p className="text-white/40 max-w-xl">
            Register your validator on Exnus. Each license is for one-time use and is burned upon node decommissioning.
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
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                 <span className="text-white/40">Active Nodes / Total Slots</span>
                 <div className="flex items-center gap-1.5 font-black">
                   <span className={remainingSlots > 0 ? "text-[#00f5ff]" : "text-red-400"}>
                     {activeNodeCount}
                   </span>
                   <span className="text-white/20">/</span>
                   <span className="text-white/60">{totalLimit}</span>
                 </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full">
                <div 
                  className="h-full exn-gradient-bg transition-all duration-500" 
                  style={{ width: `${Math.min(100, (activeNodeCount / totalLimit) * 100)}%` }}
                />
              </div>
            </div>
            
            <button 
              onClick={handlePurchase}
              disabled={state.licenses.length >= totalLimit}
              className={`w-full h-14 text-sm tracking-[0.2em] font-black uppercase flex items-center justify-center gap-3 transition-all ${state.licenses.length < totalLimit ? 'exn-button' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
            >
              Purchase License
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Your Purchased Licenses</h3>
            <div className="space-y-3">
              {state.licenses.length === 0 ? (
                <p className="text-[10px] text-white/20 uppercase text-center py-4">No licenses found</p>
              ) : (
                state.licenses.map((lic) => (
                  <div key={lic.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="font-mono text-xs text-[#00f5ff]">{lic.id}</span>
                    <div className="flex items-center gap-2">
                      {lic.is_burned ? (
                        <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black uppercase bg-red-900/30 text-red-500">
                          <Flame className="w-3 h-3" /> Burned
                        </span>
                      ) : (
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${lic.is_claimed ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
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
    </main>
  );
}
