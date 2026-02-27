
"use client";

import React, { useState } from 'react';
import { Coins, Clock, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STAKING_TIERS = [
  { days: 30, multiplier: 3000, label: '30 Days' },
  { days: 60, multiplier: 5000, label: '60 Days' },
  { days: 90, multiplier: 7500, label: '90 Days' },
  { days: 180, multiplier: 10000, label: '180 Days' },
];

export function StakingActionForm({ selectedNode, exnBalance, onStake }: { selectedNode: any, exnBalance: number, onStake: (s: any) => void }) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [isStaking, setIsStaking] = useState(true);

  const handleAction = () => {
    const numAmt = Number(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount of EXN tokens.", variant: "destructive" });
      return;
    }
    if (isStaking && numAmt > exnBalance) {
      toast({ title: "Insufficient Balance", description: `You only have ${exnBalance} EXN.`, variant: "destructive" });
      return;
    }
    if (isStaking && !selectedNode) {
      toast({ title: "No Node Selected", description: "Please select a validator from the list first.", variant: "destructive" });
      return;
    }

    if (isStaking) {
      const tier = STAKING_TIERS.find(t => t.days.toString() === duration);
      onStake({
        validator_id: selectedNode.id,
        amount: numAmt,
        lock_multiplier: tier?.multiplier || 3000,
        unlock_timestamp: Date.now() + (Number(duration) * 86400000),
        reward_checkpoint: selectedNode.global_reward_index,
        claimed: false,
        unstaked: false
      });
      toast({ title: "Phase 1 Complete", description: `Successfully staked ${amount} EXN with ${selectedNode.name}.` });
      setAmount('');
    } else {
      toast({ title: "Phase 2 Initiated", description: "Searching for unlocked stake records...", variant: "destructive" });
    }
  };

  return (
    <div className="exn-card p-8 space-y-6 sticky top-28 border-[#00f5ff]/10">
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
        <button 
          onClick={() => setIsStaking(true)}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isStaking ? 'exn-gradient-bg text-black' : 'text-white/70 hover:bg-white/5'}`}
        >
          Stake
        </button>
        <button 
          onClick={() => setIsStaking(false)}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isStaking ? 'exn-gradient-bg text-black' : 'text-white/70 hover:bg-white/5'}`}
        >
          Unstake
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-white/50 uppercase tracking-widest">Amount (EXN)</label>
            <span className="text-[10px] text-white/30">Balance: {exnBalance.toLocaleString()} EXN</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="exn-input pl-10 h-12"
            />
            <Coins className="absolute left-3 top-3.5 w-5 h-5 text-[#00f5ff]/60" />
            <button onClick={() => setAmount(exnBalance.toString())} className="absolute right-3 top-2.5 text-xs text-[#00f5ff] font-bold hover:underline">MAX</button>
          </div>
        </div>

        {isStaking && (
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Lock-up Tier (Phase 1)</label>
            <div className="grid grid-cols-2 gap-2">
              {STAKING_TIERS.map((tier) => (
                <button
                  key={tier.days}
                  onClick={() => setDuration(tier.days.toString())}
                  className={`py-3 px-2 border rounded-md transition-all flex flex-col items-center ${duration === tier.days.toString() ? 'border-[#00f5ff] bg-[#00f5ff]/10 text-[#00f5ff]' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                >
                  <span className="text-sm font-bold">{tier.label}</span>
                  <span className="text-[10px] opacity-70">Boost: {(tier.multiplier/1000).toFixed(1)}x</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Validator</span>
            <span className="text-white font-medium">{selectedNode ? selectedNode.name : 'Select a node'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Mint Address</span>
            <span className="text-white font-mono text-[10px] opacity-50">ExnUs...1111</span>
          </div>
          {isStaking && amount && (
            <div className="flex justify-between text-xs pt-2 border-t border-white/5 mt-2">
              <span className="text-emerald-400 font-bold">Estimated APR</span>
              <span className="text-emerald-400 font-bold">~14.5%</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleAction}
          className="w-full h-12 exn-button uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-5 h-5" />
          {isStaking ? 'Confirm Stake' : 'Confirm Unstake'}
        </button>

        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-400">Phase 2 Alert: Unstaking is only permitted after the lock duration expires. Full amount only.</p>
        </div>
      </div>
    </div>
  );
}
