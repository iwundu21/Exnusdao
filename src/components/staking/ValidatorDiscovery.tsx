
"use client";

import React from 'react';
import { ShieldCheck, ArrowRightLeft, MapPin, Check } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

export function ValidatorDiscovery({ validators, onSelect, userStakes, onMigrate, selectedId }: any) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold exn-gradient-text uppercase tracking-widest">Active Validators</h2>
        <div className="flex gap-2">
          <span className="bg-[#00f5ff]/10 text-[#00f5ff] text-xs px-3 py-1 rounded-full border border-[#00f5ff]/20">{validators.length} Total</span>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">{validators.filter((v: any) => v.is_active).length} Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {validators.map((validator: any) => {
          // Resolve logo URI: if it's a URL, use it; otherwise, use our picsum seed system
          const isUrl = validator.logo_uri?.startsWith('http') || validator.logo_uri?.startsWith('data:');
          const logoUrl = isUrl ? validator.logo_uri : `https://picsum.photos/seed/${validator.logo_uri}/800/400`;
          const isSelected = selectedId === validator.id;

          return (
            <div key={validator.id} className={`exn-card group border transition-all duration-300 ${isSelected ? 'border-[#00f5ff] ring-1 ring-[#00f5ff] shadow-[0_0_30px_rgba(0,245,255,0.15)]' : !validator.is_active ? 'border-red-500/20 opacity-80' : 'border-white/10'}`}>
              <div className="relative h-32 w-full overflow-hidden">
                 <Image 
                  src={logoUrl}
                  alt={validator.name}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                  data-ai-hint="validator tech"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
                <div className="absolute top-4 right-6 flex items-center gap-1 text-[9px] text-white/60 font-black uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-md">
                  <MapPin className="w-3 h-3 text-red-400" /> {validator.location}
                </div>
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${validator.is_active ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]' : 'bg-red-400'}`} />
                  <span className="text-white font-bold text-lg tracking-tight">{validator.name}</span>
                  {isSelected && (
                    <div className="flex items-center gap-1 ml-2 bg-[#00f5ff] text-black text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
                      <Check className="w-2.5 h-2.5" /> Selected
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-white/40 text-[9px] uppercase">Node Fee</p>
                    <p className="text-white font-bold text-xs">{(validator.commission_rate / 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-white/40 text-[9px] uppercase">TVL</p>
                    <p className="text-white font-bold text-xs">{validator.total_staked.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-white/40 text-[9px] uppercase">R-Index</p>
                    <p className="text-[#00f5ff] font-bold text-xs">{(validator.global_reward_index / 1000).toFixed(1)}k</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    disabled={!validator.is_active || isSelected}
                    onClick={() => onSelect(validator)}
                    className={`flex-1 text-[10px] py-2.5 uppercase font-black tracking-widest rounded-md transition-all ${validator.is_active ? (isSelected ? 'bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/40' : 'exn-button') : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                  >
                    {isSelected ? 'Target Locked' : (validator.is_active ? 'Stake Now' : 'Node Inactive')}
                  </button>
                  
                  {!validator.is_active && userStakes.some((s: any) => s.validator_id === validator.id && !s.unstaked) && (
                     <button 
                       onClick={() => {
                          const activeNode = validators.find((v: any) => v.is_active);
                          const stake = userStakes.find((s: any) => s.validator_id === validator.id && !s.unstaked);
                          if (activeNode && stake) onMigrate(stake.id, activeNode.id);
                          else toast({ title: "No Active Target", variant: "destructive" });
                       }}
                       className="px-4 exn-button-outline border-emerald-500 text-emerald-400 flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                     >
                       <ArrowRightLeft className="w-4 h-4" /> Migrate
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
