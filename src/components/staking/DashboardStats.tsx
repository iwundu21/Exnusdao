"use client";

import React from 'react';

const EXN_PRICE = 0.23;

export function DashboardStats({ 
  totalStaked = 0, 
  treasuryBalance = 0,
}: { 
  totalStaked?: number, 
  treasuryBalance?: number,
}) {
  const stakedUsd = (totalStaked || 0) * EXN_PRICE;
  const treasuryUsd = (treasuryBalance || 0) * EXN_PRICE;

  const stats = [
    { 
      label: 'Total Value Staked', 
      value: `$${stakedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      subValue: `${(totalStaked || 0).toLocaleString()} EXN`,
      color: 'text-[#00f5ff]' 
    },
    { 
      label: 'Treasury Value', 
      value: `$${treasuryUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      subValue: `${(treasuryBalance || 0).toLocaleString()} EXN`,
      color: 'text-blue-400' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {stats.map((stat, i) => (
        <div key={i} className="exn-card p-8 flex flex-col justify-center hover:border-[#00f5ff]/40 transition-all group">
          <p className="text-white/50 text-xs uppercase font-black tracking-[0.2em] mb-2">{stat.label}</p>
          <div className="flex flex-col gap-1">
            <p className={`text-4xl font-bold tracking-tighter ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest group-hover:text-white/60 transition-colors">
              {stat.subValue} @ ${EXN_PRICE.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
