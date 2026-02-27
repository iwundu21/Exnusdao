"use client";

import React from 'react';
import { ShieldCheck, ArrowRightLeft, ExternalLink, Activity } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

export function ValidatorDiscovery({ validators, onSelect, userStakes, onMigrate }: any) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold exn-gradient-text uppercase tracking-widest">Node Registry (Phase 9)</h2>
        <div className="flex gap-2">
          <span className="bg-[#00f5ff]/10 text-[#00f5ff] text-xs px-3 py-1 rounded-full border border-[#00f5ff]/20">{validators.length} Validators</span>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">{validators.filter((v: any) => v.is_active).length} Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {validators.map((validator: any) => (
          <div key={validator.id} className={`exn-card group border ${!validator.is_active ? 'border-red-500/20 opacity-80' : 'border-white/10'}`}>
            <div className="relative h-28 w-full overflow-hidden">
               <Image 
                src={`https://picsum.photos/seed/${validator.logo_uri}/800/200`}
                alt={validator.name}
                fill
                className="object-cover opacity-30"
                data-ai-hint="validator tech"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${validator.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-white font-bold text-base">{validator.name}</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white/5 rounded-lg">
                  <p className="text-white/40 text-[9px] uppercase">Phase 10: Fee</p>
                  <p className="text-white font-bold text-xs">{(validator.commission_rate / 100).toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                  <p className="text-white/40 text-[9px] uppercase">TVL</p>
                  <p className="text-white font-bold text-xs">{validator.total_staked.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                  <p className="text-white/40 text-[9px] uppercase">Phase 5: Index</p>
                  <p className="text-[#00f5ff] font-bold text-xs">{(validator.global_reward_index / 1000).toFixed(1)}k</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  disabled={!validator.is_active}
                  onClick={() => onSelect(validator)}
                  className={`flex-1 text-[10px] py-2 uppercase font-black tracking-widest rounded-md transition-all ${validator.is_active ? 'exn-button' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                >
                  {validator.is_active ? 'Stake with Node' : 'Node Inactive'}
                </button>
                
                {!validator.is_active && userStakes.some((s: any) => s.validator_id === validator.id && !s.unstaked) && (
                   <button 
                     onClick={() => {
                        const activeNode = validators.find((v: any) => v.is_active);
                        const stake = userStakes.find((s: any) => s.validator_id === validator.id && !s.unstaked);
                        if (activeNode && stake) onMigrate(stake.id, activeNode.id);
                        else toast({ title: "No Active Target", variant: "destructive" });
                     }}
                     className="px-4 exn-button-outline border-emerald-500 text-emerald-400 flex items-center justify-center gap-2 text-[10px]"
                   >
                     <ArrowRightLeft className="w-3 h-3" /> Migrate (Phase 3)
                   </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
