
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';

export function ValidatorDiscovery({ validators, onSelect, userStakes, onMigrate, selectedId, setFeedback }: any) {
  // Dynamic calculation of total network weight for percentage share
  const totalNetworkWeight = useMemo(() => {
    return validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  }, [validators]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold exn-gradient-text uppercase tracking-widest">Active Validators</h2>
        <div className="flex gap-2">
          <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full border border-primary/20">{validators.length} Total</span>
          <span className="bg-emerald-500/10 text-emerald-500 text-xs px-3 py-1 rounded-full border border-emerald-500/20">{validators.filter((v: any) => v.is_active).length} Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {validators.map((validator: any) => {
          const isUrl = validator.logo_uri?.startsWith('http') || validator.logo_uri?.startsWith('data:');
          const logoUrl = isUrl ? validator.logo_uri : `https://picsum.photos/seed/${validator.logo_uri}/800/400`;
          const isSelected = selectedId === validator.id;
          const isUserStaked = userStakes.some((s: any) => s.validator_id === validator.id && !s.unstaked);
          const stakerCount = userStakes.filter((s: any) => s.validator_id === validator.id && !s.unstaked).length;
          
          // Calculate dynamic percentage share of total network weight
          const weightShare = totalNetworkWeight > 0 ? (validator.total_staked / totalNetworkWeight) * 100 : 0;

          return (
            <div key={validator.id} className={`exn-card group border transition-all duration-300 ${isSelected ? 'border-primary ring-1 ring-primary shadow-[0_0_30px_rgba(0,245,255,0.15)]' : !validator.is_active ? 'border-destructive/20 opacity-80' : 'border-border'}`}>
              <div className="relative h-32 w-full overflow-hidden">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                  data-ai-hint="validator tech"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                
                <div className="absolute top-4 right-6 flex items-center gap-2">
                   <div className="flex items-center gap-1.5 bg-primary/20 text-primary text-[9px] px-2 py-1 rounded font-black uppercase border border-primary/30 backdrop-blur-md">
                      {weightShare.toFixed(2)}% Share
                   </div>
                   {isUserStaked && (
                     <div className="flex items-center gap-1 bg-emerald-500 text-black text-[8px] px-1.5 py-0.5 rounded font-black uppercase shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                       Your Stake Active
                     </div>
                   )}
                </div>

                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${validator.is_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-destructive'}`} />
                  <span className="text-foreground font-bold text-lg tracking-tight">{validator.name}</span>
                  {isSelected && (
                    <div className="flex items-center gap-1 ml-2 bg-primary text-black text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
                      Selected
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <p className="text-[10px] text-foreground/30 uppercase font-black tracking-widest">Node Description</p>
                  <p className="text-xs text-foreground/60 leading-relaxed italic line-clamp-2">
                    {validator.description || "High-performance decentralized validator node serving the Exnus network protocol with guaranteed uptime."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-foreground/5 rounded-xl border border-border/10 space-y-1">
                    <p className="text-[9px] uppercase font-bold text-foreground/40">Total Staked</p>
                    <p className="text-foreground font-bold text-sm tracking-tight">{validator.total_staked.toLocaleString()} EXN</p>
                  </div>
                  <div className="p-3 bg-foreground/5 rounded-xl border border-border/10 space-y-1">
                    <p className="text-[9px] uppercase font-bold text-foreground/40">Total Stakers</p>
                    <p className="text-foreground font-bold text-sm tracking-tight">{stakerCount} Active</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-foreground/5 rounded-lg border border-border/10">
                    <p className="text-foreground/40 text-[9px] uppercase">Node Fee</p>
                    <p className="text-foreground font-bold text-xs">{(validator.commission_rate / 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-2 bg-foreground/5 rounded-lg border border-border/10">
                    <p className="text-foreground/40 text-[9px] uppercase">Location</p>
                    <p className="text-primary font-bold text-[10px] uppercase truncate">{validator.location}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    disabled={!validator.is_active || isSelected}
                    onClick={() => onSelect(validator)}
                    className={`flex-1 text-[10px] py-2.5 uppercase font-black tracking-widest rounded-md transition-all ${validator.is_active ? (isSelected ? 'bg-primary/20 text-primary border border-primary/40' : 'exn-button') : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
                  >
                    {isSelected ? 'Target Locked' : (validator.is_active ? 'Stake Now' : 'Node Inactive')}
                  </button>
                  
                  {!validator.is_active && userStakes.some((s: any) => s.validator_id === validator.id && !s.unstaked) && (
                     <button 
                       onClick={() => {
                          const activeNode = validators.find((v: any) => v.is_active);
                          const stake = userStakes.find((s: any) => s.validator_id === validator.id && !s.unstaked);
                          if (activeNode && stake) onMigrate(stake.id, activeNode.id);
                          else setFeedback('error', 'Protocol Migration Failed: No active target node available.');
                       }}
                       className="px-4 exn-button-outline border-emerald-500 text-emerald-500 flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                     >
                       Migrate
                     </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
