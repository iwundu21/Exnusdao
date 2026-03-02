
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
  LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function ProtocolSpecPage() {
  return (
    <div className="max-w-5xl mx-auto px-10 py-20 space-y-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Book className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Developer Blueprint</p>
        </div>
        <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase">Protocol Specification v1.2</h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Technical architecture and state machine behavior for the Exnus Network Solana Program. 
          Use this specification to implement the core smart contract logic, multi-vault accounting, and DAO consensus.
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
              The entry point for anchoring the protocol. This must be a one-time operation authorized by the Deployer.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-muted-foreground">Step-by-Step Behavior</h5>
              <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5">
                <li>Initialize the <span className="text-foreground font-bold">Global State Account</span> using seeds <span className="font-mono text-primary">["global_state"]</span>.</li>
                <li>Assign <span className="text-foreground font-bold">Admin Authority</span> to the caller's public key.</li>
                <li>Store the <span className="text-foreground font-bold">EXN Mint</span> and <span className="text-foreground font-bold">USDC Mint</span> addresses in the Global State.</li>
                <li>Derive and initialize the three Global PDAs: Reward Vault, Treasury Vault, and License Vault.</li>
                <li>Set initial parameters: <span className="text-primary">Reward Cap</span>, <span className="text-primary">License Price (USDC)</span>, and <span className="text-primary">Epoch Index</span>.</li>
              </ol>
            </div>
            <div className="p-6 bg-background/50 rounded-2xl border border-border space-y-4">
               <div className="flex items-center gap-2 text-secondary">
                 <Lock className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase">Authority Constraint</p>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                 "Only the address set during initialization (Global State Admin) can authorize USDC withdrawals from the License Vault or update global network parameters like the License Price directly."
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PDA & Vault Architecture */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">2. Vault & PDA Architecture</h2>
        </div>
        
        <div className="space-y-8">
           <div className="exn-card p-6 border-primary/40 bg-primary/5 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary">Global State Account (Root)</h5>
                  <p className="text-[11px] text-muted-foreground mt-1">Seeds: <span className="font-mono text-foreground font-bold">["global_state"]</span></p>
                </div>
                <Database className="w-5 h-5 text-primary/40" />
              </div>
              <p className="text-xs text-foreground/70 mt-3">The master account for the protocol. Stores all configuration, authority data, and global network indices.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="exn-card p-6 border-primary/20 space-y-4">
                 <h5 className="text-[10px] font-black uppercase text-primary">Global Reward Vault</h5>
                 <p className="text-[11px] text-muted-foreground">Seeds: <span className="font-mono">["reward_vault"]</span></p>
                 <p className="text-xs text-foreground/70">Source of all EXN reward emissions. Holds the dynamic distribution pool funded by the Admin.</p>
              </div>
              <div className="exn-card p-6 border-secondary/20 space-y-4">
                 <h5 className="text-[10px] font-black uppercase text-secondary">Global Treasury Vault</h5>
                 <p className="text-[11px] text-muted-foreground">Seeds: <span className="font-mono">["treasury_vault"]</span></p>
                 <p className="text-xs text-foreground/70">Collector for governance fees and direct funding. Used for ecosystem growth.</p>
              </div>
              <div className="exn-card p-6 border-emerald-500/20 space-y-4">
                 <h5 className="text-[10px] font-black uppercase text-emerald-500">Global License Vault</h5>
                 <p className="text-[11px] text-muted-foreground">Seeds: <span className="font-mono">["license_vault"]</span></p>
                 <p className="text-xs text-foreground/70">Collector for USDC revenue from node license sales. Settled by Admin.</p>
              </div>
           </div>

           <div className="exn-card p-8 border-border">
              <h3 className="text-lg font-bold uppercase tracking-widest mb-6">User-Validator PDAs (Dynamic)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <div className="p-4 bg-foreground/5 rounded-xl border border-border">
                       <p className="text-[10px] font-black uppercase text-primary mb-2">Validator Seed PDA</p>
                       <p className="text-xs font-mono text-foreground">["validator_seed", validator_pubkey]</p>
                       <p className="text-[11px] text-muted-foreground mt-3">Isolated vault for the 15M EXN activation deposit. Ensures validator skin-in-the-game.</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="p-4 bg-foreground/5 rounded-xl border border-border">
                       <p className="text-[10px] font-black uppercase text-secondary mb-2">Staking Vault PDA</p>
                       <p className="text-xs font-mono text-foreground">["stake_account", user_pubkey, stake_nonce]</p>
                       <p className="text-[11px] text-muted-foreground mt-3">Isolated vault for individual delegator principal. Ensures funds are never commingled.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 3. Staking Lifecycle */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <ArrowRightLeft className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">3. Staking & Maturity Logic</h2>
        </div>

        <div className="exn-card p-10 space-y-10">
           <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-emerald-500 tracking-widest">Instruction: <span className="text-foreground font-mono">stake_tokens(amount, duration)</span></h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-muted-foreground">Step-by-Step Behavior</h5>
                    <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5">
                       <li>Derive unique <span className="text-foreground font-bold">Staking Vault PDA</span> for the user.</li>
                       <li>Transfer <span className="text-foreground font-bold">amount</span> from User Wallet to the <span className="text-primary">Staking Vault PDA</span>.</li>
                       <li>Calculate and store <span className="text-foreground font-bold">unlock_timestamp</span> based on <span className="font-mono">Clock::unix_timestamp</span> + tier.</li>
                       <li>Checkpoint the Validator's current <span className="text-foreground font-bold">global_reward_index</span>.</li>
                    </ol>
                 </div>
                 <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-amber-500">
                      <ShieldAlert className="w-4 h-4" />
                      <p className="text-[10px] font-black uppercase">Maturity Constraint</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Funds in the <span className="font-bold">Staking Vault PDA</span> are cryptographically locked. The program must reject any transfer-out attempts before the <span className="font-mono">unlock_timestamp</span> is reached.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. Claims & Unstaking (Decoupled) */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">4. Decoupled Settlement</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="exn-card p-8 border-primary/20 space-y-6">
              <h4 className="text-sm font-black uppercase text-primary tracking-widest">Instruction: <span className="text-foreground font-mono">claim_rewards()</span></h4>
              <div className="space-y-4">
                 <p className="text-[11px] text-muted-foreground leading-relaxed">
                    1. Assert current time >= stake account maturity.<br/>
                    2. Calculate yield: <span className="font-mono">(ValidatorIndex - Checkpoint) * StakeAmount</span>.<br/>
                    3. Transfer yield from <span className="text-foreground font-bold">Global Reward Vault</span> to User Wallet.<br/>
                    4. Reset stake checkpoint to current Validator Index.
                 </p>
              </div>
           </div>
           <div className="exn-card p-8 border-secondary/20 space-y-6">
              <h4 className="text-sm font-black uppercase text-secondary tracking-widest">Instruction: <span className="text-foreground font-mono">unstake_principal()</span></h4>
              <div className="space-y-4">
                 <p className="text-[11px] text-muted-foreground leading-relaxed">
                    1. Assert current time >= stake account maturity.<br/>
                    2. Transfer original principal from the <span className="text-foreground font-bold">Staking Vault PDA</span> to User Wallet.<br/>
                    3. Close the Staking Vault PDA account and return rent lamports to user.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Validator Registration & Management */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Hammer className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">5. Validator Lifecycle</h2>
        </div>

        <div className="exn-card p-10 space-y-12">
           {/* Registration */}
           <div className="space-y-6">
              <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">5.1 Node Registration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <p className="text-xs font-black uppercase text-amber-500">Prerequisite: License</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      User must first transfer the current <span className="font-bold text-foreground">Dynamic License Price</span> in USDC to the <span className="font-bold text-foreground">Global License Vault</span>.
                    </p>
                 </div>
                 <div className="space-y-4">
                    <p className="text-xs font-black uppercase text-amber-500">Instruction: <span className="font-mono">register_validator</span></p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      1. Verify <span className="font-mono">license_id</span> ownership.<br/>
                      2. Initialize <span className="font-bold text-foreground">Validator State Account</span> (PDA).<br/>
                      3. Map metadata (Name, Location, Commission Rate).<br/>
                      4. Set <span className="font-mono">license.is_claimed = true</span>.
                    </p>
                 </div>
              </div>
           </div>

           {/* Seed Management */}
           <div className="space-y-6 pt-10 border-t border-white/5">
              <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">5.2 Seed & Commission Management</h3>
              <div className="grid grid-cols-1 gap-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="exn-card p-6 border-primary/10 bg-primary/5 space-y-4">
                       <p className="text-xs font-black uppercase text-primary">Instruction: <span className="font-mono">deposit_seed</span> (15M EXN)</p>
                       <p className="text-[11px] text-muted-foreground">
                          Moves 15,000,000 EXN from Validator Wallet to the <span className="text-foreground font-bold">Validator Seed PDA</span> (Seeds: <span className="font-mono">["validator_seed", pubkey]</span>). 
                          This capital is cryptographically locked and required to toggle status to <span className="text-emerald-500 font-bold">ONLINE</span>.
                       </p>
                    </div>
                    <div className="exn-card p-6 border-destructive/10 bg-destructive/5 space-y-4">
                       <p className="text-xs font-black uppercase text-destructive">Instruction: <span className="font-mono">withdraw_seed</span></p>
                       <p className="text-[11px] text-muted-foreground">
                          1. <span className="font-bold">Verify Authority:</span> Caller must be Node Owner.<br/>
                          2. <span className="font-bold">Toggle Status:</span> Set Node to <span className="font-bold">INACTIVE</span>.<br/>
                          3. <span className="font-bold">Settle Capital:</span> Transfer 15M EXN from the <span className="text-foreground font-bold">Validator Seed PDA</span> back to Owner Wallet.
                       </p>
                    </div>
                 </div>
                 <div className="exn-card p-6 border-emerald-500/10 bg-emerald-500/5 space-y-4">
                    <p className="text-xs font-black uppercase text-emerald-500">Instruction: <span className="font-mono">claim_node_commission</span></p>
                    <p className="text-[11px] text-muted-foreground">
                      Transfers the node owner's accrued commission (calculated during epoch cranks) from the <span className="font-bold text-foreground">Global Reward Vault</span> to their wallet.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 6. Admin Authorities */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">6. Administrative Instructions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 bg-foreground/5 rounded-2xl border border-border space-y-3">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-black uppercase text-primary">Settle Revenue</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Authorized: <span className="font-bold">Admin Only</span>. Instruction transfers USDC from <span className="font-mono">GlobalLicenseVault</span> to the designated Admin wallet.</p>
           </div>
           <div className="p-6 bg-foreground/5 rounded-2xl border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                <p className="text-xs font-black uppercase text-primary">Update Parameters</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Authorized: <span className="font-bold">Admin Only</span>. Allows modification of the <span className="font-bold">Reward Cap</span> and the <span className="font-bold">License Price (USDC)</span>.</p>
           </div>
        </div>
      </section>

      {/* 7. Network Crank Logic */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <RefreshCw className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">7. Network Crank & Distribution</h2>
        </div>

        <div className="exn-card p-10 space-y-8 border-emerald-500/20 bg-emerald-500/5">
           <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-emerald-500 tracking-widest">Instruction: <span className="text-foreground font-mono">crank_epoch_distribution(epoch_idx)</span></h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Calculates and finalizes reward indices for the entire network at the end of a 14-day cycle.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground">7.1 Execution Steps (On-Chain)</h5>
                 <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5 leading-relaxed">
                    <li>Assert <span className="text-foreground font-mono">Clock::unix_timestamp</span> exceeds Epoch end-time.</li>
                    <li>Calculate <span className="text-foreground font-bold">Total Network Weight</span> (Sum of all active validator stake).</li>
                    <li>Calculate <span className="text-secondary font-bold">Epoch Share</span> per validator based on relative weight.</li>
                    <li><span className="text-primary font-bold">Mandatory Commission Split:</span> Deduct node owner fee from the validator's share first.</li>
                    <li>Update <span className="text-foreground font-bold">Validator Accrued Rewards</span> with the commission amount.</li>
                    <li>Distribute the <span className="text-emerald-500 font-bold">Delegator Remainder</span> into the global reward index.</li>
                 </ol>
              </div>

              <div className="p-6 bg-background/60 rounded-2xl border border-border space-y-6">
                 <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase text-foreground">7.2 Reward Sharding Math</p>
                 </div>
                 <div className="space-y-4 font-mono text-[10px] text-muted-foreground bg-black/30 p-6 rounded-lg leading-relaxed">
                    <p className="text-foreground/60 border-b border-white/5 pb-2 uppercase font-black">Step 1: Node Total Share</p>
                    <p className="text-foreground">Node_Share = (Reward_Pool * Node_Weight) / Total_Network_Weight</p>
                    
                    <p className="text-foreground/60 border-b border-white/5 pb-2 pt-4 uppercase font-black">Step 2: Commission Deduction</p>
                    <p className="text-secondary">Owner_Commission = Node_Share * Commission_Rate (%)</p>
                    
                    <p className="text-foreground/60 border-b border-white/5 pb-2 pt-4 uppercase font-black">Step 3: Delegator Pool Update</p>
                    <p className="text-emerald-500">Delegator_Pool = Node_Share - Owner_Commission</p>
                    <p className="text-emerald-500">New_Global_Index = Old_Index + (Delegator_Pool / Node_Weight)</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 8. DAO Governance Consensus */}
      <section className="space-y-10 pb-20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-xl">
            <Vote className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest">8. DAO Governance Consensus</h2>
        </div>

        <div className="exn-card p-10 space-y-12 border-secondary/20 bg-secondary/5">
           {/* Proposal Types */}
           <div className="space-y-6">
              <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">8.1 Proposal Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
                    <p className="text-xs font-black uppercase text-primary tracking-widest">Type 0: Parameter Change</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Used to modify mutable variables in the <span className="font-bold text-foreground">Global State Account</span> (e.g., Reward Cap, License Price).
                    </p>
                 </div>
                 <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/20 space-y-4">
                    <p className="text-xs font-black uppercase text-secondary tracking-widest">Type 1: Treasury Distribution</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Authorizes the transfer of EXN tokens from the <span className="font-bold text-foreground">Global Treasury Vault</span> to a designated recipient.
                    </p>
                 </div>
              </div>
           </div>

           {/* Voting Mechanics */}
           <div className="space-y-6 pt-10 border-t border-white/5">
              <div className="flex items-center gap-3">
                 <Scale className="w-5 h-5 text-secondary" />
                 <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">8.2 Voting Mechanics (Instruction: <span className="font-mono">cast_vote</span>)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase text-muted-foreground">Execution Behavior</h5>
                  <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5">
                    <li><span className="text-foreground font-bold">Verify Identity:</span> Assert caller has active, non-unstaked <span className="font-mono text-primary">Stake Account PDAs</span>.</li>
                    <li><span className="text-amber-500 font-bold uppercase">Requirement:</span> Assert total combined stake weight is <span className="font-black">≥ 10,000 EXN</span>.</li>
                    <li><span className="text-foreground font-bold">Weight Snapshot:</span> Sum total principal across all valid accounts. <span className="text-secondary font-bold">1 EXN = 1 Vote Weight</span>.</li>
                    <li><span className="text-foreground font-bold">Protocol Fee:</span> Transfer exactly <span className="text-foreground font-bold">3 EXN</span> from Voter wallet to <span className="text-secondary">Global Treasury Vault</span>.</li>
                    <li><span className="text-foreground font-bold">Record Participation:</span> Add Voter address to the Proposal PDA's <span className="font-mono">voter_registry</span> to prevent double-voting.</li>
                    <li><span className="text-foreground font-bold">Maturity Extension:</span> Apply a mandatory <span className="text-amber-500 font-bold">4-hour unlock delay</span> to all of the voter's Stake PDAs to prevent immediate capital exit.</li>
                  </ol>
                </div>
                <div className="p-6 bg-background/40 border border-border rounded-2xl space-y-4">
                   <p className="text-[10px] font-black uppercase text-secondary">Anti-Sybil Logic</p>
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                     "Voting weight is snapshot precisely at the time of the instruction. Developers must ensure the program loops through the user's Stake PDAs to aggregate total weight and enforces the 10,000 EXN minimum threshold before updating the proposal's global counters."
                   </p>
                </div>
              </div>
           </div>

           {/* Creation */}
           <div className="space-y-6 pt-10 border-t border-white/5">
              <div className="flex items-center gap-3">
                 <Gavel className="w-5 h-5 text-secondary" />
                 <h4 className="text-sm font-black uppercase text-foreground tracking-widest">Instruction: <span className="text-secondary font-mono">create_proposal</span></h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-muted-foreground">On-Chain Behavior</h5>
                    <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5">
                       <li>Verify caller has <span className="text-foreground font-bold">≥ 1M EXN</span> active stake weight.</li>
                       <li>Transfer <span className="text-foreground font-bold">10 EXN fee</span> to <span className="text-secondary">Global Treasury Vault</span>.</li>
                       <li>Initialize <span className="text-foreground font-bold">Proposal Account</span> (PDA) seeds <span className="font-mono text-primary">["proposal", proposal_id]</span>.</li>
                       <li>Store metadata and the 7-day consensus <span className="font-mono">deadline_timestamp</span>.</li>
                    </ol>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer / Call to Action */}
      <div className="pt-20 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Architecture Finalized</h3>
          <p className="text-muted-foreground text-sm uppercase font-black tracking-widest">Target Network: Mainnet-Beta | Build: Anchor 0.29.0</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="exn-button px-10">Admin Terminal</Link>
          <Link href="/" className="exn-button-outline px-10">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
