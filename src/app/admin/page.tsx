"use client";

import React, { useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress, getExplorerLink } from '@/lib/utils';
import { 
  ShieldCheck, 
  Settings, 
  Coins, 
  CircleDollarSign, 
  ArrowUpRight, 
  AlertTriangle,
  Lock,
  ExternalLink,
  Zap,
  TrendingUp,
  Banknote,
  Layers,
  Calendar
} from 'lucide-react';

export default function AdminPage() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, setState, isLoaded, setFeedback } = useProtocolState();
  
  const [mints, setMints] = useState({ 
    exn: 'EXN1111111111111111111111111111111111111111', 
    usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' 
  });
  const [funding, setFunding] = useState({ reward: '', treasury: '' });
  const [newCap, setNewCap] = useState('');
  const [newLicensePrice, setNewLicensePrice] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = state.adminWallet === walletAddress;

  const handleInitialize = () => {
    if (!connected) return setFeedback('error', 'Wallet connection required.');
    
    setState(prev => ({
      ...prev,
      isInitialized: true,
      adminWallet: walletAddress,
      exnMint: mints.exn,
      usdcMint: mints.usdc,
      rewardVaultPda: 'RV-MOCK',
      treasuryVaultPda: 'TV-MOCK',
      usdcVaultPda: 'LV-MOCK',
      stakedVaultPda: 'SV-MOCK',
      licensePrice: 0,
      rewardCap: 0
    }));
    setFeedback('success', 'Protocol initialized. Params set to 0.');
  };

  const handleSetNetworkStart = () => {
    setState(prev => ({ ...prev, networkStartDate: Date.now() }));
    setFeedback('success', '10-Year Network Lifecycle Clock Started.');
  };

  const handleUpdateCap = () => {
    const cap = Number(newCap);
    if (!cap || cap < 0) return setFeedback('error', 'Invalid cap.');
    setState(prev => ({ ...prev, rewardCap: cap }));
    setNewCap('');
    setFeedback('success', `Distribution cap updated to ${cap.toLocaleString()} EXN.`);
  };

  const handleUpdateLicensePrice = () => {
    const price = Number(newLicensePrice);
    if (!price || price < 0) return setFeedback('error', 'Invalid price.');
    setState(prev => ({ ...prev, licensePrice: price }));
    setNewLicensePrice('');
    setFeedback('success', `License price updated to ${price.toLocaleString()} USDC.`);
  };

  if (!mounted || !isLoaded) return null;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8">
         <Lock className="w-12 h-12 text-primary" />
         <h1 className="text-4xl font-bold uppercase">Authority Required</h1>
         <p className="text-muted-foreground">Please connect your wallet to access the terminal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-primary" />
             <p className="text-xs font-black uppercase tracking-widest text-primary">Protocol Admin</p>
          </div>
          <h1 className="text-6xl font-bold exn-gradient-text uppercase">Command Center</h1>
        </div>
      </div>

      {!state.isInitialized ? (
        <div className="exn-card p-10 border-amber-500/30 bg-amber-500/5 space-y-10">
           <div className="flex items-center gap-4 text-amber-500">
             <AlertTriangle className="w-8 h-8" />
             <h3 className="text-xl font-bold uppercase">Protocol Not Initialized</h3>
           </div>
           <button onClick={handleInitialize} className="exn-button w-full h-14 uppercase font-black">Initialize Global State</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="exn-card p-8 space-y-8 border-border/20">
                 <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Network Lifecycle</h3>
                 </div>
                 {!state.networkStartDate ? (
                   <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                      <p className="text-sm text-muted-foreground">The 10-year reward block cycle is currently inactive.</p>
                      <button onClick={handleSetNetworkStart} className="exn-button px-10 text-xs">Set Network Start Date</button>
                   </div>
                 ) : (
                   <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs font-black uppercase text-emerald-500">Lifecycle Active</p>
                      <p className="text-sm text-muted-foreground mt-1">Started: {new Date(state.networkStartDate).toLocaleString()}</p>
                   </div>
                 )}
              </div>

              <div className="exn-card p-8 space-y-8 border-border/20">
                 <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Protocol Parameters</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Reward Block Cap (EXN)</p>
                      <div className="flex gap-2">
                         <input value={newCap} onChange={e => setNewCap(e.target.value)} className="exn-input h-12" placeholder={state.rewardCap.toString()} />
                         <button onClick={handleUpdateCap} className="exn-button-outline px-4 h-12 text-[9px] uppercase font-black">Apply</button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">License Price (USDC)</p>
                      <div className="flex gap-2">
                         <input value={newLicensePrice} onChange={e => setNewLicensePrice(e.target.value)} className="exn-input h-12" placeholder={state.licensePrice.toString()} />
                         <button onClick={handleUpdateLicensePrice} className="exn-button-outline px-4 h-12 text-[9px] uppercase font-black">Apply</button>
                      </div>
                   </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="exn-card p-8 border-emerald-500/30 bg-emerald-500/5 space-y-6">
                 <h3 className="text-lg font-bold uppercase tracking-widest">License Settlement</h3>
                 <p className="text-3xl font-bold">{state.usdcVaultBalance.toLocaleString()} <span className="text-sm text-emerald-500">USDC</span></p>
                 <button disabled className="w-full h-12 bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed text-[10px] uppercase font-black">Withdraw to Admin</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
