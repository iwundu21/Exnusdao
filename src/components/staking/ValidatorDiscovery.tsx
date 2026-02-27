
"use client";

import React from 'react';
import { ShieldCheck, Users, Activity, ExternalLink, ArrowRightLeft } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

export function ValidatorDiscovery({ validators, onSelect, userStakes, setUserStakes }: { validators: any[], onSelect: (v: any) => void, userStakes: any[], setUserStakes: (s: any) => void }) {
  
  const handleMigrate = (stakeId: string, targetId: string) => {
    // Phase 3 Logic
    setUserStakes(userStakes.map(s => s.id === stakeId ? { ...s, validator_id: targetId, reward_checkpoint: validators.find(v => v.id === targetId)?.global_reward_index || 0 } : s));
    toast({ title: "Phase 3 Success", description: "Stake migrated from inactive node to active validator." });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold exn-gradient-text uppercase tracking-widest">Network Discovery</h2>
        <div className="flex gap-2">
          <span className="bg-[#00f5ff]/10 text-[#00f5ff] text-xs px-3 py-1 rounded-full border border-[#00f5ff]/20">{validators.length} Total</span>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">{validators.filter(v => v.is_active).length} Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {validators.map((validator) => (
          <div key={validator.id} className={`exn-card group hover:scale-[1.02] border ${!validator.is_active ? 'border-red-500/20' : 'border-white/10'}`}>
            <div className="relative h-32 w-full overflow-hidden">
               <Image 
                src={`https://picsum.photos/seed/${validator.logo_uri}/800/200`}
                alt={validator.name}
                fill
                className="object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                data-ai-hint="network server"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${validator.is_active ? 'bg-emerald-400' : 'bg-red-400'} ${validator.is_active ? 'animate-pulse' : ''}`} />
                <span className="text-white font-bold text-lg">{validator.name}</span>
              </div>
              {!validator.is_active && (
                <div className="absolute top-4 right-4 bg-red-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase">
                  Deactivated (Phase 3 Ready)
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-white/40 text-[10px] uppercase tracking-tighter">Commission</p>
                  <p className="text-white font-bold">{(validator.commission_rate / 100).toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 text-[10px] uppercase tracking-tighter">TVL</p>
                  <p className="text-white font-bold">{validator.total_staked.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 text-[10px] uppercase tracking-tighter">Index</p>
                  <p className="text-[#00f5ff] font-bold">{validator.global_reward_index}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  disabled={!validator.is_active}
                  onClick={() => onSelect(validator)}
                  className={`flex-1 text-xs py-2 uppercase font-bold tracking-widest rounded-md transition-all ${validator.is_active ? 'exn-button' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                >
                  {validator.is_active ? 'Stake with Node' : 'Inactive'}
                </button>
                
                {/* Migration helper for users stuck on inactive nodes */}
                {!validator.is_active && userStakes.some(s => s.validator_id === validator.id && !s.unstaked) && (
                   <button 
                     onClick={() => {
                        const activeNode = validators.find(v => v.is_active);
                        const stake = userStakes.find(s => s.validator_id === validator.id && !s.unstaked);
                        if (activeNode && stake) handleMigrate(stake.id, activeNode.id);
                     }}
                     className="px-4 exn-button-outline border-emerald-500 text-emerald-400 flex items-center justify-center gap-2"
                   >
                     <ArrowRightLeft className="w-4 h-4" /> Migrate
                   </button>
                )}
                
                <button className="p-2 exn-card flex items-center justify-center hover:bg-white/10">
                  <ExternalLink className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
