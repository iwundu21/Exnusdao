
"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Info, Sparkles, Lock, Unlock, Clock } from 'lucide-react';

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
    if (!rawAmount || isNaN(numAmt) || numAmt <= 0) return setFeedback('error', 'Invalid amount specified.');
    if (numAmt > exnBalance) return setFeedback('error', 'Insufficient EXN balance.');
    if (!selectedNode) return setFeedback('warning', 'Target validator selection required.');

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
          My Stakes
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
          </div>

          <button 
            onClick={handleAction} 
            disabled={isStakeDisabled}
            className={`w-full h-14 uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!isStakeDisabled ? 'exn-button' : 'bg-foreground/5 text-foreground/20 border border-border cursor-not-allowed'}`}
          >
            Stake EXN
          </button>
        </div>
      )}

      {activeTab === 'my-stakes' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center p-6 bg-secondary/10 border border-secondary/20 rounded-2xl">
            <div className="space-y-1">
              <p className="text-[10px] text-foreground/50 uppercase font-black tracking-widest">Global Claimable</p>
              <p className="text-2xl font-bold text-secondary">{totalPendingRewards.toFixed(2)} EXN</p>
            </div>
            <button 
              onClick={onClaim}
              disabled={totalPendingRewards <= 0 || !connected}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${totalPendingRewards > 0 && connected ? 'bg-secondary text-white' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
            >
              Claim All
            </button>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-auto pr-2 custom-scrollbar">
            {activeUserStakes.map((s: any) => {
              const isLocked = now < s.unlock_timestamp;
              const unlockDate = new Date(s.unlock_timestamp);
              const validator = validators?.find((v: any) => v.id === s.validator_id);
              const multiplier = s.lock_multiplier || 1000;
              const pendingReward = validator ? ((validator.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000) : 0;
              
              return (
                <div key={s.id} className="p-5 bg-foreground/5 rounded-xl border border-border/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="text-xl font-bold text-foreground">{s.amount.toLocaleString()} EXN</span>
                       <p className="text-[10px] font-black text-primary/70 uppercase">{validator?.name || 'Node'}</p>
                       <div className="flex items-center gap-1.5 pt-1">
                         {isLocked ? (
                           <div className="flex items-center gap-1 text-[9px] text-amber-500 font-black uppercase">
                             <Clock className="w-3 h-3" />
                             <span>Unlocks: {unlockDate.toLocaleDateString()}</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-black uppercase">
                             <Unlock className="w-3 h-3" />
                             <span>Principal Matured</span>
                           </div>
                         )}
                       </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-emerald-500">+{pendingReward.toFixed(2)}</p>
                      <p className="text-[8px] text-muted-foreground uppercase font-black">Yield: {(multiplier/1000).toFixed(1)}x</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onClaimSingle(s.id)} disabled={pendingReward <= 0} className={`h-10 rounded-lg text-[9px] font-black uppercase transition-all ${pendingReward > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}>Claim</button>
                    <button onClick={() => onUnstake(s.id)} disabled={isLocked} className={`h-10 rounded-lg text-[9px] font-black uppercase transition-all ${!isLocked ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}>Unstake</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
