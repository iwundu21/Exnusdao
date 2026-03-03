"use client";

import React from 'react';
import { 
  Book, 
  Cpu, 
  ShieldAlert, 
  Database, 
  Key, 
  Layers, 
  Network, 
  Zap, 
  ChevronRight,
  Code2,
  Lock,
  ArrowRightLeft,
  CircleDollarSign,
  Landmark,
  RefreshCw,
  Calculator,
  Gavel,
  Vote,
  Hammer,
  BadgeDollarSign,
  Settings,
  Scale,
  ShieldCheck,
  LogOut,
  Clock,
  History
} from 'lucide-react';
import Link from 'next/link';

export default function ProtocolSpecPage() {
  return (
    <div className="max-w-5xl mx-auto px-10 py-20 space-y-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            < Book className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Developer Blueprint</p>
        </div>
        <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase">Protocol Specification v1.4</h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Technical architecture for the Exnus Network Solana Program. 
          The protocol implements a <span className="text-foreground font-bold underline">10-Year Reward Block</span> system starting at index 1000.
        </p>
      </div>

      {/* 1. Global Initialization */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-xl">
             <Cpu className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">1. Global Initialization</h2>
        </div>
        <div className="exn-card p-8 border-secondary/20 bg-secondary/5 space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase text-secondary tracking-widest">Instruction: <span className="text-foreground font-mono">initialize(ctx)</span></h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              The entry point for anchoring the protocol. Provisions global state and <span className="text-secondary font-bold">automatically derives</span> core vaults.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-muted-foreground">Initialization State</h5>
              <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                <li><span className="text-foreground font-bold">Reward Cap & License Price:</span> Initialized at <span className="text-primary font-bold">0</span>. Admin must configure via front-end.</li>
                <li><span className="text-foreground font-bold">Network Start Date:</span> Set to <span className="text-primary font-bold">null</span>. Admin triggers the 10-year clock manually post-deployment.</li>
                <li><span className="text-foreground font-bold">Vault Derivation:</span> Reward, Treasury, License, and Staked Vaults are derived automatically from seeds.</li>
              </ul>
            </div>
            <div className="p-6 bg-background/50 rounded-2xl border border-border space-y-4">
               <div className="flex items-center gap-2 text-secondary">
                 <History className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase">Lifecycle Assertion</p>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                 "Rewards distribution cannot begin until the Admin initializes the network start time. Once set, the 14-day reward blocks begin counting down for a total period of 10 years."
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Network Crank Logic */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <RefreshCw className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">7. Reward Block & Distribution</h2>
        </div>

        <div className="exn-card p-10 space-y-8 border-emerald-500/20 bg-emerald-500/5">
           <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-emerald-500 tracking-widest">Instruction: <span className="text-foreground font-mono">crank_reward_block(block_idx)</span></h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Permissionless instruction to synchronize yield across the network. The system utilizes 14-day blocks starting at index <span className="text-foreground font-bold font-mono">001000</span>.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Execution Flow</h5>
                 <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5 leading-relaxed">
                    <li><span className="text-foreground font-bold">Permissionless:</span> Any wallet can trigger the crank after the 14-day window.</li>
                    <li><span className="text-foreground font-bold">Lifespan:</span> System operates for 10 years (approx. 260 blocks).</li>
                    <li><span className="text-foreground font-bold">Validator Share:</span> Calculated based on weight relative to total network staked in the <span className="text-primary font-bold">Global Staked Vault</span>.</li>
                    <li><span className="text-secondary font-bold">Commission First:</span> Deduct node owner commission before updating delegator reward indices.</li>
                    <li><span className="text-emerald-500 font-bold">Delegator Yield:</span> Updated reward indices account for <span className="font-bold">staked amount</span> and <span className="font-bold">duration multiplier</span>.</li>
                 </ol>
              </div>

              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase text-foreground">Reward Block Math</p>
                 </div>
                 <div className="space-y-4 font-mono text-[10px] text-muted-foreground bg-black/30 p-6 rounded-lg leading-relaxed">
                    <p className="text-foreground/60 border-b border-white/5 pb-2 uppercase font-black">1. Block Pool Sharding</p>
                    <p className="text-foreground">Node_Pool = (Total_Reward_Pool * Node_Stake) / Global_Network_Stake</p>
                    
                    <p className="text-foreground/60 border-b border-white/5 pb-2 pt-4 uppercase font-black">2. Validator Commission</p>
                    <p className="text-secondary">Owner_Reward = Node_Pool * Commission_Rate (%)</p>
                    
                    <p className="text-foreground/60 border-b border-white/5 pb-2 pt-4 uppercase font-black">3. Delegator Distribution</p>
                    <p className="text-emerald-500">Delegator_Pool = Node_Pool - Owner_Reward</p>
                    <p className="text-emerald-500">Index_Delta = (Delegator_Pool * Multiplier) / Node_Stake</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer / Call to Action */}
      <div className="pt-20 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Architecture Finalized</h3>
          <p className="text-muted-foreground text-sm uppercase font-black tracking-widest">Target Network: Mainnet-Beta | Distribution: 10-Year Reward Sharding</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="exn-button px-10">Admin Terminal</Link>
          <Link href="/" className="exn-button-outline px-10">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
