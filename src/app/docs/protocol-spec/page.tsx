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
        <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase">Protocol Specification v2.1</h1>
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
            <h4 className="text-sm font-black uppercase text-secondary tracking-widest">Instruction: <span className="text-foreground font-mono">initialize(ctx, exn_mint, usdc_mint)</span></h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Provision the singleton <span className="text-foreground font-mono">GlobalState</span> account and establish the protocol's mint authority. 
              This instruction <span className="text-primary font-bold underline">atomically</span> derives and creates the 4 core Global PDA vaults.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-muted-foreground">Mandatory Inputs & Actions</h5>
              <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                <li><span className="text-foreground font-bold">Mint Integration:</span> Capture the EXN and USDC mint addresses provided by the frontend.</li>
                <li><span className="text-foreground font-bold">Vault Provisioning:</span> Derives <span className="text-primary font-mono">staked_vault</span>, <span className="text-emerald-500 font-mono">reward_vault</span>, <span className="text-secondary font-mono">license_vault</span>, and <span className="text-foreground font-mono">treasury_vault</span>.</li>
                <li><span className="text-foreground font-bold">Initial Params:</span> Sets Reward Cap and License Price to <span className="text-primary font-bold">0</span>.</li>
              </ul>
            </div>
            <div className="p-6 bg-background/50 rounded-2xl border border-border space-y-4">
               <div className="flex items-center gap-2 text-secondary">
                 <ShieldCheck className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase">Atomic Account Creation</p>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                 "The initialization instruction must include sufficient rent for all Global PDAs. Failure to create any vault account results in a total transaction revert, ensuring protocol integrity."
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
                       <span className="text-xs font-mono">Global Staked Vault (EXN)</span>
                       <span className="text-[10px] font-black text-primary uppercase">["staked_vault"]</span>
                    </div>
                    <div className="p-4 bg-background/40 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-xs font-mono">Global Reward Vault (EXN)</span>
                       <span className="text-[10px] font-black text-emerald-500 uppercase">["reward_vault"]</span>
                    </div>
                    <div className="p-4 bg-background/40 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-xs font-mono">License Vault (USDC)</span>
                       <span className="text-[10px] font-black text-secondary uppercase">["license_vault"]</span>
                    </div>
                    <div className="p-4 bg-background/40 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-xs font-mono">Treasury Vault (EXN)</span>
                       <span className="text-[10px] font-black text-foreground uppercase">["treasury_vault"]</span>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-black/20 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-2">
                    <Vault className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-black uppercase">Vault Derivation Hierarchy</p>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   All active network capital—including <span className="text-foreground font-bold underline">15M EXN Validator Seeds</span> and <span className="text-foreground font-bold underline">Delegator Principal</span>—is consolidated into the <span className="text-primary font-bold">Global Staked Vault</span>. 
                   Yield is isolated in the <span className="text-emerald-500 font-bold">Reward Vault</span> to prevent principal dilution during emissions.
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
                    <li><span className="text-foreground font-bold">Accounting:</span> Create unique Stake Account PDA to track duration and principal.</li>
                    <li><span className="text-foreground font-bold">Yield Logic:</span> Principal and Rewards are settled from decoupled vaults to ensure solvency.</li>
                 </ul>
              </div>
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Instruction: <span className="text-foreground font-mono">unstake_exn()</span></h5>
                 <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                    <li><span className="text-foreground font-bold">Maturity:</span> Cluster time must exceed Stake Unlock Timestamp.</li>
                    <li><span className="text-foreground font-bold">Settlement:</span> <span className="text-primary font-bold">Global Staked Vault</span> → User Wallet.</li>
                    <li><span className="text-foreground font-bold">Protection:</span> Account is closed post-transfer to prevent double-spending.</li>
                 </ul>
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
                    <li><span className="text-foreground font-bold">Commission First:</span> Node owner fee deducted before delegator yield sharding.</li>
                    <li><span className="text-emerald-500 font-bold">Yield Sharding:</span> Rewards flow from <span className="font-bold">Global Reward Vault</span> to user accounts.</li>
                    <li><span className="text-primary font-bold">Weight-Based:</span> Distributed proportional to (Staked Amount × Multiplier).</li>
                 </ol>
              </div>

              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase text-foreground">Reward Sharding Math</p>
                 </div>
                 <div className="space-y-4 font-mono text-[10px] text-muted-foreground bg-black/30 p-6 rounded-lg leading-relaxed">
                    <p className="text-foreground/60 border-b border-white/5 pb-2 uppercase font-black">1. Owner Harvesting</p>
                    <p className="text-secondary">Owner_Fee = Block_Pool * Commission_Rate</p>
                    
                    <p className="text-foreground/60 border-b border-white/5 pb-2 pt-4 uppercase font-black">2. Delegator Pool</p>
                    <p className="text-emerald-500">Staker_Pool = Block_Pool - Owner_Fee</p>
                    
                    <p className="text-foreground/60 border-b border-white/5 pb-2 pt-4 uppercase font-black">3. Reward Index Update</p>
                    <p className="text-primary">Global_Index += (Staker_Pool * Precision) / Total_Weighted_Stake</p>
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
                    <li><span className="text-foreground font-bold underline">Min Stake:</span> Requires at least <span className="text-primary font-bold">10,000 EXN</span> actively staked.</li>
                    <li><span className="text-foreground font-bold underline">Mandatory Rationale:</span> A comment string must be provided or the transaction reverts.</li>
                    <li><span className="text-foreground font-bold underline">Lock Window:</span> Instruction is <span className="text-amber-500 font-bold">Disabled</span> if Cluster Time is within 4 Hours of deadline.</li>
                 </ul>
              </div>
              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase">Voter Protection Policy</p>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   To prevent governance manipulation, any wallet casting a vote has its active Stake Maturity <span className="text-foreground font-bold underline">Extended</span> by 4 hours. 
                   Capital is physically locked until the voting window concludes.
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
