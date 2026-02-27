"use client";

import React from 'react';

export function DashboardStats({ 
  totalStaked = 0, 
  pendingRewards = 0, 
  treasuryBalance = 0,
  onClaim
}: { 
  totalStaked?: number, 
  pendingRewards?: number, 
  treasuryBalance?: number,
  onClaim?: () => void
}) {
  const stats = [
    { label: 'Total Staked', value: `${(totalStaked || 0).toLocaleString()} EXN`, color: 'text-[#00f5ff]' },
    { 
      label: 'Pending Rewards', 
      value: `${(pendingRewards || 0).toFixed(2)} EXN`, 
      color: 'text-[#a855f7]',
      action: onClaim && pendingRewards > 0 ? (
        <button 
          onClick={onClaim}
          className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#a855f7] hover:text-white transition-colors"
        >
          [ Claim All ]
        </button>
      ) : null
    },
    { label: 'Treasury Balance', value: `${(treasuryBalance || 0).toLocaleString()} EXN`, color: 'text-blue-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {stats.map((stat, i) => (
        <div key={i} className="exn-card p-6 flex flex-col justify-center hover:border-[#00f5ff]/40">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
          {stat.action}
        </div>
      ))}
    </div>
  );
}
