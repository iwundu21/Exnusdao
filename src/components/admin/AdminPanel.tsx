
"use client";

import React, { useState } from 'react';
import { ShieldAlert, Zap, Banknote, PauseCircle, PlayCircle, PlusCircle, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AdminPanel({ globalState, setGlobalState, onSettle, validators, setValidators }: any) {
  const [isPaused, setIsPaused] = useState(false);
  const [newValidator, setNewValidator] = useState({ name: '', description: '' });

  const handleUpdate = (action: string) => {
    toast({ title: "Admin Action", description: `Protocol successfully ${action}.` });
  };

  const handleRegister = () => {
    if (!newValidator.name) return;
    const node = {
      id: `v${Date.now()}`,
      name: newValidator.name,
      description: newValidator.description,
      logo_uri: '12',
      is_active: false,
      seed_deposited: false,
      total_staked: 0,
      commission_rate: 1000,
      accrued_node_rewards: 0,
      global_reward_index: 0
    };
    setValidators([...validators, node]);
    setGlobalState({ ...globalState, validatorCount: globalState.validatorCount + 1 });
    setNewValidator({ name: '', description: '' });
    toast({ title: "Phase 9 Success", description: "Validator node registered via License." });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/95 flex items-center justify-center p-6 backdrop-blur-2xl overflow-y-auto">
      <div className="max-w-5xl w-full exn-card border-[#a855f7]/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#a855f7]/20 rounded-lg text-[#a855f7]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold exn-gradient-text uppercase tracking-tighter">EXNUS ADMIN (PHASE 0-14)</h2>
          </div>
          <button 
             onClick={() => (window as any).toggleAdminView()} 
             className="text-white/50 hover:text-white font-mono text-xs uppercase"
          >
            [ Exit System ]
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-[#00f5ff] flex items-center gap-2">
                <RefreshCw className="w-5 h-5" /> Epoch Simulation
              </h3>
              <div className="p-4 bg-white/5 rounded-xl space-y-4">
                <p className="text-[10px] text-white/40 leading-relaxed uppercase">Triggers Phase 5: Settle rewards for all active nodes based on global reward cap.</p>
                <button onClick={onSettle} className="w-full exn-button flex items-center justify-center gap-2">
                   Manual Epoch Settle
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Node Registration
              </h3>
              <div className="space-y-3">
                <input 
                  value={newValidator.name} 
                  onChange={e => setNewValidator({...newValidator, name: e.target.value})}
                  className="exn-input text-xs" 
                  placeholder="Validator Name..." 
                />
                <button onClick={handleRegister} className="w-full exn-button-outline text-xs h-10">Claim License (Phase 9)</button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Banknote className="w-5 h-5" /> Config (Phase 11)
              </h3>
              <div className="space-y-4">
                <div>
                   <label className="text-[10px] text-white/40 uppercase block mb-1">Reward Cap (EXN/Epoch)</label>
                   <input type="number" value={globalState.rewardCap} onChange={e => setGlobalState({...globalState, rewardCap: Number(e.target.value)})} className="exn-input" />
                </div>
                <button onClick={() => handleUpdate('updated protocol config')} className="w-full exn-button text-xs">Update On-Chain State</button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <PauseCircle className="w-5 h-5" /> Emergency Controls
              </h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setIsPaused(!isPaused); handleUpdate(isPaused ? 'Unpaused' : 'Paused'); }}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg font-bold transition-all ${isPaused ? 'bg-emerald-500 text-black' : 'bg-red-500 text-black'}`}
                >
                  {isPaused ? <PlayCircle className="w-5 h-5" /> : <PauseCircle className="w-5 h-5" />}
                  {isPaused ? 'Resume Protocol' : 'Emergency Pause'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
             <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Validator Audit
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-auto">
                {validators.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-1">
                      <span className="text-xs font-bold block">{v.name}</span>
                      <span className="text-[10px] text-white/40 uppercase">TVL: {v.total_staked}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => {
                        setValidators(validators.map((item: any) => item.id === v.id ? { ...item, is_active: !item.is_active } : item));
                        handleUpdate(v.is_active ? 'deactivated node' : 'activated node');
                      }} className={`p-1 rounded ${v.is_active ? 'text-red-400' : 'text-emerald-400'}`}>
                         {v.is_active ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      </button>
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
