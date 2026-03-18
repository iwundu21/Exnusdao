
"use client";

import React, { useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useFakeWallet } from '@/hooks/use-fake-wallet';
import { 
  ShieldCheck, 
  Settings, 
  Lock,
  Calendar,
  Coins,
  ShieldAlert,
  RotateCcw,
  Banknote,
  Ticket,
  Zap,
  Play,
  Layers
} from 'lucide-react';

export default function AdminPage() {
  const { connected, publicKey } = useFakeWallet();
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
    
    crankEpoch(nextEpoch, state.rewardCap);
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
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 animate-in fade-in duration-500">
         <Lock className="w-10 h-10 text-primary" />
         <h1 className="text-2xl font-bold uppercase text-white">Authority Required</h1>
         <p className="text-white text-[10px] font-black uppercase tracking-widest">Please link your virtual identity to access the terminal.</p>
      </div>
    );
  }

  if (isLoaded && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 animate-in fade-in duration-500">
         <div className="p-5 bg-destructive/20 rounded-full border border-destructive/40">
            <ShieldAlert className="w-10 h-10 text-destructive" />
         </div>
         <h1 className="text-2xl font-bold uppercase text-destructive">Unauthorized Access</h1>
         <p className="text-white text-[11px] font-black uppercase tracking-[0.4em] max-w-md mx-auto">
            This terminal is restricted to the designated Protocol Authority identity.
         </p>
      </div>
    );
  }

  const currentEpoch = Math.floor((now - (state.networkStartDate || now)) / (30 * 24 * 60 * 60 * 1000)) + 1;

  return (
    <div className="max-w-6xl mx-auto px-10 py-10 space-y-10 animate-in fade-in duration-500 pb-32">
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-primary" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Protocol Authority</p>
          </div>
          <h1 className="text-4xl font-bold exn-gradient-text uppercase">XNode Management</h1>
        </div>
      </div>

      {!isLoaded ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-3">
           <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-[9px] uppercase font-black tracking-widest text-primary animate-pulse">Accessing Cloud Console</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <div className="exn-card p-6 space-y-6 border-primary/40 bg-primary/10">
                 <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold uppercase tracking-widest text-white">Epoch Protocol Control</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-background/80 border border-primary/30 rounded-xl space-y-3">
                       <p className="text-[10px] text-white uppercase font-black">Genesis Activation</p>
                       <p className="text-[11px] text-white font-black uppercase leading-relaxed">Reset the network clock.</p>
                       <button onClick={handleStartEpochGenesis} className="w-full h-11 bg-primary/20 text-primary border border-primary/50 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/30 transition-all flex items-center justify-center gap-2">
                         <Play className="w-3 h-3 fill-current" /> Initialize Genesis
                       </button>
                    </div>

                    <div className="p-5 bg-background/80 border border-secondary/40 rounded-xl space-y-3">
                       <p className="text-[10px] text-white uppercase font-black">Manual Settlement</p>
                       <p className="text-[11px] text-white font-black uppercase leading-relaxed">Force settlement of Epoch {state.lastCrankedEpoch + 1}.</p>
                       <button onClick={handleManualCrank} className="w-full h-11 bg-secondary/20 text-secondary border border-secondary/50 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-secondary/30 transition-all flex items-center justify-center gap-2">
                         <Zap className="w-3 h-3 fill-current" /> Force Settlement
                       </button>
                    </div>
                 </div>
              </div>

              <div className="exn-card p-6 space-y-6 border-secondary/40">
                 <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-secondary" />
                    <h3 className="text-base font-bold uppercase tracking-widest text-white">Network Governance</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                       <p className="text-[10px] text-white uppercase font-black">License Price (USDC)</p>
                       <div className="relative">
                          <Ticket className="absolute left-4 top-3.5 w-3.5 h-3.5 text-white" />
                          <input value={formatInput(newLicensePrice)} onChange={e => handleTextChange(e.target.value, setNewLicensePrice)} className="exn-input h-11 pl-10 font-mono text-[12px] text-white border-white bg-white/10" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[10px] text-white uppercase font-black">Reward Cap (EXN)</p>
                       <div className="relative">
                          <Zap className="absolute left-4 top-3.5 w-3.5 h-3.5 text-white" />
                          <input value={formatInput(newRewardCap)} onChange={e => handleTextChange(e.target.value, setNewRewardCap)} className="exn-input h-11 pl-10 font-mono text-[12px] text-white border-white bg-white/10" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[10px] text-white uppercase font-black">Supply Cap (Licenses)</p>
                       <div className="relative">
                          <Layers className="absolute left-4 top-3.5 w-3.5 h-3.5 text-white" />
                          <input value={formatInput(newLicenseLimit)} onChange={e => handleTextChange(e.target.value, setNewLicenseLimit)} className="exn-input h-11 pl-10 font-mono text-[12px] text-white border-white bg-white/10" />
                       </div>
                    </div>
                 </div>
                 
                 <button onClick={handleUpdateGlobals} className="w-full h-11 bg-secondary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-lg hover:opacity-90 transition-all">
                   Apply Global Updates
                 </button>
              </div>

              <div className="exn-card p-6 space-y-6 border-primary/40">
                 <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary" />
                    <h3 className="text-base font-bold uppercase tracking-widest text-white">Vault Capital Management</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] text-white uppercase font-black">Withdraw License Vault (USDC)</p>
                        <p className="text-[11px] text-emerald-400 font-bold uppercase">Vault: {state.usdcVaultBalance.toLocaleString()} USDC</p>
                      </div>
                      <div className="flex gap-2">
                         <input value={formatInput(withdrawUsdcAmt)} onChange={e => handleTextChange(e.target.value, setWithdrawUsdcAmt)} className="exn-input h-11 font-mono text-[12px] text-white border-white bg-white/10" />
                         <button onClick={handleWithdrawUsdc} disabled={!withdrawUsdcAmt.trim() || Number(withdrawUsdcAmt.replace(/,/g, '')) > state.usdcVaultBalance} className={`px-4 h-11 text-[10px] uppercase font-black transition-all flex items-center gap-2 ${withdrawUsdcAmt.trim() ? 'exn-button' : 'bg-white/10 text-white border border-white/30 cursor-not-allowed'}`}>
                           Withdraw
                         </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] text-white uppercase font-black">Fund Reward Pool (EXN)</p>
                          <p className="text-[11px] text-primary font-bold uppercase">Bal: {exnBalance.toLocaleString()}</p>
                        </div>
                        <input value={formatInput(fundRewardsAmt)} onChange={e => handleTextChange(e.target.value, setFundRewardsAmt)} className="exn-input h-11 font-mono text-[12px] text-white border-white bg-white/10" />
                        <button onClick={handleFundRewards} disabled={!fundRewardsAmt.trim() || Number(fundRewardsAmt.replace(/,/g, '')) > exnBalance} className={`w-full h-11 text-[10px] uppercase font-black transition-all flex items-center justify-center gap-2 ${fundRewardsAmt.trim() ? 'exn-button' : 'bg-white/10 text-white border border-white/30 cursor-not-allowed'}`}>
                          Fund Rewards
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] text-white uppercase font-black">Fund DAO Treasury (EXN)</p>
                          <p className="text-[11px] text-primary font-bold uppercase">Bal: {exnBalance.toLocaleString()}</p>
                        </div>
                        <input value={formatInput(fundTreasuryAmt)} onChange={e => handleTextChange(e.target.value, setFundTreasuryAmt)} className="exn-input h-11 font-mono text-[12px] text-white border-white bg-white/10" />
                        <button onClick={handleFundTreasury} disabled={!fundTreasuryAmt.trim() || Number(fundTreasuryAmt.replace(/,/g, '')) > exnBalance} className={`w-full h-11 text-[10px] uppercase font-black transition-all flex items-center justify-center gap-2 ${fundTreasuryAmt.trim() ? 'exn-button' : 'bg-white/10 text-white border border-white/30 cursor-not-allowed'}`}>
                          Fund Treasury
                        </button>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="exn-card p-6 space-y-6 border-destructive/50 bg-destructive/10">
                 <div className="flex items-center gap-2 text-destructive">
                    <RotateCcw className="w-4 h-4" />
                    <h3 className="text-base font-bold uppercase tracking-widest">Master Protocol Reset</h3>
                 </div>
                 <button onClick={() => { if(window.confirm("CRITICAL: Reset state?")) handleFullProtocolReset(); }} className="w-full h-11 bg-destructive text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-destructive/90 transition-all">
                   Master Reset Protocol
                 </button>
              </div>
           </div>

           <div className="space-y-6">
              <div className="exn-card p-6 border-emerald-500/50 bg-emerald-500/10 space-y-4">
                 <h3 className="text-base font-bold uppercase tracking-widest flex items-center gap-2 text-white"><Coins className="w-4 h-4 text-emerald-400" /> Protocol Vaults</h3>
                 <div className="space-y-3">
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[10px] text-white uppercase font-black">License Vault</p>
                       <p className="text-[15px] font-bold font-mono text-white">{(state?.usdcVaultBalance ?? 0).toLocaleString()}</p>
                     </div>
                     <span className="text-[11px] text-emerald-400 font-bold">USDC</span>
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[10px] text-white uppercase font-black">DAO Treasury</p>
                       <p className="text-[15px] font-bold font-mono text-white">{(state?.treasuryBalance ?? 0).toLocaleString()}</p>
                     </div>
                     <span className="text-[11px] text-primary font-bold">EXN</span>
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[10px] text-white uppercase font-black">Global Reward Vault</p>
                       <p className="text-[15px] font-bold font-mono text-white">{(state?.rewardVaultBalance ?? 0).toLocaleString()}</p>
                     </div>
                     <span className="text-[11px] text-primary font-bold">EXN</span>
                   </div>
                 </div>
              </div>

              <div className="exn-card p-5 space-y-3 border-primary/40 bg-primary/10">
                 <div className="flex items-center gap-2 text-primary">
                   <Calendar className="w-3.5 h-3.5 text-primary" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Network Timeline</p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] text-white uppercase font-black">Origin Anchor</p>
                    <p className="text-[11px] font-mono text-white">{state.networkStartDate ? new Date(state.networkStartDate).toLocaleString() : 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                       <div className={`w-1 h-1 rounded-full ${state.networkStartDate ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
                       <p className="text-[11px] font-black uppercase text-primary">Active Epoch: {state.networkStartDate ? currentEpoch : '0'}</p>
                    </div>
                    <p className="text-[10px] text-white font-black uppercase mt-0.5">Last Settled: {state.lastCrankedEpoch}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
