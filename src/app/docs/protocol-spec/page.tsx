
"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Landmark, 
  Globe, 
  Database, 
  ArrowLeft,
  Terminal,
  Activity,
  Lock,
  ArrowRight
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
      icon: ShieldCheck,
      title: "LAYER_0: INFRASTRUCTURE_AUTHORIZATION",
      content: "The foundation of the Exnus network is built upon the XNode License NFT standard. Every validator must mint a unique Metaplex-standard NFT to act as a cryptographic authorization key. This on-chain asset grants the holder permission to register infrastructure and participate in the protocol's reward sharding mechanism. The supply of licenses is strictly capped by the protocol's global parameter, ensuring infrastructure scarcity and network stability."
    },
    {
      id: "registration",
      icon: Cpu,
      title: "LAYER_1: REGISTRATION_PROTOCOL",
      content: "XNode Registration is an atomic handshake between a License NFT and a validator identity. During this process, the system autonomously tracks the owner's physical origin via a secure network diagnostic, synchronizing the country and flag to the global ledger. This automated geolocation prevents sector spoofing and ensures transparent infrastructure distribution across the network's geographic layers."
    },
    {
      id: "economic",
      icon: Database,
      title: "LAYER_2: ECONOMIC_STAKING_LOGIC",
      content: "The Exnus Economic Layer utilizes a time-locked staking model. Users lock EXN tokens into specific validator sectors to generate network weight. Staking tiers (30D, 60D, 90D, 180D) provide non-linear yield multipliers (up to 10.0x), rewarding long-term capital commitment. All staked principal is vaulted on-chain and can only be released after the maturity timestamp is verified by the network clock."
    },
    {
      id: "consensus",
      icon: Zap,
      title: "LAYER_3: EPOCH_SETTLEMENT_CRANK",
      content: "Network rewards are distributed in 30-day epoch cycles. At the conclusion of each epoch, the 'Crank' function settles the global reward block. Rewards are sharded among active validators based on their proportional network weight (Seed Capital + Delegated Stakes). This settlement update reshards the Global Reward Index, allowing individual stakers to harvest their accrued yield based on their specific entry and exit checkpoints."
    },
    {
      id: "governance",
      icon: Landmark,
      title: "LAYER_4: DAO_CONSENSUS_GOVERNANCE",
      content: "Exnus operates under a stake-weighted DAO governance model. Any validator or major staker can broadcast proposals to adjust protocol parameters or distribute treasury capital. Consensus is reached through on-chain voting, where the weight of each decision is equal to the voter's locked EXN weight. Proposals require a verified majority and a concluding execution phase to enact atomic changes to the protocol's global state."
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
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">EXNUS_PROTOCOL_SPEC_V3.0.2_STABLE</p>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black exn-gradient-text tracking-tighter uppercase leading-none">HOW_IT_WORKS</h1>
        <p className="text-white text-[12px] font-black uppercase tracking-[0.5em] max-w-2xl leading-relaxed">
          The Exnus protocol is a decentralized infrastructure network (DePIN) sharding rewards through stake-weighted consensus and autonomous hardware verification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="exn-card p-10 bg-black/80 border-white/20 relative group hover:border-primary/50 transition-all shadow-3xl overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all">
                <Icon className="w-32 h-32 text-primary" />
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-primary/15 rounded-2xl border border-primary/30 shadow-2xl">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
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
