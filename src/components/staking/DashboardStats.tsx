"use client";

import React from 'react';

const EXN_PRICE = 0.23;

interface DashboardStatsProps {
  totalStaked?: number;
  treasuryBalance?: number;
  rewardVaultBalance?: number;
  usdcVaultBalance?: number;
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
      <div className="relative group h-[140px]">
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#00f5ff]/20 blur-[60px]" />
          <div className="absolute bottom-0 right-1/4 w-24 h-[1px] bg-[#00f5ff] shadow-[0_0_15px_#00f5ff]" />
          
          <div className="p-8 flex flex-col justify-between h-full relative z-10">
            <div className="space-y-1">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em]">Network Total Staked</p>
              <div className="h-[1px] w-full bg-white/5 mt-3" />
            </div>
            
            <div className="space-y-0">
              <p className="text-xl font-mono font-bold text-white tracking-tighter">
                {totalStaked.toLocaleString()} <span className="text-[9px] font-black text-white/30 ml-1 uppercase">EXN</span>
              </p>
              <p className="text-[10px] font-bold text-emerald-500/80 tracking-tight font-mono uppercase">
                ≈ ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Treasury Balance Card */}
      <div className="relative group h-[140px]">
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#3b82f6]/20 blur-[60px]" />
          <div className="absolute bottom-0 right-1/4 w-24 h-[1px] bg-[#3b82f6] shadow-[0_0_15px_#3b82f6]" />

          <div className="p-8 flex flex-col justify-between h-full relative z-10">
            <div className="space-y-1">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em]">DAO Treasury Assets</p>
              <div className="h-[1px] w-full bg-white/5 mt-3" />
            </div>
            
            <div className="space-y-0">
              <p className="text-xl font-mono font-bold text-white tracking-tighter">
                {treasuryBalance.toLocaleString()} <span className="text-[9px] font-black text-white/30 ml-1 uppercase">EXN</span>
              </p>
              <p className="text-[10px] font-bold text-blue-400/80 tracking-tight font-mono uppercase">
                ≈ ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
