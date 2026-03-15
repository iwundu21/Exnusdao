
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProtocolSpecPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sections = [
    {
      id: "infrastructure",
      title: "LAYER_0: XNODE_SCARCITY_MODEL",
      content: "The Exnus network is governed by absolute infrastructure scarcity. Exactly 21 XNodes will ever exist on the Solana network. These are specialized infrastructure sectors (XNodes) designed for reward sharding, utilizing Solana's high-speed ledger for L1 settlement finality. Each node is initialized via a unique XNode License NFT which serves as the cryptographic authorization key."
    },
    {
      id: "seed-lifecycle",
      title: "LAYER_1: SEED_CAPITAL_&_OFFLINE_STATE",
      content: "To activate an XNode, a seed commitment of 15,000,000 EXN is required. Withdrawal of this seed capital puts the XNode into a temporary 'OFFLINE' status, halting reward accrual and commission fees. The owner may re-deposit the seed capital at any time to restore 'ONLINE' status and resume participation in network consensus."
    },
    {
      id: "termination",
      title: "LAYER_2: PERMANENT_TERMINATION_&_NFT_BURN",
      content: "XNode Termination is a permanent and irreversible protocol action. Upon termination, the XNode's registration is deleted from the global ledger, and the associated XNode License NFT is automatically burned on-chain. This action permanently reduces the available infrastructure capacity of the network and cannot be undone."
    },
    {
      id: "migration",
      title: "LAYER_3: ATOMIC_STAKE_MIGRATION",
      content: "The protocol supports Atomic Migration for all stakers. If an XNode goes offline or is permanently terminated, stakers can migrate their locked principal to any other active XNode at any time. Crucially, migration does NOT reset the original lock duration or maturity timestamp. Stakers maintain their original multipliers and yield timelines while shifting their support."
    },
    {
      id: "governance",
      title: "LAYER_4: DAO_CONSENSUS_&_TRANSACTION_PROPOSALS",
      content: "Governance is gated by stake weight. BROADCASTING A PROPOSAL requires a weight of 1,000,000 EXN and a 10 EXN fee. TRANSACTION PROPOSALS (Treasury Distributions) are restricted to the Protocol Authority for broadcasting. Once a transaction proposal achieves consensus finalization, its execution is PERMISSIONLESS; any network participant can trigger the atomic shift of assets from the protocol treasury to the recipient. VOTING requires 10,000 EXN weight and a 3 EXN fee."
    },
    {
      id: "rewards",
      title: "LAYER_5: REWARD_SHARDING_&_EPOCH_SETTLEMENT",
      content: "The protocol operates on 30-day cycles known as Epochs. At the conclusion of each Epoch, a 'Network Crank' is executed to shard the global reward pool among active XNodes. This action is PERMISSIONLESS; any network participant can settle a matured Epoch. Rewards are distributed pro-rata based on effective weight (Principal x Lock Multiplier). All rewards settle as liquid EXN on the Solana ledger."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-24 space-y-16 animate-in fade-in duration-700 pb-40">
      <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-all">
        <ArrowLeft className="w-4 h-4" /> EXIT_DOCUMENTATION
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">EXNUS_PROTOCOL_SPEC_V3.5.0_STABLE</p>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black exn-gradient-text tracking-tighter uppercase leading-none">NETWORK_BLUEPRINTS</h1>
        <p className="text-white text-[12px] font-black uppercase tracking-[0.5em] max-w-2xl leading-relaxed">
          The Exnus protocol is a decentralized infrastructure layer built on Solana, utilizing a fixed-supply 21 XNode model for reward sharding and autonomous hardware verification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {sections.map((section) => {
          return (
            <div key={section.id} className="exn-card p-10 bg-black/80 border-white/20 relative group hover:border-primary/50 transition-all shadow-3xl overflow-hidden">
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-5">
                  <h2 className="text-xl font-black text-white uppercase tracking-widest">{section.title}</h2>
                </div>

                <div className="space-y-6">
                   <p className="text-[13px] text-white font-medium leading-relaxed border-l-2 border-primary/30 pl-8 tracking-tight italic">
                     {section.content}
                   </p>
                   
                   <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                     ON_CHAIN_VERIFIED_PROTOCOL_LAYER
                   </div>
                </div>
              </div>
            </div>
          );
        section.content})}
      </div>

      <div className="exn-card p-12 bg-primary/5 border-primary/40 text-center space-y-8 shadow-3xl">
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">ESTABLISH_INFRASTRUCTURE</h3>
          <p className="text-[11px] text-white font-black uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
            Initialize your sector on the global ledger. Mint your authorization key and register your XNode to begin consensus participation.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
           <Link href="/purchase-license" className="exn-button px-10 h-12 flex items-center gap-3 text-[11px] tracking-widest">
             MINT_LICENSE
           </Link>
           <Link href="/register-node" className="exn-button-outline px-10 h-12 flex items-center gap-3 text-[11px] tracking-widest border-white/30 text-white">
             REGISTER_XNODE
           </Link>
        </div>
      </div>
    </div>
  );
}
