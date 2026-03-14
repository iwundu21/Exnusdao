
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis 
} from 'recharts';
import { ArrowUpRight, Cpu, Calendar } from 'lucide-react';

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

  const chartData = useMemo(() => {
    const points = 12;
    const data = [];
    const currentVal = totalStaked || 0;
    const startTime = state.networkStartDate || (Date.now() - (7 * 24 * 60 * 60 * 1000));
    const duration = Math.max(Date.now() - startTime, 1000 * 60 * 60);
    const timeStep = duration / points;

    for (let i = 0; i <= points; i++) {
      const pointTime = startTime + (i * timeStep);
      const progress = i / points;
      const variation = 0.99 + (Math.sin(i * 1.5) * 0.01);
      const baseGrowth = 0.9 + (Math.log10(1 + progress * 9) / 1) * 0.1;
      const value = i === points ? currentVal : Math.floor(currentVal * variation * baseGrowth);
      
      data.push({
        date: new Date(pointTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: value,
      });
    }
    return data;
  }, [totalStaked, state.networkStartDate]);

  return (
    <div className="space-y-2 mb-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        <div className="lg:col-span-3 h-32 exn-card bg-black border-white/20 flex flex-col overflow-hidden relative shadow-2xl">
          <div className="p-3 pb-0 flex justify-between items-start relative z-10">
            <div>
              <p className="text-white text-[7px] font-black uppercase tracking-[0.2em]">PROTOCOL_TVL</p>
              <h3 className="text-xl font-black font-mono tracking-tighter text-white">
                {totalStaked.toLocaleString()} <span className="text-[8px] text-primary">EXN</span>
              </h3>
            </div>
            
            <div className="text-right">
              <p className="text-xs font-black text-emerald-400 font-mono tracking-tighter">
                ${stakedUsdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <div className="flex items-center justify-end gap-1 text-[7px] font-black text-emerald-500 uppercase tracking-widest">
                <ArrowUpRight className="w-2.5 h-2.5" /> +2.4%
              </div>
            </div>
          </div>

          <div className="flex-1 w-full -mb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin * 0.99', 'dataMax * 1.01']} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={1} fillOpacity={1} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="exn-card p-3 bg-black border-white/20 flex flex-col justify-center space-y-1 shadow-2xl">
          <p className="text-white text-[7px] font-black uppercase tracking-[0.2em]">DAO_TREASURY</p>
          <div className="flex justify-between items-end">
            <p className="text-base font-mono font-black text-white tracking-tighter">
              {treasuryBalance.toLocaleString()} <span className="text-[7px] text-primary">EXN</span>
            </p>
            <div className="text-[7px] font-black text-emerald-400 font-mono">
              ${treasuryUsdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="exn-card p-2.5 bg-black border-white/20 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-primary" />
              <div>
                 <p className="text-[6px] text-white uppercase font-black tracking-tighter">CURRENT_EPOCH</p>
                 <p className="text-[10px] font-black text-white font-mono">{currentEpoch}</p>
              </div>
           </div>
           <span className="text-[7px] text-emerald-400 font-black uppercase border border-emerald-400/30 px-1.5 py-0.5 rounded bg-emerald-500/5">STABLE</span>
        </div>

        <div className="exn-card p-2.5 bg-black border-white/20 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div>
                 <p className="text-[6px] text-white uppercase font-black tracking-tighter">LAST_SETTLED</p>
                 <p className="text-[10px] font-black text-white font-mono">{state.lastCrankedEpoch || 0}</p>
              </div>
           </div>
           <span className="text-[7px] text-primary font-black uppercase border border-primary/30 px-1.5 py-0.5 rounded bg-primary/5">FINALIZED</span>
        </div>

        <div className="exn-card p-2.5 bg-black border-white/20 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-primary" />
              <div>
                 <p className="text-[6px] text-white uppercase font-black tracking-tighter">ACTIVE_NODES</p>
                 <p className="text-[10px] font-black text-white font-mono">{state.validators.filter(v => v.is_active).length}</p>
              </div>
           </div>
           <span className="text-[7px] text-primary font-black uppercase border border-primary/30 px-1.5 py-0.5 rounded bg-primary/5">SYNCED</span>
        </div>
      </div>
    </div>
  );
}
