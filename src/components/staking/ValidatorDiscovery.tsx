"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { MapPin, Globe, ShieldCheck, Database, Cpu } from 'lucide-react';

export function ValidatorDiscovery({ validators, onSelect, userStakes = [], walletAddress, selectedId }: any) {
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-black exn-gradient-text uppercase tracking-tight">NETWORK_DISCOVERY</h2>
          <p className="text-[10px] text-white uppercase font-black tracking-[0.4em]">NODE_INDEX_V3.0.1_STABLE</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-black/40 text-white text-[9px] px-4 py-2 rounded-lg border border-white font-black uppercase tracking-widest backdrop-blur-xl">
            {validators.length} NODES
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 text-[9px] px-4 py-2 rounded-lg border border-emerald-500 font-black uppercase tracking-widest backdrop-blur-xl">
            {validators.filter((v: any) => v.is_active).length} ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className={`exn-card group relative bg-black/90 border transition-all duration-500 ${
                isSelected 
                  ? 'border-primary ring-4 ring-primary/20 shadow-[0_0_40px_rgba(0,245,255,0.3)] scale-[1.01]' 
                  : !validator.is_active 
                    ? 'border-destructive/50 grayscale' 
                    : 'border-white/40 hover:border-primary'
              }`}
            >
              <div className="relative h-40 w-full overflow-hidden border-b border-white/20">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105"
                  data-ai-hint="validator tech"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute top-4 right-4 flex items-center gap-2">
                   <div className="flex items-center gap-1.5 bg-black/80 text-primary text-[9px] px-3 py-1.5 rounded-md font-black uppercase border border-primary/50 shadow-xl">
                      {weightShare.toFixed(2)}%_WEIGHT
                   </div>
                   {isUserStaked && (
                     <div className="flex items-center gap-1.5 bg-emerald-500 text-black text-[9px] px-3 py-1.5 rounded-md font-black uppercase shadow-[0_0_20px_rgba(16,185,129,0.6)] border border-emerald-400">
                       <ShieldCheck className="w-3 h-3" />
                       STAKED
                     </div>
                   )}
                </div>

                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${validator.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                  <h3 className="text-white font-black text-xl tracking-tight uppercase leading-none">{validator.name}</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] text-primary uppercase font-black tracking-widest">
                    <Globe className="w-3 h-3" />
                    <span>SECTOR_LOGS</span>
                  </div>
                  <p className="text-[11px] text-white font-bold leading-relaxed italic line-clamp-2 min-h-[2.5rem] tracking-tight border-l border-primary/30 pl-3">
                    {validator.description || "High-performance cluster serving Exnus with 99.9% uptime commitment."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/20 space-y-1.5 group-hover:border-primary/40 transition-all">
                    <p className="text-[8px] uppercase font-black text-white tracking-[0.2em]">STAKED_WEIGHT</p>
                    <p className="text-primary font-black text-[14px] font-mono tracking-tighter">{(validator.total_staked || 0).toLocaleString()} <span className="text-[9px] text-white">EXN</span></p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/20 space-y-1.5 group-hover:border-primary/40 transition-all">
                    <p className="text-[8px] uppercase font-black text-white tracking-[0.2em]">ACTIVE_STAKERS</p>
                    <p className="text-white font-black text-[14px] font-mono tracking-tighter">{stakerCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/20 flex flex-col gap-1">
                    <span className="text-white text-[8px] uppercase font-black tracking-widest">NETWORK_FEE</span>
                    <span className="text-white font-black text-[13px] font-mono">{(validator.commission_rate / 100).toFixed(1)}%</span>
                  </div>
                  <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/20 flex flex-col gap-1 overflow-hidden">
                    <span className="text-white text-[8px] uppercase font-black tracking-widest">REGION</span>
                    <div className="flex items-center gap-2 text-primary">
                       <MapPin className="w-3 h-3" />
                       <span className="font-black text-[9px] uppercase truncate font-mono tracking-tight">{validator.location}</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!validator.is_active || isSelected}
                  onClick={() => onSelect(validator)}
                  className={`w-full text-[11px] h-12 uppercase font-black tracking-[0.4em] rounded-xl transition-all duration-300 shadow-xl ${
                    validator.is_active 
                      ? (isSelected ? 'bg-primary/20 text-primary border border-primary shadow-[0_0_20px_rgba(0,245,255,0.2)]' : 'exn-button') 
                      : 'bg-white/5 text-white border border-white/20 cursor-not-allowed'
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
