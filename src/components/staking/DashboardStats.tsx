
"use client";

import React from 'react';
import { TrendingUp, Lock, Award, Coins } from 'lucide-react';

export function DashboardStats({ totalStaked, pendingRewards, lockedAmount }: { totalStaked: number, pendingRewards: number, lockedAmount: number }) {
  const stats = [
    { label: 'Total Staked', value: `${totalStaked.toLocaleString()} EXN`, icon: Coins, color: 'text-[#00f5ff]' },
    { label: 'Pending Rewards', value: `${pendingRewards.toFixed(2)} EXN`, icon: Award, color: 'text-[#a855f7]' },
    { label: 'Locked Volume', value: `${lockedAmount.toLocaleString()} EXN`, icon: Lock, color: 'text-blue-400' },
    { label: 'Estimated APR', value: '14.5%', icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
