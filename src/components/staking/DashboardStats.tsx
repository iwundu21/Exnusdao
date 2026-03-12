
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

  /**
   * Deterministic but dynamic 24h trend based on the current minute.
   * Provides a "live" feel for the prototype.
   */
  const { tvlTrend, treasuryTrend, isTvlPositive, isTreasuryPositive } = useMemo(() => {
    const minute = Math.floor(now / 60000);
    // Pseudo-random but stable fluctuations
    const tvlVal = (Math.sin(minute * 0.5) * 2.4 + 4.2).toFixed(2);
    const treasuryVal = (Math.cos(minute * 0.3) * 1.8 + 1.5).toFixed(2);
    
    return {
      tvlTrend: tvlVal,
      treasuryTrend: treasuryVal,
      isTvlPositive: Number(tvlVal) > 0,
      isTreasuryPositive: Number(treasuryVal) > 0
    };
  }, [now]);

  /**
   * Sleek growth curve calculation
   */
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
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: value,
      });
    }
    
    return data;
  }, [totalStaked, state.networkStartDate]);

  return (
    <div className="space-y-8 mb-12 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sleek Fintech TVL Terminal */}
        <div className="lg:col-span-3 relative h-[350px] exn-card bg-black/40 border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">
          <div className="p-10 pb-0 flex justify-between items-start relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
                <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.5em]">Protocol TVL (Locked)</p>
              </div>
              <h3 className="text-xl font-bold font-mono tracking-tighter text-white">
                {totalStaked.toLocaleString()} <span className="text-[9px] text-primary uppercase font-black ml-1">EXN</span>
              </h3>
            </div>
            
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2">
                <p className="text-xs font-bold text-emerald-500 font-mono tracking-tighter">
                  ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${isTvlPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                  {isTvlPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {tvlTrend}%
                </div>
              </div>
              <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mt-1">24H Market Volatility</p>
            </div>
          </div>

          <div className="flex-1 w-full -mb-1 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin * 0.9', 'dataMax * 1.1']} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-3xl space-y-2">
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{payload[0].payload.date}</p>
                          <div className="h-px w-full bg-white/5" />
                          <p className="text-sm font-bold text-primary font-mono tracking-tighter">
                            {Number(payload[0].value).toLocaleString()} <span className="text-[9px]">EXN</span>
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
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="flex-1 exn-card p-8 bg-black/40 border-white/5 flex flex-col justify-center space-y-6 group hover:border-secondary/40 transition-all duration-500">
            <div className="space-y-1">
              <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.4em]">Treasury</p>
              <div className="h-[1px] w-8 bg-secondary/30 rounded-full group-hover:w-12 transition-all" />
            </div>
            
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-sm font-mono font-bold text-white tracking-tighter">
                  {treasuryBalance.toLocaleString()} <span className="text-[9px] text-white/20 ml-1">EXN</span>
                </p>
              </div>
              <div className="text-right space-y-2">
                <div className={`flex items-center gap-1 ml-auto w-fit px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${isTreasuryPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                  {isTreasuryPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {treasuryTrend}%
                </div>
                <p className="text-[10px] font-bold text-secondary/70 font-mono uppercase tracking-tight">
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
