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
          <p className="text-[11px] text-white uppercase font-black tracking-[0.4em]">Global Node Indexing v2.4</p>
        </div>
        <div className="flex gap-3">
          <span className="bg-white/10 text-white text-[10px] px-4 py-2 rounded-lg border border-white font-black uppercase tracking-widest backdrop-blur-md">{validators.length} UNITS</span>
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-4 py-2 rounded-lg border border-emerald-500 font-black uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.3)]">{validators.filter((v: any) => v.is_active).length} ONLINE</span>
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
              className={`exn-card group relative bg-black/60 border-2 transition-all duration-700 ${
                isSelected 
                  ? 'border-primary ring-4 ring-primary/20 shadow-[0_0_60px_rgba(0,245,255,0.3)]' 
                  : !validator.is_active 
                    ? 'border-destructive/40 opacity-70' 
                    : 'border-white hover:border-primary shadow-2xl'
              }`}
            >
              <div className="relative h-48 w-full overflow-hidden">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-110"
                  data-ai-hint="validator technology"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02060f] via-transparent to-transparent" />
                
                <div className="absolute top-6 right-6 flex items-center gap-3">
                   <div className="flex items-center gap-2 bg-black/90 backdrop-blur-2xl text-primary text-[10px] px-4 py-2 rounded-lg font-black uppercase border border-primary shadow-2xl">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {weightShare.toFixed(2)}%_WEIGHT
                   </div>
                   {isUserStaked && (
                     <div className="flex items-center gap-2 bg-emerald-500 text-black text-[10px] px-4 py-2 rounded-lg font-black uppercase shadow-[0_0_30px_rgba(16,185,129,0.6)] border border-emerald-400">
                       <ShieldCheck className="w-3.5 h-3.5" />
                       STAKED
                     </div>
                   )}
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  <div className={`w-3.5 h-3.5 rounded-full ${validator.is_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]' : 'bg-destructive shadow-[0_0_20px_#ef4444]'}`} />
                  <h3 className="text-white font-black text-2xl tracking-tighter uppercase leading-none">{validator.name}</h3>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] text-primary uppercase font-black tracking-[0.5em]">
                    <Globe className="w-4 h-4" />
                    <span>SECTOR_LOGS</span>
                  </div>
                  <p className="text-[12px] text-white font-medium leading-relaxed italic line-clamp-3 min-h-[4rem] tracking-tight">
                    {validator.description || "High-performance decentralized cluster serving the Exnus network with 99.9% uptime commitment metrics."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/10 rounded-xl border border-white space-y-2 group-hover:border-primary transition-all duration-500 shadow-xl">
                    <p className="text-[10px] uppercase font-black text-white tracking-[0.2em]">STAKED_WEIGHT</p>
                    <p className="text-primary font-black text-[14px] font-mono tracking-tighter">{(validator.total_staked || 0).toLocaleString()} <span className="text-[10px] text-white">EXN</span></p>
                  </div>
                  <div className="p-6 bg-white/10 rounded-xl border border-white space-y-2 group-hover:border-primary transition-all duration-500 shadow-xl">
                    <p className="text-[10px] uppercase font-black text-white tracking-[0.2em]">ACTIVE_STAKERS</p>
                    <p className="text-white font-black text-[14px] font-mono tracking-tighter">{stakerCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="px-5 py-4 bg-white/10 rounded-xl border border-white flex flex-col items-center gap-2">
                    <span className="text-white text-[10px] uppercase font-black tracking-widest">NETWORK_FEE</span>
                    <span className="text-white font-black text-[13px] font-mono">{(validator.commission_rate / 100).toFixed(1)}%</span>
                  </div>
                  <div className="px-5 py-4 bg-white/10 rounded-xl border border-white flex flex-col items-center gap-2 overflow-hidden">
                    <span className="text-white text-[10px] uppercase font-black tracking-widest">REGION</span>
                    <div className="flex items-center gap-2 text-primary">
                       <MapPin className="w-3.5 h-3.5" />
                       <span className="font-black text-[10px] uppercase truncate max-w-[120px] font-mono tracking-tight">{validator.location}</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!validator.is_active || isSelected}
                  onClick={() => onSelect(validator)}
                  className={`w-full text-[12px] h-14 uppercase font-black tracking-[0.4em] rounded-xl transition-all duration-500 shadow-2xl ${
                    validator.is_active 
                      ? (isSelected ? 'bg-primary/30 text-primary border border-primary' : 'exn-button') 
                      : 'bg-white/10 text-white border border-white cursor-not-allowed'
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
