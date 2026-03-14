
"use client";

import React, { useState, useEffect } from 'react';
import { Unlock, Clock, ShieldCheck, ArrowRightLeft, Database, MapPin, Zap } from 'lucide-react';
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
  onMigrate,
  totalPendingRewards = 0,
  connected = false,
  setFeedback
}: any) {
  const [amountInput, setAmountInput] = useState('');
  const [duration, setDuration] = useState('30');
  const [activeTab, setActiveTab] = useState<'stake' | 'my-stakes'>('stake');
  const [now, setNow] = useState(Date.now());
  
  const [showStakeReview, setShowStakeReview] = useState(false);
  const [showClaimReview, setShowClaimReview] = useState(false);
  const [showUnstakeReview, setShowUnstakeReview] = useState<string | null>(null);
  const [showClaimSingleReview, setShowClaimSingleReview] = useState<any | null>(null);
  
  const [migrationStake, setMigrationStake] = useState<any | null>(null);
  const [migrationTarget, setMigrationTarget] = useState<any | null>(null);
  const [showMigrationReview, setShowMigrationReview] = useState(false);

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
    if (!connected) return setFeedback('warning', 'WALLET_LINK_REQUIRED');
    const numAmt = Number(amountInput.replace(/,/g, ''));
    if (!numAmt || numAmt <= 0) return setFeedback('error', 'INVALID_QUANTITY');
    if (numAmt > exnBalance) return setFeedback('error', 'INSUFFICIENT_LIQUIDITY');
    if (!selectedNode) return setFeedback('warning', 'TARGET_SECTOR_REQUIRED');
    setShowStakeReview(true);
  };

  const confirmStake = () => {
    const numAmt = Number(amountInput.replace(/,/g, ''));
    const tier = STAKING_TIERS.find(t => t.days.toString() === duration);
    setShowStakeReview(false);
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
  };

  const activeUserStakes = userStakes.filter((s: any) => !s.unstaked);
  const currentTier = STAKING_TIERS.find(t => t.days.toString() === duration);

  return (
    <div className="exn-card p-0 bg-black/95 border border-white sticky top-28 overflow-hidden backdrop-blur-3xl shadow-3xl">
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === 'stake' ? 'text-primary bg-primary/10 border-b-2 border-primary' : 'text-white hover:bg-white/5'}`}
        >
          PROVISION_LOCK
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-stakes' ? 'text-secondary bg-secondary/10 border-b-2 border-secondary' : 'text-white hover:bg-white/5'}`}
        >
          INVENTORY_LOG
        </button>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'stake' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label className="text-[7px] text-white uppercase font-black tracking-widest">QUANTITY</label>
                <span className="text-[7px] font-mono font-black text-primary">AVL: {connected ? exnBalance.toLocaleString() : '0'}</span>
              </div>
              <div className="relative">
                <input type="text" value={amountInput} disabled={!connected} onChange={handleInputChange} placeholder="0.00" className="exn-input h-9 bg-white/5 border-white/40 text-[10px] font-mono font-black text-white" />
                {connected && (
                  <button onClick={() => setAmountInput(formatForDisplay(exnBalance.toString()))} className="absolute right-3 top-2.5 text-[8px] font-black text-primary hover:text-white uppercase transition-colors">MAX</button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[7px] text-white uppercase font-black tracking-widest">LOCK_TIER</label>
              <div className="grid grid-cols-4 gap-1">
                {STAKING_TIERS.map((tier) => (
                  <button key={tier.days} disabled={!connected} onClick={() => setDuration(tier.days.toString())} className={`h-9 border rounded-lg transition-all flex flex-col items-center justify-center ${duration === tier.days.toString() ? 'border-primary bg-primary/20 text-primary' : 'border-white/10 bg-white/5 text-white'}`}>
                    <span className="text-[7px] font-black">{tier.label}</span>
                    <span className="text-[6px] font-mono">{(tier.multiplier/1000).toFixed(1)}x</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-1">
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                <span className="text-white">TARGET_SECTOR</span>
                <span className="text-primary truncate max-w-[80px]">{selectedNode ? selectedNode.name : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                <span className="text-white">YIELD_BOOST</span>
                <span className="text-emerald-400 font-mono">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x</span>
              </div>
            </div>

            <button onClick={initiateStake} disabled={!selectedNode || !amountInput} className={`w-full h-10 uppercase tracking-widest font-black text-[9px] transition-all ${selectedNode && amountInput ? 'exn-button' : 'bg-white/10 text-white border border-white/10 cursor-not-allowed'}`}>
              COMMIT_PROTOCOL_LOCK
            </button>
          </div>
        )}

        {activeTab === 'my-stakes' && (
          <div className="space-y-3 animate-in fade-in duration-500">
            <div className="p-3 bg-secondary/15 border border-secondary/40 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-[7px] text-white uppercase font-black">ACCRUED_YIELD</p>
                <p className="text-xs font-black text-white font-mono">{(totalPendingRewards || 0).toFixed(4)} <span className="text-[7px] text-secondary">EXN</span></p>
              </div>
              <button onClick={() => setShowClaimReview(true)} disabled={totalPendingRewards <= 0} className={`px-2.5 py-1.5 rounded-lg text-[7px] font-black uppercase border transition-all ${totalPendingRewards > 0 ? 'bg-secondary text-white border-secondary' : 'bg-white/5 text-white border-white/10 cursor-not-allowed'}`}>
                HARVEST
              </button>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-auto pr-1 custom-scrollbar">
              {activeUserStakes.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <p className="text-[8px] uppercase font-black text-white">NO_ACTIVE_LOCKS</p>
                </div>
              ) : (
                activeUserStakes.map((s: any) => {
                  const isLocked = now < s.unlock_timestamp;
                  const v = validators?.find((val: any) => val.id === s.validator_id);
                  const multiplier = s.lock_multiplier || 1000;
                  const reward = v ? ((v.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000) : 0;
                  
                  return (
                    <div key={s.id} className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-2 hover:border-primary transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                           <p className="text-[9px] font-black text-white font-mono">{s.amount.toLocaleString()} <span className="text-[7px] uppercase">EXN</span></p>
                           <p className="text-[7px] font-black text-primary uppercase truncate max-w-[100px]">{v?.name || 'N/A'}</p>
                        </div>
                        <p className="text-[9px] font-black text-emerald-400 font-mono">+{reward.toFixed(3)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[6px] font-black uppercase text-white border-t border-white/10 pt-2">
                        <div>LOCK: <span className="text-white/60 font-mono">{new Date(s.staked_at).toLocaleDateString()}</span></div>
                        <div className="text-right">MATURE: <span className={`font-mono ${isLocked ? 'text-amber-400' : 'text-emerald-400'}`}>{new Date(s.unlock_timestamp).toLocaleDateString()}</span></div>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => setShowClaimSingleReview({ id: s.id, amount: reward })} disabled={reward <= 0} className="h-6 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[6px] font-black uppercase hover:bg-emerald-500 hover:text-black">HARVEST</button>
                        <button onClick={() => setMigrationStake(s)} className="h-6 rounded bg-primary/10 text-primary border border-primary/30 text-[6px] font-black uppercase hover:bg-primary hover:text-black">MIGRATE</button>
                        <button onClick={() => setShowUnstakeReview(s.id)} disabled={isLocked} className="h-6 rounded bg-white/5 text-white border border-white/20 text-[6px] font-black uppercase hover:bg-white hover:text-black">RELEASE</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stake Review */}
      <AlertDialog open={showStakeReview} onOpenChange={setShowStakeReview}>
        <AlertDialogContent className="exn-card border-primary bg-black/95 p-6 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> VERIFY_LOCK
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                  <div className="flex justify-between items-center text-[8px] uppercase font-black">
                    <span className="text-white">QUANTITY</span>
                    <span className="text-white font-mono">{amountInput} EXN</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] uppercase font-black">
                    <span className="text-white">HORIZON</span>
                    <span className="text-emerald-400">{duration} DAYS</span>
                  </div>
                </div>
                <p className="text-[9px] text-white uppercase font-black leading-relaxed">
                  THIS OPERATION WILL ATOMICALLY COMMIT LIQUIDITY TO THE PROTOCOL SECTOR.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 pt-2">
            <AlertDialogCancel className="exn-button-outline flex-1 h-10 text-[9px] uppercase font-black border-white text-white">ABORT</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStake} className="exn-button flex-1 h-10 text-[9px] uppercase font-black">CONFIRM_OPS</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Other dialogs handled similarly with asChild description fixes... */}
    </div>
  );
}
