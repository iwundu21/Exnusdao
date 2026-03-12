"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Landmark, ShieldCheck } from 'lucide-react';

const EXN_PRICE = 0.23;

export function DashboardStats({ 
  totalStaked = 0, 
  treasuryBalance = 0 
}: { 
  totalStaked?: number, 
  treasuryBalance?: number 
}) {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [totalStaked, treasuryBalance]);

  const stats = [
    { 
      label: 'TOTAL NETWORK STAKED', 
      value: `${(totalStaked || 0).toLocaleString()} EXN`, 
      subValue: `$${(totalStaked * EXN_PRICE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: ShieldCheck,
      color: 'text-primary' 
    },
    { 
      label: 'DAO TREASURY VAULT', 
      value: `${(treasuryBalance || 0).toLocaleString()} EXN`, 
      subValue: `$${(treasuryBalance * EXN_PRICE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Landmark,
      color: 'text-secondary' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`}></div>
            <div className="relative exn-card p-10 flex flex-col justify-between border-white/5 bg-black/40 backdrop-blur-xl h-full min-h-[220px]">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <p className="text-foreground/40 text-[10px] uppercase font-black tracking-[0.3em]">
                    {stat.label}
                  </p>
                  <Icon className={`w-6 h-6 ${stat.color} opacity-40`} />
                </div>
                
                <div className="space-y-2">
                  <p className={`text-4xl font-bold tracking-tighter text-white uppercase`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${stat.color}`}>
                    {stat.subValue}
                  </p>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] text-foreground/20 uppercase font-black">
                  <Clock className="w-3 h-3" />
                  <span>Network Sync: {lastUpdated || 'ACTIVE'}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-20">
                  <div className={`w-1.5 h-1.5 rounded-full ${stat.color} bg-current animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                  <div className="w-8 h-[1px] bg-white/20"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
