
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { TrendingUp, MapPin, Globe, ShieldCheck } from 'lucide-react';

export function ValidatorDiscovery({ validators, onSelect, userStakes = [], walletAddress, selectedId }: any) {
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-black exn-gradient-text uppercase tracking-tighter">NETWORK_DISCOVERY</h2>
          <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.4em]">Global Node Indexing v2.4</p>
        </div>
        <div className="flex gap-3">
          <span className="bg-white/5 text-white/70 text-[9px] px-4 py-2 rounded-lg border border-white/10 font-black uppercase tracking-widest backdrop-blur-md">{validators.length} UNITS</span>
          <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-4 py-2 rounded-lg border border-emerald-500/30 font-black uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">{validators.filter((v: any) => v.is_active).length} ONLINE</span>
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
              className={`exn-card group relative bg-black/50 border transition-all duration-700 ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary/30 shadow-[0_0_60px_rgba(0,245,255,0.2)]' 
                  : !validator.is_active 
                    ? 'border-destructive/20 opacity-60' 
                    : 'border-white/10 hover:border-white/30 shadow-2xl'
              }`}
            >
              <div className="relative h-44 w-full overflow-hidden">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-20 group-hover:opacity-40 transition-all duration-1000 group-hover:scale-110"
                  data-ai-hint="validator technology"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02060f] via-transparent to-transparent" />
                
                <div className="absolute top-6 right-6 flex items-center gap-3">
                   <div className="flex items-center gap-2 bg-black/80 backdrop-blur-2xl text-primary text-[9px] px-4 py-2 rounded-lg font-black uppercase border border-primary/40 shadow-2xl">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {weightShare.toFixed(2)}%_WEIGHT
                   </div>
                   {isUserStaked && (
                     <div className="flex items-center gap-2 bg-emerald-500 text-black text-[9px] px-4 py-2 rounded-lg font-black uppercase shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400">
                       <ShieldCheck className="w-3.5 h-3.5" />
                       STAKED
                     </div>
                   )}
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${validator.is_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]' : 'bg-destructive shadow-[0_0_20px_#ef4444]'}`} />
                  <h3 className="text-white font-black text-xl tracking-tighter uppercase leading-none">{validator.name}</h3>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[9px] text-white/30 uppercase font-black tracking-[0.5em]">
                    <Globe className="w-4 h-4" />
                    <span>SECTOR_LOGS</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed font-medium italic line-clamp-2 min-h-[3rem] tracking-tight">
                    {validator.description || "High-performance decentralized cluster serving the Exnus network with 99.9% uptime commitment metrics."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-2 group-hover:border-primary/40 transition-all duration-500 shadow-xl">
                    <p className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em]">STAKED_WEIGHT</p>
                    <p className="text-primary font-black text-[12px] font-mono tracking-tighter">{(validator.total_staked || 0).toLocaleString()} <span className="text-[9px] text-white/30">EXN</span></p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-2 group-hover:border-primary/40 transition-all duration-500 shadow-xl">
                    <p className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em]">ACTIVE_STAKERS</p>
                    <p className="text-white font-black text-[12px] font-mono tracking-tighter">{stakerCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="px-5 py-4 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center gap-2">
                    <span className="text-white/20 text-[9px] uppercase font-black tracking-widest">NETWORK_FEE</span>
                    <span className="text-white font-black text-[11px] font-mono">{(validator.commission_rate / 100).toFixed(1)}%</span>
                  </div>
                  <div className="px-5 py-4 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center gap-2 overflow-hidden">
                    <span className="text-white/20 text-[9px] uppercase font-black tracking-widest">REGION</span>
                    <div className="flex items-center gap-2 text-primary">
                       <MapPin className="w-3.5 h-3.5" />
                       <span className="font-black text-[9px] uppercase truncate max-w-[100px] font-mono tracking-tight">{validator.location}</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!validator.is_active || isSelected}
                  onClick={() => onSelect(validator)}
                  className={`w-full text-[11px] h-14 uppercase font-black tracking-[0.4em] rounded-xl transition-all duration-500 shadow-2xl ${
                    validator.is_active 
                      ? (isSelected ? 'bg-primary/20 text-primary border border-primary/50' : 'exn-button') 
                      : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {isSelected ? 'IDENTITY_SELECTED' : (validator.is_active ? 'INITIALIZE_STAKE' : 'OFFLINE_STATUS')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
