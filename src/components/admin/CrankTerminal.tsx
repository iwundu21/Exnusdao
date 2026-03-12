
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock } from 'lucide-react';

const EPOCH_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days in ms

export function CrankTerminal({ validators = [], rewardCap = 0, lastCrankedEpoch = 0, networkStartDate, onCrank, connected = false }: any) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [currentEpoch, setCurrentEpoch] = useState(1);

  const effectiveStartDate = networkStartDate || Date.now();

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - effectiveStartDate);
      const epoch = Math.floor(elapsed / EPOCH_DURATION) + 1; 
      const remainingMs = EPOCH_DURATION - (elapsed % EPOCH_DURATION);

      setCurrentEpoch(epoch);
      
      const d = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setTimeLeft({ d, h, m, s });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [effectiveStartDate]);

  // An epoch is cranked if the last finalized epoch is the current one or greater
  const isCurrentEpochFinalized = lastCrankedEpoch >= currentEpoch;

  const epochHistory = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const eNum = currentEpoch - i;
      if (eNum < 1) return null;
      
      const startMs = effectiveStartDate + (eNum - 1) * EPOCH_DURATION;
      const endMs = startMs + EPOCH_DURATION;
      
      const status = eNum <= lastCrankedEpoch ? 'FINALIZED' : eNum === currentEpoch ? 'ACTIVE' : 'UPCOMING';

      return {
        number: eNum,
        status,
        isCurrent: eNum === currentEpoch,
        startFormatted: new Date(startMs).toLocaleDateString(),
        endFormatted: new Date(endMs).toLocaleDateString()
      };
    }).filter(Boolean);
  }, [currentEpoch, lastCrankedEpoch, effectiveStartDate]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Network Crank Terminal</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Settle the 14-day reward epochs. The system operates on a 10-year sharding cycle, distributing the {(rewardCap || 0).toLocaleString()} EXN pool permissionlessly.
          </p>
        </div>
        <div className="px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-6">
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Active Epoch</p>
             <p className="text-xl font-bold text-primary font-mono">{currentEpoch}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ends In</p>
             <p className="text-xl font-bold text-foreground font-mono">
               {timeLeft.d}D {timeLeft.h}H {timeLeft.m}M
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="exn-card p-10 border-primary/30 flex flex-col items-center justify-center text-center space-y-8">
          <Activity className={`w-12 h-12 text-primary ${!isCurrentEpochFinalized ? 'animate-pulse' : ''}`} />
          <h3 className="text-2xl font-bold uppercase tracking-widest">
            {isCurrentEpochFinalized ? `Epoch ${currentEpoch} Settled` : `Execute Epoch ${currentEpoch} Crank`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isCurrentEpochFinalized 
              ? `Consensus yield for Epoch ${currentEpoch} has been distributed to the network shards.`
              : `Authorize sharding of ${(rewardCap || 0).toLocaleString()} EXN to all active network weight shards.`
            }
          </p>
          
          <button 
            onClick={onCrank}
            disabled={!connected || isCurrentEpochFinalized}
            className={`w-full py-5 rounded-xl font-black uppercase text-sm tracking-[0.3em] transition-all ${!isCurrentEpochFinalized && connected ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {isCurrentEpochFinalized ? `Epoch ${currentEpoch} Finalized` : `Settle Epoch ${currentEpoch}`}
          </button>
        </div>

        <div className="exn-card p-0 border-border overflow-hidden">
          <div className="p-4 bg-foreground/5 border-b border-border">
             <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">10-Year Epoch Registry</p>
          </div>
          <div className="divide-y divide-border">
             {epochHistory.map((epoch: any) => (
               <div key={epoch.number} className={`p-4 flex justify-between items-center ${epoch.isCurrent ? 'bg-primary/5' : ''}`}>
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
