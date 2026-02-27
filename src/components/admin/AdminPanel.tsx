"use client";

import React from 'react';

export function AdminPanel({ 
  globalState, 
  setGlobalState, 
  onSettle, 
  onToggleValidator, 
  onClaimCommission, 
  validators 
}: any) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/98 flex items-center justify-center p-6 backdrop-blur-3xl overflow-y-auto">
      <div className="max-w-6xl w-full exn-card border-[#a855f7]/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold exn-gradient-text uppercase tracking-tighter">Protocol Configuration</h2>
          </div>
          <button 
             onClick={() => (window as any).location.reload()} 
             className="text-white/50 hover:text-white font-mono text-xs uppercase"
          >
            [ Close Dashboard ]
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-[#00f5ff] uppercase tracking-widest">
                Epoch Settlement
              </h3>
              <div className="p-5 bg-white/5 rounded-xl space-y-4 border border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed uppercase">Initiate reward distribution for all active network nodes based on current TVL.</p>
                <button onClick={onSettle} className="w-full exn-button text-xs py-3">
                   Distribute Rewards
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest">
                Financial Parameters
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

          <div className="lg:col-span-8 space-y-8">
             <section className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                Validator Management
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-auto pr-4">
                {validators.map((v: any) => (
                  <div key={v.id} className="p-5 bg-white/5 rounded-xl border border-white/10 space-y-4 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${v.is_active ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-red-500'}`} />
                        <div>
                          <span className="text-sm font-black uppercase text-white block">{v.name}</span>
                          <span className="text-[10px] text-white/40 uppercase font-bold">{v.location} • Fee: {(v.commission_rate / 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#00f5ff] block">{v.total_staked.toLocaleString()} EXN</span>
                        <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Total Stake</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                         <div>
                            <p className="text-[9px] text-white/40 uppercase font-black">Accrued Commission</p>
                            <p className="text-sm font-black text-emerald-400">{v.accrued_node_rewards.toFixed(2)} EXN</p>
                         </div>
                         <button 
                            onClick={() => onClaimCommission(v.id)}
                            disabled={v.accrued_node_rewards <= 0}
                            className={`px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${v.accrued_node_rewards > 0 ? 'bg-emerald-500 text-black hover:opacity-90' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                         >
                           Claim
                         </button>
                      </div>

                      <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                         <div>
                            <p className="text-[9px] text-white/40 uppercase font-black">Node Status</p>
                            <p className={`text-sm font-black uppercase ${v.is_active ? 'text-emerald-400' : 'text-red-500'}`}>{v.is_active ? 'Active' : 'Inactive'}</p>
                         </div>
                         <button 
                            onClick={() => onToggleValidator(v.id)}
                            className={`px-4 py-2 rounded text-[10px] font-black uppercase border transition-all ${v.is_active ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'}`}
                         >
                           {v.is_active ? 'Deactivate' : 'Activate'}
                         </button>
                      </div>
                    </div>
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
