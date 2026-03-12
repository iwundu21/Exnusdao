
"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Info, Sparkles, Lock, Unlock } from 'lucide-react';

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
  userStakes = [], 
  validators,
  onUnstake,
  onClaim,
  onClaimSingle,
  totalPendingRewards = 0,
  connected = false,
  setFeedback
}: any) {
  const [amountInput, setAmountInput] = useState('');
  const [duration, setDuration] = useState('30');
  const [activeTab, setActiveTab] = useState<'stake' | 'my-stakes'>('stake');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Format with commas for human-readable display
  const formatForDisplay = (val: string) => {
    const raw = val.replace(/,/g, '');
    if (!raw) return '';
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const raw = val.replace(/,/g, '');
    if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
      setAmountInput(formatForDisplay(raw));
    }
  };

  const handleAction = () => {
    if (!connected) return setFeedback('warning', 'Please connect your wallet to initiate staking.');
    const rawAmount = amountInput.replace(/,/g, '');
    const numAmt = Number(rawAmount);
    if (!rawAmount || isNaN(numAmt) || numAmt <= 0) return setFeedback('error', 'Invalid amount specified for protocol lock.');
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
    setAmountInput('');
  };

  const activeUserStakes = userStakes.filter((s: any) => !s.unstaked);
  const isStakeDisabled = !selectedNode || !amountInput || Number(amountInput.replace(/,/g, '')) <= 0 || !connected;

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
              <span className="text-[10px] text-foreground/30">Available: {connected ? exnBalance.toLocaleString() : '0'}</span>
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={amountInput}
                disabled={!connected}
                onChange={handleInputChange}
                placeholder="0.00"
                className={`exn-input h-12 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {connected && (
                <button onClick={() => setAmountInput(formatForDisplay(exnBalance.toString()))} className="absolute right-3 top-2.5 text-xs text-primary font-bold hover:underline">MAX</button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-foreground/50 uppercase tracking-widest mb-2 block">Lock-up Duration</label>
            <div className="grid grid-cols-2 gap-2">
              {STAKING_TIERS.map((tier) => (
                <button
                  key={tier.days}
                  disabled={!connected}
                  onClick={() => setDuration(tier.days.toString())}
                  className={`py-3 px-2 border rounded-md transition-all flex flex-col items-center ${duration === tier.days.toString() ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50 hover:border-foreground/30'} ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            disabled={isStakeDisabled}
            className={`w-full h-14 uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!isStakeDisabled ? 'exn-button' : 'bg-foreground/5 text-foreground/20 border border-border cursor-not-allowed'}`}
          >
            {!connected ? 'Connect Wallet to Stake' : (selectedNode ? `Stake with ${selectedNode.name}` : 'Confirm Stake')}
          </button>
        </div>
      )}

      {activeTab === 'my-stakes' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center p-6 bg-secondary/10 border border-secondary/20 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <div className="space-y-1">
              <p className="text-[10px] text-foreground/50 uppercase font-black tracking-widest">Global Claimable</p>
              <p className="text-2xl font-bold text-secondary">{totalPendingRewards.toFixed(2)} EXN</p>
              <div className="flex items-center gap-1.5 text-[8px] text-secondary/60 uppercase font-bold">
                <Sparkles className="w-2.5 h-2.5" /> Earned rewards available for instant harvest
              </div>
            </div>
            <button 
              onClick={onClaim}
              disabled={totalPendingRewards <= 0 || !connected}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${totalPendingRewards > 0 && connected ? 'bg-secondary text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:opacity-90 active:scale-95' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
            >
              Claim All
            </button>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-auto pr-2 custom-scrollbar">
            {!connected ? (
               <div className="flex flex-col items-center justify-center py-10 space-y-4 text-foreground/10 border border-dashed border-border rounded-xl">
                 <Wallet className="w-8 h-8 opacity-20" />
                 <p className="text-center text-[10px] uppercase font-bold tracking-widest">Wallet Disconnected</p>
               </div>
            ) : activeUserStakes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-foreground/10 border border-dashed border-border rounded-xl">
                 <p className="text-center text-[10px] uppercase font-bold tracking-widest">No active positions</p>
              </div>
            ) : (
              activeUserStakes.map((s: any) => {
                const isLocked = now < s.unlock_timestamp;
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
                        <p className={`text-base font-black text-emerald-500`}>
                          +{pendingReward.toFixed(4)} EXN
                        </p>
                        <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 ${isLocked ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                          {isLocked ? 'Principal Locked' : 'Principal Matured'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border/10">
                       <div className="flex justify-between items-center text-[9px] text-foreground/30 uppercase font-black">
                          <span>Principal Maturity</span>
                          <span className={`font-mono ${isLocked ? 'text-amber-500/60' : 'text-emerald-500/60'}`}>{unlockFormatted}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => onClaimSingle(s.id)}
                        disabled={pendingReward <= 0.0001}
                        className={`h-10 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${pendingReward > 0.0001 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-foreground/5 text-muted-foreground cursor-not-allowed'}`}
                      >
                        <Sparkles className="w-3 h-3" /> Claim Reward
                      </button>
                      <button 
                        onClick={() => onUnstake(s.id)}
                        disabled={isLocked}
                        className={`h-10 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${!isLocked ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' : 'bg-foreground/5 text-muted-foreground cursor-not-allowed opacity-50'}`}
                      >
                        <Unlock className="w-3 h-3" /> Unstake Principal
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <Info className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-primary/40 leading-tight uppercase font-black tracking-tighter">
          Earned rewards can be harvested at any time. Unstaking of principal is only permitted after the account lock-up duration has expired.
        </p>
      </div>
    </div>
  );
}
