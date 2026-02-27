"use client";

import React from 'react';

export function AdminPanel({ 
  globalState, 
  setGlobalState, 
  onSettle,
}: any) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/98 flex items-center justify-center p-6 backdrop-blur-3xl overflow-y-auto">
      <div className="max-w-4xl w-full exn-card border-[#a855f7]/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold exn-gradient-text uppercase tracking-tighter">Global Protocol Control</h2>
          </div>
          <button 
             onClick={() => (window as any).location.reload()} 
             className="text-white/50 hover:text-white font-mono text-xs uppercase"
          >
            [ Close Dashboard ]
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-[#00f5ff] uppercase tracking-widest">
                Epoch Settlement
              </h3>
              <div className="p-5 bg-white/5 rounded-xl space-y-4 border border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed uppercase">Trigger network-wide reward distribution for the current epoch.</p>
                <button onClick={onSettle} className="w-full exn-button text-xs py-3">
                   Settle Epoch Rewards
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-red-400 uppercase tracking-widest">
                Circuit Breaker
              </h3>
              <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed uppercase mb-4">Emergency pause stops new staking actions. Cannot freeze user funds.</p>
                <button 
                  onClick={() => setGlobalState({...globalState, isPaused: !globalState.isPaused})}
                  className={`w-full flex items-center justify-center gap-2 h-12 rounded-lg font-bold transition-all text-xs ${globalState.isPaused ? 'bg-emerald-500 text-black' : 'bg-red-500 text-black'}`}
                >
                  {globalState.isPaused ? 'Resume Staking' : 'Pause Staking'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest">
                Protocol Parameters
              </h3>
              <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-white/5">
                <div>
                   <label className="text-[10px] text-white/40 uppercase block mb-1">Global Reward Cap (EXN)</label>
                   <input 
                     type="number" 
                     value={globalState.rewardCap} 
                     onChange={e => setGlobalState({...globalState, rewardCap: Number(e.target.value)})} 
                     className="exn-input text-sm" 
                   />
                </div>
                <div>
                   <label className="text-[10px] text-white/40 uppercase block mb-1">License Supply Limit</label>
                   <input 
                     type="number" 
                     value={globalState.licenseLimit} 
                     onChange={e => setGlobalState({...globalState, licenseLimit: Number(e.target.value)})} 
                     className="exn-input text-sm" 
                   />
                </div>
                <button className="w-full exn-button text-[10px] font-black">Apply Protocol Updates</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
