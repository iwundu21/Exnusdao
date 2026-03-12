
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock, ShieldAlert } from 'lucide-react';

const BLOCK_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days in ms

export function CrankTerminal({ validators = [], rewardCap = 0, lastCrankedBlock = 999, networkStartDate, onCrank, connected = false }: any) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [currentBlock, setCurrentBlock] = useState(1000);

  // Fallback if somehow not present, although ensured in state hook
  const effectiveStartDate = networkStartDate || Date.now() - BLOCK_DURATION;

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - effectiveStartDate;
      const block = Math.floor(elapsed / BLOCK_DURATION) + 1000; 
      const remainingMs = BLOCK_DURATION - (elapsed % BLOCK_DURATION);

      setCurrentBlock(block);
      
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

  const activeValidators = validators.filter((v: any) => v.is_active);
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);
  
  const isBlockCranked = lastCrankedBlock >= currentBlock;

  const blockHistory = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const bNum = currentBlock - i;
      if (bNum < 1000) return null;
      
      const startMs = effectiveStartDate + (bNum - 1000) * BLOCK_DURATION;
      const endMs = startMs + BLOCK_DURATION;
      
      return {
        number: bNum,
        status: bNum <= lastCrankedBlock ? 'FINALIZED' : bNum === currentBlock ? 'PENDING' : 'UPCOMING',
        isCurrent: bNum === currentBlock,
        startFormatted: new Date(startMs).toLocaleDateString(),
        endFormatted: new Date(endMs).toLocaleDateString()
      };
    }).filter(Boolean);
  }, [currentBlock, lastCrankedBlock, effectiveStartDate]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Network Crank Terminal</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Settle the 14-day reward blocks. The system operates on a 10-year sharding cycle, distributing the {(rewardCap || 0).toLocaleString()} EXN pool permissionlessly.
          </p>
        </div>
        <div className="px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-6">
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Active Block</p>
             <p className="text-xl font-bold text-primary font-mono">{currentBlock}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="space-y-1">
             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Block Ends In</p>
             <p className="text-xl font-bold text-foreground font-mono">
               {timeLeft.d}D {timeLeft.h}H {timeLeft.m}M
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="exn-card p-10 border-primary/30 flex flex-col items-center justify-center text-center space-y-8">
          <Activity className="w-12 h-12 text-primary animate-pulse" />
          <h3 className="text-2xl font-bold uppercase tracking-widest">Execute Block {currentBlock} Crank</h3>
          <p className="text-sm text-muted-foreground">Authorize sharding of {(rewardCap || 0).toLocaleString()} EXN to all active network weight shards.</p>
          
          <button 
            onClick={onCrank}
            disabled={!connected || isBlockCranked}
            className={`w-full py-5 rounded-xl font-black uppercase text-sm tracking-[0.3em] transition-all ${!isBlockCranked && connected ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
          >
            {isBlockCranked ? `Block ${currentBlock} Finalized` : `Settle Reward Block ${currentBlock}`}
          </button>
        </div>

        <div className="exn-card p-0 border-border overflow-hidden">
          <div className="p-4 bg-foreground/5 border-b border-border">
             <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">10-Year Lifecycle Registry</p>
          </div>
          <div className="divide-y divide-border">
             {blockHistory.map((block: any) => (
               <div key={block.number} className={`p-4 flex justify-between items-center ${block.isCurrent ? 'bg-primary/5' : ''}`}>
                  <div>
                    <p className="text-xs font-bold uppercase">Block {block.number}</p>
                    <p className="text-[9px] text-muted-foreground">{block.startFormatted} - {block.endFormatted}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${block.status === 'FINALIZED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-foreground/5 text-muted-foreground border-border'}`}>
                    {block.status}
                  </span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
