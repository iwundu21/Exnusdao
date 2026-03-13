"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { TrendingUp, MapPin, Globe, ShieldCheck } from 'lucide-react';

export function ValidatorDiscovery({ validators, onSelect, userStakes = [], walletAddress, selectedId }: any) {
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);

  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h2 className="text-3xl font-black exn-gradient-text uppercase tracking-tighter">NETWORK_DISCOVERY</h2>
          <p className="text-[12px] text-white uppercase font-black tracking-[0.5em]">Global Node Indexing v2.4</p>
        </div>
        <div className="flex gap-4">
          <span className="bg-white/15 text-white text-[11px] px-5 py-2.5 rounded-xl border-2 border-white font-black uppercase tracking-widest backdrop-blur-xl shadow-lg">{validators.length} UNITS</span>
          <span className="bg-emerald-500/20 text-emerald-400 text-[11px] px-5 py-2.5 rounded-xl border-2 border-emerald-500 font-black uppercase tracking-widest backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.4)]">{validators.filter((v: any) => v.is_active).length} ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
              className={`exn-card group relative bg-black border-2 transition-all duration-700 ${
                isSelected 
                  ? 'border-primary ring-8 ring-primary/20 shadow-[0_0_80px_rgba(0,245,255,0.4)] scale-[1.02]' 
                  : !validator.is_active 
                    ? 'border-destructive/60 opacity-80' 
                    : 'border-white/60 hover:border-primary shadow-3xl'
              }`}
            >
              <div className="relative h-56 w-full overflow-hidden">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-50 group-hover:opacity-80 transition-all duration-1000 group-hover:scale-110"
                  data-ai-hint="validator technology"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02060f] via-transparent to-transparent" />
                
                <div className="absolute top-8 right-8 flex items-center gap-4">
                   <div className="flex items-center gap-2.5 bg-black text-primary text-[11px] px-5 py-2.5 rounded-xl font-black uppercase border-2 border-primary shadow-2xl">
                      <TrendingUp className="w-4 h-4" />
                      {weightShare.toFixed(2)}%_WEIGHT
                   </div>
                   {isUserStaked && (
                     <div className="flex items-center gap-2.5 bg-emerald-500 text-black text-[11px] px-5 py-2.5 rounded-xl font-black uppercase shadow-[0_0_40px_rgba(16,185,129,0.8)] border-2 border-emerald-400">
                       <ShieldCheck className="w-4 h-4" />
                       STAKED
                     </div>
                   )}
                </div>

                <div className="absolute bottom-8 left-8 flex items-center gap-5">
                  <div className={`w-4 h-4 rounded-full ${validator.is_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_30px_#10b981]' : 'bg-destructive shadow-[0_0_30px_#ef4444]'}`} />
                  <h3 className="text-white font-black text-3xl tracking-tighter uppercase leading-none">{validator.name}</h3>
                </div>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 text-[12px] text-primary uppercase font-black tracking-[0.6em]">
                    <Globe className="w-5 h-5" />
                    <span>SECTOR_LOGS</span>
                  </div>
                  <p className="text-[14px] text-white font-bold leading-relaxed italic line-clamp-3 min-h-[5rem] tracking-tight">
                    {validator.description || "High-performance decentralized cluster serving the Exnus network with 99.9% uptime commitment metrics."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="p-8 bg-white/10 rounded-2xl border-2 border-white space-y-3 group-hover:border-primary transition-all duration-500 shadow-xl">
                    <p className="text-[11px] uppercase font-black text-white tracking-[0.3em]">STAKED_WEIGHT</p>
                    <p className="text-primary font-black text-[18px] font-mono tracking-tighter">{(validator.total_staked || 0).toLocaleString()} <span className="text-[11px] text-white">EXN</span></p>
                  </div>
                  <div className="p-8 bg-white/10 rounded-2xl border-2 border-white space-y-3 group-hover:border-primary transition-all duration-500 shadow-xl">
                    <p className="text-[11px] uppercase font-black text-white tracking-[0.3em]">ACTIVE_STAKERS</p>
                    <p className="text-white font-black text-[18px] font-mono tracking-tighter">{stakerCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="px-6 py-5 bg-white/10 rounded-2xl border-2 border-white flex flex-col items-center gap-3 shadow-lg">
                    <span className="text-white text-[11px] uppercase font-black tracking-widest">NETWORK_FEE</span>
                    <span className="text-white font-black text-[16px] font-mono">{(validator.commission_rate / 100).toFixed(1)}%</span>
                  </div>
                  <div className="px-6 py-5 bg-white/10 rounded-2xl border-2 border-white flex flex-col items-center gap-3 overflow-hidden shadow-lg">
                    <span className="text-white text-[11px] uppercase font-black tracking-widest">REGION</span>
                    <div className="flex items-center gap-3 text-primary">
                       <MapPin className="w-4 h-4 shadow-lg" />
                       <span className="font-black text-[11px] uppercase truncate max-w-[140px] font-mono tracking-tight">{validator.location}</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!validator.is_active || isSelected}
                  onClick={() => onSelect(validator)}
                  className={`w-full text-[14px] h-16 uppercase font-black tracking-[0.5em] rounded-2xl transition-all duration-500 shadow-3xl ${
                    validator.is_active 
                      ? (isSelected ? 'bg-primary/40 text-primary border-4 border-primary shadow-[0_0_40px_rgba(0,245,255,0.3)]' : 'exn-button') 
                      : 'bg-white/15 text-white/60 border-2 border-white/30 cursor-not-allowed'
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
