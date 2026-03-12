
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
  ShieldAlert
} from 'lucide-react';

const ADMIN_WALLET = '9Kqt28pfMVBsBvXYYnYQCT2BZyorAwzbR6dUmgQfsZYW';

export default function AdminPage() {
  const { connected, publicKey } = useWallet();
  const { state, setState, isLoaded, setFeedback } = useProtocolState();
  
  const [newCap, setNewCap] = useState('');
  const [newLicensePrice, setNewLicensePrice] = useState('');
  const [newLicenseLimit, setNewLicenseLimit] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleResetTimeline = () => {
    setState(prev => ({ 
      ...prev, 
      networkStartDate: Date.now(), 
      lastCrankedEpoch: 0, 
      settledEpochs: [],
      validators: [],
      userStakes: [],
      licenses: [],
      proposals: [],
      profiles: {}
    }));
    setFeedback('success', 'Protocol timeline re-anchored and all state cleared. Epoch 1 is now active.');
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
            <div className="exn-card p-8 space-y-8 border-border/20">
               <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold uppercase tracking-widest">Network Timeline</h3>
               </div>
               <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black uppercase text-emerald-500">Timeline Management</p>
                    <p className="text-sm text-muted-foreground mt-1 font-mono text-[11px]">Origin: {new Date(state.networkStartDate).toLocaleString()}</p>
                    <p className="text-[10px] text-primary font-bold uppercase mt-2">Active Epoch: {state.lastCrankedEpoch + 1}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if(window.confirm("This will wipe all network state and restart the timeline at Epoch 1. Proceed?")) handleResetTimeline();
                    }} 
                    className="exn-button-outline text-[9px] px-4 py-2 uppercase font-black"
                  >
                    Reset All & Re-anchor
                  </button>
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
                       <input value={newCap} onChange={e => setNewCap(e.target.value)} className="exn-input h-12" placeholder={(state?.rewardCap ?? 0).toString()} />
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
                         <input value={newLicensePrice} onChange={e => setNewLicensePrice(e.target.value)} className="exn-input h-12" placeholder={(state?.licensePrice ?? 0).toString()} />
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
                         <input value={newLicenseLimit} onChange={e => setNewLicenseLimit(e.target.value)} className="exn-input h-12" placeholder={(state?.licenseLimit ?? 0).toString()} />
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
               <div className="flex items-center gap-2">
                 <Database className="w-4 h-4 text-primary" />
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
