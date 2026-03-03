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
  History,
  ShieldQuestion,
  Coins,
  Vault,
  Unlock
} from 'lucide-react';
import Link from 'next/link';

export default function ProtocolSpecPage() {
  return (
    <div className="max-w-5xl mx-auto px-10 py-20 space-y-20 animate-in fade-in duration-700 pb-40">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Book className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Developer Blueprint</p>
        </div>
        <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase">Protocol Specification v2.0</h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Final technical architecture for the Exnus Network Solana Program. 
          The protocol implements a <span className="text-foreground font-bold underline">10-Year Reward Block</span> system starting at index 001000.
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
              Provision the global protocol anchor. All initial distribution parameters are set to <span className="text-primary font-bold">0</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-muted-foreground">Initial State Assertions</h5>
              <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                <li><span className="text-foreground font-bold">Reward Cap:</span> Initialized at <span className="text-primary font-bold">0</span>. Admin configures via terminal.</li>
                <li><span className="text-foreground font-bold">License Price:</span> Initialized at <span className="text-primary font-bold">0</span>. Admin configures via terminal.</li>
                <li><span className="text-foreground font-bold">Network Start:</span> Set to <span className="text-primary font-bold">null</span>. The 10-year clock is triggered manually.</li>
              </ul>
            </div>
            <div className="p-6 bg-background/50 rounded-2xl border border-border space-y-4">
               <div className="flex items-center gap-2 text-secondary">
                 <History className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase">Admin Authority</p>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                 "Rewards distribution cannot begin until the Admin initializes the network start time. Once set, the 14-day reward blocks begin counting down for a total period of 10 years."
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Account & Vault PDAs */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
             <Layers className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">2. Account & Vault PDAs</h2>
        </div>
        <div className="exn-card p-10 border-primary/20 bg-primary/5">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Unified Capital PDAs</h5>
                 <div className="space-y-4">
                    <div className="p-4 bg-background/40 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-xs font-mono">Global State PDA</span>
                       <span className="text-[10px] font-black text-primary uppercase">["global_state"]</span>
                    </div>
                    <div className="p-4 bg-background/40 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-xs font-mono">Global Staked Vault</span>
                       <span className="text-[10px] font-black text-amber-500 uppercase">["staked_vault"]</span>
                    </div>
                    <div className="p-4 bg-background/40 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-xs font-mono">Global Reward Vault</span>
                       <span className="text-[10px] font-black text-emerald-500 uppercase">["reward_vault"]</span>
                    </div>
                    <div className="p-4 bg-background/40 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-xs font-mono">License Vault (USDC)</span>
                       <span className="text-[10px] font-black text-secondary uppercase">["license_vault"]</span>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-black/20 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-2">
                    <Vault className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-black uppercase">Unified Capitalization</p>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   All active network capital—including <span className="text-foreground font-bold underline">15M EXN Validator Seeds</span> and <span className="text-foreground font-bold underline">Delegator Principal</span>—is consolidated into the <span className="text-primary font-bold">Global Staked Vault</span>. 
                   Accounting is handled dynamically via isolated Stake Accounts.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* 4. Staking Lifecycle */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
             <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">4. Staking & Unstaking</h2>
        </div>
        <div className="exn-card p-10 border-amber-500/20 bg-amber-500/5 space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Instruction: <span className="text-foreground font-mono">stake_exn(amount)</span></h5>
                 <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                    <li><span className="text-foreground font-bold">Transfer:</span> User Wallet → <span className="text-primary font-bold">Global Staked Vault</span>.</li>
                    <li><span className="text-foreground font-bold">Dynamic Record:</span> Create Stake Account to track duration and principal.</li>
                    <li><span className="text-foreground font-bold">Snapshot:</span> Store current Validator Reward Index for claim calculation.</li>
                 </ul>
              </div>
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Instruction: <span className="text-foreground font-mono">unstake_exn()</span></h5>
                 <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                    <li><span className="text-foreground font-bold">Maturity:</span> Cluster time must exceed Stake Unlock Timestamp.</li>
                    <li><span className="text-foreground font-bold">Principal:</span> <span className="text-primary font-bold">Global Staked Vault</span> → User Wallet.</li>
                    <li><span className="text-foreground font-bold">Double Spend:</span> Account record is closed to prevent re-withdrawal.</li>
                 </ul>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Validator Management */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
             <Hammer className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">5. Validator Seed Management</h2>
        </div>
        <div className="exn-card p-10 border-emerald-500/20 bg-emerald-500/5 space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Instruction: <span className="text-foreground font-mono">deposit_seed()</span></h5>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   Transfer <span className="text-foreground font-bold">15,000,000 EXN</span> from Owner Wallet to the <span className="text-emerald-500 font-bold">Global Staked Vault</span>. 
                   This capital is isolated in accounting and required to activate the node.
                 </p>
              </div>
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Instruction: <span className="text-foreground font-mono">withdraw_seed()</span></h5>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   Decommissioning instruction. Returns the 15M EXN deposit from <span className="text-emerald-500 font-bold">Global Staked Vault</span> to Owner. 
                   Only accessible if all delegator positions are closed.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* 7. Reward Sharding Logic */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <RefreshCw className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">7. 10-Year Reward Blocks</h2>
        </div>

        <div className="exn-card p-10 space-y-8 border-primary/20 bg-primary/5">
           <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-primary tracking-widest">Instruction: <span className="text-foreground font-mono">crank_reward_block(block_idx)</span></h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Permissionless instruction to synchronize yield across the network every 14 days. Distribution starts at index <span className="text-foreground font-bold font-mono">001000</span>.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Execution Sharding</h5>
                 <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5 leading-relaxed">
                    <li><span className="text-foreground font-bold">Commission First:</span> Deduct node owner commission before updating delegator indices.</li>
                    <li><span className="text-secondary font-bold">Weight-Based:</span> Shard rewards from <span className="font-bold">Global Reward Vault</span> to user accounts.</li>
                    <li><span className="text-emerald-500 font-bold">Yield Sharding:</span> Delegator pool = Block Pool - Validator Commission.</li>
                 </ol>
              </div>

              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase text-foreground">Reward Distribution Math</p>
                 </div>
                 <div className="space-y-4 font-mono text-[10px] text-muted-foreground bg-black/30 p-6 rounded-lg leading-relaxed">
                    <p className="text-foreground/60 border-b border-white/5 pb-2 uppercase font-black">1. Validator Commission</p>
                    <p className="text-secondary">Owner_Reward = Block_Pool * Commission (%)</p>
                    
                    <p className="text-foreground/60 border-b border-white/5 pb-2 pt-4 uppercase font-black">2. Delegator Pool</p>
                    <p className="text-emerald-500">Delegator_Pool = Block_Pool - Owner_Reward</p>
                    
                    <p className="text-foreground/60 border-b border-white/5 pb-2 pt-4 uppercase font-black">3. Reward Index Update</p>
                    <p className="text-primary">Index_Delta = (Delegator_Pool * Multiplier) / Total_Staked</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 8. DAO Governance */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-xl">
             <Landmark className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">8. DAO Consensus & Voting</h2>
        </div>
        <div className="exn-card p-10 border-secondary/20 bg-secondary/5 space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Instruction: <span className="text-foreground font-mono">cast_vote(support, rationale)</span></h5>
                 <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                    <li><span className="text-foreground font-bold underline">Min Stake:</span> Voters must have at least <span className="text-primary font-bold">10,000 EXN</span> actively staked.</li>
                    <li><span className="text-foreground font-bold underline">Mandatory Rationale:</span> The rationale (comment) string must be provided or the transaction reverts.</li>
                    <li><span className="text-foreground font-bold underline">7-Day Window:</span> Proposals are active for exactly 168 hours.</li>
                 </ul>
              </div>
              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase">Consensus Lock Period</p>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   To prevent "flash-voting," the instruction is disabled when a proposal has less than <span className="text-amber-500 font-bold underline">4 Hours</span> remaining. 
                   Capital used for voting is locked from withdrawal until the consensus window concludes.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer / Call to Action */}
      <div className="pt-20 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold uppercase tracking-tighter text-foreground">Architecture Finalized</h3>
          <p className="text-muted-foreground text-sm uppercase font-black tracking-widest">Target Network: Mainnet-Beta | Lifecycle: 10-Year Reward Sharding</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="exn-button px-10">Admin Terminal</Link>
          <Link href="/" className="exn-button-outline px-10">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
