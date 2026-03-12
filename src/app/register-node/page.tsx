
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, AlertCircle, ExternalLink, Wallet, Search, Ticket, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress, getExplorerLink } from '@/lib/utils';

export default function RegisterNodePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, setState, isLoaded, setFeedback } = useProtocolState();
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_uri: '',
    location: '',
    commission: 10,
    licenseId: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Syncing Network State</p>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-10 py-40 space-y-8 animate-in fade-in duration-500">
         <div className="p-6 bg-primary/10 rounded-full border border-primary/20">
           <Wallet className="w-12 h-12 text-primary" />
         </div>
         <div className="space-y-4">
           <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">Wallet Connection Required</h1>
           <p className="text-muted-foreground max-w-md mx-auto">Please connect your Solana wallet to verify License NFT ownership.</p>
         </div>
      </div>
    );
  }

  const existingNode = state.validators.find(v => v.owner === walletAddress);
  const hasExistingNode = !!existingNode;

  const handleRegister = () => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    if (hasExistingNode) return setFeedback('warning', 'Only one node registration permitted per wallet.');
    
    const license = state.licenses.find(l => l.id === formData.licenseId);
    if (!license) return setFeedback('error', 'Invalid license NFT selected.');
    if (license.owner !== walletAddress) return setFeedback('error', 'License NFT ownership verification failed.');
    if (license.is_burned) return setFeedback('error', 'License NFT has been burned.');
    if (license.is_claimed) return setFeedback('error', 'License is already bound to another node.');
    
    if (!formData.name || !formData.location) return setFeedback('error', 'Node name and location required.');

    const newNode = {
      id: `v${Date.now()}`,
      owner: walletAddress,
      name: formData.name,
      description: formData.description,
      logo_uri: formData.logo_uri || "default-seed",
      location: formData.location,
      is_active: false,
      seed_deposited: false,
      total_staked: 0,
      commission_rate: formData.commission * 100,
      accrued_node_rewards: 0,
      global_reward_index: 0,
      license_id: formData.licenseId
    };

    setState(prev => ({
      ...prev,
      validators: [...prev.validators, newNode],
      licenses: prev.licenses.map(l => l.id === formData.licenseId ? { ...l, is_claimed: true } : l)
    }));
    
    setFeedback('success', 'NFT-Bound node registration successful.');
    setTimeout(() => router.push('/manage-node'), 1500);
  };

  const availableLicenses = state.licenses.filter(l => l.owner === walletAddress && !l.is_claimed && !l.is_burned);

  return (
    <div className="max-w-4xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">Node Provisioning</h1>
        <p className="text-muted-foreground max-w-xl">
          Register a validator node by binding it to a verified **Node License NFT**.
        </p>
      </div>

      {hasExistingNode ? (
        <div className="exn-card p-12 flex flex-col items-center justify-center text-center space-y-8 border-amber-500/20 bg-amber-500/5">
           <AlertCircle className="w-12 h-12 text-amber-500" />
           <div className="space-y-2">
             <h2 className="text-2xl font-bold text-foreground uppercase">Active Node Detected</h2>
             <p className="text-xs text-muted-foreground uppercase tracking-widest">Only one node registration permitted per wallet address.</p>
           </div>
           <Link href="/manage-node" className="exn-button">Manage Existing Node</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 exn-card p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">NFT Authorization</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Select License NFT</label>
                <div className="relative">
                   <Ticket className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground/40" />
                   <select 
                    value={formData.licenseId} 
                    onChange={e => setFormData({...formData, licenseId: e.target.value})} 
                    className="exn-input h-12 pl-12 text-[10px] font-mono"
                   >
                    <option value="">Select a Minted License...</option>
                    {availableLicenses.map(l => (
                      <option key={l.id} value={l.id}>{l.id}</option>
                    ))}
                   </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Node Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-12 text-sm" placeholder="e.g. CyberCore-01" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Location</label>
                <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-12 text-sm" placeholder="e.g. Frankfurt, DE" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Commission (0-30%)</label>
                <div className="relative">
                  <input type="number" value={formData.commission} onChange={e => setFormData({...formData, commission: Math.min(30, Math.max(0, Number(e.target.value)))})} className="exn-input h-12 text-sm" />
                  <span className="absolute right-4 top-3.5 text-muted-foreground font-bold">%</span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Validator Bio</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[100px] py-4 text-xs" placeholder="Describe your hardware and commitment..." />
              </div>
            </div>
            
            <button 
              onClick={handleRegister} 
              disabled={!formData.licenseId || !formData.name} 
              className={`w-full h-14 uppercase tracking-widest font-black transition-all ${(!formData.licenseId || !formData.name) ? 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed' : 'exn-button'}`}
            >
              Bind Node to NFT
            </button>
          </div>

          <div className="space-y-6">
            <div className="exn-card aspect-square relative flex items-center justify-center overflow-hidden border-primary/20 bg-black/40">
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto border border-border">
                  <ShieldCheck className="w-8 h-8 text-muted-foreground/20" />
                </div>
                <p className="text-[10px] uppercase font-black text-muted-foreground/40 tracking-widest">Identity Preview</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
