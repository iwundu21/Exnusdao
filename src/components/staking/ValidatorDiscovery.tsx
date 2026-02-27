
"use client";

import React from 'react';
import { ShieldCheck, Users, Activity, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const MOCK_VALIDATORS = [
  { id: 1, name: 'CyberCore-01', commission: '5%', stakers: 1240, status: 'Active', apr: '12.1%', imageSeed: '66' },
  { id: 2, name: 'NebulaNode', commission: '8%', stakers: 850, status: 'Active', apr: '14.5%', imageSeed: '77' },
  { id: 3, name: 'AlphaPulse', commission: '3%', stakers: 2100, status: 'Active', apr: '11.8%', imageSeed: '88' },
  { id: 4, name: 'TitanStaking', commission: '10%', stakers: 500, status: 'Paused', apr: '15.2%', imageSeed: '12' },
];

export function ValidatorDiscovery({ onSelect }: { onSelect: (v: any) => void }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold exn-gradient-text uppercase tracking-widest">Network Nodes</h2>
        <div className="flex gap-2">
          <span className="bg-[#00f5ff]/10 text-[#00f5ff] text-xs px-3 py-1 rounded-full border border-[#00f5ff]/20">24 Total</span>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">21 Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_VALIDATORS.map((validator) => (
          <div key={validator.id} className="exn-card group hover:scale-[1.02]">
            <div className="relative h-32 w-full overflow-hidden">
               <Image 
                src={`https://picsum.photos/seed/${validator.imageSeed}/800/200`}
                alt={validator.name}
                fill
                className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                data-ai-hint="network server"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${validator.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                <span className="text-white font-bold text-lg">{validator.name}</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-white/40 text-[10px] uppercase tracking-tighter">Commission</p>
                  <p className="text-white font-bold">{validator.commission}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 text-[10px] uppercase tracking-tighter">Stakers</p>
                  <p className="text-white font-bold">{validator.stakers}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 text-[10px] uppercase tracking-tighter">Est. APR</p>
                  <p className="text-[#00f5ff] font-bold">{validator.apr}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onSelect(validator)}
                  className="flex-1 exn-button text-xs py-2"
                >
                  Stake with Node
                </button>
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
