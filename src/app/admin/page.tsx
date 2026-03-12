
"use client";

import React, { useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  ShieldCheck, 
  Settings, 
  Lock,
  Calendar,
  Database,
  Coins,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Ticket,
  Zap
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
    adminUpdateSettings
  } = useProtocolState();
  
  const [withdrawUsdcAmt, setWithdrawUsdcAmt] = useState('');
  const [fundRewardsAmt, setFundRewardsAmt] = useState('');
  const [fundTreasuryAmt, setFundTreasuryAmt] = useState('');
  
  const [newLicensePrice, setNewLicensePrice] = useState('');
  const [newRewardCap, setNewRewardCap] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (state.licensePrice) setNewLicensePrice(state.licensePrice.toString());
    if (state.rewardCap) setNewRewardCap(state.rewardCap.toString());
  }, [state.licensePrice, state.rewardCap]);

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
    const amt = Number(withdrawUsdcAmt);
    if (isNaN(amt) || amt <= 0) return setFeedback('error', 'Invalid withdrawal amount.');
    if (amt > state.usdcVaultBalance) return setFeedback('error', 'Insufficient USDC in vault.');

    adminWithdrawUsdc(walletAddress!, amt);
    setWithdrawUsdcAmt('');
    setFeedback('success', `Successfully withdrew ${amt.toLocaleString()} USDC from license vault.`);
  };

  const handleFundRewards = () => {
    const amt = Number(fundRewardsAmt);
    if (isNaN(amt) || amt <= 0) return setFeedback('error', 'Invalid funding amount.');
    if (amt > exnBalance) return setFeedback('error', 'Insufficient personal EXN balance.');

    adminFundVault(walletAddress!, amt, 'rewardVaultBalance');
    setFundRewardsAmt('');
    setFeedback('success', `Injected ${amt.toLocaleString()} EXN into Global Reward Pool.`);
  };

  const handleFundTreasury = () => {
    const amt = Number(fundTreasuryAmt);
    if (isNaN(amt) || amt <= 0) return setFeedback('error', 'Invalid funding amount.');
    if (amt > exnBalance) return setFeedback('error', 'Insufficient personal EXN balance.');

    adminFundVault(walletAddress!, amt, 'treasuryBalance');
    setFundTreasuryAmt('');
    setFeedback('success', `Injected ${amt.toLocaleString()} EXN into DAO Treasury.`);
  };

  const handleUpdateGlobals = () => {
    const price = Number(newLicensePrice);
    const cap = Number(newRewardCap);
    
    if (isNaN(price) || price < 0) return setFeedback('error', 'Invalid license price.');
    if (isNaN(cap) || cap < 0) return setFeedback('error', 'Invalid reward cap.');

    adminUpdateSettings({
      licensePrice: price,
      rewardCap: cap
    });
    setFeedback('success', 'Global network parameters updated in cloud ledger.');
  };

  const handleFullProtocolReset = async () => {
    await resetProtocol();
    setFeedback('success', 'Master Reset Complete: Cloud global parameters re-anchored.');
  };

  if (!mounted) return null;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in duration-500">
         <Lock className="w-12 h-12 text-primary" />
         <h1 className="text-4xl font-bold uppercase">Authority Required</h1>
         <p className="text-muted-foreground">Please connect your wallet to access the terminal.</p>
      </div>
    );
  }

  if (isLoaded && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in duration-500">
         <div className="p-6 bg-destructive/10 rounded-full border border-destructive/20">
            <ShieldAlert className="w-12 h-12 text-destructive" />
         </div>
         <h1 className="text-4xl font-bold uppercase text-destructive">Unauthorized Access</h1>
         <p className="text-muted-foreground max-w-md mx-auto">
            This terminal is restricted to the designated Protocol Authority wallet: <br/>
            <span className="font-mono text-primary break-all">{state.adminWallet}</span>
         </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-primary" />
             <p className="text-xs font-black uppercase tracking-widest text-primary">Protocol Authority</p>
          </div>
          <h1 className="text-6xl font-bold exn-gradient-text uppercase">Command Center</h1>
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
              {/* Global Network Controls */}
              <div className="exn-card p-8 space-y-8 border-secondary/20">
                 <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Network Governance</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <p className="text-[10px] text-muted-foreground uppercase font-black">XNode License Price (USDC)</p>
                       <div className="relative">
                          <Ticket className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground/40" />
                          <input 
                            value={formatInput(newLicensePrice)} 
                            onChange={e => handleTextChange(e.target.value, setNewLicensePrice)} 
                            className="exn-input h-12 pl-12" 
                            placeholder="Price in USDC..." 
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] text-muted-foreground uppercase font-black">Epoch Reward Cap (EXN)</p>
                       <div className="relative">
                          <Zap className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground/40" />
                          <input 
                            value={formatInput(newRewardCap)} 
                            onChange={e => handleTextChange(e.target.value, setNewRewardCap)} 
                            className="exn-input h-12 pl-12" 
                            placeholder="Reward Pool per Epoch..." 
                          />
                       </div>
                    </div>
                 </div>
                 
                 <button 
                   onClick={handleUpdateGlobals}
                   className="w-full h-12 bg-secondary text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all shadow-xl shadow-secondary/10"
                 >
                   Apply Global Updates
                 </button>
              </div>

              {/* Vault Management */}
              <div className="exn-card p-8 space-y-8 border-primary/20">
                 <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Vault Capital Management</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] text-muted-foreground uppercase font-black">Withdraw from License Vault (USDC)</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase">Vault: {state.usdcVaultBalance.toLocaleString()} USDC</p>
                      </div>
                      <div className="flex gap-2">
                         <input value={formatInput(withdrawUsdcAmt)} onChange={e => handleTextChange(e.target.value, setWithdrawUsdcAmt)} className="exn-input h-12" placeholder="Amount..." />
                         <button 
                           onClick={handleWithdrawUsdc} 
                           disabled={!withdrawUsdcAmt.trim() || Number(withdrawUsdcAmt) > state.usdcVaultBalance}
                           className={`px-6 h-12 text-[9px] uppercase font-black transition-all flex items-center gap-2 ${withdrawUsdcAmt.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                         >
                           <ArrowDownLeft className="w-3 h-3" /> Withdraw USDC
                         </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] text-muted-foreground uppercase font-black">Fund Reward Pool (EXN)</p>
                          <p className="text-[9px] text-primary font-bold uppercase">Bal: {exnBalance.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                           <input value={formatInput(fundRewardsAmt)} onChange={e => handleTextChange(e.target.value, setFundRewardsAmt)} className="exn-input h-12" placeholder="EXN to add..." />
                           <button 
                             onClick={handleFundRewards} 
                             disabled={!fundRewardsAmt.trim() || Number(fundRewardsAmt) > exnBalance}
                             className={`w-full h-12 text-[9px] uppercase font-black transition-all flex items-center justify-center gap-2 ${fundRewardsAmt.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                           >
                             <ArrowUpRight className="w-3 h-3" /> Fund Rewards
                           </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] text-muted-foreground uppercase font-black">Fund DAO Treasury (EXN)</p>
                          <p className="text-[9px] text-primary font-bold uppercase">Bal: {exnBalance.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                           <input value={formatInput(fundTreasuryAmt)} onChange={e => handleTextChange(e.target.value, setFundTreasuryAmt)} className="exn-input h-12" placeholder="EXN to add..." />
                           <button 
                             onClick={handleFundTreasury} 
                             disabled={!fundTreasuryAmt.trim() || Number(fundTreasuryAmt) > exnBalance}
                             className={`w-full h-12 text-[9px] uppercase font-black transition-all flex items-center justify-center gap-2 ${fundTreasuryAmt.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                           >
                             <ArrowUpRight className="w-3 h-3" /> Fund Treasury
                           </button>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Reset Control */}
              <div className="exn-card p-8 space-y-8 border-destructive/20 bg-destructive/5">
                 <div className="flex items-center gap-3 text-destructive">
                    <RotateCcw className="w-5 h-5" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Master Protocol Reset</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="p-6 bg-background/50 border border-destructive/20 rounded-xl space-y-4">
                       <div className="flex items-start gap-4">
                          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                          <div className="space-y-2">
                             <p className="text-sm font-bold text-foreground uppercase tracking-tight">Danger Zone: Irreversible Operation</p>
                             <p className="text-xs text-muted-foreground leading-relaxed">
                                Executing a Master Reset will purge all cloud-anchored global parameters and re-initialize limits. 
                             </p>
                          </div>
                       </div>
                       <button 
                         onClick={() => {
                           if(window.confirm("CRITICAL: Wipe entire protocol state?")) handleFullProtocolReset();
                         }} 
                         className="w-full h-14 bg-destructive text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-destructive/90 transition-all shadow-xl shadow-destructive/20"
                       >
                         This should work now
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="exn-card p-8 border-emerald-500/30 bg-emerald-500/5 space-y-6">
                 <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2"><Coins className="w-5 h-5" /> Protocol Vaults</h3>
                 <div className="space-y-4">
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-black">XNode License Vault (USDC)</p>
                     <p className="text-2xl font-bold font-mono">{(state?.usdcVaultBalance ?? 0).toLocaleString()} <span className="text-sm text-emerald-500">USDC</span></p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-black">DAO Treasury Vault (EXN)</p>
                     <p className="text-2xl font-bold font-mono">{(state?.treasuryBalance ?? 0).toLocaleString()} <span className="text-sm text-primary">EXN</span></p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-black">Global Reward Vault (EXN)</p>
                     <p className="text-2xl font-bold font-mono">{(state?.rewardVaultBalance ?? 0).toLocaleString()} <span className="text-sm text-primary">EXN</span></p>
                   </div>
                 </div>
              </div>

              <div className="exn-card p-6 space-y-4 border-primary/20 bg-primary/5">
                 <div className="flex items-center gap-2 text-primary">
                   <Calendar className="w-4 h-4 text-primary" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Network Timeline</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-black">Origin Anchor</p>
                    <p className="text-[10px] font-mono text-foreground">{new Date(state.networkStartDate).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                       <p className="text-[11px] font-black uppercase text-primary">Active Epoch: {state.lastCrankedEpoch + 1}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
