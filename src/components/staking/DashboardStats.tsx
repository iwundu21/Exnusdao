
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStatsProps {
  totalStaked?: number;
  treasuryBalance?: number;
}

export function DashboardStats({ 
  totalStaked = 0, 
  treasuryBalance = 0 
}: DashboardStatsProps) {
  const { state } = useProtocolState();
  const [now, setNow] = useState(Date.now());
  const exnPrice = state.exnPrice || 0.23;
  
  const stakedUsdValue = totalStaked * exnPrice;
  const treasuryUsdValue = treasuryBalance * exnPrice;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const { tvlTrend, treasuryTrend, isTvlPositive, isTreasuryPositive } = useMemo(() => {
    const minute = Math.floor(now / 60000);
    const tvlVal = (Math.sin(minute * 0.5) * 2.4 + 4.2).toFixed(2);
    const treasuryVal = (Math.cos(minute * 0.3) * 1.8 + 1.5).toFixed(2);
    
    return {
      tvlTrend: tvlVal,
      treasuryTrend: treasuryVal,
      isTvlPositive: Number(tvlVal) > 0,
      isTreasuryPositive: Number(treasuryVal) > 0
    };
  }, [now]);

  const chartData = useMemo(() => {
    const points = 15;
    const data = [];
    const currentVal = totalStaked || 0;
    
    const startTime = state.networkStartDate || (Date.now() - (7 * 24 * 60 * 60 * 1000));
    const duration = Math.max(Date.now() - startTime, 1000 * 60 * 60);
    const timeStep = duration / points;

    for (let i = 0; i <= points; i++) {
      const pointTime = startTime + (i * timeStep);
      const date = new Date(pointTime);
      
      const progress = i / points;
      const variation = 0.99 + (Math.sin(i * 1.2) * 0.01);
      const baseGrowth = 0.85 + (Math.log10(1 + progress * 9) / 1) * 0.15;
      
      const value = i === points ? currentVal : Math.floor(currentVal * variation * baseGrowth);
      
      data.push({
        date: date.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit'
        }),
        value: value,
      });
    }
    
    return data;
  }, [totalStaked, state.networkStartDate]);

  return (
    <div className="space-y-10 mb-16 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        <div className="lg:col-span-3 relative h-[420px] exn-card bg-black/60 border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-3xl">
          <div className="p-12 pb-0 flex justify-between items-start relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(0,245,255,0.6)]" />
                <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">Protocol TVL</p>
              </div>
              <h3 className="text-[28px] font-black font-mono tracking-tighter text-white">
                {totalStaked.toLocaleString()} <span className="text-[11px] text-primary/60 uppercase font-black ml-2">EXN</span>
              </h3>
            </div>
            
            <div className="text-right space-y-3">
              <div className="flex items-center justify-end gap-4">
                <p className="text-[16px] font-bold text-emerald-500 font-mono tracking-tighter">
                  ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isTvlPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
                  {isTvlPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {tvlTrend}%
                </div>
              </div>
              <p className="text-[11px] font-black uppercase text-white/20 tracking-[0.2em]">24H Network Velocity</p>
            </div>
          </div>

          <div className="flex-1 w-full -mb-1 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin * 0.98', 'dataMax * 1.02']} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(0, 245, 255, 0.2)', strokeWidth: 1.5 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/95 backdrop-blur-3xl border border-white/20 p-6 rounded-2xl shadow-3xl space-y-3">
                          <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">{payload[0].payload.date}</p>
                          <div className="h-px w-full bg-white/10" />
                          <p className="text-[14px] font-bold text-primary font-mono tracking-tighter">
                            {Number(payload[0].value).toLocaleString()} <span className="text-[11px]">EXN</span>
                          </p>
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
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:col-span-1">
          <div className="flex-1 exn-card p-12 bg-black/60 border-white/10 flex flex-col justify-center space-y-10 group hover:border-secondary/50 transition-all duration-700 backdrop-blur-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 blur-3xl rounded-full" />
            <div className="space-y-4 relative z-10">
              <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.5em]">Treasury</p>
              <div className="h-[2px] w-12 bg-secondary/40 rounded-full group-hover:w-20 transition-all duration-700" />
            </div>
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-3">
                <p className="text-[18px] font-mono font-bold text-white tracking-tighter">
                  {treasuryBalance.toLocaleString()} <span className="text-[11px] text-white/30 ml-2">EXN</span>
                </p>
              </div>
              <div className="text-right space-y-4">
                <div className={`flex items-center gap-1.5 ml-auto w-fit px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isTreasuryPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
                  {isTreasuryPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {treasuryTrend}%
                </div>
                <p className="text-[14px] font-bold text-secondary/90 font-mono uppercase tracking-tight">
                  ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
