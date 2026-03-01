"use client";

import React, { useState } from 'react';
import { Wallet, Info, Sparkles } from 'lucide-react';

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
  totalPendingRewards = 0,
  connected = false,
  setFeedback
}: any) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [activeTab, setActiveTab] = useState<'stake' | 'my-stakes'>('stake');

  const handleAction = () => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    const numAmt = Number(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) return setFeedback('error', 'Invalid amount specified for protocol lock.');
    if (numAmt > exnBalance) return setFeedback('error', 'Insufficient EXN balance for this staking weight.');
    if (!selectedNode) return setFeedback('warning', 'Target validator selection required to initiate stake.');

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

  if (!connected) {
    return (
      <div className="exn-card p-8 space-y-6 sticky top-28 border-border/10 flex flex-col items-center justify-center text-center py-20">
        <Wallet className="w-10 h-10 text-foreground/20 mb-4" />
        <p className="text-xs text-foreground/40 uppercase font-black tracking-widest leading-relaxed">
          Connect your Solana wallet <br/> to start staking
        </p>
      </div>
    );
  }

  return (
    <div className="exn-card p-8 space-y-6 sticky top-28 border-border/10">
      <div className="flex gap-1 p-1 bg-foreground/5 rounded-lg">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all uppercase ${activeTab === 'stake' ? 'exn-gradient-bg text-black' : 'text-foreground/40 hover:bg-foreground/5'}`}
        >
          Stake
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all uppercase ${activeTab === 'my-stakes' ? 'exn-gradient-bg text-black' : 'text-foreground/40 hover:bg-foreground/5'}`}
        >
          My Stakes & Rewards
        </button>
      </div>

      {activeTab === 'stake' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-foreground/50 uppercase tracking-widest">Amount (EXN)</label>
              <span className="text-[10px] text-foreground/30">Available: {exnBalance.toLocaleString()}</span>
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="exn-input h-12"
              />
              <button onClick={() => setAmount(exnBalance.toString())} className="absolute right-3 top-2.5 text-xs text-primary font-bold hover:underline">MAX</button>
            </div>
          </div>

          <div>
            <label className="text-xs text-foreground/50 uppercase tracking-widest mb-2 block">Lock-up Duration</label>
            <div className="grid grid-cols-2 gap-2">
              {STAKING_TIERS.map((tier) => (
                <button
                  key={tier.days}
                  onClick={() => setDuration(tier.days.toString())}
                  className={`py-3 px-2 border rounded-md transition-all flex flex-col items-center ${duration === tier.days.toString() ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50 hover:border-foreground/30'}`}
                >
                  <span className="text-sm font-bold">{tier.label}</span>
                  <span className="text-[10px] opacity-70">{(tier.multiplier/1000).toFixed(1)}x Yield</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-foreground/5 rounded-xl border border-border/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground/50 uppercase tracking-tighter">Target Node</span>
              <span className={`font-bold uppercase ${selectedNode ? 'text-primary' : 'text-foreground/20'}`}>
                {selectedNode ? selectedNode.name : 'Selection Required'}
              </span>
            </div>
            {selectedNode && (
               <div className="flex justify-between items-center text-[9px] uppercase font-bold text-foreground/30">
                 <span>Location</span>
                 <span>{selectedNode.location}</span>
               </div>
            )}
          </div>

          <button 
            onClick={handleAction} 
            disabled={!selectedNode}
            className={`w-full h-14 uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${selectedNode ? 'exn-button' : 'bg-foreground/5 text-foreground/20 border border-border cursor-not-allowed'}`}
          >
            {selectedNode ? `Confirm Stake with ${selectedNode.name}` : 'Confirm Stake'}
          </button>
        </div>
      )}

      {activeTab === 'my-stakes' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center p-6 bg-secondary/10 border border-secondary/20 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <div className="space-y-1">
              <p className="text-[10px] text-foreground/50 uppercase font-black tracking-widest">Total Claimable</p>
              <p className="text-2xl font-bold text-secondary">{totalPendingRewards.toFixed(2)} EXN</p>
              <div className="flex items-center gap-1.5 text-[8px] text-secondary/60 uppercase font-bold">
                <Sparkles className="w-2.5 h-2.5" /> Rewards accrue per Network Crank
              </div>
            </div>
            <button 
              onClick={onClaim}
              disabled={totalPendingRewards <= 0}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${totalPendingRewards > 0 ? 'bg-secondary text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:opacity-90 active:scale-95' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
            >
              Claim All
            </button>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-auto pr-2 custom-scrollbar">
            {activeUserStakes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-foreground/10 border border-dashed border-border rounded-xl">
                 <p className="text-center text-[10px] uppercase font-bold tracking-widest">No active positions</p>
              </div>
            ) : (
              activeUserStakes.map((s: any) => {
                const isLocked = Date.now() < s.unlock_timestamp;
                const validator = validators?.find((v: any) => v.id === s.validator_id);
                const pendingReward = validator ? ((validator.global_reward_index - s.reward_checkpoint) * s.amount) / REWARD_PRECISION : 0;
                
                const unlockDate = new Date(s.unlock_timestamp);
                const unlockFormatted = `${unlockDate.toLocaleDateString()} at ${unlockDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                return (
                  <div key={s.id} className="p-5 bg-foreground/5 rounded-xl border border-border/10 hover:border-border/30 transition-all space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="text-xl font-bold text-foreground">{s.amount.toLocaleString()} EXN</span>
                           <span className="text-[9px] bg-primary/20 px-2 py-0.5 rounded-full font-black text-primary uppercase">{(s.lock_multiplier/1000).toFixed(1)}x Yield</span>
                        </div>
                        <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest">{validator?.name || 'Network Node'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-emerald-500">+{pendingReward.toFixed(4)} EXN</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block ${isLocked ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {isLocked ? 'Locked' : 'Unlocked'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border/10">
                       <div className="flex justify-between items-center text-[9px] text-foreground/30 uppercase font-black">
                          <span>Principal Unlock</span>
                          <span className="text-foreground/60 font-mono">{unlockFormatted}</span>
                       </div>
                    </div>

                    {!isLocked && (
                      <button 
                        onClick={() => onUnstake(s.id)}
                        className="w-full h-10 exn-button-outline border-primary/20 text-primary text-[10px] font-black uppercase hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
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

      <div className="flex items-start gap-2 p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <div className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0">
          <Info className="w-full h-full" />
        </div>
        <p className="text-[10px] text-primary/40 leading-tight uppercase font-black tracking-tighter">
          Protocol lock periods are immutable once broadcast. Rewards are settled on every network pulse. Verify selection before signature.
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
