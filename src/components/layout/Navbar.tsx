"use client";

import React from 'react';
import { Settings, Coins, CircleDollarSign, LayoutDashboard, Ticket, Hammer, Zap } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';

export function Navbar({ 
  exnBalance: propsExnBalance = 0, 
  usdcBalance: propsUsdcBalance = 0 
}: { 
  exnBalance?: number,
  usdcBalance?: number
}) {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, setState, isLoaded } = useProtocolState();

  const currentExn = isLoaded ? state.exnBalance : propsExnBalance;
  const currentUsdc = isLoaded ? state.usdcBalance : propsUsdcBalance;

  const handleCrank = () => {
    const now = Date.now();
    let finalizedCount = 0;

    setState(prev => {
      let treasuryDelta = 0;
      let userExnDelta = 0;

      // 1. Process Governance
      const newProposals = prev.proposals.map(p => {
        if (!p.executed && now > p.deadline) {
          finalizedCount++;
          if (p.yes_votes > p.no_votes) {
            // Apply passed proposal logic
            if (p.type === 1) { // Treasury Distribution
              treasuryDelta -= p.amount;
              if (p.recipient === walletAddress) {
                userExnDelta += p.amount;
              }
            }
          }
          return { ...p, executed: true };
        }
        return p;
      });

      // 2. Synchronize Rewards (0.01% of total staked per crank)
      const newValidators = prev.validators.map(v => {
        if (!v.is_active) return v;
        
        const crankReward = v.total_staked * 0.0001; 
        const commission = (crankReward * (v.commission_rate / 10000));
        const stakerPool = crankReward - commission;
        
        return {
          ...v,
          accrued_node_rewards: (v.accrued_node_rewards || 0) + commission,
          global_reward_index: (v.global_reward_index || 0) + (stakerPool * 1_000_000 / v.total_staked)
        };
      });

      return {
        ...prev,
        validators: newValidators,
        proposals: newProposals,
        treasuryBalance: prev.treasuryBalance + treasuryDelta,
        exnBalance: prev.exnBalance + userExnDelta
      };
    });

    toast({ 
      title: "Network Cranked", 
      description: `Synchronized rewards for ${state.validators.filter(v => v.is_active).length} nodes. ${finalizedCount} proposals finalized.` 
    });
  };

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-border backdrop-blur-md sticky top-0 z-50 bg-background/80">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold exn-gradient-text tracking-wider leading-none">EXNUS</h1>
          <span className="text-[10px] text-foreground/40 tracking-[0.3em] font-bold uppercase">Protocol | Network</span>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-6 text-xs uppercase font-bold tracking-widest">
          <Link href="/" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/purchase-license" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <Ticket className="w-4 h-4" /> Buy License
          </Link>
          <Link href="/register-node" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <Hammer className="w-4 h-4" /> Register Node
          </Link>
          <Link href="/manage-node" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
            <Settings className="w-4 h-4" /> Manage Node
          </Link>
        </div>

        {connected && (
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={handleCrank}
              className="p-2 bg-primary/10 rounded-full border border-primary/20 hover:bg-primary/20 transition-all text-primary"
              title="Crank Network (Simulate Epoch Maintenance)"
            >
              <Zap className="w-4 h-4 fill-current" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-full border border-border">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">{currentExn.toLocaleString()} EXN</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-full border border-border">
              <CircleDollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">{currentUsdc.toLocaleString()} USDC</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <WalletMultiButton className="exn-wallet-button" />
        </div>
      </div>

      <style jsx global>{`
        .exn-wallet-button {
          background: linear-gradient(to right, #00f5ff, #a855f7) !important;
          color: black !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.1em !important;
          height: 40px !important;
          line-height: 40px !important;
          border-radius: 8px !important;
          padding: 0 20px !important;
          transition: all 0.3s ease !important;
        }
        .exn-wallet-button:hover {
          opacity: 0.9 !important;
          transform: scale(0.98) !important;
        }
      `}</style>
    </nav>
  );
}