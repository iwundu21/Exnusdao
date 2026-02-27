
"use client";

import React, { useState } from 'react';
import { ShieldAlert, Zap, Banknote, PauseCircle, PlayCircle, PlusCircle, Trash2, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AdminPanel() {
  const [isPaused, setIsPaused] = useState(false);
  const [emissionRate, setEmissionRate] = useState('1.5');

  const handleUpdate = (action: string) => {
    toast({ title: "Admin Action", description: `Protocol successfully ${action}.` });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/95 flex items-center justify-center p-6 backdrop-blur-2xl overflow-y-auto">
      <div className="max-w-4xl w-full exn-card border-[#a855f7]/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#a855f7]/20 rounded-lg text-[#a855f7]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold exn-gradient-text uppercase tracking-tighter">Protocol Management</h2>
          </div>
          <button 
             onClick={() => (window as any).toggleAdminView()} 
             className="text-white/50 hover:text-white"
          >
            [Close Admin Access]
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-[#00f5ff] flex items-center gap-2">
                <Zap className="w-5 h-5" /> Emission Control
              </h3>
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-widest">Global Emission Rate (EXN/Block)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={emissionRate}
                    onChange={(e) => setEmissionRate(e.target.value)}
                    className="exn-input"
                  />
                  <button onClick={() => handleUpdate('updated emission rate')} className="exn-button text-xs whitespace-nowrap">Update Rate</button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <PauseCircle className="w-5 h-5" /> Safety Controls
              </h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setIsPaused(!isPaused); handleUpdate(isPaused ? 'Unpaused' : 'Paused'); }}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg font-bold transition-all ${isPaused ? 'bg-emerald-500 text-black' : 'bg-red-500 text-black'}`}
                >
                  {isPaused ? <PlayCircle className="w-5 h-5" /> : <PauseCircle className="w-5 h-5" />}
                  {isPaused ? 'Unpause Protocol' : 'Emergency Pause'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Banknote className="w-5 h-5" /> Treasury & Slashing
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleUpdate('withdrawn treasury funds')} className="exn-button-outline w-full h-12 flex items-center justify-center gap-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">
                  Withdraw Treasury Funds (2.4M EXN)
                </button>
                <div className="space-y-2 border border-red-500/20 p-4 rounded-xl bg-red-500/5">
                   <label className="text-xs text-red-400/70 uppercase font-bold">Punitive Slashing</label>
                   <div className="flex gap-2">
                     <select className="exn-input border-red-500/40 text-xs">
                       <option>Select Validator...</option>
                       <option>CyberCore-01</option>
                       <option>NebulaNode</option>
                     </select>
                     <button onClick={() => handleUpdate('slashed validator')} className="bg-red-500 text-black px-4 rounded font-bold text-xs"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Node Approvals
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm font-medium">Pending: VoidNode-X</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate('approved validator')} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded"><CheckCircle className="w-5 h-5" /></button>
                    <button onClick={() => handleUpdate('rejected validator')} className="p-1 text-red-400 hover:bg-red-400/10 rounded"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
