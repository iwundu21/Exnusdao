"use client";

import React from 'react';

export function DashboardStats({ 
  totalStaked = 0, 
  treasuryBalance = 0,
}: { 
  totalStaked?: number, 
  treasuryBalance?: number,
}) {
  const stats = [
    { label: 'Total Staked', value: `${(totalStaked || 0).toLocaleString()} EXN`, color: 'text-[#00f5ff]' },
    { label: 'Treasury Balance', value: `${(treasuryBalance || 0).toLocaleString()} EXN`, color: 'text-blue-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {stats.map((stat, i) => (
        <div key={i} className="exn-card p-6 flex flex-col justify-center hover:border-[#00f5ff]/40">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
