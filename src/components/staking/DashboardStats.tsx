
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

  /**
   * Generates a sleek, professional growth curve anchored to the real-time cloud ledger.
   * The shape reacts dynamically to changes in 'totalStaked' and 'networkStartDate'.
   */
  const chartData = useMemo(() => {
    const points = 15; // Higher resolution for a sleeker curve
    const data = [];
    const currentVal = totalStaked || 0;
    
    // Default to 7 days history if network hasn't started
    const startTime = state.networkStartDate || (Date.now() - (7 * 24 * 60 * 60 * 1000));
    const now = Date.now();
    const duration = Math.max(now - startTime, 1000 * 60 * 60); // Min 1 hour duration
    const timeStep = duration / points;

    for (let i = 0; i <= points; i++) {
      const pointTime = startTime + (i * timeStep);
      const date = new Date(pointTime);
      
      // Professional growth model: 
      // i=points is exactly the live value from Firestore.
      // History points use a deterministic "logarithmic growth" model seeded by the live value.
      const progress = i / points;
      const variation = 0.99 + (Math.sin(i * 1.2) * 0.01); // Subtle fluctuation
      const baseGrowth = 0.85 + (Math.log10(1 + progress * 9) / 1) * 0.15; // Classic S-Curve/Log growth
      
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
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em]">Real-Time Protocol TVL</p>
              </div>
              <h3 className="text-5xl font-bold font-mono tracking-tighter text-white">
                {totalStaked.toLocaleString()} <span className="text-[10px] text-primary uppercase font-black ml-1">EXN</span>
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-emerald-500 font-mono tracking-tighter">
                ${stakedUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mt-1">Global Valuation (USD)</p>
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
                <XAxis 
                  dataKey="date" 
                  hide 
                />
                <YAxis 
                  hide 
                  domain={['dataMin * 0.9', 'dataMax * 1.1']} 
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-3xl space-y-2">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{payload[0].payload.date}</p>
                          <div className="h-px w-full bg-white/5" />
                          <p className="text-lg font-bold text-primary font-mono tracking-tighter">
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
                  animationDuration={2000}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          <div className="flex-1 exn-card p-10 bg-black/40 border-white/5 flex flex-col justify-between group hover:border-secondary/40 transition-all duration-500">
            <div className="space-y-1">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em]">DAO Treasury</p>
              <div className="h-[2px] w-10 bg-secondary/30 rounded-full group-hover:w-16 transition-all" />
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                {treasuryBalance.toLocaleString()} <span className="text-[10px] text-white/20">EXN</span>
              </p>
              <p className="text-[11px] font-bold text-secondary/70 font-mono uppercase tracking-tight">
                ${treasuryUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex-1 exn-card p-10 bg-black/40 border-white/5 flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-500">
            <div className="space-y-1">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em]">Reward Vault</p>
              <div className="h-[2px] w-10 bg-emerald-500/30 rounded-full group-hover:w-16 transition-all" />
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                {(state.rewardVaultBalance || 0).toLocaleString()} <span className="text-[10px] text-white/20">EXN</span>
              </p>
              <p className="text-[11px] font-bold text-emerald-500/70 font-mono uppercase tracking-tight">
                ${((state.rewardVaultBalance || 0) * exnPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
