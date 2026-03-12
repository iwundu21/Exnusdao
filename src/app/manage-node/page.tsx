"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, AlertTriangle, LogOut, Trash2, Wallet, ExternalLink, Activity, Upload, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress, getExplorerLink } from '@/lib/utils';

const SEED_DEPOSIT_AMOUNT = 15000000;

export default function ManageNodePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { state, setState, isLoaded, setFeedback } = useProtocolState();
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

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
           <p className="text-muted-foreground max-w-md mx-auto">Please connect your Solana wallet to manage your XNode.</p>
         </div>
      </div>
    );
  }

  const myNodes = state.validators.filter(v => v.owner === walletAddress);

  const startEditing = (node: any) => {
    setEditingNodeId(node.id);
    setFormData({
      name: node.name,
      location: node.location,
      description: node.description,
      logo_uri: node.logo_uri,
      commission_rate: (node.commission_rate || 0) / 100,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        return setFeedback('error', 'Image size exceeds 1MB.');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo_uri: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    if (!editingNodeId || !formData) return;
    
    if (formData.commission_rate < 0 || formData.commission_rate > 30) {
      return setFeedback('error', 'Invalid commission rate. Range: 0% to 30%.');
    }

    setState(prev => ({
      ...prev,
      validators: prev.validators.map(v => v.id === editingNodeId ? {
        ...v,
        name: formData.name,
        location: formData.location,
        description: formData.description,
        logo_uri: formData.logo_uri,
        commission_rate: formData.commission_rate * 100,
      } : v)
    }));
    setEditingNodeId(null);
    setFeedback('success', 'XNode metadata synchronized with network.');
  };

  const handleClaimCommission = (vId: string) => {
    const validator = state.validators.find(v => v.id === vId);
    if (!validator || (validator.accrued_node_rewards || 0) <= 0) return;
    const reward = validator.accrued_node_rewards;
    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance + reward,
      validators: prev.validators.map(v => v.id === vId ? { ...v, accrued_node_rewards: 0 } : v)
    }));
    setFeedback('success', `Withdrew ${reward.toFixed(2)} EXN performance commission.`);
  };

  const handleDepositSeed = (vId: string) => {
    if (state.exnBalance < SEED_DEPOSIT_AMOUNT) {
      return setFeedback('error', `Insufficient EXN. Seed deposit: ${SEED_DEPOSIT_AMOUNT.toLocaleString()} EXN.`);
    }
    setState(prev => ({
      ...prev,
      exnBalance: Math.max(0, prev.exnBalance - SEED_DEPOSIT_AMOUNT),
      validators: prev.validators.map(v => v.id === vId ? { 
        ...v, 
        seed_deposited: true, 
        is_active: true,
        total_staked: (v.total_staked || 0) + SEED_DEPOSIT_AMOUNT 
      } : v)
    }));
    setFeedback('success', 'Protocol seed deposited. XNode initialized.');
  };

  const handleWithdrawSeed = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node?.seed_deposited) return;
    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance + SEED_DEPOSIT_AMOUNT,
      validators: prev.validators.map(v => v.id === vId ? { 
        ...v, 
        seed_deposited: false, 
        is_active: false,
        total_staked: Math.max(0, (v.total_staked || 0) - SEED_DEPOSIT_AMOUNT) 
      } : v)
    }));
    setFeedback('success', 'Protocol seed returned to wallet. XNode deactivated.');
  };

  const handleCloseAccount = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node) return;
    const delegatorStake = (node.total_staked || 0) - (node.seed_deposited ? SEED_DEPOSIT_AMOUNT : 0);
    const activeDelegators = state.userStakes.filter(s => s.validator_id === vId && !s.unstaked);
    if (delegatorStake > 0.01 || activeDelegators.length > 0) {
       return setFeedback('error', 'Active delegator capital found. Cannot decommission.');
    }
    const seedRefund = node.seed_deposited ? SEED_DEPOSIT_AMOUNT : 0;
    const rewards = node.accrued_node_rewards || 0;
    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance + seedRefund + rewards,
      validators: prev.validators.filter(v => v.id !== vId),
      licenses: prev.licenses.map(l => l.id === node.license_id ? { ...l, is_burned: true, is_claimed: false } : l)
    }));
    setFeedback('success', 'XNode account terminated. Associated XNode License burned.');
    router.push('/');
  };

  const toggleNodeStatus = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node?.seed_deposited) {
      return setFeedback('warning', 'Seed deposit required to activate XNode.');
    }
    setState(prev => ({
      ...prev,
      validators: prev.validators.map(v => v.id === vId ? { ...v, is_active: !v.is_active } : v)
    }));
    setFeedback('success', `XNode operational status updated: ${!node.is_active ? 'ONLINE' : 'PAUSED'}.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">XNode Management</h1>
        <p className="text-muted-foreground max-w-xl">
          Optimize your validator parameters, manage protocol seed, and harvest performance commissions.
        </p>
      </div>

      {myNodes.length === 0 ? (
        <div className="exn-card p-20 flex flex-col items-center justify-center text-center space-y-6">
          <p className="text-muted-foreground uppercase font-black tracking-widest">No XNodes registered to this wallet</p>
          <Link href="/register-node" className="exn-button">Register New XNode</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {myNodes.map((node) => {
            const isEditing = editingNodeId === node.id;
            const logoToDisplay = isEditing ? formData.logo_uri : node.logo_uri;
            const isUrl = logoToDisplay?.startsWith('http') || logoToDisplay?.startsWith('data:');
            const logoUrl = isUrl ? logoToDisplay : `https://picsum.photos/seed/${logoToDisplay}/400/400`;

            const isUpdateDisabled = !formData?.name.trim() || !formData?.location.trim() || !formData?.description.trim();

            return (
              <div key={node.id} className="exn-card p-10 space-y-10 border-primary/20">
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                  <div className="w-full lg:w-1/3 space-y-8">
                    <div className="flex items-center gap-6">
                      <div 
                        onClick={() => isEditing && fileInputRef.current?.click()}
                        className={`relative w-24 h-24 rounded-2xl overflow-hidden border border-border group ${isEditing ? 'cursor-pointer hover:border-primary transition-all' : ''}`}
                      >
                         <Image src={logoUrl} alt={node.name} fill className="object-cover" />
                         {isEditing && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload className="w-6 h-6 text-white" />
                           </div>
                         )}
                         <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground uppercase">{node.name}</h2>
                        <p className="text-xs text-muted-foreground font-mono">{node.id}</p>
                      </div>
                    </div>

                    {!node.seed_deposited ? (
                      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3 text-amber-500">
                          <AlertTriangle className="w-5 h-5" />
                          <p className="text-[10px] uppercase font-black tracking-widest">Initialization Required</p>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          A minimum seed deposit of <span className="text-foreground font-bold">{SEED_DEPOSIT_AMOUNT.toLocaleString()} EXN</span> is required.
                        </p>
                        <button onClick={() => handleDepositSeed(node.id)} className="w-full py-3 bg-amber-500 text-black text-[10px] font-black uppercase rounded-lg hover:bg-amber-400 transition-all">
                          Deposit Protocol Seed
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-[10px] uppercase font-black tracking-widest">
                          Protocol Seed Active
                        </div>
                        <button onClick={() => handleWithdrawSeed(node.id)} className="w-full py-2 border border-destructive/20 text-destructive text-[10px] font-black uppercase rounded-lg hover:bg-destructive/10 transition-all flex items-center justify-center gap-2">
                          <LogOut className="w-3 h-3" /> Withdraw Protocol Seed
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-foreground/5 rounded-xl border border-border">
                          <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Total Stake</p>
                          <p className="text-xl font-bold text-primary">{(node.total_staked || 0).toLocaleString()}</p>
                       </div>
                       <div className="p-4 bg-foreground/5 rounded-xl border border-border">
                          <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Commission</p>
                          <p className="text-xl font-bold text-foreground">{((node.commission_rate || 0) / 100).toFixed(1)}%</p>
                       </div>
                    </div>

                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center">
                      <div>
                         <p className="text-[10px] text-emerald-500 uppercase font-black">Accrued Rewards</p>
                         <p className="text-2xl font-bold text-emerald-500">{(node.accrued_node_rewards || 0).toFixed(2)} EXN</p>
                      </div>
                      <button onClick={() => handleClaimCommission(node.id)} disabled={(node.accrued_node_rewards || 0) <= 0} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${node.accrued_node_rewards > 0 ? 'bg-emerald-500 text-black' : 'bg-foreground/5 text-muted-foreground cursor-not-allowed'}`}>
                        Claim
                      </button>
                    </div>

                    <div className="space-y-4">
                      <button onClick={() => toggleNodeStatus(node.id)} disabled={!node.seed_deposited} className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${!node.seed_deposited ? 'bg-foreground/5 text-muted-foreground cursor-not-allowed' : node.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-destructive/10 text-destructive border border-destructive/30'}`}>
                        {node.is_active ? '● XNode Active' : node.seed_deposited ? '○ XNode Paused' : '○ Pending Seed'}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-12">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">Metadata & Parameters</h3>
                        {!isEditing && (
                          <button onClick={() => startEditing(node)} className="exn-button-outline px-4 py-2 text-[10px]">Edit Details</button>
                        )}
                      </div>

                      <div className={`space-y-6 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">XNode Name</label>
                            <input value={isEditing ? formData.name : node.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-12" readOnly={!isEditing} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Location</label>
                            <input value={isEditing ? formData.location : node.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-12" readOnly={!isEditing} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Commission % (Max 30%)</label>
                            <div className="relative">
                              <input type="number" value={isEditing ? formData.commission_rate : ((node.commission_rate || 0) / 100)} onChange={e => setFormData({...formData, commission_rate: Number(e.target.value)})} className="exn-input h-12" readOnly={!isEditing} />
                              <span className="absolute right-4 top-3.5 text-muted-foreground font-bold">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Logo Seed/URI</label>
                            <input value={isEditing ? formData.logo_uri : node.logo_uri} onChange={e => setFormData({...formData, logo_uri: e.target.value})} className="exn-input h-12 font-mono text-xs" readOnly={!isEditing} />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Bio / Description</label>
                            <textarea value={isEditing ? formData.description : node.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[100px] py-4" readOnly={!isEditing} />
                          </div>
                        </div>

                        {isEditing && (
                          <div className="flex gap-4 pt-4">
                            <button 
                              onClick={handleUpdate} 
                              disabled={isUpdateDisabled}
                              className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${isUpdateDisabled ? 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed' : 'exn-button'}`}
                            >
                               <Save className="w-4 h-4" /> Save Network Updates
                            </button>
                            <button onClick={() => setEditingNodeId(null)} className="exn-button-outline px-10">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-10 border-t border-destructive/20">
                       <h3 className="text-xs font-black text-destructive uppercase tracking-[0.3em] mb-6">Danger Zone</h3>
                       <div className="p-8 bg-destructive/5 border border-destructive/10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-foreground uppercase">Close XNode Account</p>
                             <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                               Decommissioning is permanent. The associated XNode license will be burned 🔥 and cannot be reused.
                             </p>
                          </div>
                          <button onClick={() => { if (window.confirm("Permanent closure will burn your XNode license. Proceed?")) handleCloseAccount(node.id); }} className="px-8 py-3 bg-destructive/10 text-destructive border border-destructive/40 rounded-lg text-[10px] font-black uppercase hover:bg-destructive hover:text-white transition-all flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Terminate XNode Account
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
