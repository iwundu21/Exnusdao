"use client";

import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const STAKING_TIERS = [
  { days: 30, multiplier: 3000, label: '30 Days' },
  { days: 60, multiplier: 5000, label: '60 Days' },
  { days: 90, multiplier: 7500, label: '90 Days' },
  { days: 180, multiplier: 10000, label: '180 Days' },
];

const REWARD_PRECISION = 1_000_000;

export function StakingActionForm({ 
  selectedNode, 
  exnBalance, 
  onStake, 
  userStakes, 
  validators,
  onUnstake,
  onClaim,
  totalPendingRewards = 0
}: any) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [activeTab, setActiveTab] = useState<'stake' | 'my-stakes'>('stake');

  const handleAction = () => {
    const numAmt = Number(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) return toast({ title: "Invalid Amount", variant: "destructive" });
    if (numAmt > exnBalance) return toast({ title: "Insufficient Balance", variant: "destructive" });
    if (!selectedNode) return toast({ title: "Select Validator", description: "Please pick a validator from the list first.", variant: "destructive" });

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
  };

  const activeUserStakes = userStakes.filter((s: any) => !s.unstaked);

  return (
    <div className="exn-card p-8 space-y-6 sticky top-28 border-[#00f5ff]/10">
      <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all uppercase ${activeTab === 'stake' ? 'exn-gradient-bg text-black' : 'text-white/40 hover:bg-white/5'}`}
        >
          Stake
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all uppercase ${activeTab === 'my-stakes' ? 'exn-gradient-bg text-black' : 'text-white/40 hover:bg-white/5'}`}
        >
          My Stakes & Rewards
        </button>
      </div>

      {activeTab === 'stake' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
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
                className="exn-input h-12"
              />
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
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50 uppercase tracking-tighter">Target Node</span>
              <span className={`font-bold uppercase ${selectedNode ? 'text-[#00f5ff]' : 'text-red-400 animate-pulse'}`}>
                {selectedNode ? selectedNode.name : 'Selection Required'}
              </span>
            </div>
            {selectedNode && (
               <div className="flex justify-between items-center text-[9px] uppercase font-bold text-white/30">
                 <span>Location</span>
                 <span>{selectedNode.location}</span>
               </div>
            )}
          </div>

          <button 
            onClick={handleAction} 
            disabled={!selectedNode}
            className={`w-full h-14 uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${selectedNode ? 'exn-button' : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'}`}
          >
            {selectedNode ? `Confirm Stake with ${selectedNode.name}` : 'Confirm Stake'}
          </button>
        </div>
      )}

      {activeTab === 'my-stakes' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center p-4 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl">
            <div>
              <p className="text-[10px] text-white/50 uppercase font-black">Claimable Rewards</p>
              <p className="text-xl font-bold text-[#a855f7]">{totalPendingRewards.toFixed(2)} EXN</p>
            </div>
            <button 
              onClick={onClaim}
              disabled={totalPendingRewards <= 0}
              className={`px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${totalPendingRewards > 0 ? 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
            >
              Claim All
            </button>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-auto pr-2">
            {activeUserStakes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-white/10 border border-dashed border-white/5 rounded-xl">
                 <p className="text-center text-[10px] uppercase font-bold tracking-widest">No active positions</p>
              </div>
            ) : (
              activeUserStakes.map((s: any) => {
                const isLocked = Date.now() < s.unlock_timestamp;
                const validator = validators?.find((v: any) => v.id === s.validator_id);
                const pendingReward = validator ? ((validator.global_reward_index - s.reward_checkpoint) * s.amount) / REWARD_PRECISION : 0;
                
                return (
                  <div key={s.id} className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-bold text-white">{s.amount.toLocaleString()} EXN</span>
                           <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-black text-white/40 uppercase">{(s.lock_multiplier/1000).toFixed(1)}x</span>
                        </div>
                        <p className="text-[10px] font-black text-[#00f5ff] uppercase">{validator?.name || 'Unknown Node'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-400">+{pendingReward.toFixed(2)} EXN</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isLocked ? 'text-amber-500' : 'text-emerald-400'}`}>
                          {isLocked ? 'Locked' : 'Unlocked'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                       <div className="space-y-0.5">
                          <p className="text-[8px] text-white/20 uppercase font-black">Staked On</p>
                          <p className="text-[10px] text-white/60 font-medium">
                            {new Date(s.staked_at).toLocaleDateString()} {new Date(s.staked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                       <div className="space-y-0.5 text-right">
                          <p className="text-[8px] text-white/20 uppercase font-black">Unlocks At</p>
                          <p className="text-[10px] text-white/60 font-medium">
                            {new Date(s.unlock_timestamp).toLocaleDateString()} {new Date(s.unlock_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>

                    {!isLocked && (
                      <button 
                        onClick={() => onUnstake(s.id)}
                        className="w-full h-8 exn-button-outline text-[9px] font-black uppercase hover:bg-[#00f5ff]/20"
                      >
                        Unstake Principal & Rewards
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-[10px] text-red-400 leading-tight uppercase font-bold">Protocol lock periods are immutable once confirmed. Verify your selection before broadcasting.</p>
      </div>
    </div>
  );
}
