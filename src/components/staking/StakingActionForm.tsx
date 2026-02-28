"use client";

import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Wallet, Info } from 'lucide-react';

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
  connected = false
}: any) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [activeTab, setActiveTab] = useState<'stake' | 'my-stakes'>('stake');

  const handleAction = () => {
    if (!connected) return toast({ title: "Wallet Connection Required", variant: "destructive" });
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
              <span className={`font-bold uppercase ${selectedNode ? 'text-primary' : 'text-destructive animate-pulse'}`}>
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
          <div className="flex justify-between items-center p-4 bg-secondary/10 border border-secondary/20 rounded-xl">
            <div>
              <p className="text-[10px] text-foreground/50 uppercase font-black">Claimable Rewards</p>
              <p className="text-xl font-bold text-secondary">{totalPendingRewards.toFixed(2)} EXN</p>
            </div>
            <button 
              onClick={onClaim}
              disabled={totalPendingRewards <= 0}
              className={`px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${totalPendingRewards > 0 ? 'bg-secondary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
            >
              Claim All
            </button>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-auto pr-2">
            {activeUserStakes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-foreground/10 border border-dashed border-border rounded-xl">
                 <p className="text-center text-[10px] uppercase font-bold tracking-widest">No active positions</p>
              </div>
            ) : (
              activeUserStakes.map((s: any) => {
                const isLocked = Date.now() < s.unlock_timestamp;
                const validator = validators?.find((v: any) => v.id === s.validator_id);
                const pendingReward = validator ? ((validator.global_reward_index - s.reward_checkpoint) * s.amount) / REWARD_PRECISION : 0;
                
                return (
                  <div key={s.id} className="p-4 bg-foreground/5 rounded-lg border border-border/10 hover:border-border transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-bold text-foreground">{s.amount.toLocaleString()} EXN</span>
                           <span className="text-[9px] bg-foreground/10 px-1.5 py-0.5 rounded font-black text-foreground/40 uppercase">{(s.lock_multiplier/1000).toFixed(1)}x</span>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase">{validator?.name || 'Unknown Node'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-500">+{pendingReward.toFixed(2)} EXN</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {isLocked ? 'Locked' : 'Unlocked'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10">
                       <div className="space-y-0.5">
                          <p className="text-[8px] text-foreground/20 uppercase font-black">Staked On</p>
                          <p className="text-[10px] text-foreground/60 font-medium">
                            {new Date(s.staked_at).toLocaleDateString()} {new Date(s.staked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                       <div className="space-y-0.5 text-right">
                          <p className="text-[8px] text-foreground/20 uppercase font-black">Unlocks At</p>
                          <p className="text-[10px] text-foreground/60 font-medium">
                            {new Date(s.unlock_timestamp).toLocaleDateString()} {new Date(s.unlock_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>

                    {!isLocked && (
                      <button 
                        onClick={() => onUnstake(s.id)}
                        className="w-full h-8 exn-button-outline text-[9px] font-black uppercase hover:bg-primary/20"
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

      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Info className="w-3.5 h-3.5 text-primary/60 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-muted-foreground leading-tight uppercase font-bold">Protocol lock periods are immutable once confirmed. Verify your selection before broadcasting.</p>
      </div>
    </div>
  );
}
