"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const EXN_PRICE = 0.23;

export function DashboardStats({ 
  totalStaked = 0, 
  treasuryBalance = 0,
}: { 
  totalStaked?: number, 
  treasuryBalance?: number,
}) {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [totalStaked, treasuryBalance]);

  const stakedUsd = (totalStaked || 0) * EXN_PRICE;
  const treasuryUsd = (treasuryBalance || 0) * EXN_PRICE;

  const stats = [
    { 
      label: 'TOTAL NETWORK STAKED', 
      value: `${(totalStaked || 0).toLocaleString()} EXN`, 
      subValue: `$${stakedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
      color: 'text-primary' 
    },
    { 
      label: 'PROTOCOL TREASURY BALANCE', 
      value: `${(treasuryBalance || 0).toLocaleString()} EXN`, 
      subValue: `$${treasuryUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
      color: 'text-secondary' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {stats.map((stat, i) => (
        <div key={i} className="relative group">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-0.5 bg-primary/20 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative exn-card p-10 flex flex-col min-h-[220px] justify-between border-primary/30 bg-black/40 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="space-y-6">
              <p className="text-foreground/40 text-[10px] uppercase font-black tracking-[0.3em] mb-2">
                {stat.label}
              </p>
              
              <div className="flex flex-col gap-2">
                <p className={`text-4xl md:text-5xl font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,245,255,0.8)]`}>
                  {stat.subValue.split(' ')[0]} <span className="text-lg font-black text-white/50 tracking-widest ml-1">USDC</span>
                </p>
                <p className="text-xs text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {stat.value} Equity Equivalent
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-foreground/30 uppercase font-black tracking-widest">
                <Clock className="w-3 h-3" />
                <span>Last updated: {lastUpdated || 'Just now'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-primary/40"></div>
                <div className="w-8 h-[1px] bg-primary/20"></div>
                <div className="w-1 h-1 rounded-full bg-primary/40"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
