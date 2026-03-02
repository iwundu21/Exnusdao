
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
  RefreshCcw,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronRight
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = state.adminWallet === walletAddress;

  const handleInitialize = () => {
    if (!connected) return setFeedback('error', 'Wallet connection required for initialization.');
    
    // Derived PDA Mock addresses (Program Derived Addresses)
    const rewardVaultPda = `RVD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const treasuryVaultPda = `TVD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const usdcVaultPda = `UVD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    setState(prev => ({
      ...prev,
      isInitialized: true,
      adminWallet: walletAddress,
      exnMint: mints.exn,
      usdcMint: mints.usdc,
      rewardVaultPda,
      treasuryVaultPda,
      usdcVaultPda
    }));
    setFeedback('success', 'Protocol smart contract initialized. Authority assigned to active wallet.');
  };

  const handleFundRewardVault = () => {
    const amt = Number(funding.reward);
    if (!amt || amt <= 0) return setFeedback('error', 'Specify valid EXN amount to fund rewards.');
    if (state.exnBalance < amt) return setFeedback('error', 'Insufficient EXN in wallet.');

    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance - amt,
      rewardVaultBalance: prev.rewardVaultBalance + amt
    }));
    setFunding({ ...funding, reward: '' });
    setFeedback('success', `Funded Reward Vault with ${amt.toLocaleString()} EXN.`);
  };

  const handleFundTreasury = () => {
    const amt = Number(funding.treasury);
    if (!amt || amt <= 0) return setFeedback('error', 'Specify valid EXN amount for treasury.');
    if (state.exnBalance < amt) return setFeedback('error', 'Insufficient EXN in wallet.');

    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance - amt,
      treasuryBalance: prev.treasuryBalance + amt
    }));
    setFunding({ ...funding, treasury: '' });
    setFeedback('success', `Funded Treasury Vault with ${amt.toLocaleString()} EXN.`);
  };

  const handleUpdateCap = () => {
    const cap = Number(newCap);
    if (!cap || cap <= 0) return setFeedback('error', 'Invalid distribution cap.');
    setState(prev => ({ ...prev, rewardCap: cap }));
    setNewCap('');
    setFeedback('success', `Network distribution cap updated to ${cap.toLocaleString()} EXN.`);
  };

  const handleWithdrawUsdc = () => {
    const amt = state.usdcVaultBalance;
    if (amt <= 0) return setFeedback('warning', 'USDC vault is currently empty.');
    setState(prev => ({
      ...prev,
      usdcBalance: prev.usdcBalance + amt,
      usdcVaultBalance: 0
    }));
    setFeedback('success', `Withdrew ${amt.toLocaleString()} USDC from protocol vault to admin wallet.`);
  };

  if (!mounted || !isLoaded) return null;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in duration-500">
         <div className="p-6 bg-primary/10 rounded-full border border-primary/20">
           <Lock className="w-12 h-12 text-primary" />
         </div>
         <div className="space-y-2">
           <h1 className="text-4xl font-bold uppercase tracking-tight">Authority Required</h1>
           <p className="text-muted-foreground">Please connect your wallet to access the protocol administration terminal.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
               <ShieldCheck className="w-5 h-5 text-primary" />
             </div>
             <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Protocol Admin</p>
          </div>
          <h1 className="text-6xl font-bold exn-gradient-text tracking-tighter uppercase">Command Center</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Configure on-chain protocol parameters, manage decentralized vaults, and authorize global initialization. 
            {state.isInitialized && (
              <span className="block mt-2 font-mono text-[10px] bg-foreground/5 px-2 py-1 rounded w-fit">
                Authority: {shortenAddress(state.adminWallet || '')}
              </span>
            )}
          </p>
        </div>
        {state.isInitialized && (
          <div className="flex items-center gap-4">
             <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-emerald-500 uppercase font-black">Status</p>
                  <p className="text-xl font-bold text-foreground">INITIALIZED</p>
                </div>
                <div className="w-px h-10 bg-emerald-500/20" />
                <div className="space-y-1">
                  <p className="text-[10px] text-emerald-500 uppercase font-black">Network</p>
                  <p className="text-xl font-bold text-foreground">MAINNET-BETA</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {!state.isInitialized ? (
        <div className="exn-card p-10 border-amber-500/30 bg-amber-500/5 space-y-10">
           <div className="flex items-center gap-4 text-amber-500">
             <AlertTriangle className="w-8 h-8" />
             <div>
               <h3 className="text-xl font-bold uppercase tracking-widest">Protocol Not Initialized</h3>
               <p className="text-xs font-bold uppercase opacity-60">Smart contracts require anchoring to a decentralized authority.</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">EXN Token Mint</label>
                 <input 
                  value={mints.exn} 
                  onChange={e => setMints({...mints, exn: e.target.value})} 
                  className="exn-input font-mono text-xs h-12" 
                />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">USDC Token Mint</label>
                 <input 
                  value={mints.usdc} 
                  onChange={e => setMints({...mints, usdc: e.target.value})} 
                  className="exn-input font-mono text-xs h-12" 
                />
              </div>
           </div>

           <div className="p-6 bg-background/50 rounded-2xl border border-border/10 space-y-4">
              <p className="text-[10px] text-muted-foreground uppercase font-black leading-relaxed">
                Initialization will automatically derive PDAs for the Reward, Treasury, and USDC vaults based on the provided mints. The wallet currently connected ({shortenAddress(walletAddress)}) will be set as the Permanent Protocol Admin.
              </p>
              <button onClick={handleInitialize} className="exn-button w-full h-14 uppercase tracking-[0.3em] text-xs font-black">
                Authorize Global Initialization
              </button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Vault Balances */}
           <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="exn-card p-6 border-primary/20 bg-primary/5">
                 <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-3">Reward Vault</p>
                 <p className="text-2xl font-bold text-foreground">{(state.rewardVaultBalance || 0).toLocaleString()} EXN</p>
                 <p className="text-[8px] font-mono text-muted-foreground mt-2">{state.rewardVaultPda}</p>
              </div>
              <div className="exn-card p-6 border-secondary/20 bg-secondary/5">
                 <p className="text-[10px] uppercase font-black tracking-widest text-secondary mb-3">Treasury Vault</p>
                 <p className="text-2xl font-bold text-foreground">{(state.treasuryBalance || 0).toLocaleString()} EXN</p>
                 <p className="text-[8px] font-mono text-muted-foreground mt-2">{state.treasuryVaultPda}</p>
              </div>
              <div className="exn-card p-6 border-emerald-500/20 bg-emerald-500/5">
                 <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-3">USDC License Vault</p>
                 <p className="text-2xl font-bold text-foreground">{(state.usdcVaultBalance || 0).toLocaleString()} USDC</p>
                 <p className="text-[8px] font-mono text-muted-foreground mt-2">{state.usdcVaultPda}</p>
              </div>
              <div className="exn-card p-6 border-border bg-foreground/5">
                 <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3">Epoch Reward Cap</p>
                 <p className="text-2xl font-bold text-foreground">{(state.rewardCap || 0).toLocaleString()} EXN</p>
                 <p className="text-[8px] uppercase font-bold text-muted-foreground mt-2">14-Day Cycle</p>
              </div>
           </div>

           {/* Admin Actions */}
           <div className="lg:col-span-2 space-y-8">
              <div className="exn-card p-8 space-y-8 border-border/20">
                 <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Liquidity Injections</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <p className="text-[10px] text-muted-foreground uppercase font-black">Fund Reward Vault</p>
                       <div className="relative">
                          <input 
                            type="number" 
                            value={funding.reward}
                            onChange={e => setFunding({...funding, reward: e.target.value})}
                            placeholder="Amount EXN" 
                            className="exn-input h-12" 
                          />
                          <button onClick={handleFundRewardVault} className="absolute right-2 top-2 h-8 px-4 bg-primary text-black text-[9px] font-black uppercase rounded">Fund</button>
                       </div>
                       <p className="text-[9px] text-muted-foreground uppercase">Available: {state.exnBalance.toLocaleString()} EXN</p>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] text-muted-foreground uppercase font-black">Fund Treasury Vault</p>
                       <div className="relative">
                          <input 
                            type="number" 
                            value={funding.treasury}
                            onChange={e => setFunding({...funding, treasury: e.target.value})}
                            placeholder="Amount EXN" 
                            className="exn-input h-12" 
                          />
                          <button onClick={handleFundTreasury} className="absolute right-2 top-2 h-8 px-4 bg-secondary text-white text-[9px] font-black uppercase rounded">Fund</button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="exn-card p-8 space-y-8 border-border/20">
                 <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Network Parameters</h3>
                 </div>
                 
                 <div className="space-y-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-black">14-Day Distribution Cap (EXN)</p>
                    <div className="flex gap-4">
                       <input 
                        type="number" 
                        value={newCap} 
                        onChange={e => setNewCap(e.target.value)} 
                        className="exn-input flex-1 h-12" 
                        placeholder={state.rewardCap.toString()}
                      />
                       <button onClick={handleUpdateCap} className="exn-button-outline px-8 h-12 text-[10px] font-black uppercase">Apply Change</button>
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase">Current: {state.rewardCap.toLocaleString()} EXN per epoch</p>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="exn-card p-8 border-emerald-500/30 bg-emerald-500/5 space-y-6">
                 <div className="flex items-center gap-3">
                    <CircleDollarSign className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Protocol Revenue</h3>
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Withdraw License Capital</p>
                    <p className="text-3xl font-bold text-foreground">{(state.usdcVaultBalance || 0).toLocaleString()} <span className="text-sm text-emerald-500">USDC</span></p>
                 </div>
                 <button 
                  onClick={handleWithdrawUsdc}
                  disabled={!isAdmin || state.usdcVaultBalance <= 0}
                  className={`w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isAdmin && state.usdcVaultBalance > 0 ? 'bg-emerald-500 text-black hover:opacity-90' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                >
                  Withdraw to Admin <ArrowUpRight className="w-4 h-4" />
                </button>
                {!isAdmin && (
                  <p className="text-[9px] text-destructive text-center uppercase font-black">Restricted: Non-Admin Access</p>
                )}
              </div>

              <div className="exn-card p-6 border-border bg-foreground/[0.02] space-y-4">
                 <p className="text-[10px] text-muted-foreground uppercase font-black">Program Metadata</p>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                       <span className="text-muted-foreground">EXN Mint</span>
                       <a href={getExplorerLink(state.exnMint || '')} target="_blank" className="text-primary flex items-center gap-1 font-mono">{shortenAddress(state.exnMint || '')} <ExternalLink className="w-2.5 h-2.5" /></a>
                    </div>
                    <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                       <span className="text-muted-foreground">USDC Mint</span>
                       <a href={getExplorerLink(state.usdcMint || '')} target="_blank" className="text-emerald-500 flex items-center gap-1 font-mono">{shortenAddress(state.usdcMint || '')} <ExternalLink className="w-2.5 h-2.5" /></a>
                    </div>
                    <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                       <span className="text-muted-foreground">Admin Pubkey</span>
                       <span className="text-foreground font-mono">{shortenAddress(state.adminWallet || '')}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
