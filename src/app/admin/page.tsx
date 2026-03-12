
"use client";

import React, { useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  ShieldCheck, 
  Settings, 
  Lock,
  Calendar,
  Coins,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Ticket,
  Zap,
  Layers,
  Activity,
  Play
} from 'lucide-react';

export default function AdminPage() {
  const { connected, publicKey } = useWallet();
  const { 
    state, 
    resetProtocol,
    isLoaded, 
    setFeedback, 
    exnBalance, 
    adminFundVault, 
    adminWithdrawUsdc,
    adminUpdateSettings,
    crankEpoch
  } = useProtocolState();
  
  const [withdrawUsdcAmt, setWithdrawUsdcAmt] = useState('');
  const [fundRewardsAmt, setFundRewardsAmt] = useState('');
  const [fundTreasuryAmt, setFundTreasuryAmt] = useState('');
  
  const [newLicensePrice, setNewLicensePrice] = useState('');
  const [newRewardCap, setNewRewardCap] = useState('');
  const [newLicenseLimit, setNewLicenseLimit] = useState('');

  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    if (isLoaded && !isInitialized) {
      setNewLicensePrice(state.licensePrice?.toString() || '0');
      setNewRewardCap(state.rewardCap?.toString() || '0');
      setNewLicenseLimit(state.licenseLimit?.toString() || '0');
      setIsInitialized(true);
    }
    return () => clearInterval(timer);
  }, [isLoaded, state.licensePrice, state.rewardCap, state.licenseLimit, isInitialized]);

  const formatInput = (val: string) => {
    const raw = val.replace(/,/g, "");
    if (!raw) return "";
    const parts = raw.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleTextChange = (val: string, setter: (v: string) => void) => {
    const raw = val.replace(/,/g, "");
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      setter(raw);
    }
  };

  const walletAddress = publicKey?.toBase58();
  const isAdmin = walletAddress === state.adminWallet;

  const handleWithdrawUsdc = () => {
    const amt = Number(withdrawUsdcAmt.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) return setFeedback('error', 'Invalid withdrawal amount.');
    if (amt > state.usdcVaultBalance) return setFeedback('error', 'Insufficient USDC in vault.');

    adminWithdrawUsdc(walletAddress!, amt);
    setWithdrawUsdcAmt('');
    setFeedback('success', `Successfully withdrew ${amt.toLocaleString()} USDC from license vault.`);
  };

  const handleFundRewards = () => {
    const amt = Number(fundRewardsAmt.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) return setFeedback('error', 'Invalid funding amount.');
    if (amt > exnBalance) return setFeedback('error', 'Insufficient personal EXN balance.');

    adminFundVault(walletAddress!, amt, 'rewardVaultBalance');
    setFundRewardsAmt('');
    setFeedback('success', `Injected ${amt.toLocaleString()} EXN into Global Reward Pool.`);
  };

  const handleFundTreasury = () => {
    const amt = Number(fundTreasuryAmt.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) return setFeedback('error', 'Invalid funding amount.');
    if (amt > exnBalance) return setFeedback('error', 'Insufficient personal EXN balance.');

    adminFundVault(walletAddress!, amt, 'treasuryBalance');
    setFundTreasuryAmt('');
    setFeedback('success', `Injected ${amt.toLocaleString()} EXN into DAO Treasury.`);
  };

  const handleUpdateGlobals = () => {
    const price = Number(newLicensePrice.replace(/,/g, ''));
    const cap = Number(newRewardCap.replace(/,/g, ''));
    const limit = Number(newLicenseLimit.replace(/,/g, ''));
    
    if (isNaN(price) || price < 0) return setFeedback('error', 'Invalid license price.');
    if (isNaN(cap) || cap < 0) return setFeedback('error', 'Invalid reward cap.');
    if (isNaN(limit) || limit < 0) return setFeedback('error', 'Invalid license supply cap.');

    adminUpdateSettings({
      licensePrice: price,
      rewardCap: cap,
      licenseLimit: limit
    });
  };

  const handleStartEpochGenesis = () => {
    adminUpdateSettings({
      networkStartDate: Date.now(),
      lastCrankedEpoch: 0
    });
    setFeedback('success', 'Network Genesis initialized.');
  };

  const handleManualCrank = () => {
    const nextEpoch = state.lastCrankedEpoch + 1;
    const activeValidators = state.validators.filter(v => v.is_active && v.total_staked > 0);
    const totalWeight = activeValidators.reduce((acc, v) => acc + v.total_staked, 0);
    
    if (totalWeight <= 0) return setFeedback('error', 'No active network weight.');
    
    crankEpoch(nextEpoch, state.rewardCap, activeValidators, totalWeight);
    setFeedback('success', `Admin Override: Epoch ${nextEpoch} settled.`);
  };

  const handleFullProtocolReset = async () => {
    await resetProtocol();
    setFeedback('success', 'Master Reset Complete.');
    setIsInitialized(false);
  };

  if (!mounted) return null;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in duration-500">
         <Lock className="w-12 h-12 text-primary" />
         <h1 className="text-3xl font-bold uppercase">Authority Required</h1>
         <p className="text-muted-foreground text-xs">Please connect your wallet to access the terminal.</p>
      </div>
    );
  }

  if (isLoaded && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in duration-500">
         <div className="p-6 bg-destructive/10 rounded-full border border-destructive/20">
            <ShieldAlert className="w-12 h-12 text-destructive" />
         </div>
         <h1 className="text-3xl font-bold uppercase text-destructive">Unauthorized Access</h1>
         <p className="text-muted-foreground text-xs max-w-md mx-auto">
            This terminal is restricted to the designated Protocol Authority wallet.
         </p>
      </div>
    );
  }

  const currentEpoch = Math.floor((now - (state.networkStartDate || now)) / (30 * 24 * 60 * 60 * 1000)) + 1;

  return (
    <div className="max-w-7xl mx-auto px-10 py-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-primary" />
             <p className="text-xs font-black uppercase tracking-widest text-primary">Protocol Authority</p>
          </div>
          <h1 className="text-5xl font-bold exn-gradient-text uppercase">Command Center</h1>
        </div>
      </div>

      {!isLoaded ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-4">
           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] uppercase font-black tracking-widest text-primary animate-pulse">Accessing Cloud Console</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="exn-card p-8 space-y-8 border-primary/30 bg-primary/5">
                 <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Epoch Protocol Control</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-background/50 border border-primary/20 rounded-xl space-y-4">
                       <p className="text-[9px] text-muted-foreground uppercase font-black">Genesis Activation</p>
                       <p className="text-[11px] text-muted-foreground leading-relaxed">Reset the network clock.</p>
                       <button onClick={handleStartEpochGenesis} className="w-full h-12 bg-primary/20 text-primary border border-primary/40 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/30 transition-all flex items-center justify-center gap-2">
                         <Play className="w-3 h-3 fill-current" /> Initialize Genesis
                       </button>
                    </div>

                    <div className="p-6 bg-background/50 border border-secondary/20 rounded-xl space-y-4">
                       <p className="text-[9px] text-muted-foreground uppercase font-black">Manual Settlement Override</p>
                       <p className="text-[11px] text-muted-foreground leading-relaxed">Force settlement of Epoch {state.lastCrankedEpoch + 1}.</p>
                       <button onClick={handleManualCrank} className="w-full h-12 bg-secondary/20 text-secondary border border-secondary/40 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary/30 transition-all flex items-center justify-center gap-2">
                         <Zap className="w-3 h-3 fill-current" /> Force Manual Settlement
                       </button>
                    </div>
                 </div>
              </div>

              <div className="exn-card p-8 space-y-8 border-secondary/20">
                 <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Network Governance</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <p className="text-[9px] text-muted-foreground uppercase font-black">License Price (USDC)</p>
                       <div className="relative">
                          <Ticket className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground/40" />
                          <input value={formatInput(newLicensePrice)} onChange={e => handleTextChange(e.target.value, setNewLicensePrice)} className="exn-input h-12 pl-12 font-mono text-sm" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[9px] text-muted-foreground uppercase font-black">Reward Cap (EXN)</p>
                       <div className="relative">
                          <Zap className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground/40" />
                          <input value={formatInput(newRewardCap)} onChange={e => handleTextChange(e.target.value, setNewRewardCap)} className="exn-input h-12 pl-12 font-mono text-sm" />
                       </div>
                    </div>
                 </div>
                 
                 <button onClick={handleUpdateGlobals} className="w-full h-12 bg-secondary text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all">
                   Apply Global Updates
                 </button>
              </div>

              <div className="exn-card p-8 space-y-8 border-primary/20">
                 <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Vault Capital Management</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[9px] text-muted-foreground uppercase font-black">Withdraw from License Vault (USDC)</p>
                        <p className="text-[9px] text-emerald-500 font-bold uppercase">Vault: {state.usdcVaultBalance.toLocaleString()} USDC</p>
                      </div>
                      <div className="flex gap-2">
                         <input value={formatInput(withdrawUsdcAmt)} onChange={e => handleTextChange(e.target.value, setWithdrawUsdcAmt)} className="exn-input h-12 font-mono text-sm" />
                         <button onClick={handleWithdrawUsdc} disabled={!withdrawUsdcAmt.trim() || Number(withdrawUsdcAmt.replace(/,/g, '')) > state.usdcVaultBalance} className={`px-4 h-12 text-[9px] uppercase font-black transition-all flex items-center gap-2 ${withdrawUsdcAmt.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}>
                           <ArrowDownLeft className="w-3 h-3" /> Withdraw
                         </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[9px] text-muted-foreground uppercase font-black">Fund Reward Pool (EXN)</p>
                          <p className="text-[9px] text-primary font-bold uppercase">Bal: {exnBalance.toLocaleString()}</p>
                        </div>
                        <input value={formatInput(fundRewardsAmt)} onChange={e => handleTextChange(e.target.value, setFundRewardsAmt)} className="exn-input h-12 font-mono text-sm" />
                        <button onClick={handleFundRewards} disabled={!fundRewardsAmt.trim() || Number(fundRewardsAmt.replace(/,/g, '')) > exnBalance} className={`w-full h-12 text-[9px] uppercase font-black transition-all flex items-center justify-center gap-2 ${fundRewardsAmt.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}>
                          Fund Rewards
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[9px] text-muted-foreground uppercase font-black">Fund DAO Treasury (EXN)</p>
                          <p className="text-[9px] text-primary font-bold uppercase">Bal: {exnBalance.toLocaleString()}</p>
                        </div>
                        <input value={formatInput(fundTreasuryAmt)} onChange={e => handleTextChange(e.target.value, setFundTreasuryAmt)} className="exn-input h-12 font-mono text-sm" />
                        <button onClick={handleFundTreasury} disabled={!fundTreasuryAmt.trim() || Number(fundTreasuryAmt.replace(/,/g, '')) > exnBalance} className={`w-full h-12 text-[9px] uppercase font-black transition-all flex items-center justify-center gap-2 ${fundTreasuryAmt.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}>
                          Fund Treasury
                        </button>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="exn-card p-8 space-y-8 border-destructive/20 bg-destructive/5">
                 <div className="flex items-center gap-3 text-destructive">
                    <RotateCcw className="w-5 h-5" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Master Protocol Reset</h3>
                 </div>
                 <button onClick={() => { if(window.confirm("CRITICAL: Reset state?")) handleFullProtocolReset(); }} className="w-full h-12 bg-destructive text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-destructive/90 transition-all">
                   Master Reset Protocol
                 </button>
              </div>
           </div>

           <div className="space-y-8">
              <div className="exn-card p-8 border-emerald-500/30 bg-emerald-500/5 space-y-6">
                 <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2"><Coins className="w-5 h-5" /> Protocol Vaults</h3>
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[9px] text-muted-foreground uppercase font-black">License Vault</p>
                       <p className="text-lg font-bold font-mono">{(state?.usdcVaultBalance ?? 0).toLocaleString()}</p>
                     </div>
                     <span className="text-[10px] text-emerald-500 font-bold">USDC</span>
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[9px] text-muted-foreground uppercase font-black">DAO Treasury</p>
                       <p className="text-lg font-bold font-mono">{(state?.treasuryBalance ?? 0).toLocaleString()}</p>
                     </div>
                     <span className="text-[10px] text-primary font-bold">EXN</span>
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[9px] text-muted-foreground uppercase font-black">Global Reward Vault</p>
                       <p className="text-lg font-bold font-mono">{(state?.rewardVaultBalance ?? 0).toLocaleString()}</p>
                     </div>
                     <span className="text-[10px] text-primary font-bold">EXN</span>
                   </div>
                 </div>
              </div>

              <div className="exn-card p-6 space-y-4 border-primary/20 bg-primary/5">
                 <div className="flex items-center gap-2 text-primary">
                   <Calendar className="w-4 h-4 text-primary" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Network Timeline</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] text-muted-foreground uppercase font-black">Origin Anchor</p>
                    <p className="text-[9px] font-mono text-foreground">{state.networkStartDate ? new Date(state.networkStartDate).toLocaleString() : 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${state.networkStartDate ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
                       <p className="text-[10px] font-black uppercase text-primary">Active Epoch: {state.networkStartDate ? currentEpoch : '0'}</p>
                    </div>
                    <p className="text-[8px] text-muted-foreground font-bold uppercase mt-1">Last Settled: {state.lastCrankedEpoch}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
