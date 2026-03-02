
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
  Landmark
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
        <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase">Protocol Specification v1.0</h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Technical architecture and state machine behavior for the Exnus Network Solana Program. 
          Use this specification to implement the core smart contract logic.
        </p>
      </div>

      {/* 1. Global Initialization */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <Cpu className="w-8 h-8 text-secondary" />
          <h2 className="text-3xl font-bold uppercase tracking-widest">1. Global Initialization</h2>
        </div>
        <div className="exn-card p-8 border-secondary/20 bg-secondary/5 space-y-6">
          <p className="text-sm text-foreground/80 leading-relaxed">
            The `initialize` instruction sets the protocol's permanent authority and establishes the token accounting framework.
          </p>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-secondary tracking-widest">Step-by-Step Behavior:</h4>
            <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-5">
              <li>Receive `admin_wallet` as the permanent protocol authority.</li>
              <li>Register `exn_mint` and `usdc_mint` public keys.</li>
              <li>Derive and initialize 3 Global PDAs (Program Derived Addresses):
                <ul className="mt-2 space-y-2 pl-4 border-l border-border">
                  <li><span className="text-foreground font-bold font-mono">GlobalRewardVault</span>: Holds EXN for emissions.</li>
                  <li><span className="text-foreground font-bold font-mono">GlobalTreasuryVault</span>: Holds EXN from governance fees.</li>
                  <li><span className="text-foreground font-bold font-mono">GlobalLicenseVault</span>: Holds USDC from license sales.</li>
                </ul>
              </li>
              <li>Initialize global state account with `reward_cap`, `license_limit`, and `epoch_index`.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 2. PDA & Vault Architecture */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <Layers className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold uppercase tracking-widest">2. Vault Architecture</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="exn-card p-8 border-primary/20 space-y-4">
            <h3 className="text-lg font-bold uppercase text-primary tracking-widest">Program PDAs</h3>
            <div className="space-y-3">
              <div className="p-4 bg-foreground/5 rounded-xl border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Validator Seed PDA</p>
                <p className="text-xs font-mono text-foreground">Seeds: ["validator", validator_id]</p>
                <p className="text-[9px] mt-2 text-muted-foreground italic">Purpose: Isolates 15M EXN mandatory seed per node.</p>
              </div>
              <div className="p-4 bg-foreground/5 rounded-xl border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Stake Account PDA</p>
                <p className="text-xs font-mono text-foreground">Seeds: ["stake", user_pubkey, stake_id]</p>
                <p className="text-[9px] mt-2 text-muted-foreground italic">Purpose: Unique isolated vault for individual delegator principal.</p>
              </div>
            </div>
          </div>
          <div className="exn-card p-8 border-border space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-widest">Vault Totals</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">3 Global Vaults</span>
                <span className="text-xs font-mono text-primary">Constant</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Validator Seeds</span>
                <span className="text-xs font-mono text-primary">N Nodes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">Stake PDAs</span>
                <span className="text-xs font-mono text-primary">M Positions</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic uppercase font-black leading-tight">
              Total system vaults = 3 + N + M. This ensures zero commingling of staker principal with protocol rewards.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Staking & Unstaking Logic */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <ArrowRightLeft className="w-8 h-8 text-emerald-500" />
          <h2 className="text-3xl font-bold uppercase tracking-widest">3. Staking & Maturity</h2>
        </div>
        <div className="exn-card p-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase text-emerald-500 tracking-[0.2em]">Staking Instruction</h4>
              <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
                <li>Create unique `Stake PDA`.</li>
                <li>Transfer `amount` from User Wallet to `Stake PDA`.</li>
                <li>Record `unlock_timestamp` based on tier (30-180 days).</li>
                <li>Capture Validator's current `global_reward_index`.</li>
                <li>Increase Validator's `total_staked` global counter.</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase text-amber-500 tracking-[0.2em]">Maturity Enforcement</h4>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <ShieldAlert className="w-4 h-4" />
                  <p className="text-[10px] uppercase font-black">Mandatory Check</p>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  assert!(Clock::get()?.unix_timestamp >= stake_account.unlock_timestamp, Error::StakeLocked);
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <h4 className="text-sm font-black uppercase text-primary mb-6">Action Separation (Atomic)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-foreground/5 rounded-2xl border border-border">
                <p className="text-xs font-black uppercase mb-3">Claim Reward</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Calculate delta between current `global_reward_index` and user's checkpoint. Transfer yield from **Global Reward Vault** to user. Reset checkpoint.
                </p>
              </div>
              <div className="p-6 bg-foreground/5 rounded-2xl border border-border">
                <p className="text-xs font-black uppercase mb-3">Unstake Principal</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transfer original principal from **Stake PDA** to user. Close Stake PDA and return rent to user. Decrease Validator's `total_staked`.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Validator Management */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <Network className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold uppercase tracking-widest">4. Validator Sharding</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="exn-card p-6 border-border space-y-4">
            <h5 className="text-xs font-black uppercase text-primary">Registration</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Requires valid `License ID`. Transfers 500 USDC to **Global License Vault**. Creates Validator metadata account.
            </p>
          </div>
          <div className="exn-card p-6 border-amber-500/20 space-y-4">
            <h5 className="text-xs font-black uppercase text-amber-500">Activation Seed</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mandatory transfer of 15M EXN to **Validator Seed PDA**. Node cannot participate in `crank` without this balance.
            </p>
          </div>
          <div className="exn-card p-6 border-emerald-500/20 space-y-4">
            <h5 className="text-xs font-black uppercase text-emerald-500">Commission</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              During `crank`, a configurable % (max 30%) of the epoch reward is diverted to the validator's reward balance.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Governance & DAO */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <Landmark className="w-8 h-8 text-secondary" />
          <h2 className="text-3xl font-bold uppercase tracking-widest">5. Governance Engine</h2>
        </div>
        <div className="exn-card p-10 border-secondary/30 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <p className="text-xs font-black uppercase tracking-widest">Proposal Creation</p>
                </div>
                <div className="p-4 bg-foreground/5 rounded-xl border border-border">
                  <p className="text-[10px] text-muted-foreground font-bold mb-2">Requirement:</p>
                  <p className="text-sm font-bold text-foreground">1M EXN Staked Weight</p>
                  <p className="text-[10px] text-secondary font-black mt-2">FEE: 10 EXN -> Treasury Vault</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <p className="text-xs font-black uppercase tracking-widest">Vote Consensus</p>
                </div>
                <div className="p-4 bg-foreground/5 rounded-xl border border-border">
                  <p className="text-[10px] text-muted-foreground font-bold mb-2">Requirement:</p>
                  <p className="text-sm font-bold text-foreground">10k EXN Staked Weight</p>
                  <p className="text-[10px] text-secondary font-black mt-2">FEE: 3 EXN -> Treasury Vault</p>
                </div>
              </div>
           </div>
           <p className="text-[10px] text-muted-foreground uppercase font-black text-center tracking-[0.2em] border-t border-border pt-8">
             Voting ends 4 hours before proposal deadline to calculate stake-weighted quorum.
           </p>
        </div>
      </section>

      {/* Footer / Call to Action */}
      <div className="pt-20 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Ready to Deploy?</h3>
          <p className="text-muted-foreground text-sm uppercase font-black tracking-widest">Target Network: Mainnet-Beta | Env: Anchor 0.29.0</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="exn-button px-10">Admin Terminal</Link>
          <Link href="/" className="exn-button-outline px-10">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
