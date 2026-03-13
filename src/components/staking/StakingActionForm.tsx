
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
    <div className="exn-card p-0 bg-black/40 border-white/5 sticky top-28 overflow-hidden backdrop-blur-xl transition-all duration-300">
      <div className="flex border-b border-white/5">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'stake' ? 'text-primary border-primary bg-primary/5' : 'text-white/30 border-transparent hover:text-white/50'}`}
        >
          Provision
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'my-stakes' ? 'text-secondary border-secondary bg-secondary/5' : 'text-white/30 border-transparent hover:text-white/50'}`}
        >
          Inventory
        </button>
      </div>

      <div className="p-8 space-y-8">
        {activeTab === 'stake' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[9px] text-white/30 uppercase font-black tracking-widest">Quantum Amount</label>
                <span className="text-[8px] font-mono text-primary/70">Bal: {connected ? exnBalance.toLocaleString() : '0.00'}</span>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={amountInput}
                  disabled={!connected}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`exn-input h-14 bg-white/5 border-white/10 text-[11px] font-mono tracking-tighter transition-all group-hover:border-primary/40 focus:border-primary ${!connected ? 'opacity-30 cursor-not-allowed' : ''}`}
                />
                {connected && (
                  <button onClick={() => setAmountInput(formatForDisplay(exnBalance.toString()))} className="absolute right-4 top-4.5 text-[8px] font-black text-primary hover:text-white transition-colors">MAX</button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] text-white/30 uppercase font-black tracking-widest block">Lock Horizon</label>
              <div className="grid grid-cols-4 gap-2">
                {STAKING_TIERS.map((tier) => (
                  <button
                    key={tier.days}
                    disabled={!connected}
                    onClick={() => setDuration(tier.days.toString())}
                    className={`h-16 border rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                      duration === tier.days.toString() 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'
                    } ${!connected ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-[10px] font-black">{tier.label}</span>
                    <span className="text-[7px] font-bold opacity-60">{(tier.multiplier/1000).toFixed(1)}x</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Protocol Target</span>
                <span className={`text-[10px] font-bold uppercase ${selectedNode ? 'text-primary' : 'text-white/10'}`}>
                  {selectedNode ? selectedNode.name : 'Unassigned'}
                </span>
              </div>
              <div className="h-px w-full bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Expected Multiplier</span>
                <span className="text-[10px] font-bold text-emerald-500">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x Yield</span>
              </div>
            </div>

            <button 
              onClick={initiateStake} 
              disabled={isStakeDisabled}
              className={`w-full h-14 uppercase tracking-[0.3em] font-black text-[10px] flex items-center justify-center gap-3 transition-all ${
                !isStakeDisabled ? 'exn-button' : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'
              }`}
            >
              Initialize Lock <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'my-stakes' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="p-8 bg-secondary/5 border border-secondary/20 rounded-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 blur-3xl group-hover:bg-secondary/20 transition-all" />
              <div className="relative z-10 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[8px] text-white/30 uppercase font-black tracking-[0.3em]">Aggregate Yield</p>
                  <p className="text-[11px] font-bold text-white font-mono tracking-tighter">{totalPendingRewards.toFixed(4)} <span className="text-[10px] text-secondary">EXN</span></p>
                </div>
                <button 
                  onClick={onClaim}
                  disabled={totalPendingRewards <= 0 || !connected}
                  className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${totalPendingRewards > 0 && connected ? 'bg-secondary text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                >
                  Harvest
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-auto pr-3 custom-scrollbar">
              {activeUserStakes.length === 0 ? (
                <div className="text-center py-20 opacity-20 border border-dashed border-white/5 rounded-2xl">
                  <CalendarDays className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] uppercase font-black tracking-[0.2em]">No Active Positions</p>
                </div>
              ) : (
                activeUserStakes.map((s: any) => {
                  const isLocked = now < s.unlock_timestamp;
                  const validator = validators?.find((v: any) => v.id === s.validator_id);
                  const multiplier = s.lock_multiplier || 1000;
                  const pendingReward = validator ? ((validator.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000) : 0;
                  
                  return (
                    <div key={s.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-6 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2">
                             <span className="text-[11px] font-bold text-white font-mono tracking-tighter">{s.amount.toLocaleString()}</span>
                             <span className="text-[8px] text-white/30 uppercase font-black">EXN</span>
                           </div>
                           <p className="text-[9px] font-black text-primary/70 uppercase tracking-widest">{validator?.name || 'Unknown Cluster'}</p>
                           
                           <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5 mt-2">
                             <div className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-widest text-white/40">
                               <Lock className="w-2.5 h-2.5" />
                               <span>Locked: {new Date(s.staked_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                             </div>
                             <div className={`flex items-center gap-1.5 text-[7px] font-black uppercase tracking-widest ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>
                               {isLocked ? <Clock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                               <span>Unlock: {new Date(s.unlock_timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-emerald-500 font-mono tracking-tighter">+{pendingReward.toFixed(4)}</p>
                          <p className="text-[7px] text-white/20 uppercase font-black mt-1">Multiplier: {(multiplier/1000).toFixed(1)}x</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => onClaimSingle(s.id)} disabled={pendingReward <= 0} className={`h-11 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${pendingReward > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}`}>Claim</button>
                        <button onClick={() => onUnstake(s.id)} disabled={isLocked} className={`h-11 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${!isLocked ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}`}>Withdraw</button>
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
          <div className="exn-card border-primary/40 bg-black/95 backdrop-blur-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" />
                Review Lock Operation
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                      <span className="text-white/30">Action</span>
                      <span className="text-white font-black">Provision Stake</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                      <span className="text-white/30">Amount</span>
                      <span className="text-primary font-mono font-bold text-[11px]">{amountInput} EXN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                      <span className="text-white/30">Target Cluster</span>
                      <span className="text-white font-bold">{selectedNode?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                      <span className="text-white/30">Yield Multiplier</span>
                      <span className="text-emerald-500 font-black">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-white/40 uppercase leading-relaxed font-bold">
                    Proceeding will lock your assets in the protocol's vault for {duration} days. This transaction is atomic and final on the network ledger.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-8">
              <AlertDialogCancel className="exn-button-outline text-[9px] h-12 uppercase font-black border-white/10 text-white hover:bg-white/5">Abort</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStake} className="exn-button text-[9px] h-12 uppercase font-black">Confirm Provisioning</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
