
"use client";

import React from 'react';
import { Zap, AlertCircle, BarChart3, Database } from 'lucide-react';

export function CrankTerminal({ validators = [], proposals = [], onCrank, connected = false }: any) {
  const activeValidators = validators.filter((v: any) => v.is_active);
  const totalNetworkWeight = validators.reduce((acc: number, v: any) => acc + (v.total_staked || 0), 0);
  const projectedEpochReward = totalNetworkWeight * 0.0001;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Network Crank Terminal</h2>
        <p className="text-muted-foreground text-sm">
          Call the protocol smart contract to dynamically distribute rewards to active delegators based on validator stake weights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="exn-card p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Active Nodes</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{activeValidators.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Earning Network Rewards</p>
        </div>

        <div className="exn-card p-6 border-secondary/20 bg-secondary/5">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Epoch Distribution</h3>
          </div>
          <p className="text-3xl font-bold text-secondary">{projectedEpochReward.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Projected EXN for Delegators</p>
        </div>

        <div className="exn-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Reward Multiplier</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-500">0.01%</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Weight-Based Dynamic Yield</p>
        </div>
      </div>

      <div className="exn-card p-10 border-primary/30 flex flex-col items-center justify-center text-center space-y-8">
        <div className="max-w-md space-y-4">
          <h3 className="text-2xl font-bold uppercase tracking-widest">Distribute Delegator Rewards</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Executing the network crank will trigger a smart contract call to synchronize global reward indices for all active delegators based on current validator weights.
          </p>
        </div>

        <button 
          onClick={onCrank}
          disabled={!connected}
          className={`px-12 py-4 rounded-xl font-black uppercase text-sm tracking-[0.2em] transition-all flex items-center gap-3 ${connected ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
        >
          <Zap className="w-5 h-5 fill-current" /> {connected ? 'Trigger Reward Crank' : 'Wallet Required'}
        </button>

        {!connected && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <p className="text-[10px] uppercase font-black tracking-widest">Authorized Wallet Signature Required</p>
          </div>
        )}
      </div>

      <div className="exn-card p-0 border-border overflow-hidden">
        <div className="p-4 bg-foreground/5 border-b border-border flex items-center gap-2">
           <Database className="w-4 h-4 text-muted-foreground" />
           <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Network Weight Details</p>
        </div>
        <div className="divide-y divide-border">
          {activeValidators.length === 0 ? (
            <div className="p-10 text-center opacity-20">
               <p className="text-[10px] uppercase font-black tracking-[0.3em]">No active nodes available for reward distribution</p>
            </div>
          ) : (
            activeValidators.map((v: any) => {
              const weightShare = (v.total_staked / totalNetworkWeight) * 100;
              return (
                <div key={v.id} className="p-6 flex justify-between items-center bg-foreground/[0.02]">
                  <div>
                     <p className="text-[10px] text-primary uppercase font-black mb-1">{v.name}</p>
                     <p className="text-sm font-bold text-foreground uppercase">{v.location}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase text-emerald-500">
                       Network Share: {weightShare.toFixed(2)}%
                     </p>
                     <p className="text-[8px] text-muted-foreground uppercase font-bold">Weight: {v.total_staked.toLocaleString()} EXN</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}
