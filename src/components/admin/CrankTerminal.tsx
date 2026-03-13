"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, History, Zap, ShieldCheck, Wallet } from 'lucide-react';

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

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { currentEpoch, currentEpochEndTime, isTargetMatured, nextTargetToSettle } = useMemo(() => {
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
          <p className="text-white text-sm max-w-xl font-medium leading-relaxed">
            Settle matured 30-day epochs to shard the {(rewardCap || 0).toLocaleString()} EXN reward block. Epoch {currentEpoch} is active and cannot be settled until maturity.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-6 py-4 bg-primary/10 border border-primary/40 rounded-2xl flex items-center gap-6 shadow-xl">
            <div className="space-y-1">
               <p className="text-[10px] text-white uppercase font-black tracking-widest">Active Epoch</p>
               <p className="text-xl font-bold text-primary font-mono">{currentEpoch}</p>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div className="space-y-1">
               <p className="text-[10px] text-white uppercase font-black tracking-widest">Maturity In</p>
               <p className="text-xl font-bold text-white font-mono">
                 {now ? `${timeLeft.d}D ${timeLeft.h}H ${timeLeft.m}M ${timeLeft.s}S` : 'SYNCING...'}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className={`exn-card p-10 border-primary/40 flex flex-col md:flex-row items-center gap-10 transition-all ${isTargetMatured ? 'opacity-100 bg-primary/5 shadow-[0_0_50px_rgba(0,245,255,0.15)]' : 'opacity-80 bg-white/5'}`}>
            <div className="flex-grow space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-widest text-white">
                   TARGET: EPOCH {nextTargetToSettle}
                </h3>
                <p className="text-[13px] text-white font-medium leading-relaxed italic">
                  {isTargetMatured 
                    ? `Chronological maturity reached for Epoch ${nextTargetToSettle}. Execute settlement to shard rewards.`
                    : `Epoch ${nextTargetToSettle} is currently active or in the future. Settlement is restricted until the 30-day period concludes.`
                  }
                </p>
              </div>
              
              <button 
                onClick={() => onCrank(nextTargetToSettle)}
                disabled={!isTargetMatured || !connected}
                className={`w-full py-5 rounded-xl font-black uppercase text-sm tracking-[0.3em] transition-all ${isTargetMatured && connected ? 'exn-button shadow-[0_0_30px_rgba(0,245,255,0.3)]' : 'bg-white/10 text-white/60 border border-white/20 cursor-not-allowed'}`}
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
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <History className="w-4 h-4 text-primary" /> Settlement History & Shares
            </h3>
            
            {settledEpochs.length === 0 ? (
              <div className="exn-card p-16 text-center border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-white/40" />
                <p className="text-[11px] font-black uppercase text-white/60 tracking-widest">No epochs settled in current cluster timeline</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {[...settledEpochs].reverse().map((record: any) => (
                  <div key={`epoch-record-${record.epoch}`} className="exn-card p-6 border-emerald-500/40 bg-emerald-500/10 group hover:border-emerald-500/60 transition-all shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                          <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-emerald-400 uppercase tracking-widest">Epoch {record.epoch} Sharded</p>
                          <p className="text-[10px] text-white uppercase font-bold">{new Date(record.settledAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white font-mono">{record.totalPool.toLocaleString()} EXN</p>
                        <p className="text-[9px] text-white uppercase font-black tracking-widest">Block Reward Distributed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="exn-card p-0 border-white/30 overflow-hidden shadow-2xl">
            <div className="p-5 bg-white/10 border-b border-white/30">
               <p className="text-[11px] uppercase font-black tracking-widest text-white">Epoch Roadmap</p>
            </div>
            <div className="divide-y divide-white/20">
               {epochHistory.map((epoch: any) => (
                 <div key={`roadmap-epoch-${epoch.number}`} className={`p-5 flex justify-between items-center transition-colors ${epoch.isCurrent ? 'bg-primary/20 border-l-4 border-l-primary' : ''} ${epoch.isSettleable ? 'bg-amber-500/20' : ''}`}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <p className="text-[13px] font-black uppercase text-white">Epoch {epoch.number}</p>
                        {epoch.isCurrent && <span className="text-[9px] bg-primary text-black px-2 py-0.5 rounded-lg font-black uppercase shadow-lg">ACTIVE</span>}
                        {epoch.isSettleable && <span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded-lg font-black uppercase shadow-lg">MATURED</span>}
                      </div>
                      <p className="text-[10px] font-bold text-white/80">{epoch.startFormatted} - {epoch.endFormatted}</p>
                    </div>
                    <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border transition-all shadow-md ${
                      epoch.status === 'FINALIZED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 
                      epoch.status === 'ACTIVE' ? 'bg-primary/20 text-primary border-primary/40' : 
                      epoch.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                      'bg-white/10 text-white border-white/20'
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
