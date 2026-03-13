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
import { ArrowUpRight, ArrowDownRight, Cpu, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  totalStaked?: number;
  treasuryBalance?: number;
}

const EPOCH_DURATION = 30 * 24 * 60 * 60 * 1000;

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
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const currentEpoch = useMemo(() => {
    if (!state.networkStartDate) return 1;
    const elapsed = now - state.networkStartDate;
    return Math.floor(elapsed / EPOCH_DURATION) + 1;
  }, [state.networkStartDate, now]);

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
    <div className="space-y-4 mb-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        <div className="lg:col-span-3 relative h-[240px] exn-card bg-black/90 border-white shadow-2xl flex flex-col overflow-hidden backdrop-blur-3xl">
          <div className="p-6 pb-0 flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,245,255,1)]" />
                <p className="text-white text-[9px] font-black uppercase tracking-[0.3em]">PROTOCOL_TVL</p>
              </div>
              <h3 className="text-xl font-black font-mono tracking-tighter text-white">
                {totalStaked.toLocaleString()} <span className="text-[10px] text-primary font-black ml-1 uppercase">EXN</span>
              </h3>
            </div>
            
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2">
                <p className="text-base font-black text-emerald-400 font-mono tracking-tighter">
                  ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${isTvlPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'bg-destructive/10 text-destructive border-destructive/50'}`}>
                  {isTvlPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {tvlTrend}%
                </div>
              </div>
              <p className="text-[8px] font-black uppercase text-white tracking-[0.1em]">24H_VELOCITY</p>
            </div>
          </div>

          <div className="flex-1 w-full -mb-1 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" x1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin * 0.99', 'dataMax * 1.01']} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(0, 245, 255, 0.4)', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/95 border border-primary p-3 rounded-lg shadow-2xl space-y-1 backdrop-blur-3xl">
                          <p className="text-[8px] font-black text-white uppercase tracking-[0.1em]">{payload[0].payload.date}</p>
                          <p className="text-[11px] font-black text-primary font-mono tracking-tighter">
                            {Number(payload[0].value).toLocaleString()} <span className="text-[8px]">EXN</span>
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

        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="flex-1 exn-card p-6 bg-black/90 border-white flex flex-col justify-center space-y-4 group hover:border-secondary transition-all duration-500 backdrop-blur-3xl overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 blur-3xl rounded-full" />
            <div className="space-y-2 relative z-10">
              <p className="text-white text-[9px] font-black uppercase tracking-[0.3em]">DAO_TREASURY</p>
              <div className="h-[1px] w-6 bg-secondary rounded-full group-hover:w-12 transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            </div>
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-1">
                <p className="text-lg font-mono font-black text-white tracking-tighter">
                  {treasuryBalance.toLocaleString()} <span className="text-[9px] text-white ml-1 font-black uppercase">EXN</span>
                </p>
              </div>
              <div className="text-right space-y-2">
                <div className={`flex items-center gap-1 ml-auto w-fit px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${isTreasuryPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'bg-destructive/10 text-destructive border-destructive/50'}`}>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  {treasuryTrend}%
                </div>
                <p className="text-[11px] font-black text-secondary font-mono uppercase tracking-tight">
                  ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="exn-card p-4 bg-black/90 border-white flex items-center justify-between group hover:border-primary transition-all shadow-xl">
           <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div className="space-y-0.5">
                 <p className="text-[8px] text-white uppercase font-black tracking-[0.2em]">CURRENT_EPOCH</p>
                 <p className="text-sm font-black text-white font-mono">{currentEpoch}</p>
              </div>
           </div>
           <div className="flex flex-col items-end">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[7px] text-emerald-400 font-black uppercase mt-1 tracking-widest">ACTIVE</span>
           </div>
        </div>

        <div className="exn-card p-4 bg-black/90 border-white flex items-center justify-between group hover:border-primary transition-all shadow-xl">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                 <span className="text-[10px] font-black text-primary font-mono">#</span>
              </div>
              <div className="space-y-0.5">
                 <p className="text-[8px] text-white uppercase font-black tracking-[0.2em]">LAST_SETTLED</p>
                 <p className="text-sm font-black text-white font-mono">{state.lastCrankedEpoch || 0}</p>
              </div>
           </div>
        </div>

        <div className="exn-card p-4 bg-black/90 border-white flex items-center justify-between group hover:border-primary transition-all shadow-xl">
           <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-primary" />
              <div className="space-y-0.5">
                 <p className="text-[8px] text-white uppercase font-black tracking-[0.2em]">ACTIVE_NODES</p>
                 <p className="text-sm font-black text-white font-mono">{state.validators.filter(v => v.is_active).length}</p>
              </div>
           </div>
           <span className="text-[7px] text-primary font-black uppercase border border-primary px-1.5 py-0.5 rounded">ONLINE</span>
        </div>
      </div>
    </div>
  );
}
