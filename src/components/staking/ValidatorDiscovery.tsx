
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Users, TrendingUp, MapPin, Info } from 'lucide-react';

export function ValidatorDiscovery({ validators, onSelect, userStakes = [], walletAddress, onMigrate, selectedId, setFeedback }: any) {
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold exn-gradient-text uppercase tracking-widest">Active XNodes</h2>
        <div className="flex gap-2">
          <span className="bg-primary/10 text-primary text-[9px] px-3 py-1 rounded-full border border-primary/20 font-black uppercase tracking-wider">{validators.length} Total</span>
          <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-3 py-1 rounded-full border border-emerald-500/20 font-black uppercase tracking-wider">{validators.filter((v: any) => v.is_active).length} Online</span>
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
            <div key={validator.id} className={`exn-card group border transition-all duration-300 ${isSelected ? 'border-primary ring-1 ring-primary shadow-[0_0_30px_rgba(0,245,255,0.15)]' : !validator.is_active ? 'border-destructive/20 opacity-80' : 'border-border'}`}>
              <div className="relative h-40 w-full overflow-hidden">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-105"
                  data-ai-hint="validator tech"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                
                <div className="absolute top-4 right-6 flex items-center gap-2">
                   <div className="flex items-center gap-1.5 bg-primary/20 text-primary text-[8px] px-2 py-1 rounded font-black uppercase border border-primary/30 backdrop-blur-md">
                      {weightShare.toFixed(2)}% Power
                   </div>
                   {isUserStaked && (
                     <div className="flex items-center gap-1 bg-emerald-500 text-black text-[7px] px-2 py-1 rounded font-black uppercase shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                       Active Stake
                     </div>
                   )}
                </div>

                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${validator.is_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-destructive'}`} />
                  <span className="text-foreground font-black text-lg tracking-tight uppercase">{validator.name}</span>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-[8px] text-foreground/30 uppercase font-black tracking-[0.2em]">Node Metadata</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed italic line-clamp-2 min-h-[2.5rem]">
                    {validator.description || "High-performance decentralized XNode serving the Exnus network protocol."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-foreground/5 rounded-2xl border border-border/10 space-y-1 group-hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2 text-[8px] uppercase font-bold text-foreground/40">
                       <TrendingUp className="w-3 h-3" />
                       <span>Total Staked</span>
                    </div>
                    <p className="text-primary font-bold text-sm tracking-tight">{validator.total_staked.toLocaleString()} <span className="text-[9px] text-muted-foreground">EXN</span></p>
                  </div>
                  <div className="p-4 bg-foreground/5 rounded-2xl border border-border/10 space-y-1 group-hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2 text-[8px] uppercase font-bold text-foreground/40">
                       <Users className="w-3 h-3" />
                       <span>Users</span>
                    </div>
                    <p className="text-foreground font-bold text-sm tracking-tight">{stakerCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-foreground/5 rounded-xl border border-border/10 flex flex-col items-center">
                    <p className="text-foreground/40 text-[7px] uppercase font-black mb-1">Commission</p>
                    <p className="text-foreground font-bold text-xs">{(validator.commission_rate / 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-foreground/5 rounded-xl border border-border/10 flex flex-col items-center">
                    <p className="text-foreground/40 text-[7px] uppercase font-black mb-1">Node Hub</p>
                    <div className="flex items-center gap-1 text-primary">
                       <MapPin className="w-3 h-3" />
                       <p className="font-bold text-[9px] uppercase truncate max-w-[80px]">{validator.location}</p>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!validator.is_active || isSelected}
                  onClick={() => onSelect(validator)}
                  className={`w-full text-[9px] h-11 uppercase font-black tracking-[0.2em] rounded-xl transition-all ${validator.is_active ? (isSelected ? 'bg-primary/20 text-primary border border-primary/40' : 'exn-button') : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
                >
                  {isSelected ? 'Target Locked' : (validator.is_active ? 'Stake with Node' : 'Node Inactive')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
