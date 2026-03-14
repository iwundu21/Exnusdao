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
  const [migrationTargetId, setMigrationTargetId] = useState('');
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

  const initiateMigration = () => {
    if (!migrationStake || !migrationTargetId) return;
    if (migrationStake.validator_id === migrationTargetId) return setFeedback('warning', 'IDENTICAL_SECTOR_MIGRATION');
    setShowMigrationReview(true);
  };

  const confirmMigration = () => {
    if (!migrationStake || !migrationTargetId) return;
    onMigrate(migrationStake.id, migrationStake.amount, migrationStake.validator_id, migrationTargetId);
    setMigrationStake(null);
    setMigrationTargetId('');
    setShowMigrationReview(false);
  };

  const activeUserStakes = userStakes.filter((s: any) => !s.unstaked);
  const currentTier = STAKING_TIERS.find(t => t.days.toString() === duration);

  return (
    <div className="exn-card p-0 bg-black/95 border border-white sticky top-28 overflow-hidden backdrop-blur-3xl shadow-3xl">
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stake' ? 'text-primary bg-primary/10 border-b-2 border-primary' : 'text-white hover:bg-white/5'}`}
        >
          PROVISION_LOCK
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-stakes' ? 'text-secondary bg-secondary/10 border-b-2 border-secondary' : 'text-white hover:bg-white/5'}`}
        >
          INVENTORY_LOG
        </button>
      </div>

      <div className="p-5 space-y-5">
        {activeTab === 'stake' && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[9px] text-white uppercase font-black tracking-widest">QUANTITY</label>
                <span className="text-[10px] font-mono font-black text-primary">AVL: {connected ? exnBalance.toLocaleString() : '0'}</span>
              </div>
              <div className="relative">
                <input type="text" value={amountInput} disabled={!connected} onChange={handleInputChange} placeholder="0.00" className="exn-input h-10 bg-white/5 border-white/40 text-[11px] font-mono font-black text-white" />
                {connected && (
                  <button onClick={() => setAmountInput(formatForDisplay(exnBalance.toString()))} className="absolute right-4 top-2.5 text-[9px] font-black text-primary hover:text-white uppercase transition-colors">MAX</button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-white uppercase font-black tracking-widest">LOCK_TIER</label>
              <div className="grid grid-cols-4 gap-2">
                {STAKING_TIERS.map((tier) => (
                  <button key={tier.days} disabled={!connected} onClick={() => setDuration(tier.days.toString())} className={`h-10 border rounded-lg transition-all flex flex-col items-center justify-center ${duration === tier.days.toString() ? 'border-primary bg-primary/20 text-primary' : 'border-white/20 bg-white/5 text-white'}`}>
                    <span className="text-[9px] font-black">{tier.label}</span>
                    <span className="text-[8px] font-mono">{(tier.multiplier/1000).toFixed(1)}x</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/20 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-white">TARGET_SECTOR</span>
                <span className="text-primary truncate max-w-[120px]">{selectedNode ? selectedNode.name : 'UNASSIGNED'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-white">YIELD_BOOST</span>
                <span className="text-emerald-400 font-mono">{(Number(currentTier?.multiplier || 3000)/1000).toFixed(1)}x</span>
              </div>
            </div>

            <button onClick={initiateStake} disabled={!selectedNode || !amountInput} className={`w-full h-12 uppercase tracking-widest font-black text-[10px] transition-all shadow-xl ${selectedNode && amountInput ? 'exn-button' : 'bg-white/10 text-white border border-white/20 cursor-not-allowed'}`}>
              COMMIT_PROTOCOL_LOCK
            </button>
          </div>
        )}

        {activeTab === 'my-stakes' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 bg-secondary/15 border border-secondary/40 rounded-lg flex justify-between items-center shadow-lg">
              <div>
                <p className="text-[9px] text-white uppercase font-black tracking-widest">ACCRUED_YIELD</p>
                <p className="text-sm font-black text-white font-mono">{(totalPendingRewards || 0).toFixed(4)} <span className="text-[10px] text-secondary">EXN</span></p>
              </div>
              <button onClick={() => setShowClaimReview(true)} disabled={totalPendingRewards <= 0} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase border transition-all shadow-md ${totalPendingRewards > 0 ? 'bg-secondary text-white border-secondary' : 'bg-white/5 text-white border-white/20 cursor-not-allowed'}`}>
                HARVEST
              </button>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-auto pr-2 custom-scrollbar">
              {activeUserStakes.length === 0 ? (
                <div className="text-center py-16 opacity-100">
                  <p className="text-[10px] uppercase font-black text-white tracking-[0.4em]">NO_ACTIVE_LOCKS</p>
                </div>
              ) : (
                activeUserStakes.map((s: any) => {
                  const isLocked = now < s.unlock_timestamp;
                  const v = validators?.find((val: any) => val.id === s.validator_id);
                  const multiplier = s.lock_multiplier || 1000;
                  const reward = v ? ((v.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000) : 0;
                  const isMigrating = migrationStake?.id === s.id;
                  
                  return (
                    <div key={s.id} className={`p-4 bg-white/5 border rounded-lg space-y-3 transition-all ${isMigrating ? 'border-primary ring-1 ring-primary/30' : 'border-white/20 hover:border-white/40'}`}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <p className="text-[11px] font-black text-white font-mono uppercase">{s.amount.toLocaleString()} <span className="text-[9px]">EXN</span></p>
                           <p className="text-[9px] font-black text-primary uppercase truncate max-w-[140px]">{v?.name || 'N/A'}</p>
                        </div>
                        <p className="text-[11px] font-black text-emerald-400 font-mono">+{reward.toFixed(4)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[8px] font-black uppercase text-white border-t border-white/10 pt-3">
                        <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(s.staked_at).toLocaleDateString()}</div>
                        <div className="text-right flex items-center justify-end gap-1">
                          <Unlock className="w-2.5 h-2.5" />
                          <span className={`${isLocked ? 'text-amber-400' : 'text-emerald-400'}`}>{new Date(s.unlock_timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {isMigrating ? (
                        <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                           <p className="text-[9px] text-primary font-black uppercase tracking-widest">SELECT_TARGET_SECTOR</p>
                           <select 
                            value={migrationTargetId} 
                            onChange={(e) => setMigrationTargetId(e.target.value)}
                            className="exn-input h-9 text-[9px] uppercase font-black bg-black/60"
                           >
                              <option value="">SCANNING_NODES...</option>
                              {validators.filter((val: any) => val.id !== s.validator_id && val.is_active).map((val: any) => (
                                <option key={val.id} value={val.id}>{val.name}</option>
                              ))}
                           </select>
                           <div className="flex gap-2">
                             <button onClick={initiateMigration} disabled={!migrationTargetId} className={`flex-1 h-9 rounded text-[9px] font-black uppercase transition-all ${migrationTargetId ? 'bg-primary text-black' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}>CONFIRM_MIGRATION</button>
                             <button onClick={() => setMigrationStake(null)} className="flex-1 h-9 rounded bg-white/5 text-white border border-white/20 text-[9px] font-black uppercase">ABORT</button>
                           </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button onClick={() => setShowClaimSingleReview({ id: s.id, amount: reward })} disabled={reward <= 0} className="h-8 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/40 text-[9px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all">HARVEST</button>
                          <button onClick={() => setMigrationStake(s)} className="h-8 rounded bg-primary/15 text-primary border border-primary/40 text-[9px] font-black uppercase hover:bg-primary hover:text-black transition-all">MIGRATE</button>
                          <button onClick={() => setShowUnstakeReview(s.id)} disabled={isLocked} className="h-8 rounded bg-white/10 text-white border border-white/30 text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all">RELEASE</button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stake Review Dialog */}
      <AlertDialog open={showStakeReview} onOpenChange={setShowStakeReview}>
        <AlertDialogContent className="exn-card border-primary/60 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" /> VERIFY_LOCK_OP
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <div className="p-5 bg-white/5 rounded-xl border border-white/20 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">QUANTITY</span>
                      <span className="text-white font-mono">{amountInput} EXN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">HORIZON</span>
                      <span className="text-emerald-400 font-black">{duration} DAYS</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">TARGET_SECTOR</span>
                      <span className="text-primary truncate max-w-[100px]">{selectedNode?.name}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-white uppercase leading-relaxed font-black tracking-tight">BY CONFIRMING, YOU AUTHORIZE THE ATOMIC LOCKING OF ASSETS IN THE PROTOCOL SECTOR.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white/20 text-white">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStake} className="exn-button flex-1 h-11 text-[10px] uppercase font-black">CONFIRM_OPS</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Migration Review Dialog */}
      <AlertDialog open={showMigrationReview} onOpenChange={setShowMigrationReview}>
        <AlertDialogContent className="exn-card border-primary/60 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5" /> VERIFY_MIGRATION
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <div className="p-5 bg-white/5 rounded-xl border border-white/20 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">QUANTITY</span>
                      <span className="text-white font-mono">{migrationStake?.amount.toLocaleString()} EXN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">NEW_SECTOR</span>
                      <span className="text-primary font-black truncate max-w-[100px]">
                        {validators.find((v: any) => v.id === migrationTargetId)?.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-white uppercase leading-relaxed font-black tracking-tight">MIGRATION WILL TRANSFER LOCK PRINCIPAL TO THE NEW SECTOR WHILE MAINTAINING MATURITY TIMELINES.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white/20 text-white">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMigration} className="exn-button flex-1 h-11 text-[10px] uppercase font-black">CONFIRM_SHIFT</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unstake Review Dialog */}
      <AlertDialog open={showUnstakeReview !== null} onOpenChange={() => setShowUnstakeReview(null)}>
        <AlertDialogContent className="exn-card border-destructive/60 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-destructive flex items-center gap-3">
                <Unlock className="w-5 h-5" /> VERIFY_RELEASE
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <p className="text-[11px] text-white uppercase leading-relaxed font-black tracking-tight">CONFIRMING WILL RELEASE THE PRINCIPAL ASSETS FROM THE PROTOCOL VAULT TO YOUR CONNECTED WALLET.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white/20 text-white">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if(showUnstakeReview) onUnstake(showUnstakeReview); setShowUnstakeReview(null); }} className="bg-destructive text-white flex-1 h-11 text-[10px] uppercase font-black rounded-lg hover:opacity-90">CONFIRM_RELEASE</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
