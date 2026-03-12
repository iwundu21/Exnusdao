
"use client";

import React, { useState, useEffect } from 'react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress } from '@/lib/utils';
import { 
  ShieldCheck, 
  Settings, 
  AlertTriangle,
  Lock,
  Calendar,
  Database,
  Ticket,
  Coins
} from 'lucide-react';

export default function AdminPage() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, setState, isLoaded, setFeedback } = useProtocolState();
  
  const [mints, setMints] = useState({ 
    exn: state?.exnMint || 'EXN1111111111111111111111111111111111111111', 
    usdc: state?.usdcMint || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' 
  });
  const [newCap, setNewCap] = useState('');
  const [newLicensePrice, setNewLicensePrice] = useState('');
  const [newLicenseLimit, setNewLicenseLimit] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInitialize = () => {
    if (!connected) return setFeedback('error', 'Wallet connection required.');
    
    setState(prev => ({
      ...prev,
      isInitialized: true,
      adminWallet: walletAddress,
      exnMint: mints.exn,
      usdcMint: mints.usdc,
      rewardVaultPda: 'REWARD-PDA',
      treasuryVaultPda: 'TREASURY-PDA',
      usdcVaultPda: 'LICENSE-PDA',
      stakedVaultPda: 'STAKED-PDA',
      licensePrice: prev.licensePrice || 0,
      rewardCap: prev.rewardCap || 0,
      licenseLimit: prev.licenseLimit || 0,
      networkStartDate: prev.networkStartDate || null
    }));
    setFeedback('success', 'Protocol parameters anchored and vaults provisioned.');
  };

  const handleSetNetworkStart = () => {
    setState(prev => ({ ...prev, networkStartDate: Date.now() }));
    setFeedback('success', '10-Year Network Lifecycle Clock Started.');
  };

  const handleUpdateCap = () => {
    const cap = Number(newCap);
    if (isNaN(cap) || cap < 0) return setFeedback('error', 'Invalid cap.');
    setState(prev => ({ ...prev, rewardCap: cap }));
    setNewCap('');
    setFeedback('success', `14-day Reward Block Cap updated to ${cap.toLocaleString()} EXN.`);
  };

  const handleUpdateLicensePrice = () => {
    const price = Number(newLicensePrice);
    if (isNaN(price) || price < 0) return setFeedback('error', 'Invalid price.');
    setState(prev => ({ ...prev, licensePrice: price }));
    setNewLicensePrice('');
    setFeedback('success', `License Mint Price updated to ${price.toLocaleString()} USDC.`);
  };

  const handleUpdateLicenseLimit = () => {
    const limit = Number(newLicenseLimit);
    if (isNaN(limit) || limit < 0) return setFeedback('error', 'Invalid limit.');
    setState(prev => ({ ...prev, licenseLimit: limit }));
    setNewLicenseLimit('');
    setFeedback('success', `Total License Supply Cap updated to ${limit}.`);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="exn-card p-8 space-y-8 border-border/20">
               <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold uppercase tracking-widest">Network Timeline</h3>
               </div>
               {!state.networkStartDate ? (
                 <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                    <p className="text-sm text-muted-foreground">The 10-year reward cycle is inactive. Set the start date to begin block index 1000.</p>
                    <button onClick={handleSetNetworkStart} className="exn-button px-10 text-xs uppercase font-black">Set Network Start Date</button>
                 </div>
               ) : (
                 <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black uppercase text-emerald-500">Lifecycle Active</p>
                      <p className="text-sm text-muted-foreground mt-1 font-mono text-[11px]">Started: {new Date(state.networkStartDate).toLocaleString()}</p>
                    </div>
                    <button onClick={handleSetNetworkStart} className="exn-button-outline text-[9px] px-4 py-2 uppercase font-black">Reset Timeline</button>
                 </div>
               )}
            </div>

            <div className="exn-card p-8 space-y-8 border-border/20">
               <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-bold uppercase tracking-widest">Economic Parameters</h3>
               </div>
               <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-black">14-Day Reward Block Pool (EXN)</p>
                    <div className="flex gap-2">
                       <input value={newCap} onChange={e => setNewCap(e.target.value)} className="exn-input h-12" placeholder={(state?.rewardCap ?? 0).toString()} />
                       <button onClick={handleUpdateCap} className="exn-button-outline px-6 h-12 text-[9px] uppercase font-black">Update Pool</button>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">License Mint Price (USDC)</p>
                      <div className="flex gap-2">
                         <input value={newLicensePrice} onChange={e => setNewLicensePrice(e.target.value)} className="exn-input h-12" placeholder={(state?.licensePrice ?? 0).toString()} />
                         <button onClick={handleUpdateLicensePrice} className="exn-button-outline px-6 h-12 text-[9px] uppercase font-black">Update Price</button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Total License Supply Cap</p>
                      <div className="flex gap-2">
                         <input value={newLicenseLimit} onChange={e => setNewLicenseLimit(e.target.value)} className="exn-input h-12" placeholder={(state?.licenseLimit ?? 0).toString()} />
                         <button onClick={handleUpdateLicenseLimit} className="exn-button-outline px-6 h-12 text-[9px] uppercase font-black">Update Cap</button>
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
                   <p className="text-[10px] text-muted-foreground uppercase font-black">License Vault (USDC)</p>
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
               <button onClick={handleInitialize} className="w-full py-2 bg-primary/10 border border-primary/30 rounded text-[9px] font-black uppercase text-primary hover:bg-primary hover:text-black transition-all mt-4">
                 Re-Anchor Metadata
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
