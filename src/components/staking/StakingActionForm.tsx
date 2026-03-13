"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Info, Sparkles, Lock, Unlock, Clock, CalendarDays, ShieldCheck, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STAKING_TIERS = [
  { days: 30, multiplier: 3000, label: '30D' },
  { days: 60, multiplier: 5000, label: '60D' },
  { days: 90, multiplier: 7500, label: '90D' },
  { days: 180, multiplier: 10000, label: '180D' },
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
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
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

  const initiateStake = () => {
    if (!connected) return setFeedback('warning', 'Please connect your wallet to initiate staking.');
    const rawAmount = amountInput.replace(/,/g, '');
    const numAmt = Number(rawAmount);
    if (!rawAmount || isNaN(numAmt) || numAmt <= 0) return setFeedback('error', 'Invalid amount specified.');
    if (numAmt > exnBalance) return setFeedback('error', 'Insufficient EXN balance.');
    if (!selectedNode) return setFeedback('warning', 'Target validator selection required.');
    
    setShowReview(true);
  };

  const confirmStake = () => {
    const rawAmount = amountInput.replace(/,/g, '');
    const numAmt = Number(rawAmount);
    const tier = STAKING_TIERS.find(t => t.days.toString() === duration);
    
    onStake({
      validator_id: selectedNode.id,
      amount: numAmt,
      lock_multiplier: tier?.multiplier || 3000,
      staked_at: Date.now(),
      unlock_timestamp: Date.now() + (Number(duration) * 86400000),
      reward_checkpoint: selectedNode.global_reward_index,
      claimed: false,
      unstaked: false
    });
    setAmountInput('');
    setShowReview(false);
  };

  const activeUserStakes = userStakes.filter((s: any) => !s.unstaked);
  const isStakeDisabled = !selectedNode || !amountInput || Number(amountInput.replace(/,/g, '')) <= 0 || !connected;
  const currentTier = STAKING_TIERS.find(t => t.days.toString() === duration);

  return (
    <div className="exn-card p-0 bg-black/60 border-white/10 sticky top-[100px] lg:top-28 overflow-hidden backdrop-blur-2xl transition-all duration-300 z-10 shadow-3xl">
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'stake' ? 'text-primary border-primary bg-primary/10' : 'text-white/30 border-transparent hover:text-white/60 hover:bg-white/5'}`}
        >
          Provision
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'my-stakes' ? 'text-secondary border-secondary bg-secondary/10' : 'text-white/30 border-transparent hover:text-white/60 hover:bg-white/5'}`}
        >
          Inventory
        </button>
      </div>

      <div className="p-10 space-y-10">
        {activeTab === 'stake' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Stake Amount</label>
                <span className="text-[10px] font-mono font-bold text-primary/80">Available: {connected ? exnBalance.toLocaleString() : '0.00'}</span>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={amountInput}
                  disabled={!connected}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`exn-input h-14 bg-white/5 border-white/10 text-sm font-mono tracking-tighter transition-all group-hover:border-primary/40 focus:border-primary ${!connected ? 'opacity-30 cursor-not-allowed' : ''}`}
                />
                {connected && (
                  <button onClick={() => setAmountInput(formatForDisplay(exnBalance.toString()))} className="absolute right-5 top-4.5 text-[10px] font-black text-primary hover:text-white transition-colors">MAX</button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block">Lock Period</label>
              <div className="grid grid-cols-4 gap-3">
                {STAKING_TIERS.map((tier) => (
                  <button
                    key={tier.days}
                    disabled={!connected}
                    onClick={() => setDuration(tier.days.toString())}
                    className={`h-16 border rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 ${
                      duration === tier.days.toString() 
                        ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/10' 
                        : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'
                    } ${!connected ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-[11px] font-black">{tier.label}</span>
                    <span className="text-[9px] font-bold opacity-60">{(tier.multiplier/1000).toFixed(1)}x</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Validator</span>
                <span className={`font-bold uppercase tracking-tight ${selectedNode ? 'text-primary' : 'text-white/20'} truncate max-w-[150px]`}>
                  {selectedNode ? selectedNode.name : 'Unassigned'}
                </span>
              </div>
              <div className="h-px w-full bg-white/10" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Multiplier</span>
                <span className="font-bold text-emerald-500 font-mono">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x</span>
              </div>
            </div>

            <button 
              onClick={initiateStake} 
              disabled={isStakeDisabled}
              className={`w-full h-14 uppercase tracking-[0.4em] font-black text-xs flex items-center justify-center gap-3 transition-all ${
                !isStakeDisabled ? 'exn-button' : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
              }`}
            >
              COMMIT STAKE <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {activeTab === 'my-stakes' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="p-8 bg-secondary/10 border border-secondary/30 rounded-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary/20 blur-3xl group-hover:bg-secondary/30 transition-all" />
              <div className="relative z-10 flex justify-between items-center">
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em]">Total Rewards</p>
                  <p className="text-lg font-bold text-white font-mono tracking-tighter">{totalPendingRewards.toFixed(4)} <span className="text-xs text-secondary/70">EXN</span></p>
                </div>
                <button 
                  onClick={onClaim}
                  disabled={totalPendingRewards <= 0 || !connected}
                  className={`px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${totalPendingRewards > 0 && connected ? 'bg-secondary text-white shadow-xl shadow-secondary/30' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                >
                  HARVEST ALL
                </button>
              </div>
            </div>

            <div className="space-y-5 max-h-[500px] overflow-auto pr-4 custom-scrollbar">
              {activeUserStakes.length === 0 ? (
                <div className="text-center py-24 opacity-30 border-2 border-dashed border-white/5 rounded-2xl">
                  <CalendarDays className="w-12 h-12 mx-auto mb-6 opacity-50" />
                  <p className="text-[11px] uppercase font-black tracking-[0.2em]">No Active Positions</p>
                </div>
              ) : (
                activeUserStakes.map((s: any) => {
                  const isLocked = now < s.unlock_timestamp;
                  const validator = validators?.find((v: any) => v.id === s.validator_id);
                  const multiplier = s.lock_multiplier || 1000;
                  const pendingReward = validator ? ((validator.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000) : 0;
                  
                  return (
                    <div key={s.id} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6 hover:border-white/20 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                             <span className="text-sm font-bold text-white font-mono tracking-tighter">{s.amount.toLocaleString()}</span>
                             <span className="text-[10px] text-white/40 uppercase font-black">EXN</span>
                           </div>
                           <p className="text-[11px] font-black text-primary uppercase tracking-widest truncate max-w-[150px]">{validator?.name || 'Network Validator'}</p>
                           
                           <div className="flex flex-col gap-2 pt-4 border-t border-white/10 mt-4">
                             <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-white/50">
                               <Lock className="w-4 h-4 text-white/20" />
                               <span className="font-mono">Locked: {new Date(s.staked_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                             </div>
                             <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>
                               {isLocked ? <Clock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                               <span className="font-mono">Unlock: {new Date(s.unlock_timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-500 font-mono tracking-tighter">+{pendingReward.toFixed(4)}</p>
                          <p className="text-[10px] text-white/30 uppercase font-black mt-2">{(multiplier/1000).toFixed(1)}x Boost</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <button onClick={() => onClaimSingle(s.id)} disabled={pendingReward <= 0} className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pendingReward > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'}`}>Claim Reward</button>
                        <button onClick={() => onUnstake(s.id)} disabled={isLocked} className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLocked ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20' : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'}`}>Withdraw</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showReview} onOpenChange={setShowReview}>
        <AlertDialogContent asChild>
          <div className="exn-card border-primary/50 bg-black/95 backdrop-blur-2xl mx-4 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-4">
                <ShieldCheck className="w-7 h-7" />
                VERIFY PROTOCOL LOCK
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-8 pt-8">
                  <div className="p-8 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                      <span className="text-white/40 font-black">OPERATION</span>
                      <span className="text-white font-black">NETWORK_STAKE_PROVISION</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                      <span className="text-white/40 font-black">ASSET QUANTITY</span>
                      <span className="text-primary font-mono font-black text-sm">{amountInput} EXN</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                      <span className="text-white/40 font-black">BOOST MULTIPLIER</span>
                      <span className="text-emerald-500 font-black font-mono">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-white/40 uppercase leading-relaxed font-bold tracking-tight">
                    By confirming, you authorize a protocol lock for {duration} days. This transaction is immutable on the network ledger.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-10 flex flex-row gap-4">
              <AlertDialogCancel className="exn-button-outline flex-1 text-[11px] h-14 uppercase font-black border-white/10 text-white hover:bg-white/10 mt-0">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStake} className="exn-button flex-1 text-[11px] h-14 uppercase font-black">CONFIRM LOCK</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}