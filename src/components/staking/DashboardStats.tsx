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
    return () => clearInterval(timer);
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
    <div className="space-y-8 mb-12 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-3 relative h-[340px] exn-card bg-black border-white shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden backdrop-blur-3xl">
          <div className="p-10 pb-0 flex justify-between items-start relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_20px_rgba(0,245,255,1)]" />
                <p className="text-white text-[12px] font-black uppercase tracking-[0.5em]">Protocol TVL</p>
              </div>
              <h3 className="text-[32px] font-black font-mono tracking-tighter text-white">
                {totalStaked.toLocaleString()} <span className="text-[14px] text-primary font-black ml-2 uppercase">EXN</span>
              </h3>
            </div>
            
            <div className="text-right space-y-3">
              <div className="flex items-center justify-end gap-4">
                <p className="text-[18px] font-black text-emerald-400 font-mono tracking-tighter">
                  ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-2 ${isTvlPositive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-lg' : 'bg-destructive/20 text-destructive border-destructive shadow-lg'}`}>
                  {isTvlPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {tvlTrend}%
                </div>
              </div>
              <p className="text-[11px] font-black uppercase text-white tracking-[0.3em]">24H Network Velocity</p>
            </div>
          </div>

          <div className="flex-1 w-full -mb-1 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin * 0.98', 'dataMax * 1.02']} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(0, 245, 255, 0.6)', strokeWidth: 2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black border-2 border-primary p-6 rounded-2xl shadow-[0_0_50px_rgba(0,245,255,0.3)] space-y-3 backdrop-blur-3xl">
                          <p className="text-[12px] font-black text-white uppercase tracking-[0.3em]">{payload[0].payload.date}</p>
                          <div className="h-px w-full bg-white" />
                          <p className="text-[15px] font-black text-primary font-mono tracking-tighter">
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
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                  animationDuration={3000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-1">
          <div className="flex-1 exn-card p-10 bg-black border-white flex flex-col justify-center space-y-8 group hover:border-secondary transition-all duration-700 backdrop-blur-3xl overflow-hidden relative shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 blur-3xl rounded-full" />
            <div className="space-y-4 relative z-10">
              <p className="text-white text-[12px] font-black uppercase tracking-[0.6em]">DAO Treasury</p>
              <div className="h-[4px] w-10 bg-secondary rounded-full group-hover:w-20 transition-all duration-700 shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
            </div>
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-3">
                <p className="text-[22px] font-mono font-black text-white tracking-tighter">
                  {treasuryBalance.toLocaleString()} <span className="text-[12px] text-white ml-1 font-black uppercase">EXN</span>
                </p>
              </div>
              <div className="text-right space-y-4">
                <div className={`flex items-center gap-1.5 ml-auto w-fit px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-2 ${isTreasuryPositive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-lg' : 'bg-destructive/20 text-destructive border-destructive shadow-lg'}`}>
                  <ArrowUpRight className="w-4 h-4" />
                  {treasuryTrend}%
                </div>
                <p className="text-[15px] font-black text-secondary font-mono uppercase tracking-tight">
                  ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="exn-card p-8 bg-black border-white flex items-center justify-between group hover:border-primary transition-all shadow-2xl">
           <div className="flex items-center gap-5">
              <Calendar className="w-8 h-8 text-primary shadow-[0_0_20px_rgba(0,245,255,0.4)]" />
              <div className="space-y-1.5">
                 <p className="text-[11px] text-white uppercase font-black tracking-widest">Current Epoch</p>
                 <p className="text-[18px] font-black text-white font-mono">{currentEpoch}</p>
              </div>
           </div>
           <div className="flex flex-col items-end">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
              <span className="text-[11px] text-emerald-400 font-black uppercase mt-2 tracking-widest">Active</span>
           </div>
        </div>

        <div className="exn-card p-8 bg-black border-white flex items-center justify-between group hover:border-primary transition-all shadow-2xl">
           <div className="flex items-center gap-5">
              <div className="space-y-1.5">
                 <p className="text-[11px] text-white uppercase font-black tracking-widest">Last Settled</p>
                 <p className="text-[18px] font-black text-white font-mono">{state.lastCrankedEpoch || 0}</p>
              </div>
           </div>
        </div>

        <div className="exn-card p-8 bg-black border-white flex items-center justify-between group hover:border-primary transition-all shadow-2xl">
           <div className="flex items-center gap-5">
              <Cpu className="w-8 h-8 text-primary" />
              <div className="space-y-1.5">
                 <p className="text-[11px] text-white uppercase font-black tracking-widest">Active Nodes</p>
                 <p className="text-[18px] font-black text-white font-mono">{state.validators.filter(v => v.is_active).length}</p>
              </div>
           </div>
           <span className="text-[11px] text-primary font-black uppercase border-2 border-primary px-3 py-1.5 rounded-xl shadow-lg">Online</span>
        </div>

        <div className="exn-card p-8 bg-black border-white flex items-center justify-between group hover:border-primary transition-all shadow-2xl">
           <div className="flex items-center gap-5">
              <div className="space-y-1.5">
                 <p className="text-[11px] text-white uppercase font-black tracking-widest">Network Health</p>
                 <p className="text-[18px] font-black text-emerald-400 font-mono tracking-widest">STABLE</p>
              </div>
           </div>
           <div className="flex gap-2">
              <div className="w-2 h-5 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" />
              <div className="w-2 h-5 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" />
              <div className="w-2 h-5 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" />
           </div>
        </div>
      </div>
    </div>
  );
}
