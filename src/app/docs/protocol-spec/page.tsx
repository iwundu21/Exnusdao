
"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Terminal,
  Activity,
  ArrowRight,
  Cpu
} from 'lucide-react';
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
      title: "LAYER_0: INFRASTRUCTURE_AUTHORIZATION",
      content: "The foundation of the Exnus network is built upon the XNode License NFT standard. Every validator must mint a unique Metaplex-standard NFT to act as a cryptographic authorization key. This on-chain asset grants the holder permission to register infrastructure and participate in the protocol's reward sharding mechanism. The supply of licenses is strictly capped by the protocol's global parameter, ensuring infrastructure scarcity and network stability."
    },
    {
      id: "registration",
      title: "LAYER_1: REGISTRATION_PROTOCOL",
      content: "XNode Registration is an atomic handshake between a License NFT and a validator identity. During this process, the system autonomously tracks the owner's physical origin via a secure network diagnostic, synchronizing the country and flag to the global ledger. This automated geolocation prevents sector spoofing and ensures transparent infrastructure distribution across the network's geographic layers."
    },
    {
      id: "economic",
      title: "LAYER_2: ECONOMIC_STAKING_LOGIC",
      content: "The Exnus Economic Layer utilizes a time-locked staking model. Users lock EXN tokens into specific validator sectors to generate network weight. Staking tiers (30D, 60D, 90D, 180D) provide non-linear yield multipliers (up to 10.0x), rewarding long-term capital commitment. All staked principal is vaulted on-chain and can only be released after the maturity timestamp is verified by the network clock."
    },
    {
      id: "consensus",
      title: "LAYER_3: EPOCH_SETTLEMENT_CRANK",
      content: "Network rewards are distributed in 30-day epoch cycles. At the conclusion of each epoch, the 'Crank' function settles the global reward block. Rewards are sharded among active validators based on their proportional network weight (Seed Capital + Delegated Stakes). This settlement update reshards the Global Reward Index, allowing individual stakers to harvest their accrued yield based on their specific entry and exit checkpoints."
    },
    {
      id: "governance",
      title: "LAYER_4: DAO_CONSENSUS_GOVERNANCE",
      content: "Exnus operates under a stake-weighted DAO governance model. Participation is strictly gated by on-chain stake weight. To cast a vote, a user must hold a verified XNode License or maintain a minimum stake of 10,000 EXN (plus a 3 EXN fee). Broadcasting a new proposal requires a senior consensus weight of 1,000,000 EXN and a 10 EXN protocol fee. Consensus is reached through on-chain voting where decision weight equals locked EXN volume."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-24 space-y-16 animate-in fade-in duration-700 pb-40">
      <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-all">
        <ArrowLeft className="w-4 h-4" /> EXIT_DOCUMENTATION
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-primary" />
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">EXNUS_PROTOCOL_SPEC_V3.1.0_STABLE</p>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black exn-gradient-text tracking-tighter uppercase leading-none">HOW_IT_WORKS</h1>
        <p className="text-white text-[12px] font-black uppercase tracking-[0.5em] max-w-2xl leading-relaxed">
          The Exnus protocol is a decentralized infrastructure network (DePIN) sharding rewards through stake-weighted consensus and autonomous hardware verification.
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
                     <Activity className="w-4 h-4" />
                     ON_CHAIN_VERIFIED_PROTOCOL
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
            Initialize your sector on the global ledger. Mint your authorization key and register your validator node to begin consensus participation.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
           <Link href="/purchase-license" className="exn-button px-10 h-12 flex items-center gap-3 text-[11px] tracking-widest">
             MINT_LICENSE <ArrowRight className="w-4 h-4" />
           </Link>
           <Link href="/register-node" className="exn-button-outline px-10 h-12 flex items-center gap-3 text-[11px] tracking-widest border-white/30 text-white">
             REGISTER_NODE <Cpu className="w-4 h-4" />
           </Link>
        </div>
      </div>
    </div>
  );
}
