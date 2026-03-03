"use client";

import React from 'react';
import { 
  Book, 
  Cpu, 
  ShieldAlert, 
  Database, 
  Cpu as CpuIcon,
  Layers, 
  ChevronRight,
  Lock,
  Landmark,
  RefreshCw,
  Calculator,
  Hammer,
  Coins,
  Vault,
  Ticket,
  Image as ImageIcon,
  ShieldCheck
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
        <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase">Protocol Specification v3.0</h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Technical architecture for the Exnus Network Solana Program. 
          Implementing <span className="text-foreground font-bold underline">NFT-Based Licensing</span> and a <span className="text-foreground font-bold underline">10-Year Reward Block</span> sharding system.
        </p>
      </div>

      {/* 1. Global Initialization */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-xl">
             <CpuIcon className="w-8 h-8 text-secondary" />
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
              <h5 className="text-[10px] font-black uppercase text-muted-foreground">Initial Protocol State</h5>
              <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                <li><span className="text-foreground font-bold">Vaults:</span> Derives <span className="text-primary font-mono">reward_vault</span>, <span className="text-emerald-500 font-mono">license_vault</span>, <span className="text-secondary font-mono">treasury_vault</span>, and <span className="text-foreground font-mono">staked_vault</span>.</li>
                <li><span className="text-foreground font-bold">Params:</span> Reward Cap, License Price, and License Limit are set to <span className="text-primary font-bold">0</span>. The Admin must configure these via separate instructions after launch.</li>
              </ul>
            </div>
            <div className="p-6 bg-background/50 rounded-2xl border border-border space-y-4">
               <div className="flex items-center gap-2 text-secondary">
                 <ShieldCheck className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase">Atomic Multi-Vault Creation</p>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                 "Initialization ensures the protocol enters a consistent state with all mint authorities established before any user interaction is permitted."
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
                Users pay the Admin-configured <span className="text-emerald-500 font-bold font-mono">USDC</span> price to mint a unique **Node License NFT**. 
                This instruction triggers a **Metaplex Minting Workflow** atomically.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">NFT Asset Generation Policy</h5>
                 <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                    <li><span className="text-foreground font-bold underline">Supply Cap:</span> The Admin sets a <span className="text-primary font-bold">total_max_mintable</span> limit. Once reached, the instruction reverts.</li>
                    <li><span className="text-foreground font-bold underline">Metaplex Standards:</span> Atomic creation of Metadata and Master Edition accounts.</li>
                    <li><span className="text-foreground font-bold underline">Visual URI:</span> The NFT metadata points to a high-resolution logo URI stored on decentralized storage (Arweave).</li>
                 </ul>
              </div>
              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <p className="text-[10px] font-black uppercase text-foreground">Supply & Scarcity</p>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed italic">
                   "Each license is a limited-edition cryptographic asset. Ownership of the NFT is the only valid permit for validator registration."
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
          <h2 className="text-3xl font-bold uppercase tracking-widest">4. Unified Staked Vault</h2>
        </div>
        <div className="exn-card p-10 border-amber-500/20 bg-amber-500/5 space-y-10">
           <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-amber-500 tracking-widest">Vault: <span className="text-foreground font-mono">staked_vault</span></h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                A singleton Global PDA vault (Seeds: <span className="text-foreground font-mono">["staked_vault"]</span>) that holds all active protocol capital. 
                Accounting is isolated via individual user and node data accounts.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Capital Settlement Logic</h5>
                 <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                    <li><span className="text-foreground font-bold">Delegator Principal:</span> Transferred from User Wallet to <span className="text-primary font-bold">Global Staked Vault</span>. Locked for chosen duration.</li>
                    <li><span className="text-foreground font-bold">Validator Seeds:</span> 15M EXN deposit held in the same unified vault, but isolated via Validator State accounting.</li>
                    <li><span className="text-foreground font-bold">Withdrawal:</span> Funds are returned only upon maturity, ensuring protocol solvency.</li>
                 </ul>
              </div>
              <div className="p-6 bg-black/20 rounded-2xl border border-border space-y-4">
                 <p className="text-[10px] font-black uppercase text-primary">Decoupled Settlement</p>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Principal is settled in the **Staked Vault**, while Rewards are sharded from the **Reward Vault**, preventing commingling of principal and yield.
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
          <h2 className="text-3xl font-bold uppercase tracking-widest">5. Validator Skin-in-the-Game</h2>
        </div>
        <div className="exn-card p-10 border-emerald-500/20 bg-emerald-500/5 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase text-emerald-500 tracking-widest">Instruction: <span className="text-foreground font-mono">deposit_seed(ctx)</span></h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Node owners deposit exactly <span className="text-primary font-bold underline">15,000,000 EXN</span> into the Global Staked Vault. 
                This serves as the operational bond for the validator node.
              </p>
              <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-5">
                <li><span className="text-foreground font-bold">Withdrawal:</span> Allowed only after node deactivation and a mandatory 48-hour cooling-off window.</li>
              </ul>
            </div>
            <div className="p-6 bg-background/60 rounded-2xl border border-border flex flex-col justify-center">
               <p className="text-[10px] font-black uppercase text-emerald-500 mb-2">Operational Commitment</p>
               <p className="text-xs text-muted-foreground leading-relaxed italic">
                 "Seed capital is the last to be withdrawn, ensuring operators maintain a high standard of uptime throughout the node's lifecycle."
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
            <h4 className="text-sm font-black uppercase text-primary tracking-widest">Instruction: <span className="text-foreground font-mono">register_node(ctx, license_nft_mint)</span></h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Binds a physical validator identity to a verified <span className="text-primary font-bold underline">License NFT</span>. 
              The program verifies the presence of the specified NFT in the signer's wallet before updating the global registry.
            </p>
          </div>
        </div>
      </section>

      {/* 7. 10-Year Reward Blocks */}
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
                Permissionless sharding of yield across the network every 14 days. Distribution indices start at <span className="text-foreground font-bold font-mono">001000</span>.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">Execution Sharding</h5>
                 <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5 leading-relaxed">
                    <li><span className="text-foreground font-bold">Commission Logic:</span> Node owner fee is deducted from the block pool before delegator yield sharding.</li>
                    <li><span className="text-emerald-500 font-bold">Yield Flow:</span> Rewards flow from <span className="font-bold">Global Reward Vault</span> to user reward accounts.</li>
                    <li><span className="text-primary font-bold">Weighting:</span> Rewards are distributed proportional to (Staked Amount × Duration Multiplier).</li>
                 </ol>
              </div>

              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase text-foreground">Reward Block Math</p>
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
                    <li><span className="text-foreground font-bold underline">Min Stake:</span> Requires at least <span className="text-primary font-bold">10,000 EXN</span> actively staked weight.</li>
                    <li><span className="text-foreground font-bold underline">Mandatory Rationale:</span> A comment must be provided with every vote to ensure transparency.</li>
                    <li><span className="text-foreground font-bold underline">Lock Window:</span> Instruction reverts if Cluster Time is within 4 Hours of the 7-day deadline.</li>
                 </ul>
              </div>
              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase">Consensus Protection</p>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   The program verifies the caller's aggregate Stake weight. Capital maturity is extended by 4 hours upon voting to prevent flash-exit post-consensus.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer / Call to Action */}
      <div className="pt-20 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold uppercase tracking-tighter text-foreground">Architecture v3.0</h3>
          <p className="text-muted-foreground text-sm uppercase font-black tracking-widest">Target: Mainnet-Beta | 10-Year Sharding Cycle</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="exn-button px-10">Admin Terminal</Link>
          <Link href="/" className="exn-button-outline px-10">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
