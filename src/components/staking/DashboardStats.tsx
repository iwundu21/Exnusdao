"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Coins, Landmark, ShieldCheck, CircleDollarSign } from 'lucide-react';

const EXN_PRICE = 0.23;

export function DashboardStats({ 
  totalStaked = 0, 
  treasuryBalance = 0,
  rewardVaultBalance = 0,
  usdcVaultBalance = 0
}: { 
  totalStaked?: number, 
  treasuryBalance?: number,
  rewardVaultBalance?: number,
  usdcVaultBalance?: number
}) {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [totalStaked, treasuryBalance, rewardVaultBalance, usdcVaultBalance]);

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
    { 
      label: 'GLOBAL REWARD POOL', 
      value: `${(rewardVaultBalance || 0).toLocaleString()} EXN`, 
      subValue: `$${(rewardVaultBalance * EXN_PRICE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Coins,
      color: 'text-emerald-500' 
    },
    { 
      label: 'LICENSE SALES VAULT', 
      value: `${(usdcVaultBalance || 0).toLocaleString()} USDC`, 
      subValue: 'Protocol Revenue',
      icon: CircleDollarSign,
      color: 'text-amber-500' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`}></div>
            <div className="relative exn-card p-6 flex flex-col justify-between border-white/5 bg-black/40 backdrop-blur-xl h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <p className="text-foreground/40 text-[9px] uppercase font-black tracking-[0.2em]">
                    {stat.label}
                  </p>
                  <Icon className={`w-4 h-4 ${stat.color} opacity-40`} />
                </div>
                
                <div className="space-y-1">
                  <p className={`text-2xl font-bold tracking-tighter text-white`}>
                    {stat.value}
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${stat.color}`}>
                    {stat.subValue}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[8px] text-foreground/20 uppercase font-black">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{lastUpdated || 'SYNCED'}</span>
                </div>
                <div className="flex items-center gap-1 opacity-20">
                  <div className={`w-1 h-1 rounded-full ${stat.color} bg-current`}></div>
                  <div className="w-4 h-[1px] bg-white/20"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
