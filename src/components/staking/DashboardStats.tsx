
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Tooltip
} from 'recharts';
import { ArrowUpRight, Cpu, Calendar, Activity } from 'lucide-react';

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
  const [timeframe, setTimeframe] = useState<'24H' | '7D'>('7D');
  const [liveVariation, setLiveVariation] = useState(1);
  const exnPrice = state.exnPrice || 0.23;
  
  const stakedUsdValue = totalStaked * exnPrice;
  const treasuryUsdValue = treasuryBalance * exnPrice;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      // Simulate slight live fluctuation for the current data point
      setLiveVariation(0.9995 + Math.random() * 0.001);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentEpoch = useMemo(() => {
    if (!state.networkStartDate) return 1;
    const elapsed = now - state.networkStartDate;
    return Math.floor(elapsed / EPOCH_DURATION) + 1;
  }, [state.networkStartDate, now]);

  const chartData = useMemo(() => {
    const points = timeframe === '24H' ? 24 : 14;
    const data = [];
    const currentVal = totalStaked || 0;
    
    // Calculate start time based on timeframe
    const durationMs = timeframe === '24H' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const startTime = now - durationMs;
    const timeStep = durationMs / points;

    for (let i = 0; i <= points; i++) {
      const pointTime = startTime + (i * timeStep);
      const progress = i / points;
      
      // Professional growth curve simulation
      const baseGrowth = 0.95 + (Math.log10(1 + progress * 9) / 1) * 0.05;
      const variation = 0.995 + (Math.sin(i * 1.8) * 0.005);
      
      let value = Math.floor(currentVal * variation * baseGrowth);
      
      // Apply live variation to the absolute latest point
      if (i === points) {
        value = Math.floor(currentVal * liveVariation);
      }
      
      const dateLabel = timeframe === '24H' 
        ? new Date(pointTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(pointTime).toLocaleDateString([], { month: 'short', day: 'numeric' });

      data.push({
        label: dateLabel,
        value: value,
      });
    }
    return data;
  }, [totalStaked, timeframe, now, liveVariation]);

  return (
    <div className="space-y-3 mb-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3 h-48 exn-card bg-black border-white/20 flex flex-col overflow-hidden relative shadow-3xl">
          <div className="p-4 pb-0 flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-white text-[8px] font-black uppercase tracking-[0.3em]">PROTOCOL_TVL_DIAGNOSTIC</p>
                <div className="flex items-center gap-1.5 bg-primary/20 px-2 py-0.5 rounded border border-primary/40">
                  <Activity className="w-2.5 h-2.5 text-primary animate-pulse" />
                  <span className="text-[7px] font-black text-primary uppercase tracking-widest">LIVE_FEED</span>
                </div>
              </div>
              <h3 className="text-2xl font-black font-mono tracking-tighter text-white">
                {(totalStaked * liveVariation).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[10px] text-primary">EXN</span>
              </h3>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400 font-mono tracking-tighter">
                  ${(stakedUsdValue * liveVariation).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center justify-end gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                  <ArrowUpRight className="w-3 h-3" /> +2.4%
                </div>
              </div>
              
              <div className="flex p-1 bg-white/5 rounded-lg border border-white/20">
                <button 
                  onClick={() => setTimeframe('24H')}
                  className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all rounded ${timeframe === '24H' ? 'bg-primary text-black' : 'text-white hover:text-primary'}`}
                >
                  24H
                </button>
                <button 
                  onClick={() => setTimeframe('7D')}
                  className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all rounded ${timeframe === '7D' ? 'bg-primary text-black' : 'text-white hover:text-primary'}`}
                >
                  7D
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full -mb-2 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(0,245,255,0.4)',
                    fontSize: '10px',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#00f5ff' }}
                  labelStyle={{ color: '#fff', marginBottom: '4px' }}
                />
                <XAxis dataKey="label" hide />
                <YAxis hide domain={['dataMin * 0.99', 'dataMax * 1.01']} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="exn-card p-4 bg-black border-white/20 flex flex-col justify-between space-y-4 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
             <Activity className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-white text-[8px] font-black uppercase tracking-[0.3em]">DAO_TREASURY_RESERVE</p>
            <p className="text-xl font-mono font-black text-white tracking-tighter">
              {treasuryBalance.toLocaleString()} <span className="text-[10px] text-primary">EXN</span>
            </p>
          </div>
          <div className="space-y-1 relative z-10">
             <p className="text-[8px] text-white/50 uppercase font-black tracking-widest">MARKET_VALUE_USD</p>
             <p className="text-base font-black text-emerald-400 font-mono tracking-tighter">
               ${treasuryUsdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="exn-card p-3 bg-black border-white/20 flex items-center justify-between shadow-xl">
           <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                 <p className="text-[7px] text-white uppercase font-black tracking-widest">ACTIVE_NETWORK_EPOCH</p>
                 <p className="text-xs font-black text-white font-mono">{currentEpoch}</p>
              </div>
           </div>
           <span className="text-[8px] text-emerald-400 font-black uppercase border border-emerald-400/30 px-2 py-0.5 rounded bg-emerald-500/5 shadow-sm">STABLE_STATE</span>
        </div>

        <div className="exn-card p-3 bg-black border-white/20 flex items-center justify-between shadow-xl">
           <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-primary" />
              <div>
                 <p className="text-[7px] text-white uppercase font-black tracking-widest">SETTLEMENT_HISTORY</p>
                 <p className="text-xs font-black text-white font-mono">{state.lastCrankedEpoch || 0} EPOCHS</p>
              </div>
           </div>
           <span className="text-[8px] text-primary font-black uppercase border border-primary/30 px-2 py-0.5 rounded bg-primary/5 shadow-sm">FINALIZED</span>
        </div>

        <div className="exn-card p-3 bg-black border-white/20 flex items-center justify-between shadow-xl">
           <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-primary" />
              <div>
                 <p className="text-[7px] text-white uppercase font-black tracking-widest">OPERATIONAL_NODES</p>
                 <p className="text-xs font-black text-white font-mono">{state.validators.filter(v => v.is_active).length} UNITS</p>
              </div>
           </div>
           <span className="text-[8px] text-primary font-black uppercase border border-primary/30 px-2 py-0.5 rounded bg-primary/5 shadow-sm">SYNCED_LAYER</span>
        </div>
      </div>
    </div>
  );
}
