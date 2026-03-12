
"use client";

import React from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';

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
  const { state } = useProtocolState();
  const exnPrice = state.exnPrice || 0;
  
  const stakedUsdValue = totalStaked * exnPrice;
  const treasuryUsdValue = treasuryBalance * exnPrice;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {/* Total Staked Balance Card */}
      <div className="relative group h-[120px]">
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[24px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#00f5ff]/20 blur-[60px]" />
          
          <div className="p-8 flex flex-col justify-between h-full relative z-10">
            <div className="space-y-1">
              <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.25em]">Network Total Staked</p>
              <div className="h-[1px] w-12 bg-primary/30 mt-2" />
            </div>
            
            <div className="flex justify-between items-end w-full">
              <div className="space-y-0">
                <p className="text-xl font-mono font-bold text-white tracking-tighter leading-none">
                  {totalStaked.toLocaleString()} <span className="text-[10px] font-black text-white/30 ml-1 uppercase">EXN</span>
                </p>
              </div>
              <p className="text-[10px] font-bold text-emerald-500/80 tracking-tight font-mono uppercase pb-0.5">
                ≈ ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Treasury Balance Card */}
      <div className="relative group h-[120px]">
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[24px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#a855f7]/20 blur-[60px]" />

          <div className="p-8 flex flex-col justify-between h-full relative z-10">
            <div className="space-y-1">
              <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.2em]">DAO Treasury Assets</p>
              <div className="h-[1px] w-12 bg-secondary/30 mt-2" />
            </div>
            
            <div className="flex justify-between items-end w-full">
              <div className="space-y-0">
                <p className="text-xl font-mono font-bold text-white tracking-tighter leading-none">
                  {treasuryBalance.toLocaleString()} <span className="text-[10px] font-black text-white/30 ml-1 uppercase">EXN</span>
                </p>
              </div>
              <p className="text-[10px] font-bold text-secondary/80 tracking-tight font-mono uppercase pb-0.5">
                ≈ ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
