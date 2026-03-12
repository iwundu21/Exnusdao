"use client";

import React, { useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress } from '@/lib/utils';
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
  Banknote
} from 'lucide-react';

const ADMIN_WALLET = '9Kqt28pfMVBsBvXYYnYQCT2BZyorAwzbR6dUmgQfsZYW';

export default function AdminPage() {
  const { connected, publicKey } = useWallet();
  const { 
    state, 
    setState, 
    isLoaded, 
    setFeedback, 
    exnBalance, 
    adminFundVault, 
    adminWithdrawUsdc 
  } = useProtocolState();
  
  const [newCap, setNewCap] = useState('');
  const [newLicensePrice, setNewLicensePrice] = useState('');
  const [newLicenseLimit, setNewLicenseLimit] = useState('');
  
  const [withdrawUsdcAmt, setWithdrawUsdcAmt] = useState('');
  const [fundRewardsAmt, setFundRewardsAmt] = useState('');
  const [fundTreasuryAmt, setFundTreasuryAmt] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatInput = (val: string) => {
    if (!val) return "";
    const parts = val.split(".");
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
  const isAdmin = walletAddress === ADMIN_WALLET;

  const handleUpdateCap = () => {
    const cap = Number(newCap);
    if (isNaN(cap) || cap < 0) return setFeedback('error', 'Invalid cap value provided.');
    setState(prev => ({ ...prev, rewardCap: cap }));
    setNewCap('');
    setFeedback('success', `30-day Reward Block Cap updated to ${cap.toLocaleString()} EXN.`);
  };

  const handleUpdateLicensePrice = () => {
    const price = Number(newLicensePrice);
    if (isNaN(price) || price < 0) return setFeedback('error', 'Invalid price value provided.');
    setState(prev => ({ ...prev, licensePrice: price }));
    setNewLicensePrice('');
    setFeedback('success', `License Mint Price updated to ${price.toLocaleString()} USDC.`);
  };

  const handleUpdateLicenseLimit = () => {
    const limit = Number(newLicenseLimit);
    if (isNaN(limit) || limit < 0) return setFeedback('error', 'Invalid limit value provided.');
    setState(prev => ({ ...prev, licenseLimit: limit }));
    setNewLicenseLimit('');
    setFeedback('success', `Total License Supply Cap updated to ${limit}.`);
  };

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

  const handleFullProtocolReset = () => {
    setState(prev => ({ 
      ...prev, 
      totalStaked: 0,
      treasuryBalance: 0,
      rewardVaultBalance: 0,
      usdcVaultBalance: 0,
      stakedVaultBalance: 0,
      networkStartDate: Date.now(), 
      lastCrankedEpoch: 0, 
      settledEpochs: [],
      validators: [],
      userStakes: [],
      licenses: [],
      proposals: [],
      profiles: {}, // WIPE ALL USER DATA
      metadata: {
        version: prev.metadata.version,
        totalVolume: 0,
        totalUsers: 0,
        lastUpdate: Date.now()
      }
    }));
    setFeedback('success', 'Master Reset Complete: All protocol activities wiped. Epoch 1 re-anchored.');
  };

  if (!mounted || !isLoaded) return null;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in duration-500">
         <Lock className="w-12 h-12 text-primary" />
         <h1 className="text-4xl font-bold uppercase">Authority Required</h1>
         <p className="text-muted-foreground">Please connect your wallet to access the terminal.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in duration-500">
         <div className="p-6 bg-destructive/10 rounded-full border border-destructive/20">
            <ShieldAlert className="w-12 h-12 text-destructive" />
         </div>
         <h1 className="text-4xl font-bold uppercase text-destructive">Unauthorized Access</h1>
         <p className="text-muted-foreground max-w-md mx-auto">
            This terminal is restricted to the designated Protocol Authority wallet: <br/>
            <span className="font-mono text-primary break-all">{ADMIN_WALLET}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Vault Operations */}
            <div className="exn-card p-8 space-y-8 border-primary/20">
               <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold uppercase tracking-widest">Vault Capital Management</h3>
               </div>
               
               <div className="grid grid-cols-1 gap-8">
                  {/* Withdraw USDC */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Withdraw from License Vault (USDC)</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase">Vault: {state.usdcVaultBalance.toLocaleString()} USDC</p>
                    </div>
                    <div className="flex gap-2">
                       <input value={formatInput(withdrawUsdcAmt)} onChange={e => handleTextChange(e.target.value, setWithdrawUsdcAmt)} className="exn-input h-12" placeholder="Amount to withdraw..." />
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
                    {/* Fund Rewards */}
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

                    {/* Fund Treasury */}
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

            <div className="exn-card p-8 space-y-8 border-border/20">
               <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-bold uppercase tracking-widest">Economic Parameters</h3>
               </div>
               <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-black">30-Day Reward Block Pool (EXN)</p>
                    <div className="flex gap-2">
                       <input value={formatInput(newCap)} onChange={e => handleTextChange(e.target.value, setNewCap)} className="exn-input h-12" placeholder={(state?.rewardCap ?? 0).toString()} />
                       <button 
                         onClick={handleUpdateCap} 
                         disabled={!newCap.trim()}
                         className={`px-6 h-12 text-[9px] uppercase font-black transition-all ${newCap.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                       >
                         Update Pool
                       </button>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">XNode License Price (USDC)</p>
                      <div className="flex gap-2">
                         <input value={formatInput(newLicensePrice)} onChange={e => handleTextChange(e.target.value, setNewLicensePrice)} className="exn-input h-12" placeholder={(state?.licensePrice ?? 0).toString()} />
                         <button 
                           onClick={handleUpdateLicensePrice} 
                           disabled={!newLicensePrice.trim()}
                           className={`px-6 h-12 text-[9px] uppercase font-black transition-all ${newLicensePrice.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                         >
                           Update Price
                         </button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Total License Supply Cap</p>
                      <div className="flex gap-2">
                         <input value={formatInput(newLicenseLimit)} onChange={e => handleTextChange(e.target.value, setNewLicenseLimit)} className="exn-input h-12" placeholder={(state?.licenseLimit ?? 0).toString()} />
                         <button 
                           onClick={handleUpdateLicenseLimit} 
                           disabled={!newLicenseLimit.trim()}
                           className={`px-6 h-12 text-[9px] uppercase font-black transition-all ${newLicenseLimit.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                         >
                           Update Cap
                         </button>
                      </div>
                   </div>
                 </div>
               </div>
            </div>

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
                              Executing a Master Reset will permanently purge all on-chain simulation data. 
                              This includes XNodes, staking positions, governance proposals, user profiles, balances, and historical sharding records. 
                              The network timeline will be re-anchored to the current second, starting the cluster at Epoch 1.
                           </p>
                        </div>
                     </div>
                     <button 
                       onClick={() => {
                         if(window.confirm("CRITICAL: You are about to wipe the entire protocol database. This cannot be undone. Are you absolutely certain?")) handleFullProtocolReset();
                       }} 
                       className="w-full h-14 bg-destructive text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-destructive/90 transition-all shadow-xl shadow-destructive/20"
                     >
                       Execute Master Wipe & Re-anchor
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
                   <p className="text-2xl font-bold">{(state?.usdcVaultBalance ?? 0).toLocaleString()} <span className="text-sm text-emerald-500">USDC</span></p>
                 </div>
                 <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-black">DAO Treasury Vault (EXN)</p>
                   <p className="text-2xl font-bold">{(state?.treasuryBalance ?? 0).toLocaleString()} <span className="text-sm text-primary">EXN</span></p>
                 </div>
                 <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-black">Global Staked Vault (EXN)</p>
                   <p className="text-2xl font-bold">{(state?.stakedVaultBalance ?? 0).toLocaleString()} <span className="text-sm text-primary">EXN</span></p>
                 </div>
                 <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-black">Global Reward Vault (EXN)</p>
                   <p className="text-2xl font-bold">{(state?.rewardVaultBalance ?? 0).toLocaleString()} <span className="text-sm text-primary">EXN</span></p>
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

            <div className="exn-card p-6 space-y-4 border-border/20 bg-foreground/[0.02]">
               <div className="flex items-center gap-2">
                 <Database className="w-4 h-4 text-muted-foreground" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Protocol Context</p>
               </div>
               <div className="space-y-2 font-mono text-[9px] text-muted-foreground">
                  <p>EXN MINT: {shortenAddress(state?.exnMint || '')}</p>
                  <p>USDC MINT: {shortenAddress(state?.usdcMint || '')}</p>
                  <p>STAKED PDA: {shortenAddress(state?.stakedVaultPda || '')}</p>
                  <p>REWARD PDA: {shortenAddress(state?.rewardVaultPda || '')}</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
