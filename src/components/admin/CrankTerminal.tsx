"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock, History, Zap, ShieldCheck, Wallet } from 'lucide-react';

const EPOCH_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export function CrankTerminal({ 
  validators = [], 
  rewardCap = 0, 
  lastCrankedEpoch = 0, 
  networkStartDate, 
  onCrank, 
  connected = false,
  settledEpochs = []
}: any) {
  const [now, setNow] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // Handle hydration and browser-safe time ticking
  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Stable epoch calculation based on the official network start date
  const { currentEpoch, currentEpochEndTime, isTargetMatured, nextTargetToSettle } = useMemo(() => {
    // Fallback if network data is still syncing
    if (!networkStartDate || !now) {
      return { 
        currentEpoch: 1, 
        currentEpochEndTime: 0, 
        isTargetMatured: false, 
        nextTargetToSettle: 1 
      };
    }

    const elapsed = Math.max(0, now - networkStartDate);
    const epoch = Math.floor(elapsed / EPOCH_DURATION) + 1;
    const endTime = networkStartDate + (epoch * EPOCH_DURATION);
    
    const nextTarget = lastCrankedEpoch + 1;
    const targetEpochEndTime = networkStartDate + (nextTarget * EPOCH_DURATION);
    
    // An epoch is only matured if the current time has actually passed the end of the target epoch
    const matured = now > targetEpochEndTime;

    return { 
      currentEpoch: epoch, 
      currentEpochEndTime: endTime, 
      isTargetMatured: matured, 
      nextTargetToSettle: nextTarget 
    };
  }, [networkStartDate, now, lastCrankedEpoch]);

  useEffect(() => {
    if (!now || !currentEpochEndTime) return;

    const remainingMs = Math.max(0, currentEpochEndTime - now);
    const d = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const h = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((remainingMs % (1000 * 60)) / 1000);
    setTimeLeft({ d, h, m, s });
  }, [now, currentEpochEndTime]);

  const epochHistory = useMemo(() => {
    if (!networkStartDate) return [];
    
    return Array.from({ length: 3 }, (_, i) => {
      const eNum = nextTargetToSettle + (i - 1);
      if (eNum < 1) return null;
      
      const startMs = networkStartDate + (eNum - 1) * EPOCH_DURATION;
      const endMs = startMs + EPOCH_DURATION;
      
      let status: 'FINALIZED' | 'PENDING' | 'ACTIVE' | 'UPCOMING' = 'UPCOMING';
      if (eNum <= lastCrankedEpoch) status = 'FINALIZED';
      else if (eNum === currentEpoch) status = 'ACTIVE';
      else if (eNum < currentEpoch) status = 'PENDING';

      return {
        number: eNum,
        status,
        isCurrent: eNum === currentEpoch,
        isSettleable: eNum === nextTargetToSettle && status === 'PENDING',
        startFormatted: new Date(startMs).toLocaleDateString(),
        endFormatted: new Date(endMs).toLocaleDateString()
      };
    }).filter(Boolean);
  }, [currentEpoch, lastCrankedEpoch, nextTargetToSettle, networkStartDate]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Network Crank Terminal</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Settle matured 30-day epochs to shard the {(rewardCap || 0).toLocaleString()} EXN reward block. Epoch {currentEpoch} is active and cannot be settled until maturity.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-6">
            <div className="space-y-1">
               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Active Epoch</p>
               <p className="text-xl font-bold text-primary font-mono">{currentEpoch}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="space-y-1">
               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Maturity In</p>
               <p className="text-xl font-bold text-foreground font-mono">
                 {now ? `${timeLeft.d}D ${timeLeft.h}H ${timeLeft.m}M ${timeLeft.s}S` : 'SYNCING...'}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className={`exn-card p-10 border-primary/30 flex flex-col md:flex-row items-center gap-10 transition-all ${isTargetMatured ? 'opacity-100 shadow-[0_0_50px_rgba(0,245,255,0.1)]' : 'opacity-60 bg-foreground/5'}`}>
            <div className="flex-shrink-0 relative">
               <Activity className={`w-20 h-20 ${isTargetMatured ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
               {isTargetMatured && <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />}
            </div>
            <div className="flex-grow space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-foreground">
                   Target: Epoch {nextTargetToSettle}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isTargetMatured 
                    ? `Chronological maturity reached for Epoch ${nextTargetToSettle}. Execute settlement to shard rewards.`
                    : `Epoch ${nextTargetToSettle} is currently active or in the future. Settlement is restricted until the 30-day period concludes.`
                  }
                </p>
              </div>
              
              <button 
                onClick={() => onCrank(nextTargetToSettle)}
                disabled={!isTargetMatured || !connected}
                className={`w-full py-5 rounded-xl font-black uppercase text-sm tracking-[0.3em] transition-all ${isTargetMatured && connected ? 'exn-button shadow-[0_0_30px_rgba(0,245,255,0.2)]' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
              >
                {!connected ? (
                  <span className="flex items-center justify-center gap-2">
                    <Wallet className="w-4 h-4" /> Connect Wallet to Settle
                  </span>
                ) : isTargetMatured ? `Settle Epoch ${nextTargetToSettle}` : 'Waiting for Maturity'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
              <History className="w-4 h-4" /> Settlement History & Shares
            </h3>
            
            {settledEpochs.length === 0 ? (
              <div className="exn-card p-12 text-center border-dashed border-border flex flex-col items-center justify-center space-y-4 opacity-20">
                <ShieldCheck className="w-10 h-10" />
                <p className="text-[10px] font-black uppercase">No epochs settled in current cluster timeline</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {[...settledEpochs].reverse().map((record: any) => (
                  <div key={`epoch-record-${record.epoch}`} className="exn-card p-6 border-emerald-500/20 bg-emerald-500/5 group hover:border-emerald-500/40 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <Zap className="w-4 h-4 fill-current" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Epoch {record.epoch} Sharded</p>
                          <p className="text-[9px] text-muted-foreground uppercase">{new Date(record.settledAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{record.totalPool.toLocaleString()} EXN</p>
                        <p className="text-[8px] text-muted-foreground uppercase font-black">Block Reward Distributed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="exn-card p-0 border-border overflow-hidden">
            <div className="p-4 bg-foreground/5 border-b border-border">
               <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Epoch Roadmap</p>
            </div>
            <div className="divide-y divide-border">
               {epochHistory.map((epoch: any) => (
                 <div key={`roadmap-epoch-${epoch.number}`} className={`p-4 flex justify-between items-center transition-colors ${epoch.isCurrent ? 'bg-primary/10 border-l-2 border-l-primary' : ''} ${epoch.isSettleable ? 'bg-amber-500/10' : ''}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold uppercase">Epoch {epoch.number}</p>
                        {epoch.isCurrent && <span className="text-[8px] bg-primary text-black px-1.5 py-0.5 rounded font-black uppercase">ACTIVE</span>}
                        {epoch.isSettleable && <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black uppercase">MATURED</span>}
                      </div>
                      <p className="text-[9px] text-muted-foreground">{epoch.startFormatted} - {epoch.endFormatted}</p>
                    </div>
                    <div className={`text-[9px] font-black uppercase px-2 py-1 rounded border transition-all ${
                      epoch.status === 'FINALIZED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      epoch.status === 'ACTIVE' ? 'bg-primary/5 text-primary border-primary/20' : 
                      epoch.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-foreground/5 text-muted-foreground border-border'
                    }`}>
                      {epoch.status === 'PENDING' ? 'MATURED' : epoch.status}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}