
"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Zap, Info } from 'lucide-react';

const EPOCH_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
const GENESIS_TIME = 1704067200000; // Reference point: Jan 1, 2024

export function CrankTerminal({ validators = [], rewardCap = 0, onCrank, connected = false }: any) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [currentEpoch, setCurrentEpoch] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - GENESIS_TIME;
      const epoch = Math.floor(elapsed / EPOCH_DURATION) + 700; // Start at 700 for demo flavor
      const remainingMs = EPOCH_DURATION - (elapsed % EPOCH_DURATION);

      setCurrentEpoch(epoch);
      
      const d = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setTimeLeft({ d, h, m, s });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeValidators = validators.filter((v: any) => v.is_active);
  const totalNetworkWeight = validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  
  // Dynamic pool distribution is based on the Reward Cap
  const projectedEpochReward = rewardCap;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Network Crank Terminal</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Authorize protocol reward distribution. The network cycle settles every 14 days, distributing the dynamic reward pool to delegators based on weight.
          </p>
        </div>
        <div className="px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-6">
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Active Epoch</p>
             <p className="text-xl font-bold text-primary font-mono">{currentEpoch}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Cycle Countdown</p>
             <p className="text-xl font-bold text-foreground font-mono">
               {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="exn-card p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Active Nodes</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{activeValidators.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Contributing Weight</p>
        </div>

        <div className="exn-card p-6 border-secondary/20 bg-secondary/5">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Epoch Distribution</h3>
          </div>
          <p className="text-3xl font-bold text-secondary">{projectedEpochReward.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Dynamic Reward Pool</p>
        </div>

        <div className="exn-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Pool Multiplier</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-500">Fixed</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Per Epoch Pulse</p>
        </div>
      </div>

      <div className="exn-card p-10 border-primary/30 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Zap className="w-40 h-40" />
        </div>
        
        <div className="max-w-md space-y-4 relative z-10">
          <h3 className="text-2xl font-bold uppercase tracking-widest">Execute Network Crank</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Triggering the crank synchronizes the {rewardCap.toLocaleString()} EXN dynamic reward pool across all active validator shards.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <button 
            onClick={onCrank}
            disabled={!connected}
            className={`px-16 py-5 rounded-xl font-black uppercase text-sm tracking-[0.3em] transition-all flex items-center gap-3 ${connected ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            Trigger Reward Crank
          </button>

          <div className="flex items-center gap-2 text-[10px] text-primary/40 uppercase font-black tracking-widest">
            <Clock className="w-3 h-3" />
            Epoch {currentEpoch} Cycle Active
          </div>
        </div>
      </div>

      <div className="exn-card p-0 border-border overflow-hidden">
        <div className="p-4 bg-foreground/5 border-b border-border flex items-center justify-between">
           <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Network Weight Shards</p>
           <div className="flex items-center gap-4 text-[9px] font-black uppercase">
             <span className="text-primary">Total Weight: {totalNetworkWeight.toLocaleString()} EXN</span>
           </div>
        </div>
        <div className="divide-y divide-border">
          {activeValidators.length === 0 ? (
            <div className="p-10 text-center opacity-20">
               <p className="text-[10px] uppercase font-black tracking-[0.3em]">No active nodes found on chain</p>
            </div>
          ) : (
            activeValidators.map((v: any) => {
              const weightShare = (v.total_staked / totalNetworkWeight) * 100;
              return (
                <div key={v.id} className="p-6 flex justify-between items-center bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-primary" />
                     <div>
                        <p className="text-sm font-bold text-foreground uppercase tracking-tight">{v.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">{v.location}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-base font-bold text-primary">
                       {weightShare.toFixed(2)}%
                     </p>
                     <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">{v.total_staked.toLocaleString()} Weight</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      
      <div className="flex items-start gap-3 p-4 bg-foreground/5 border border-border rounded-xl">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
        <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight tracking-tight">
          Rewards are dynamically calculated based on the global {rewardCap.toLocaleString()} EXN epoch cap. More network weight increases protocol security but adjusts individual node yield proportionally.
        </p>
      </div>
    </div>
  );
}
