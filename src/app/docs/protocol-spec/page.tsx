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
  Unlock,
  Ticket,
  Image as ImageIcon
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
        <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase">Protocol Specification v2.2</h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Final technical architecture for the Exnus Network Solana Program. 
          Implementing <span className="text-foreground font-bold underline">NFT-Based Licensing</span> and a <span className="text-foreground font-bold underline">10-Year Reward Block</span> system.
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
              Provision the singleton <span className="text-foreground font-mono">GlobalState</span> account. 
              The frontend provides the <span className="text-primary font-bold">EXN</span> and <span className="text-emerald-500 font-bold">USDC</span> mint addresses. 
              The instruction <span className="text-primary font-bold underline">atomically</span> derives and creates the core Global PDA vaults.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-muted-foreground">Mandatory Inputs & Actions</h5>
              <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                <li><span className="text-foreground font-bold">Vault Provisioning:</span> Derives <span className="text-primary font-mono">staked_vault</span>, <span className="text-emerald-500 font-mono">reward_vault</span>, <span className="text-secondary font-mono">license_vault</span>, and <span className="text-foreground font-mono">treasury_vault</span>.</li>
                <li><span className="text-foreground font-bold">Initial Params:</span> Sets Reward Cap and License Price to <span className="text-primary font-bold">0</span>.</li>
              </ul>
            </div>
            <div className="p-6 bg-background/50 rounded-2xl border border-border space-y-4">
               <div className="flex items-center gap-2 text-secondary">
                 <ShieldCheck className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase">Atomic Multi-Account Creation</p>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                 "Initialization fails if any vault account creation reverts, ensuring the protocol enters a consistent state with all mint authorities established."
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NFT Licensing & Assets */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
             <Ticket className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">3. NFT-Based Licensing</h2>
        </div>
        <div className="exn-card p-10 border-primary/20 bg-primary/5 space-y-10">
           <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-primary tracking-widest">Instruction: <span className="text-foreground font-mono">purchase_license(ctx)</span></h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Users pay the configured <span className="text-emerald-500 font-bold font-mono">USDC</span> price to mint a unique **Node License NFT**. 
                This NFT serves as the cryptographic permit required to register and operate a validator node.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Asset Creation (Metaplex Standard)</h5>
                 <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                    <li><span className="text-foreground font-bold underline">Minting Logic:</span> Program invokes Token Metadata Program to create Metadata and Master Edition accounts.</li>
                    <li><span className="text-foreground font-bold underline">Metadata URI:</span> Points to a JSON file (Arweave/IPFS) containing the <span className="text-primary font-bold">License Logo URL</span>.</li>
                    <li><span className="text-foreground font-bold underline">Identity:</span> The NFT's Mint Address is the unique identifier for the license.</li>
                 </ul>
              </div>
              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <p className="text-[10px] font-black uppercase text-foreground">Visual Metadata Policy</p>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed italic">
                   "Each license features a base Exnus identity logo. Upon registration, the program updates the metadata URI to reflect the specific node operator's brand if desired."
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* 4. Unified Staking Vault */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
             <Vault className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">4. Unified Staking Vault</h2>
        </div>
        <div className="exn-card p-10 border-amber-500/20 bg-amber-500/5 space-y-10">
           <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-amber-500 tracking-widest">Vault: <span className="text-foreground font-mono">staked_vault</span></h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                All protocol capital (15M EXN Validator Seeds + Delegator Principal) is held in the <span className="text-primary font-bold underline">Global Staked Vault</span>. 
                Accounting is handled via isolated data accounts to track ownership and duration.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Instruction: <span className="text-foreground font-mono">stake_exn(amount, duration)</span></h5>
                 <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                    <li><span className="text-foreground font-bold">Transfer:</span> User Wallet → <span className="text-primary font-bold">Global Staked Vault</span>.</li>
                    <li><span className="text-foreground font-bold">Maturity:</span> Funds are locked until the expiration of the chosen multiplier window.</li>
                    <li><span className="text-foreground font-bold">Settlement:</span> Unstaking transfers funds from <span className="text-primary font-bold">Global Staked Vault</span> back to the user.</li>
                 </ul>
              </div>
              <div className="p-6 bg-black/20 rounded-2xl border border-border space-y-4">
                 <p className="text-[10px] font-black uppercase text-primary">Decoupled Settlement</p>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Principal is returned from the **Staked Vault**, while Rewards are distributed from the **Reward Vault**, ensuring principal solvency.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Validator Seeds */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
             <Coins className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">5. Validator Seed Deposits</h2>
        </div>
        <div className="exn-card p-10 border-emerald-500/20 bg-emerald-500/5 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase text-emerald-500 tracking-widest">Instruction: <span className="text-foreground font-mono">deposit_seed(ctx)</span></h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Node owners deposit exactly <span className="text-primary font-bold underline">15,000,000 EXN</span> into the Global Staked Vault. 
                This capital is tracked via the <span className="text-foreground font-mono">ValidatorState</span> account and serves as the node's operational bond.
              </p>
              <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                <li><span className="text-foreground font-bold">Withdrawal:</span> Only possible after node deactivation and a 48-hour cooling-off window.</li>
              </ul>
            </div>
            <div className="p-6 bg-background/60 rounded-2xl border border-border flex flex-col justify-center">
               <p className="text-[10px] font-black uppercase text-emerald-500 mb-2">Skin-in-the-Game Policy</p>
               <p className="text-xs text-muted-foreground leading-relaxed italic">
                 "Seed capital is the last to be withdrawn from the Staked Vault, ensuring operator commitment throughout the node's lifecycle."
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Node Registration */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
             <Hammer className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">6. Node Provisioning</h2>
        </div>
        <div className="exn-card p-10 border-primary/20 bg-primary/5 space-y-10">
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase text-primary tracking-widest">Instruction: <span className="text-foreground font-mono">register_node(ctx, name, logo_uri)</span></h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Binds a physical validator identity to a verified <span className="text-primary font-bold underline">License NFT</span>. 
              The program verifies the presence of the NFT in the signer's wallet before updating the registry.
            </p>
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
                    <li><span className="text-foreground font-bold underline">Mandatory Rationale:</span> A rationale (comment) MUST be provided or the transaction reverts.</li>
                    <li><span className="text-foreground font-bold underline">Lock Window:</span> Instruction reverts if Cluster Time is within 4 Hours of deadline.</li>
                 </ul>
              </div>
              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase">Voter Protection Policy</p>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   The program verifies the caller's aggregate Stake PDA weight. Capital maturity is extended by 4 hours upon voting to prevent immediate withdrawal post-consensus.
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
