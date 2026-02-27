
"use client";

import React, { useState } from 'react';
import { Coins, Clock, ArrowRightLeft, AlertCircle, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STAKING_TIERS = [
  { days: 30, multiplier: 3000, label: '30 Days' },
  { days: 60, multiplier: 5000, label: '60 Days' },
  { days: 90, multiplier: 7500, label: '90 Days' },
  { days: 180, multiplier: 10000, label: '180 Days' },
];

export function StakingActionForm({ selectedNode, exnBalance, onStake, userStakes, onUnstake }: any) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [isStaking, setIsStaking] = useState(true);

  const handleAction = () => {
    const numAmt = Number(amount);
    if (isStaking) {
      if (!amount || isNaN(numAmt) || numAmt <= 0) return toast({ title: "Invalid Amount", variant: "destructive" });
      if (numAmt > exnBalance) return toast({ title: "Insufficient Balance", variant: "destructive" });
      if (!selectedNode) return toast({ title: "Select Validator", variant: "destructive" });

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
      setAmount('');
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
          My Stakes
        </button>
      </div>

      {isStaking ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-white/50 uppercase tracking-widest">Amount (EXN)</label>
              <span className="text-[10px] text-white/30">Available: {exnBalance.toLocaleString()}</span>
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

          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Lock-up Duration</label>
            <div className="grid grid-cols-2 gap-2">
              {STAKING_TIERS.map((tier) => (
                <button
                  key={tier.days}
                  onClick={() => setDuration(tier.days.toString())}
                  className={`py-3 px-2 border rounded-md transition-all flex flex-col items-center ${duration === tier.days.toString() ? 'border-[#00f5ff] bg-[#00f5ff]/10 text-[#00f5ff]' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                >
                  <span className="text-sm font-bold">{tier.label}</span>
                  <span className="text-[10px] opacity-70">{(tier.multiplier/1000).toFixed(1)}x Yield</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Node</span>
              <span className="text-white font-medium">{selectedNode ? selectedNode.name : 'Not Selected'}</span>
            </div>
            {selectedNode && (
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Commission Fee</span>
                <span className="text-white">{(selectedNode.commission_rate/100).toFixed(1)}%</span>
              </div>
            )}
          </div>

          <button onClick={handleAction} className="w-full h-12 exn-button uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowRightLeft className="w-5 h-5" /> Confirm Stake
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
          {userStakes.filter((s: any) => !s.unstaked).length === 0 ? (
            <p className="text-center text-white/30 text-xs py-10">No active stake records.</p>
          ) : (
            userStakes.filter((s: any) => !s.unstaked).map((s: any) => {
              const isLocked = Date.now() < s.unlock_timestamp;
              return (
                <div key={s.id} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-white">{s.amount.toLocaleString()} EXN</p>
                      <p className="text-[10px] text-white/40 uppercase">Multiplier: {(s.lock_multiplier/1000).toFixed(1)}x</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black ${isLocked ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      {isLocked ? 'Locked' : 'Unlocked'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/50">
                    <Calendar className="w-3 h-3" />
                    Unlock: {new Date(s.unlock_timestamp).toLocaleDateString()}
                  </div>
                  {!isLocked && (
                    <button 
                      onClick={() => onUnstake(s.id)}
                      className="w-full py-2 bg-emerald-500 text-black text-[10px] font-bold rounded uppercase hover:bg-emerald-400"
                    >
                      Unstake Funds
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-red-400">Rule: Unstaking is full-amount only and permitted exclusively after the lock period expires.</p>
      </div>
    </div>
  );
}
