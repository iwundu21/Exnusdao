"use client";

import React from 'react';
import { Zap, ShieldCheck, Clock, AlertCircle, BarChart3, Database } from 'lucide-react';

export function CrankTerminal({ validators = [], proposals = [], onCrank, connected = false }: any) {
  const activeValidators = validators.filter((v: any) => v.is_active);
  const pendingFinalization = proposals.filter((p: any) => !p.executed && Date.now() > p.deadline);
  
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Protocol Crank Terminal</h2>
        <p className="text-muted-foreground text-sm">
          Synchronize global network state, distribute staking rewards, and finalize governance outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="exn-card p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Active Synchronizers</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{activeValidators.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Healthy Validator Nodes</p>
        </div>

        <div className="exn-card p-6 border-secondary/20 bg-secondary/5">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-secondary" />
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Pending Executions</h3>
          </div>
          <p className="text-3xl font-bold text-secondary">{pendingFinalization.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Governance Outcomes</p>
        </div>

        <div className="exn-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-[10px] uppercase font-black tracking-widest text-foreground">Epoch Rewards</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-500">0.01%</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-2 font-bold tracking-tight">Per-Block Staking Multiplier</p>
        </div>
      </div>

      <div className="exn-card p-10 border-primary/30 flex flex-col items-center justify-center text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative p-8 bg-primary/10 rounded-full border border-primary/30">
            <Zap className="w-16 h-16 text-primary fill-current" />
          </div>
        </div>

        <div className="max-w-md space-y-4">
          <h3 className="text-2xl font-bold uppercase tracking-widest">Execute Network Crank</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Broadcasting a global state update will synchronize accrued rewards for all active nodes and permanently finalize the results of expired governance proposals.
          </p>
        </div>

        <button 
          onClick={onCrank}
          disabled={!connected}
          className={`px-12 py-4 rounded-xl font-black uppercase text-sm tracking-[0.2em] transition-all flex items-center gap-3 ${connected ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
        >
          <Zap className="w-5 h-5 fill-current" /> {connected ? 'Initiate Protocol Crank' : 'Wallet Required'}
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
           <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Execution Queue Details</p>
        </div>
        <div className="divide-y divide-border">
          {pendingFinalization.length === 0 ? (
            <div className="p-10 text-center opacity-20">
               <p className="text-[10px] uppercase font-black tracking-[0.3em]">No proposals pending on-chain finalization</p>
            </div>
          ) : (
            pendingFinalization.map((p: any) => (
              <div key={p.id} className="p-6 flex justify-between items-center bg-foreground/[0.02]">
                <div>
                   <p className="text-[10px] text-primary uppercase font-black mb-1">PIP-{p.id.toString().padStart(3, '0')}</p>
                   <p className="text-sm font-bold text-foreground uppercase">{p.title}</p>
                </div>
                <div className="text-right">
                   <p className={`text-[10px] font-black uppercase ${p.yes_votes > p.no_votes ? 'text-emerald-500' : 'text-destructive'}`}>
                     Status: {p.yes_votes > p.no_votes ? 'Passed' : 'Failed'}
                   </p>
                   <p className="text-[8px] text-muted-foreground uppercase font-bold">Total Weight: {(p.yes_votes + p.no_votes).toLocaleString()} EXN</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
