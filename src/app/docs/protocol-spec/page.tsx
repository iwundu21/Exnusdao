
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
      title: "LAYER_0: XNODE_INFRASTRUCTURE_SCARCITY",
      content: "The Exnus network is built on a model of absolute infrastructure scarcity. Exactly 21 XNodes will ever exist on the Solana network. Each node is initialized via a unique XNode License NFT which acts as a cryptographic authorization key. Unlike traditional L1 validators, these XNodes are specialized infrastructure sectors designed for reward sharding and autonomous hardware verification, utilizing Solana's high-speed ledger for L1 settlement finality."
    },
    {
      id: "registration",
      title: "LAYER_1: AUTONOMOUS_REGISTRATION_PROTOCOL",
      content: "XNode registration is an atomic handshake between a License NFT and a hardware identity. During registration, the protocol autonomously tracks the owner's physical origin via a secure network diagnostic, synchronizing the country and flag to the global ledger. This process requires an active License NFT and prevents sector spoofing through automated geolocation verification."
    },
    {
      id: "seed-termination",
      title: "LAYER_2: SEED_CAPITAL_&_TERMINATION",
      content: "To activate an XNode, the owner must commit 15,000,000 EXN as seed capital. This capital remains vaulted as a network reliability bond. If an XNode owner withdraws this seed capital, the node is immediately decommissioned to a permanent 'OFFLINE' status. A decommissioned node stops accruing protocol rewards and commission fees, and the associated License NFT is burned from the network supply."
    },
    {
      id: "migration",
      title: "LAYER_3: STAKING_&_ATOMIC_MIGRATION",
      content: "Stakers commit EXN tokens to specific XNodes to generate network weight and earn yield. The protocol supports Atomic Migration: stakers can shift their locked principal from one active XNode to another at any time. Migration does not reset the original lock duration or maturity timestamp, ensuring that liquidity can move to more reliable sectors without penalizing the staker's long-term multipliers."
    },
    {
      id: "governance",
      title: "LAYER_4: DAO_CONSENSUS_GOVERNANCE",
      content: "Governance is strictly gated by stake weight. Broadcasting a new proposal requires a 'Senior Consensus' weight of 1,000,000 EXN and a 10 EXN protocol fee. To participate in voting, a user must maintain a 'Member Consensus' weight of 10,000 EXN (or hold a verified XNode License) and pay a 3 EXN fee per vote. These thresholds ensure that only committed stakeholders can influence global protocol parameters."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-24 space-y-16 animate-in fade-in duration-700 pb-40">
      <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-all">
        <ArrowLeft className="w-4 h-4" /> EXIT_DOCUMENTATION
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">EXNUS_PROTOCOL_SPEC_V3.2.0_STABLE</p>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black exn-gradient-text tracking-tighter uppercase leading-none">HOW_IT_WORKS</h1>
        <p className="text-white text-[12px] font-black uppercase tracking-[0.5em] max-w-2xl leading-relaxed">
          The Exnus protocol is a decentralized infrastructure layer built on Solana, utilizing a fixed-supply XNode model for reward sharding and autonomous hardware verification.
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
        })}
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
