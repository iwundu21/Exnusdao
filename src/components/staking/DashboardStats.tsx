
"use client";

import React from 'react';
import { Award, Coins, Landmark } from 'lucide-react';

export function DashboardStats({ 
  totalStaked = 0, 
  pendingRewards = 0, 
  treasuryBalance = 0 
}: { 
  totalStaked?: number, 
  pendingRewards?: number, 
  treasuryBalance?: number
}) {
  const stats = [
    { label: 'Total Staked', value: `${(totalStaked || 0).toLocaleString()} EXN`, icon: Coins, color: 'text-[#00f5ff]' },
    { label: 'Pending Rewards', value: `${(pendingRewards || 0).toFixed(2)} EXN`, icon: Award, color: 'text-[#a855f7]' },
    { label: 'Treasury Balance', value: `${(treasuryBalance || 0).toLocaleString()} EXN`, icon: Landmark, color: 'text-blue-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {stats.map((stat, i) => (
        <div key={i} className="exn-card p-6 flex items-center gap-4 hover:border-[#00f5ff]/40">
          <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
