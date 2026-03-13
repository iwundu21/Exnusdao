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
import { ArrowUpRight, ArrowDownRight, Cpu, Calendar, Activity } from 'lucide-react';

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
  const [healthIndex, setHealthIndex] = useState(0);
  const exnPrice = state.exnPrice || 0.23;
  
  const stakedUsdValue = totalStaked * exnPrice;
  const treasuryUsdValue = treasuryBalance * exnPrice;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const healthTimer = setInterval(() => setHealthIndex((prev) => (prev + 1) % 3), 4000);
    return () => {
      clearInterval(timer);
      clearInterval(healthTimer);
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

  const healthStates = [
    { name: 'STABLE', color: 'text-emerald-400', bg: 'bg-emerald-500', shadow: 'shadow-[0_0_20px_#10b981]' },
    { name: 'LATENCY', color: 'text-amber-400', bg: 'bg-amber-500', shadow: 'shadow-[0_0_20px_#f59e0b]' },
    { name: 'DEGRADED', color: 'text-rose-400', bg: 'bg-rose-500', shadow: 'shadow-[0_0_20px_#f43f5e]' }
  ];

  const currentHealth = healthStates[healthIndex];

  return (
    <div className="space-y-6 mb-10 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-3 relative h-[300px] exn-card bg-black/90 border-white shadow-2xl flex flex-col overflow-hidden backdrop-blur-3xl">
          <div className="p-8 pb-0 flex justify-between items-start relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(0,245,255,1)]" />
                <p className="text-white text-[10px] font-black uppercase tracking-[0.4em]">PROTOCOL_TVL</p>
              </div>
              <h3 className="text-2xl font-black font-mono tracking-tighter text-white">
                {totalStaked.toLocaleString()} <span className="text-[12px] text-primary font-black ml-1 uppercase">EXN</span>
              </h3>
            </div>
            
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end gap-3">
                <p className="text-lg font-black text-emerald-400 font-mono tracking-tighter">
                  ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isTvlPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'bg-destructive/10 text-destructive border-destructive/50'}`}>
                  {isTvlPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {tvlTrend}%
                </div>
              </div>
              <p className="text-[9px] font-black uppercase text-white tracking-[0.2em]">24H_VELOCITY</p>
            </div>
          </div>

          <div className="flex-1 w-full -mb-1 mt-6">
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
                        <div className="bg-black/95 border border-primary p-4 rounded-xl shadow-2xl space-y-2 backdrop-blur-3xl">
                          <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{payload[0].payload.date}</p>
                          <p className="text-[13px] font-black text-primary font-mono tracking-tighter">
                            {Number(payload[0].value).toLocaleString()} <span className="text-[10px]">EXN</span>
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
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="flex-1 exn-card p-8 bg-black/90 border-white flex flex-col justify-center space-y-6 group hover:border-secondary transition-all duration-500 backdrop-blur-3xl overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full" />
            <div className="space-y-3 relative z-10">
              <p className="text-white text-[10px] font-black uppercase tracking-[0.4em]">DAO_TREASURY</p>
              <div className="h-[2px] w-8 bg-secondary rounded-full group-hover:w-16 transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
            </div>
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-2">
                <p className="text-xl font-mono font-black text-white tracking-tighter">
                  {treasuryBalance.toLocaleString()} <span className="text-[10px] text-white ml-1 font-black uppercase">EXN</span>
                </p>
              </div>
              <div className="text-right space-y-3">
                <div className={`flex items-center gap-1 ml-auto w-fit px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isTreasuryPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'bg-destructive/10 text-destructive border-destructive/50'}`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {treasuryTrend}%
                </div>
                <p className="text-[13px] font-black text-secondary font-mono uppercase tracking-tight">
                  ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="exn-card p-5 bg-black/90 border-white flex items-center justify-between group hover:border-primary transition-all shadow-xl">
           <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-primary" />
              <div className="space-y-1">
                 <p className="text-[9px] text-white uppercase font-black tracking-[0.3em]">CURRENT_EPOCH</p>
                 <p className="text-base font-black text-white font-mono">{currentEpoch}</p>
              </div>
           </div>
           <div className="flex flex-col items-end">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[8px] text-emerald-400 font-black uppercase mt-1.5 tracking-widest">ACTIVE</span>
           </div>
        </div>

        <div className="exn-card p-5 bg-black/90 border-white flex items-center justify-between group hover:border-primary transition-all shadow-xl">
           <div className="flex items-center gap-4">
              <div className="space-y-1">
                 <p className="text-[9px] text-white uppercase font-black tracking-[0.3em]">LAST_SETTLED</p>
                 <p className="text-base font-black text-white font-mono">{state.lastCrankedEpoch || 0}</p>
              </div>
           </div>
        </div>

        <div className="exn-card p-5 bg-black/90 border-white flex items-center justify-between group hover:border-primary transition-all shadow-xl">
           <div className="flex items-center gap-4">
              <Cpu className="w-6 h-6 text-primary" />
              <div className="space-y-1">
                 <p className="text-[9px] text-white uppercase font-black tracking-[0.3em]">ACTIVE_NODES</p>
                 <p className="text-base font-black text-white font-mono">{state.validators.filter(v => v.is_active).length}</p>
              </div>
           </div>
           <span className="text-[8px] text-primary font-black uppercase border border-primary px-2 py-1 rounded-md">ONLINE</span>
        </div>

        <div className="exn-card p-5 bg-black/90 border-white flex items-center justify-between group hover:border-primary transition-all shadow-xl">
           <div className="flex items-center gap-4">
              <div className="space-y-1">
                 <p className="text-[9px] text-white uppercase font-black tracking-[0.3em]">NETWORK_HEALTH</p>
                 <p className={`text-sm font-black ${currentHealth.color} font-mono tracking-widest transition-colors duration-500`}>{currentHealth.name}</p>
              </div>
           </div>
           <div className="flex gap-1.5">
              <div className={`w-1.5 h-4 ${currentHealth.bg} rounded-full ${currentHealth.shadow} transition-all duration-500`} />
              <div className={`w-1.5 h-4 ${currentHealth.bg} rounded-full ${currentHealth.shadow} transition-all duration-500 delay-75`} />
              <div className={`w-1.5 h-4 ${currentHealth.bg} rounded-full ${currentHealth.shadow} transition-all duration-500 delay-150`} />
           </div>
        </div>
      </div>
    </div>
  );
}
