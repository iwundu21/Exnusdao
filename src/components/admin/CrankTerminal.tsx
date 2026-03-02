"use client";

import React, { useState, useEffect, useMemo } from 'react';

const EPOCH_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
const GENESIS_TIME = 1704067200000; // Reference point: Jan 1, 2024

export function CrankTerminal({ validators = [], rewardCap = 0, lastCrankedEpoch = 0, onCrank, connected = false }: any) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [currentEpoch, setCurrentEpoch] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - GENESIS_TIME;
      const epoch = Math.floor(elapsed / EPOCH_DURATION) + 700; 
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
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);
  
  const isEpochCranked = lastCrankedEpoch >= currentEpoch;

  const epochHistory = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const eNum = currentEpoch - i;
      if (eNum < 700) return null;
      
      const startMs = GENESIS_TIME + (eNum - 700) * EPOCH_DURATION;
      const endMs = startMs + EPOCH_DURATION;
      
      const formatOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };

      return {
        number: eNum,
        status: eNum <= lastCrankedEpoch ? 'SETTLED' : eNum === currentEpoch ? 'ACTIVE' : 'PENDING',
        isCurrent: eNum === currentEpoch,
        startFormatted: new Date(startMs).toLocaleString([], formatOptions),
        endFormatted: new Date(endMs).toLocaleString([], formatOptions)
      };
    }).filter(Boolean);
  }, [currentEpoch, lastCrankedEpoch]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Network Crank Terminal</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Authorize protocol reward distribution. The network cycle settles every 14 days, distributing the dynamic {rewardCap.toLocaleString()} EXN reward pool to delegators based on weight.
          </p>
        </div>
        <div className="px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-6">
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Active Epoch</p>
             <p className="text-xl font-bold text-primary font-mono">{currentEpoch}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Cycle Ends In</p>
             <p className="text-xl font-bold text-foreground font-mono">
               {timeLeft.d}D {timeLeft.h}H {timeLeft.m}M {timeLeft.s}S
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="exn-card p-6 border-primary/20 bg-primary/5">
          <p className="text-[10px] uppercase font-black tracking-widest text-foreground mb-4">Active Nodes</p>
          <p className="text-3xl font-bold text-primary">{activeValidators.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Contributing Weight</p>
        </div>

        <div className="exn-card p-6 border-secondary/20 bg-secondary/5">
          <p className="text-[10px] uppercase font-black tracking-widest text-foreground mb-4">Epoch Distribution</p>
          <p className="text-3xl font-bold text-secondary">{rewardCap.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Dynamic Reward Pool</p>
        </div>

        <div className="exn-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[10px] uppercase font-black tracking-widest text-foreground mb-4">Status</p>
          <p className={`text-2xl font-bold ${isEpochCranked ? 'text-emerald-500' : 'text-amber-500'}`}>
            {isEpochCranked ? 'SETTLED' : 'ACTIVE'}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Epoch {currentEpoch} Pulse</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="exn-card p-10 border-primary/30 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden h-full">
            <div className="max-w-md space-y-4 relative z-10">
              <h3 className="text-2xl font-bold uppercase tracking-widest">Execute Network Crank</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Triggering the crank synchronizes the {rewardCap.toLocaleString()} EXN dynamic reward pool across all active validator shards for Epoch {currentEpoch}.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 relative z-10 w-full">
              {isEpochCranked ? (
                <div className="w-full py-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black uppercase text-sm tracking-[0.3em] flex items-center justify-center gap-3">
                  Epoch {currentEpoch} Settled
                </div>
              ) : (
                <button 
                  onClick={onCrank}
                  disabled={!connected}
                  className={`w-full py-5 rounded-xl font-black uppercase text-sm tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${connected ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                >
                  Settle Epoch {currentEpoch}
                </button>
              )}

              <p className="text-[10px] text-primary/40 uppercase font-black tracking-widest">
                Next Cycle Starts in {timeLeft.d} Days
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="exn-card p-0 border-border overflow-hidden h-full">
              <div className="p-4 bg-foreground/5 border-b border-border">
                 <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Epoch Lifecycle Registry</p>
              </div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-foreground/10">
                 {epochHistory.map((epoch: any) => (
                   <div key={epoch.number} className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${epoch.isCurrent ? 'bg-primary/5' : 'bg-transparent'}`}>
                      <div className="flex items-center gap-4">
                         <div className={`w-2 h-2 rounded-full ${epoch.status === 'SETTLED' ? 'bg-emerald-500' : epoch.status === 'ACTIVE' ? 'bg-amber-500 animate-pulse' : 'bg-foreground/20'}`} />
                         <div>
                            <p className="text-sm font-bold text-foreground uppercase">Epoch {epoch.number}</p>
                            <div className="flex flex-col gap-0.5 mt-1">
                               <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                                 Start: {epoch.startFormatted}
                               </p>
                               <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                                 End: {epoch.endFormatted}
                               </p>
                            </div>
                         </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase border ${epoch.status === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : epoch.status === 'ACTIVE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-foreground/5 text-muted-foreground border-border'}`}>
                         {epoch.status}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="exn-card p-0 border-border overflow-hidden">
        <div className="p-4 bg-foreground/5 border-b border-border flex items-center justify-between">
           <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Active Network Weight Shards</p>
           <p className="text-[9px] font-black uppercase text-primary">Global Weight: {totalNetworkWeight.toLocaleString()} EXN</p>
        </div>
        <div className="divide-y divide-border">
          {activeValidators.length === 0 ? (
            <div className="p-10 text-center opacity-20">
               <p className="text-[10px] uppercase font-black tracking-[0.3em]">No active nodes found on chain</p>
            </div>
          ) : (
            activeValidators.map((v: any) => {
              const weightShare = totalNetworkWeight > 0 ? (v.total_staked / totalNetworkWeight) * 100 : 0;
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
      
      <div className="p-4 bg-foreground/5 border border-border rounded-xl">
        <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight tracking-tight">
          The network crank initiates a dynamic 14-day reward distribution. "ACTIVE" epochs are currently collecting weight and can be settled by operators. "SETTLED" epochs have finalized their reward indices for all delegators.
        </p>
      </div>
    </div>
  );
}
