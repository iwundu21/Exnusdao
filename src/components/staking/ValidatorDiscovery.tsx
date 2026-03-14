
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { MapPin, Globe, ShieldCheck, Database, Zap } from 'lucide-react';

export function ValidatorDiscovery({ validators, onSelect, userStakes = [], walletAddress, selectedId }: any) {
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-black exn-gradient-text uppercase tracking-tight leading-none">NETWORK_DISCOVERY</h2>
          <p className="text-[8px] text-white uppercase font-black tracking-[0.3em]">NODE_INDEX_V3.1.2_STABLE</p>
        </div>
        <div className="flex gap-1.5">
          <div className="bg-black/80 text-white text-[8px] px-2 py-1 rounded border border-white/20 font-black uppercase tracking-widest backdrop-blur-xl">
            {validators.length} NODES
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 text-[8px] px-2 py-1 rounded border border-emerald-500/30 font-black uppercase tracking-widest backdrop-blur-xl">
            {validators.filter((v: any) => v.is_active).length} ONLINE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  ? 'border-primary ring-1 ring-primary/30 shadow-[0_0_30px_rgba(0,245,255,0.2)]' 
                  : !validator.is_active 
                    ? 'border-destructive/40 grayscale opacity-80' 
                    : 'border-white/20 hover:border-primary/40'
              }`}
            >
              <div className="relative h-24 w-full overflow-hidden border-b border-white/10 bg-black/40">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
                  data-ai-hint="validator tech"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                   <div className="bg-black/90 text-primary text-[7px] px-2 py-0.5 rounded border border-primary/40 font-black tracking-widest">
                      {weightShare.toFixed(2)}%_WEIGHT
                   </div>
                   {isUserStaked && (
                     <div className="bg-emerald-500 text-black text-[7px] px-2 py-0.5 rounded font-black border border-emerald-400">
                       STAKED
                     </div>
                   )}
                </div>

                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${validator.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                  <h3 className="text-white font-black text-base tracking-tighter uppercase leading-none">{validator.name}</h3>
                </div>
              </div>
              
              <div className="p-3.5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[8px] text-primary uppercase font-black tracking-widest">
                    <Globe className="w-2.5 h-2.5" />
                    <span>SECTOR_METADATA</span>
                  </div>
                  <p className="text-[10px] text-white font-medium italic line-clamp-1 border-l-2 border-primary/30 pl-2 tracking-tight">
                    {validator.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 space-y-0.5">
                    <p className="text-[7px] uppercase font-black text-white tracking-[0.1em]">STAKED_WEIGHT</p>
                    <p className="text-primary font-black text-xs font-mono tracking-tighter">{(validator.total_staked || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 space-y-0.5">
                    <p className="text-[7px] uppercase font-black text-white tracking-[0.1em]">ACTIVE_STAKERS</p>
                    <p className="text-white font-black text-xs font-mono tracking-tighter">{stakerCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-center">
                    <span className="text-white text-[7px] uppercase font-black tracking-widest">COMMISSION</span>
                    <span className="text-white font-black text-[10px] font-mono">{(validator.commission_rate / 100).toFixed(1)}%</span>
                  </div>
                  <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-center overflow-hidden">
                    <span className="text-white text-[7px] uppercase font-black tracking-widest">LOCALIZATION</span>
                    <div className="flex items-center gap-1 text-primary">
                       <MapPin className="w-2.5 h-2.5" />
                       <span className="font-black text-[8px] uppercase truncate font-mono">{validator.location}</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!validator.is_active || isSelected}
                  onClick={() => onSelect(validator)}
                  className={`w-full text-[10px] h-9 uppercase font-black tracking-[0.2em] rounded-lg transition-all ${
                    validator.is_active 
                      ? (isSelected ? 'bg-primary/20 text-primary border border-primary' : 'exn-button') 
                      : 'bg-white/5 text-white border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {isSelected ? 'IDENTITY_SELECTED' : (validator.is_active ? 'PROVISION_STAKE' : 'SECTOR_OFFLINE')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
