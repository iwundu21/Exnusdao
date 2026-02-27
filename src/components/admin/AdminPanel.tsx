
"use client";

import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, PlusCircle, Banknote, PauseCircle, PlayCircle, CheckCircle } from 'lucide-react';

export function AdminPanel({ globalState, setGlobalState, onSettle, validators, onRegister }: any) {
  const [newValidator, setNewValidator] = useState({ name: '', description: '' });

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/98 flex items-center justify-center p-6 backdrop-blur-3xl overflow-y-auto">
      <div className="max-w-5xl w-full exn-card border-[#a855f7]/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#a855f7]/20 rounded-lg text-[#a855f7]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold exn-gradient-text uppercase tracking-tighter">Protocol Configuration</h2>
          </div>
          <button 
             onClick={() => (window as any).location.reload()} 
             className="text-white/50 hover:text-white font-mono text-xs uppercase"
          >
            [ Close Dashboard ]
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-[#00f5ff] flex items-center gap-2 uppercase tracking-widest">
                <RefreshCw className="w-5 h-5" /> Epoch Settlement
              </h3>
              <div className="p-5 bg-white/5 rounded-xl space-y-4 border border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed uppercase">Initiate reward distribution for all active network nodes based on current TVL.</p>
                <button onClick={onSettle} className="w-full exn-button text-xs py-3">
                   Distribute Rewards
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                <PlusCircle className="w-5 h-5" /> Node Setup
              </h3>
              <div className="space-y-3 p-5 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed uppercase mb-2">Simulate validator registration and initial seed deposit.</p>
                <input 
                  value={newValidator.name} 
                  onChange={e => setNewValidator({...newValidator, name: e.target.value})}
                  className="exn-input text-xs" 
                  placeholder="Node Identifier..." 
                />
                <button 
                  onClick={() => { onRegister(newValidator.name, "Community Node"); setNewValidator({name: '', description: ''}); }} 
                  className="w-full exn-button-outline text-[10px] font-black"
                >
                  Confirm Registration
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2 uppercase tracking-widest">
                <Banknote className="w-5 h-5" /> Financial Parameters
              </h3>
              <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-white/5">
                <div>
                   <label className="text-[10px] text-white/40 uppercase block mb-1">Inflation Cap (EXN)</label>
                   <input 
                     type="number" 
                     value={globalState.rewardCap} 
                     onChange={e => setGlobalState({...globalState, rewardCap: Number(e.target.value)})} 
                     className="exn-input text-sm" 
                   />
                </div>
                <button className="w-full exn-button text-[10px] font-black">Apply Changes</button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 uppercase tracking-widest">
                <PauseCircle className="w-5 h-5" /> Circuit Breaker
              </h3>
              <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed uppercase mb-4">Emergency pause stops new staking actions. Cannot freeze user funds.</p>
                <button 
                  onClick={() => setGlobalState({...globalState, isPaused: !globalState.isPaused})}
                  className={`w-full flex items-center justify-center gap-2 h-12 rounded-lg font-bold transition-all text-xs ${globalState.isPaused ? 'bg-emerald-500 text-black' : 'bg-red-500 text-black'}`}
                >
                  {globalState.isPaused ? <PlayCircle className="w-5 h-5" /> : <PauseCircle className="w-5 h-5" />}
                  {globalState.isPaused ? 'Resume Staking' : 'Pause Staking'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
             <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <CheckCircle className="w-5 h-5" /> Network Health
              </h3>
              <div className="space-y-2 max-h-[350px] overflow-auto pr-2">
                {validators.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-1">
                      <span className="text-xs font-bold block">{v.name}</span>
                      <span className="text-[9px] text-white/40 uppercase">Stake: {v.total_staked.toLocaleString()} EXN</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${v.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
