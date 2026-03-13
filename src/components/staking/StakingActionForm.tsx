
"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Unlock, Clock, ShieldCheck, ChevronRight, LockIcon, ArrowRightLeft, Database, MapPin, Zap } from 'lucide-react';
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
  
  // Action States
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Review States
  const [showStakeReview, setShowStakeReview] = useState(false);
  const [showClaimReview, setShowClaimReview] = useState(false);
  const [showUnstakeReview, setShowUnstakeReview] = useState<string | null>(null);
  const [showClaimSingleReview, setShowClaimSingleReview] = useState<any | null>(null);
  
  // Migration States
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

  const startProcessing = (action: string, callback: () => void) => {
    setIsProcessing(action);
    callback();
    setTimeout(() => {
      setIsProcessing(null);
    }, 6500);
  };

  const initiateStake = () => {
    if (!connected) return setFeedback('warning', 'Please connect your wallet.');
    const numAmt = Number(amountInput.replace(/,/g, ''));
    if (!numAmt || numAmt <= 0) return setFeedback('error', 'Invalid amount.');
    if (numAmt > exnBalance) return setFeedback('error', 'Insufficient EXN balance.');
    if (!selectedNode) return setFeedback('warning', 'Select a validator first.');
    setShowStakeReview(true);
  };

  const confirmStake = () => {
    const numAmt = Number(amountInput.replace(/,/g, ''));
    const tier = STAKING_TIERS.find(t => t.days.toString() === duration);
    startProcessing('COMMIT_STAKE', () => {
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
    });
    setShowStakeReview(false);
  };

  const initiateMigrate = (stake: any) => {
    setMigrationStake(stake);
  };

  const selectMigrationTarget = (target: any) => {
    setMigrationTarget(target);
    setShowMigrationReview(true);
  };

  const confirmMigration = () => {
    if (!migrationStake || !migrationTarget) return;
    startProcessing('MIGRATE_SECTOR', () => {
      onMigrate(migrationStake.id, migrationStake.amount, migrationStake.validator_id, migrationTarget.id);
    });
    setMigrationStake(null);
    setMigrationTarget(null);
    setShowMigrationReview(false);
  };

  const confirmClaimAll = () => {
    startProcessing('HARVEST_YIELD', () => onClaim());
    setShowClaimReview(false);
  };

  const confirmUnstake = () => {
    if (!showUnstakeReview) return;
    const s = userStakes.find((x: any) => x.id === showUnstakeReview);
    startProcessing('WITHDRAW_PRINCIPAL', () => onUnstake(s.id, s.amount, s.validator_id));
    setShowUnstakeReview(null);
  };

  const confirmClaimSingle = () => {
    if (!showClaimSingleReview) return;
    startProcessing('HARVEST_YIELD', () => onClaimSingle(showClaimSingleReview.id));
    setShowClaimSingleReview(null);
  };

  const activeUserStakes = userStakes.filter((s: any) => !s.unstaked);
  const currentTier = STAKING_TIERS.find(t => t.days.toString() === duration);

  return (
    <div className="exn-card p-0 bg-black/80 border-white/10 sticky top-32 overflow-hidden backdrop-blur-3xl transition-all duration-300 z-10 shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-2 ${activeTab === 'stake' ? 'text-primary border-primary bg-primary/10' : 'text-white/20 border-transparent hover:text-white/60 hover:bg-white/5'}`}
        >
          PROVISION
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-2 ${activeTab === 'my-stakes' ? 'text-secondary border-secondary bg-secondary/10' : 'text-white/20 border-transparent hover:text-white/60 hover:bg-white/5'}`}
        >
          INVENTORY
        </button>
      </div>

      <div className="p-6 space-y-6">
        {activeTab === 'stake' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">STAKE_AMOUNT</label>
                <span className="text-[10px] font-mono font-black text-primary/60">AVL: {connected ? exnBalance.toLocaleString() : '0.00'}</span>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={amountInput}
                  disabled={!connected || !!isProcessing}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="exn-input h-10 bg-white/5 border-white/10 text-[11px] font-mono font-black tracking-tighter"
                />
                {connected && !isProcessing && (
                  <button onClick={() => setAmountInput(formatForDisplay(exnBalance.toString()))} className="absolute right-4 top-2.5 text-[9px] font-black text-primary hover:text-white uppercase transition-colors">MAX</button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">LOCK_TIER</label>
              <div className="grid grid-cols-4 gap-2">
                {STAKING_TIERS.map((tier) => (
                  <button
                    key={tier.days}
                    disabled={!connected || !!isProcessing}
                    onClick={() => setDuration(tier.days.toString())}
                    className={`h-12 border rounded-lg transition-all flex flex-col items-center justify-center ${
                      duration === tier.days.toString() 
                        ? 'border-primary bg-primary/20 text-primary' 
                        : 'border-white/5 bg-white/5 text-white/30'
                    }`}
                  >
                    <span className="text-[9px] font-black">{tier.label}</span>
                    <span className="text-[8px] font-mono opacity-60">{(tier.multiplier/1000).toFixed(1)}x</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white/20 uppercase font-black">VALIDATOR</span>
                <span className="font-black text-primary uppercase truncate max-w-[120px]">
                  {selectedNode ? selectedNode.name : 'UNASSIGNED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white/20 uppercase font-black">YIELD_BOOST</span>
                <span className="font-black text-emerald-500 font-mono">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x</span>
              </div>
            </div>

            <button 
              onClick={initiateStake} 
              disabled={!!isProcessing || !selectedNode || !amountInput || Number(amountInput.replace(/,/g, '')) <= 0}
              className={`w-full h-12 uppercase tracking-[0.3em] font-black text-[10px] flex items-center justify-center gap-2 transition-all ${
                !isProcessing && selectedNode && amountInput ? 'exn-button' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed'
              }`}
            >
              {isProcessing === 'COMMIT_STAKE' ? 'COMMITTING_STAKE...' : 'COMMIT_STAKE'}
            </button>
          </div>
        )}

        {activeTab === 'my-stakes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-4 bg-secondary/10 border border-secondary/40 rounded-xl flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-[10px] text-white/30 uppercase font-black">TOTAL_YIELD</p>
                <p className="text-sm font-black text-white font-mono tracking-tighter">{(totalPendingRewards || 0).toFixed(4)} <span className="text-[9px] text-secondary/60">EXN</span></p>
              </div>
              <button 
                onClick={() => setShowClaimReview(true)}
                disabled={totalPendingRewards <= 0 || !!isProcessing}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all ${totalPendingRewards > 0 && !isProcessing ? 'bg-secondary text-white' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
              >
                {isProcessing === 'HARVEST_YIELD' ? 'HARVESTING...' : 'HARVEST_ALL'}
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
              {activeUserStakes.length === 0 ? (
                <div className="text-center py-16 opacity-20">
                  <Clock className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[10px] uppercase font-black">NO_ACTIVE_LOCKS</p>
                </div>
              ) : (
                activeUserStakes.map((s: any) => {
                  const isLocked = now < s.unlock_timestamp;
                  const v = validators?.find((val: any) => val.id === s.validator_id);
                  const multiplier = s.lock_multiplier || 1000;
                  const reward = v ? ((v.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000) : 0;
                  
                  return (
                    <div key={s.id} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4 group/stake">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-black text-white font-mono">{(s.amount || 0).toLocaleString()}</span>
                             <span className="text-[9px] text-white/30 font-black uppercase">EXN</span>
                           </div>
                           <p className="text-[9px] font-black text-primary uppercase truncate max-w-[140px]">{v?.name || 'VALIDATOR'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-emerald-500 font-mono">+{reward.toFixed(4)}</p>
                          <p className="text-[8px] text-white/20 uppercase font-black mt-1">{(multiplier/1000).toFixed(1)}x_BOOST</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-white/5">
                        <div className="flex flex-col">
                           <span className="text-[8px] text-white/20 uppercase font-black">LOCKED_AT</span>
                           <span className="text-[9px] font-mono text-white/60">{new Date(s.staked_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[8px] text-white/20 uppercase font-black">UNLOCKS_AT</span>
                           <span className={`text-[9px] font-mono ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>{new Date(s.unlock_timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setShowClaimSingleReview({ id: s.id, amount: reward })} disabled={reward <= 0 || !!isProcessing} className="h-8 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[9px] font-black uppercase">HARVEST</button>
                        <button onClick={() => initiateMigrate(s)} disabled={!!isProcessing} className="h-8 rounded bg-primary/10 text-primary border border-primary/30 text-[9px] font-black uppercase">MIGRATE</button>
                        <button onClick={() => setShowUnstakeReview(s.id)} disabled={isLocked || !!isProcessing} className="h-8 rounded bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase">WITHDRAW</button>
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
        <AlertDialogContent className="exn-card border-primary/50 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-6 space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> VERIFY_LOCK
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">QUANTITY</span>
                      <span className="text-white font-mono font-black">{amountInput} EXN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">LOCK_PERIOD</span>
                      <span className="text-emerald-500 font-black">{duration} DAYS</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase leading-relaxed font-black">CONFIRMING WILL BROADCAST AN IMMUTABLE STAKING COMMITMENT TO THE NETWORK.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3">
              <AlertDialogCancel className="exn-button-outline flex-1 h-10 text-[9px] uppercase font-black">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStake} className="exn-button flex-1 h-10 text-[9px] uppercase font-black">CONFIRM_LOCK</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Claim All Review */}
      <AlertDialog open={showClaimReview} onOpenChange={setShowClaimReview}>
        <AlertDialogContent className="exn-card border-secondary/50 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-6 space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-2">
                <Zap className="w-5 h-5" /> VERIFY_HARVEST
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">TOTAL_YIELD</span>
                      <span className="text-secondary font-mono font-black">{totalPendingRewards.toFixed(4)} EXN</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase leading-relaxed font-black">YIELD WILL BE ATOMICALLY TRANSFERRED TO YOUR WALLET BALANCE.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3">
              <AlertDialogCancel className="exn-button-outline flex-1 h-10 text-[9px] uppercase font-black">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmClaimAll} className="exn-button flex-1 h-10 text-[9px] uppercase font-black bg-secondary">CONFIRM_HARVEST</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Migration Selector Dialog */}
      <AlertDialog open={!!migrationStake && !showMigrationReview} onOpenChange={() => setMigrationStake(null)}>
        <AlertDialogContent className="exn-card border-primary/50 bg-black/95 p-0 overflow-hidden max-w-md">
          <div className="p-6 space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" /> SELECT_TARGET_SECTOR
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <p className="text-[10px] text-white/40 uppercase font-black">CHOOSE A NEW VALIDATOR FOR THIS STAKE POSITION:</p>
                  <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar pr-2">
                    {validators.filter((v: any) => v.is_active && v.id !== migrationStake?.validator_id).map((v: any) => (
                      <button 
                        key={v.id} 
                        onClick={() => selectMigrationTarget(v)}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary/50 transition-all flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3 text-left">
                           <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                             <Database className="w-4 h-4 text-primary" />
                           </div>
                           <div>
                             <p className="text-[11px] font-black uppercase text-white tracking-tight">{v.name}</p>
                             <div className="flex items-center gap-2 text-[8px] text-white/30 font-black uppercase">
                               <MapPin className="w-3 h-3" /> {v.location}
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-emerald-500">{(v.commission_rate/100).toFixed(1)}% FEE</p>
                           <p className="text-[8px] text-white/20 font-black uppercase">NODE_WEIGHT</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="exn-button-outline w-full h-10 text-[9px] uppercase font-black">ABORT_MIGRATION</AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Migration Review */}
      <AlertDialog open={showMigrationReview} onOpenChange={setShowMigrationReview}>
        <AlertDialogContent className="exn-card border-primary/50 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-6 space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> VERIFY_MIGRATION
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">QUANTITY</span>
                      <span className="text-white font-mono font-black">{migrationStake?.amount.toLocaleString()} EXN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">TARGET</span>
                      <span className="text-primary font-black uppercase truncate max-w-[150px]">{migrationTarget?.name}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase leading-relaxed font-black">MIGRATING ASSETS WILL REROUTE FUTURE REWARD SHARDING TO THE TARGET SECTOR.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3">
              <AlertDialogCancel className="exn-button-outline flex-1 h-10 text-[9px] uppercase font-black" onClick={() => setShowMigrationReview(false)}>ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMigration} className="exn-button flex-1 h-10 text-[9px] uppercase font-black">CONFIRM_MIGRATION</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unstake Review */}
      <AlertDialog open={!!showUnstakeReview} onOpenChange={() => setShowUnstakeReview(null)}>
        <AlertDialogContent className="exn-card border-destructive/50 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-6 space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-destructive flex items-center gap-2">
                <Unlock className="w-5 h-5" /> VERIFY_WITHDRAWAL
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">PRINCIPAL</span>
                      <span className="text-white font-mono font-black">{userStakes.find((x: any) => x.id === showUnstakeReview)?.amount.toLocaleString()} EXN</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-destructive/60 uppercase leading-relaxed font-black">WITHDRAWING PRINCIPAL WILL TERMINATE THIS STAKE POSITION ON THE NETWORK LEDGER.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3">
              <AlertDialogCancel className="exn-button-outline flex-1 h-10 text-[9px] uppercase font-black">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmUnstake} className="bg-destructive text-white flex-1 h-10 text-[9px] uppercase font-black rounded-xl">CONFIRM_WITHDRAW</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
