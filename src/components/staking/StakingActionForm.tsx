
"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Unlock, Clock, ShieldCheck, ChevronRight, LockIcon } from 'lucide-react';
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
    <div className="exn-card p-0 bg-black/80 border-white/10 sticky top-[100px] lg:top-32 overflow-hidden backdrop-blur-3xl transition-all duration-300 z-10 shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 ${activeTab === 'stake' ? 'text-primary border-primary bg-primary/10' : 'text-white/20 border-transparent hover:text-white/60 hover:bg-white/5'}`}
        >
          PROVISION
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 ${activeTab === 'my-stakes' ? 'text-secondary border-secondary bg-secondary/10' : 'text-white/20 border-transparent hover:text-white/60 hover:bg-white/5'}`}
        >
          INVENTORY
        </button>
      </div>

      <div className="p-8 space-y-8">
        {activeTab === 'stake' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em]">STAKE_AMOUNT</label>
                <span className="text-[10px] font-mono font-black text-primary/60 tracking-tight">AVL: {connected ? exnBalance.toLocaleString() : '0.00'}</span>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={amountInput}
                  disabled={!connected}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`exn-input h-12 bg-white/5 border-white/10 text-[11px] font-mono font-black tracking-tighter transition-all group-hover:border-primary/40 focus:border-primary ${!connected ? 'opacity-30 cursor-not-allowed' : ''}`}
                />
                {connected && (
                  <button onClick={() => setAmountInput(formatForDisplay(exnBalance.toString()))} className="absolute right-4 top-3.5 text-[9px] font-black text-primary hover:text-white transition-colors">MAX_CAP</button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] block">LOCK_PERIOD_TIER</label>
              <div className="grid grid-cols-4 gap-3">
                {STAKING_TIERS.map((tier) => (
                  <button
                    key={tier.days}
                    disabled={!connected}
                    onClick={() => setDuration(tier.days.toString())}
                    className={`h-16 border rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                      duration === tier.days.toString() 
                        ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/20' 
                        : 'border-white/10 bg-white/5 text-white/30 hover:border-white/30 hover:bg-white/10'
                    } ${!connected ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-[9px] font-black tracking-widest">{tier.label}</span>
                    <span className="text-[9px] font-mono font-black opacity-60">{(tier.multiplier/1000).toFixed(1)}x</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">VALIDATOR</span>
                <span className={`font-black uppercase tracking-tighter text-[11px] ${selectedNode ? 'text-primary' : 'text-white/10'} truncate max-w-[150px]`}>
                  {selectedNode ? selectedNode.name : 'UNASSIGNED_SECTOR'}
                </span>
              </div>
              <div className="h-px w-full bg-white/5" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">MULTIPLIER</span>
                <span className="font-black text-emerald-500 font-mono text-[11px] tracking-tighter">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x_BOOST</span>
              </div>
            </div>

            <button 
              onClick={initiateStake} 
              disabled={isStakeDisabled}
              className={`w-full h-14 uppercase tracking-[0.5em] font-black text-[11px] flex items-center justify-center gap-3 transition-all shadow-2xl ${
                !isStakeDisabled ? 'exn-button' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed'
              }`}
            >
              COMMIT_STAKE <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'my-stakes' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="p-6 bg-secondary/10 border border-secondary/40 rounded-xl relative overflow-hidden group/yield">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary/20 blur-3xl group-hover/yield:bg-secondary/30 transition-all" />
              <div className="relative z-10 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.4em]">ACCRUED_YIELD</p>
                  <p className="text-[17px] font-black text-white font-mono tracking-tighter">{(totalPendingRewards || 0).toFixed(4)} <span className="text-[10px] text-secondary/60 ml-1">EXN</span></p>
                </div>
                <button 
                  onClick={onClaim}
                  disabled={totalPendingRewards <= 0 || !connected}
                  className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${totalPendingRewards > 0 && connected ? 'bg-secondary text-white hover:opacity-90 active:scale-95 shadow-secondary/40' : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/10'}`}
                >
                  HARVEST_ALL
                </button>
              </div>
            </div>

            <div className="space-y-5 max-h-[450px] overflow-auto pr-3 custom-scrollbar">
              {activeUserStakes.length === 0 ? (
                <div className="text-center py-20 opacity-20 border-2 border-dashed border-white/10 rounded-2xl">
                  <Clock className="w-12 h-12 mx-auto mb-6 opacity-40" />
                  <p className="text-[11px] uppercase font-black tracking-[0.4em]">NO_ACTIVE_POSITIONS</p>
                </div>
              ) : (
                activeUserStakes.map((s: any) => {
                  const isLocked = now < s.unlock_timestamp;
                  const validator = validators?.find((v: any) => v.id === s.validator_id);
                  const multiplier = s.lock_multiplier || 1000;
                  const pendingReward = validator ? ((validator.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000) : 0;
                  
                  return (
                    <div key={s.id} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6 hover:border-white/30 transition-all shadow-xl group/stake">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                             <span className="text-[14px] font-black text-white font-mono tracking-tighter">{(s.amount || 0).toLocaleString()}</span>
                             <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">EXN</span>
                           </div>
                           <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] truncate max-w-[150px]">{validator?.name || 'NETWORK_VALIDATOR'}</p>
                           
                           <div className="flex flex-col gap-2 pt-4 border-t border-white/5 mt-4">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                               <LockIcon className="w-3.5 h-3.5 text-white/20" />
                               <span className="font-mono">LOCKED: {new Date(s.staked_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                             </div>
                             <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>
                               {isLocked ? <Clock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                               <span className="font-mono">UNLOCK: {new Date(s.unlock_timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-black text-emerald-500 font-mono tracking-tighter">+{pendingReward.toFixed(4)}</p>
                          <p className="text-[10px] text-white/20 uppercase font-black mt-2 tracking-widest">{(multiplier/1000).toFixed(1)}x_BOOST</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <button onClick={() => onClaimSingle(s.id)} disabled={pendingReward <= 0} className={`h-10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${pendingReward > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500/20 shadow-lg' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed'}`}>HARVEST</button>
                        <button onClick={() => onUnstake(s.id)} disabled={isLocked} className={`h-10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${!isLocked ? 'bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20 shadow-lg' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed'}`}>WITHDRAW</button>
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
        <AlertDialogContent className="exn-card border-primary/50 bg-black/95 backdrop-blur-3xl p-0 overflow-hidden max-w-md">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" />
                VERIFY_LOCK
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-6">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4 shadow-3xl">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                      <span className="text-white/30 font-black">OP_CODE</span>
                      <span className="text-white font-black font-mono">STAKE_PROVISION</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                      <span className="text-white/30 font-black">QUANTITY</span>
                      <span className="text-primary font-mono font-black text-[12px]">{amountInput} EXN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                      <span className="text-white/30 font-black">BOOST_TIER</span>
                      <span className="text-emerald-500 font-black font-mono text-[12px]">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-white/40 uppercase leading-relaxed font-black tracking-tight">
                    BY CONFIRMING, YOU AUTHORIZE A PROTOCOL LOCK FOR {duration} DAYS. THIS TRANSACTION IS IMMUTABLE ON THE NETWORK LEDGER.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 text-[10px] h-12 uppercase font-black border-white/20 text-white hover:bg-white/10">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStake} className="exn-button flex-1 text-[10px] h-12 uppercase font-black">CONFIRM_LOCK</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
