
"use client";

import React from 'react';

const EXN_PRICE = 0.23;

interface DashboardStatsProps {
  totalStaked?: number;
  treasuryBalance?: number;
}

export function DashboardStats({ 
  totalStaked = 0, 
  treasuryBalance = 0 
}: DashboardStatsProps) {
  
  const stakedUsdValue = totalStaked * EXN_PRICE;
  const treasuryUsdValue = treasuryBalance * EXN_PRICE;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {/* Total Staked Balance Card */}
      <div className="relative group h-[200px]">
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
          {/* Subtle teal glow at bottom */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#00f5ff]/20 blur-[60px]" />
          <div className="absolute bottom-0 right-1/4 w-24 h-[2px] bg-[#00f5ff] shadow-[0_0_15px_#00f5ff]" />
          
          <div className="p-10 flex flex-col justify-between h-full relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Total Network Locked</p>
              </div>
              <div className="h-[1px] w-full bg-white/5 mt-4" />
            </div>
            
            <div className="space-y-1.5">
              <p className="text-3xl font-bold text-white tracking-tight">
                {totalStaked.toLocaleString()} <span className="text-sm font-medium ml-1 text-white/50">EXN</span>
              </p>
              <p className="text-sm font-bold text-[#10b981] tracking-tight">
                ≈ ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Treasury Balance Card */}
      <div className="relative group h-[200px]">
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
          {/* Subtle blue glow at bottom */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#3b82f6]/20 blur-[60px]" />
          <div className="absolute bottom-0 right-1/4 w-24 h-[2px] bg-[#3b82f6] shadow-[0_0_15px_#3b82f6]" />

          <div className="p-10 flex flex-col justify-between h-full relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">DAO Treasury Assets</p>
              </div>
              <div className="h-[1px] w-full bg-white/5 mt-4" />
            </div>
            
            <div className="space-y-1.5">
              <p className="text-3xl font-bold text-white tracking-tight">
                {treasuryBalance.toLocaleString()} <span className="text-sm font-medium ml-1 text-white/50">EXN</span>
              </p>
              <p className="text-sm font-bold text-[#3b82f6] tracking-tight">
                ≈ ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
