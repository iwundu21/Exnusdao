
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock } from 'lucide-react';

const EPOCH_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days in ms

export function CrankTerminal({ validators = [], rewardCap = 0, lastCrankedEpoch = 0, networkStartDate, onCrank, connected = false }: any) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const effectiveStartDate = networkStartDate || now;
  
  // The "Active" epoch is the one currently in focus for sharding
  const targetEpoch = lastCrankedEpoch + 1;
  const targetEndTime = effectiveStartDate + (targetEpoch * EPOCH_DURATION);
  
  // Chronological epoch based on strictly elapsed time
  const currentChronologicalEpoch = Math.floor((now - effectiveStartDate) / EPOCH_DURATION) + 1;

  useEffect(() => {
    const remainingMs = Math.max(0, targetEndTime - now);
    
    const d = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const h = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

    setTimeLeft({ d, h, m, s });
  }, [now, targetEndTime]);

  // Can crank if chronological time has reached or passed the target epoch's logic
  // In this sim, we allow cranking Epoch 1 if it's the target and connected.
  const canCrank = connected && (currentChronologicalEpoch >= targetEpoch);

  const epochHistory = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const eNum = Math.max(1, targetEpoch + 2) - i;
      if (eNum < 1) return null;
      
      const startMs = effectiveStartDate + (eNum - 1) * EPOCH_DURATION;
      const endMs = startMs + EPOCH_DURATION;
      
      let status: 'FINALIZED' | 'ACTIVE' | 'UPCOMING' = 'UPCOMING';
      if (eNum <= lastCrankedEpoch) status = 'FINALIZED';
      else if (eNum === targetEpoch) status = 'ACTIVE';

      return {
        number: eNum,
        status,
        isTarget: eNum === targetEpoch,
        startFormatted: new Date(startMs).toLocaleDateString(),
        endFormatted: new Date(endMs).toLocaleDateString()
      };
    }).filter(Boolean);
  }, [targetEpoch, lastCrankedEpoch, effectiveStartDate]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Network Crank Terminal</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Settle the 14-day reward epochs. The system operates on a 10-year sharding cycle, distributing the {(rewardCap || 0).toLocaleString()} EXN pool proportionally to staked weight.
          </p>
        </div>
        <div className="px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-6">
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Active Epoch</p>
             <p className="text-xl font-bold text-primary font-mono">{targetEpoch}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Epoch Ends In</p>
             <p className="text-xl font-bold text-foreground font-mono">
               {timeLeft.d}D {timeLeft.h}H {timeLeft.m}M
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="exn-card p-10 border-primary/30 flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative">
             <Activity className={`w-16 h-16 text-primary ${canCrank ? 'animate-pulse' : 'opacity-40'}`} />
             {canCrank && <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold uppercase tracking-widest">
               Settle Epoch {targetEpoch}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {canCrank 
                ? `Authorize sharding of ${(rewardCap || 0).toLocaleString()} EXN to all active network shards for Epoch ${targetEpoch}.`
                : `Waiting for chronological maturity of Epoch ${targetEpoch}. Check back when the timer reaches zero.`
              }
            </p>
          </div>
          
          <button 
            onClick={() => onCrank(targetEpoch)}
            disabled={!canCrank}
            className={`w-full py-5 rounded-xl font-black uppercase text-sm tracking-[0.3em] transition-all ${canCrank ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {canCrank ? `Execute Epoch ${targetEpoch} Crank` : 'Epoch Maturity Required'}
          </button>
        </div>

        <div className="exn-card p-0 border-border overflow-hidden">
          <div className="p-4 bg-foreground/5 border-b border-border">
             <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">10-Year Epoch Registry</p>
          </div>
          <div className="divide-y divide-border">
             {epochHistory.map((epoch: any) => (
               <div key={epoch.number} className={`p-4 flex justify-between items-center ${epoch.isTarget ? 'bg-primary/5' : ''}`}>
                  <div>
                    <p className="text-xs font-bold uppercase">Epoch {epoch.number}</p>
                    <p className="text-[9px] text-muted-foreground">{epoch.startFormatted} - {epoch.endFormatted}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${epoch.status === 'FINALIZED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : epoch.status === 'ACTIVE' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-foreground/5 text-muted-foreground border-border'}`}>
                    {epoch.status}
                  </span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
