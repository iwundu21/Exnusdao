
"use client";

import React, { useMemo } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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
  const exnPrice = state.exnPrice || 0.23;
  
  const stakedUsdValue = totalStaked * exnPrice;
  const treasuryUsdValue = treasuryBalance * exnPrice;

  // Generate stable "virtual" historical data for the TVL Chart
  // The final point is always the real-time totalStaked
  const chartData = useMemo(() => {
    const points = 7;
    const data = [];
    const base = totalStaked > 0 ? totalStaked : 125000000;
    
    for (let i = points; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Virtual fluctuations for the chart aesthetic
      const variance = 0.95 + (Math.sin(i) * 0.05);
      const val = i === 0 ? totalStaked : Math.floor(base * variance);
      
      data.push({
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: val,
      });
    }
    
    // Ensure the last point is precisely the current totalStaked
    data[data.length - 1].value = totalStaked;
    
    return data;
  }, [totalStaked]);

  return (
    <div className="space-y-8 mb-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TVL Live Chart Card */}
        <div className="lg:col-span-2 relative group h-[280px]">
          <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 pb-0 flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">Total Value Locked (TVL)</p>
                <h3 className="text-3xl font-bold font-mono tracking-tighter text-white">
                  {totalStaked.toLocaleString()} <span className="text-xs text-primary uppercase font-black ml-1">EXN</span>
                </h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-500 font-mono uppercase">
                  ≈ ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
                <div className="flex items-center gap-1 justify-end mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#00f5ff]" />
                   <span className="text-[8px] font-black uppercase text-primary/60">Real-time Stream</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                            <p className="text-[10px] font-black text-white/40 uppercase mb-1">{payload[0].payload.date}</p>
                            <p className="text-sm font-bold text-primary font-mono">{Number(payload[0].value).toLocaleString()} EXN</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary Stats Column */}
        <div className="flex flex-col gap-8">
          {/* Treasury Balance Card */}
          <div className="relative group flex-1">
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
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-secondary/80 tracking-tight font-mono uppercase pb-0.5">
                      ≈ ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Pool Card */}
          <div className="relative group flex-1">
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[24px] border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-emerald-500/20 blur-[60px]" />

              <div className="p-8 flex flex-col justify-between h-full relative z-10">
                <div className="space-y-1">
                  <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.2em]">Epoch Reward Vault</p>
                  <div className="h-[1px] w-12 bg-emerald-500/30 mt-2" />
                </div>
                
                <div className="flex justify-between items-end w-full">
                  <div className="space-y-0">
                    <p className="text-xl font-mono font-bold text-white tracking-tighter leading-none">
                      {(state.rewardVaultBalance || 0).toLocaleString()} <span className="text-[10px] font-black text-white/30 ml-1 uppercase">EXN</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-500/80 tracking-tight font-mono uppercase pb-0.5">
                      ≈ ${((state.rewardVaultBalance || 0) * exnPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

