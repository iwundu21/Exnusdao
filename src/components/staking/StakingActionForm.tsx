
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
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
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

  const startProcessing = (action: string, callback: () => void) => {
    setIsProcessing(action);
    setTimeout(() => {
      callback();
      setIsProcessing(null);
    }, 6000);
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
    setShowStakeReview(false);
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
  };

  const initiateMigrate = (stake: any) => setMigrationStake(stake);
  const selectMigrationTarget = (target: any) => {
    setMigrationTarget(target);
    setShowMigrationReview(true);
  };

  const confirmMigration = () => {
    if (!migrationStake || !migrationTarget) return;
    setShowMigrationReview(false);
    setMigrationStake(null);
    startProcessing('MIGRATE_SECTOR', () => {
      onMigrate(migrationStake.id, migrationStake.amount, migrationStake.validator_id, migrationTarget.id);
      setMigrationTarget(null);
    });
  };

  const confirmClaimAll = () => {
    setShowClaimReview(false);
    startProcessing('HARVEST_YIELD', () => onClaim());
  };

  const confirmUnstake = () => {
    if (!showUnstakeReview) return;
    const sId = showUnstakeReview;
    const s = userStakes.find((x: any) => x.id === sId);
    setShowUnstakeReview(null);
    startProcessing('WITHDRAW_PRINCIPAL', () => onUnstake(s.id, s.amount, s.validator_id));
  };

  const confirmClaimSingle = () => {
    if (!showClaimSingleReview) return;
    const sId = showClaimSingleReview.id;
    setShowClaimSingleReview(null);
    startProcessing('HARVEST_YIELD', () => onClaimSingle(sId));
  };

  const activeUserStakes = userStakes.filter((s: any) => !s.unstaked);
  const currentTier = STAKING_TIERS.find(t => t.days.toString() === duration);

  return (
    <div className="exn-card p-0 bg-black/90 border border-white sticky top-32 overflow-hidden backdrop-blur-3xl transition-all duration-300 z-10 shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
      <div className="flex border-b border-white">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'stake' ? 'text-primary border-primary bg-primary/10' : 'text-white border-transparent hover:bg-white/5'}`}
        >
          PROVISION
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'my-stakes' ? 'text-secondary border-secondary bg-secondary/10' : 'text-white border-transparent hover:bg-white/5'}`}
        >
          INVENTORY
        </button>
      </div>

      <div className="p-5 space-y-5">
        {activeTab === 'stake' && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[9px] text-white uppercase font-black tracking-widest">STAKE_AMOUNT</label>
                <span className="text-[9px] font-mono font-black text-primary">AVL: {connected ? exnBalance.toLocaleString() : '0.00'}</span>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={amountInput}
                  disabled={!connected || !!isProcessing}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="exn-input h-11 bg-white/5 border-white text-[11px] font-mono font-black tracking-tight"
                />
                {connected && !isProcessing && (
                  <button onClick={() => setAmountInput(formatForDisplay(exnBalance.toString()))} className="absolute right-3 top-3 text-[9px] font-black text-primary hover:text-white uppercase transition-colors">MAX</button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-white uppercase font-black tracking-widest">LOCK_TIER</label>
              <div className="grid grid-cols-4 gap-1.5">
                {STAKING_TIERS.map((tier) => (
                  <button
                    key={tier.days}
                    disabled={!connected || !!isProcessing}
                    onClick={() => setDuration(tier.days.toString())}
                    className={`h-12 border rounded-lg transition-all flex flex-col items-center justify-center ${
                      duration === tier.days.toString() 
                        ? 'border-primary bg-primary/20 text-primary' 
                        : 'border-white/20 bg-white/5 text-white'
                    }`}
                  >
                    <span className="text-[9px] font-black">{tier.label}</span>
                    <span className="text-[8px] font-mono">{(tier.multiplier/1000).toFixed(1)}x</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/20 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-white uppercase font-black">VALIDATOR</span>
                <span className="font-black text-primary uppercase truncate max-w-[120px]">
                  {selectedNode ? selectedNode.name : 'UNASSIGNED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-white uppercase font-black">YIELD_BOOST</span>
                <span className="font-black text-emerald-400 font-mono">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x</span>
              </div>
            </div>

            <button 
              onClick={initiateStake} 
              disabled={!!isProcessing || !selectedNode || !amountInput || Number(amountInput.replace(/,/g, '')) <= 0}
              className={`w-full h-12 uppercase tracking-[0.4em] font-black text-[10px] flex items-center justify-center gap-2 transition-all ${
                !isProcessing && selectedNode && amountInput ? 'exn-button' : 'bg-white/5 text-white border border-white/20 cursor-not-allowed'
              }`}
            >
              {isProcessing === 'COMMIT_STAKE' ? 'PROCESSING_STAKE...' : 'COMMIT_STAKE'}
            </button>
          </div>
        )}

        {activeTab === 'my-stakes' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-4 bg-secondary/10 border border-secondary/40 rounded-xl flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-[9px] text-white uppercase font-black tracking-widest">TOTAL_YIELD</p>
                <p className="text-base font-black text-white font-mono tracking-tighter">{(totalPendingRewards || 0).toFixed(4)} <span className="text-[8px] text-secondary">EXN</span></p>
              </div>
              <button 
                onClick={() => setShowClaimReview(true)}
                disabled={totalPendingRewards <= 0 || !!isProcessing}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${totalPendingRewards > 0 && !isProcessing ? 'bg-secondary text-white shadow-lg hover:opacity-90' : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'}`}
              >
                {isProcessing === 'HARVEST_YIELD' ? 'HARVESTING...' : 'HARVEST_ALL'}
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-auto pr-1 custom-scrollbar">
              {activeUserStakes.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-8 h-8 mx-auto mb-3 text-white/40" />
                  <p className="text-[9px] uppercase font-black text-white/60 tracking-[0.3em]">NO_ACTIVE_LOCKS</p>
                </div>
              ) : (
                activeUserStakes.map((s: any) => {
                  const isLocked = now < s.unlock_timestamp;
                  const v = validators?.find((val: any) => val.id === s.validator_id);
                  const multiplier = s.lock_multiplier || 1000;
                  const reward = v ? ((v.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000) : 0;
                  
                  return (
                    <div key={s.id} className="p-4 bg-white/5 border border-white/20 rounded-xl space-y-3 group/stake hover:border-primary/50 transition-all shadow-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <div className="flex items-center gap-1.5">
                             <span className="text-[13px] font-black text-white font-mono">{(s.amount || 0).toLocaleString()}</span>
                             <span className="text-[8px] text-white font-black uppercase">EXN</span>
                           </div>
                           <p className="text-[9px] font-black text-primary uppercase truncate max-w-[140px] tracking-tight">{v?.name || 'VALIDATOR'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-black text-emerald-400 font-mono">+{reward.toFixed(4)}</p>
                          <p className="text-[8px] text-white font-black uppercase mt-0.5">{(multiplier/1000).toFixed(1)}x_BOOST</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2.5 border-t border-white/10">
                        <div className="flex flex-col">
                           <span className="text-[7px] text-white uppercase font-black tracking-widest">LOCKED</span>
                           <span className="text-[9px] font-mono text-white font-black">{new Date(s.staked_at).toLocaleDateString([], { dateStyle: 'short' })}</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[7px] text-white uppercase font-black tracking-widest">UNLOCKS</span>
                           <span className={`text-[9px] font-mono font-black ${isLocked ? 'text-amber-400' : 'text-emerald-400'}`}>{new Date(s.unlock_timestamp).toLocaleDateString([], { dateStyle: 'short' })}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button onClick={() => setShowClaimSingleReview({ id: s.id, amount: reward })} disabled={reward <= 0 || !!isProcessing} className="h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 text-[8px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all">HARVEST</button>
                        <button onClick={() => initiateMigrate(s)} disabled={!!isProcessing} className="h-8 rounded-lg bg-primary/10 text-primary border border-primary/40 text-[8px] font-black uppercase hover:bg-primary hover:text-black transition-all">MIGRATE</button>
                        <button onClick={() => setShowUnstakeReview(s.id)} disabled={isLocked || !!isProcessing} className="h-8 rounded-lg bg-white/5 text-white border border-white/20 text-[8px] font-black uppercase hover:bg-white hover:text-black transition-all">WITHDRAW</button>
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
        <AlertDialogContent className="exn-card border-primary bg-black p-8 space-y-8 overflow-hidden max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-black uppercase tracking-widest text-primary flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" /> VERIFY_LOCK
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-6 pt-4">
                <div className="p-5 bg-white/5 border border-white/20 rounded-xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-white">QUANTITY</span>
                    <span className="text-white font-mono">{amountInput} EXN</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-white">LOCK_PERIOD</span>
                    <span className="text-emerald-400">{duration} DAYS</span>
                  </div>
                </div>
                <p className="text-[10px] text-white uppercase leading-relaxed font-black tracking-tight">
                  CONFIRMING WILL BROADCAST AN IMMUTABLE STAKING COMMITMENT TO THE NETWORK LEDGER.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-4 pt-2">
            <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white text-white hover:bg-white/10">ABORT</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStake} className="exn-button flex-1 h-11 text-[10px] uppercase font-black">CONFIRM_LOCK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Claim All Review */}
      <AlertDialog open={showClaimReview} onOpenChange={setShowClaimReview}>
        <AlertDialogContent className="exn-card border-secondary bg-black p-8 space-y-8 overflow-hidden max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-black uppercase tracking-widest text-secondary flex items-center gap-3">
              <Zap className="w-5 h-5" /> VERIFY_HARVEST
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-6 pt-4">
                <div className="p-5 bg-white/5 border border-white/20 rounded-xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-white">TOTAL_YIELD</span>
                    <span className="text-secondary font-mono">{totalPendingRewards.toFixed(4)} EXN</span>
                  </div>
                </div>
                <p className="text-[10px] text-white uppercase leading-relaxed font-black tracking-tight">
                  YIELD WILL BE ATOMICALLY TRANSFERRED TO YOUR CONNECTED WALLET BALANCE.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-4 pt-2">
            <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white text-white">ABORT</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClaimAll} className="exn-button flex-1 h-11 text-[10px] uppercase font-black bg-secondary">CONFIRM_HARVEST</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Migration Selector Dialog */}
      <AlertDialog open={!!migrationStake && !showMigrationReview} onOpenChange={() => setMigrationStake(null)}>
        <AlertDialogContent className="exn-card border-primary bg-black p-8 space-y-8 overflow-hidden max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-black uppercase tracking-widest text-primary flex items-center gap-3">
              <ArrowRightLeft className="w-5 h-5" /> SELECT_TARGET_SECTOR
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-6 pt-4">
                <p className="text-[10px] text-white uppercase font-black tracking-widest">CHOOSE A NEW VALIDATOR SECTOR FOR THIS STAKE POSITION:</p>
                <div className="space-y-3 max-h-[350px] overflow-auto custom-scrollbar pr-2">
                  {validators.filter((v: any) => v.is_active && v.id !== migrationStake?.validator_id).map((v: any) => (
                    <button 
                      key={v.id} 
                      onClick={() => selectMigrationTarget(v)}
                      className="w-full p-4 bg-white/5 border border-white/20 rounded-xl hover:border-primary transition-all flex justify-between items-center group shadow-md"
                    >
                      <div className="flex items-center gap-4 text-left">
                         <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                           <Database className="w-4 h-4 text-primary" />
                         </div>
                         <div>
                           <p className="text-[11px] font-black uppercase text-white tracking-tight">{v.name}</p>
                           <div className="flex items-center gap-2 text-[9px] text-white font-black uppercase">
                             <MapPin className="w-3.5 h-3.5" /> {v.location}
                           </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-emerald-400 font-mono">{(v.commission_rate/100).toFixed(1)}%</p>
                         <p className="text-[8px] text-white font-black uppercase">FEE_TIER</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel className="exn-button-outline w-full h-11 text-[10px] uppercase font-black border-white text-white" onClick={() => setMigrationStake(null)}>ABORT_MIGRATION</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Migration Review */}
      <AlertDialog open={showMigrationReview} onOpenChange={setShowMigrationReview}>
        <AlertDialogContent className="exn-card border-primary bg-black p-8 space-y-8 overflow-hidden max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-black uppercase tracking-widest text-primary flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" /> VERIFY_MIGRATION
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-6 pt-4">
                <div className="p-5 bg-white/5 border border-white/20 rounded-xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-white">QUANTITY</span>
                    <span className="text-white font-mono">{migrationStake?.amount.toLocaleString()} EXN</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-white">TARGET</span>
                    <span className="text-primary truncate max-w-[150px]">{migrationTarget?.name}</span>
                  </div>
                </div>
                <p className="text-[10px] text-white uppercase leading-relaxed font-black tracking-tight">
                  MIGRATING ASSETS WILL REROUTE FUTURE REWARD SHARDING TO THE TARGET NETWORK SECTOR.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-4 pt-2">
            <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white text-white" onClick={() => setShowMigrationReview(false)}>ABORT</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMigration} className="exn-button flex-1 h-11 text-[10px] uppercase font-black">CONFIRM_MIGRATION</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unstake Review */}
      <AlertDialog open={!!showUnstakeReview} onOpenChange={() => setShowUnstakeReview(null)}>
        <AlertDialogContent className="exn-card border-destructive bg-black p-8 space-y-8 overflow-hidden max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-black uppercase tracking-widest text-destructive flex items-center gap-3">
              <Unlock className="w-5 h-5" /> VERIFY_WITHDRAWAL
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-6 pt-4">
                <div className="p-5 bg-white/5 border border-white/20 rounded-xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-white">PRINCIPAL</span>
                    <span className="text-white font-mono">{userStakes.find((x: any) => x.id === showUnstakeReview)?.amount.toLocaleString()} EXN</span>
                  </div>
                </div>
                <p className="text-[10px] text-destructive uppercase leading-relaxed font-black tracking-tight">
                  WITHDRAWING PRINCIPAL WILL TERMINATE THIS ACTIVE STAKE POSITION ON THE NETWORK LEDGER.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-4 pt-2">
            <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white text-white" onClick={() => setShowUnstakeReview(null)}>ABORT</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnstake} className="bg-destructive text-white flex-1 h-11 text-[10px] uppercase font-black rounded-xl hover:opacity-90">CONFIRM_WITHDRAW</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Claim Single Review */}
      <AlertDialog open={!!showClaimSingleReview} onOpenChange={() => setShowClaimSingleReview(null)}>
        <AlertDialogContent className="exn-card border-secondary bg-black p-8 space-y-8 overflow-hidden max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-black uppercase tracking-widest text-secondary flex items-center gap-3">
              <Zap className="w-5 h-5" /> VERIFY_HARVEST
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-6 pt-4">
                <div className="p-5 bg-white/5 border border-white/20 rounded-xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-white">POSITION_YIELD</span>
                    <span className="text-secondary font-mono">{showClaimSingleReview?.amount.toFixed(4)} EXN</span>
                  </div>
                </div>
                <p className="text-[10px] text-white uppercase leading-relaxed font-black tracking-tight">
                  YIELD WILL BE ATOMICALLY TRANSFERRED TO YOUR CONNECTED WALLET BALANCE.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-4 pt-2">
            <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white text-white" onClick={() => setShowClaimSingleReview(null)}>ABORT</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClaimSingle} className="exn-button flex-1 h-11 text-[10px] uppercase font-black bg-secondary">CONFIRM_HARVEST</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
