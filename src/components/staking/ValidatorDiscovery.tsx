
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Users, TrendingUp, MapPin, Info, Globe, ShieldCheck } from 'lucide-react';

export function ValidatorDiscovery({ validators, onSelect, userStakes = [], walletAddress, selectedId }: any) {
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold exn-gradient-text uppercase tracking-widest">Active XNodes</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Global Validator Discovery</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-primary/5 text-primary text-[8px] px-3 py-1.5 rounded-full border border-primary/20 font-black uppercase tracking-wider">{validators.length} Clusters</span>
          <span className="bg-emerald-500/5 text-emerald-500 text-[8px] px-3 py-1.5 rounded-full border border-emerald-500/20 font-black uppercase tracking-wider">{validators.filter((v: any) => v.is_active).length} Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {validators.map((validator: any) => {
          const isUrl = validator.logo_uri?.startsWith('http') || validator.logo_uri?.startsWith('data:');
          const logoUrl = isUrl ? validator.logo_uri : `https://picsum.photos/seed/${validator.logo_uri}/800/400`;
          const isSelected = selectedId === validator.id;
          
          const nodeStakes = userStakes.filter((s: any) => s.validator_id === validator.id && !s.unstaked);
          const stakerCount = Array.from(new Set(nodeStakes.map((s: any) => s.owner))).length;
          const isUserStaked = nodeStakes.some((s: any) => s.owner === walletAddress);
          const weightShare = totalNetworkWeight > 0 ? (validator.total_staked / totalNetworkWeight) * 100 : 0;

          return (
            <div 
              key={validator.id} 
              className={`exn-card group relative bg-black/40 border transition-all duration-500 ${
                isSelected 
                  ? 'border-primary shadow-[0_0_40px_rgba(0,245,255,0.15)] ring-1 ring-primary/30' 
                  : !validator.is_active 
                    ? 'border-destructive/20 opacity-70' 
                    : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="relative h-44 w-full overflow-hidden">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:scale-105"
                  data-ai-hint="validator architecture"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                
                <div className="absolute top-6 right-6 flex items-center gap-3">
                   <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl text-primary text-[8px] px-3 py-1.5 rounded-lg font-black uppercase border border-primary/20">
                      <TrendingUp className="w-3 h-3" />
                      {weightShare.toFixed(2)}% Power
                   </div>
                   {isUserStaked && (
                     <div className="flex items-center gap-2 bg-emerald-500 text-black text-[8px] px-3 py-1.5 rounded-lg font-black uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                       <ShieldCheck className="w-3 h-3" />
                       Active
                     </div>
                   )}
                </div>

                <div className="absolute bottom-6 left-8 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${validator.is_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]' : 'bg-destructive shadow-[0_0_15px_#ef4444]'}`} />
                  <h3 className="text-white font-black text-xl tracking-tighter uppercase">{validator.name}</h3>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[8px] text-white/20 uppercase font-black tracking-[0.4em]">
                    <Globe className="w-3 h-3" />
                    <span>Sector Bio</span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed italic line-clamp-2 min-h-[3rem]">
                    {validator.description || "High-performance decentralized XNode serving the Exnus network protocol with 99.9% uptime commitment."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2 group-hover:border-primary/20 transition-all duration-500">
                    <p className="text-[8px] uppercase font-black text-white/20 tracking-widest">Weight</p>
                    <p className="text-primary font-bold text-xs font-mono tracking-tighter">{validator.total_staked.toLocaleString()} <span className="text-[9px] text-white/30">EXN</span></p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2 group-hover:border-primary/20 transition-all duration-500">
                    <p className="text-[8px] uppercase font-black text-white/20 tracking-widest">Stakers</p>
                    <p className="text-white font-bold text-xs font-mono tracking-tighter">{stakerCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                    <span className="text-white/20 text-[7px] uppercase font-black">Fee</span>
                    <span className="text-white font-bold text-[10px] font-mono">{(validator.commission_rate / 100).toFixed(1)}%</span>
                  </div>
                  <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-1 overflow-hidden">
                    <span className="text-white/20 text-[7px] uppercase font-black">Cluster Hub</span>
                    <div className="flex items-center gap-1.5 text-primary">
                       <MapPin className="w-2.5 h-2.5" />
                       <span className="font-bold text-[9px] uppercase truncate max-w-[80px]">{validator.location}</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!validator.is_active || isSelected}
                  onClick={() => onSelect(validator)}
                  className={`w-full text-[9px] h-12 uppercase font-black tracking-[0.3em] rounded-xl transition-all duration-500 ${
                    validator.is_active 
                      ? (isSelected ? 'bg-primary/20 text-primary border border-primary/40' : 'exn-button') 
                      : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {isSelected ? 'Target Locked' : (validator.is_active ? 'Stake with Node' : 'Sector Offline')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
