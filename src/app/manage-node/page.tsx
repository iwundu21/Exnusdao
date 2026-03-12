"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, AlertTriangle, LogOut, Trash2, Wallet, ExternalLink, Activity, Upload, MapPin, Users, TrendingUp, Info } from 'lucide-react';
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
  
  const { state, setState, isLoaded, setFeedback, exnBalance, updateUserBalance } = useProtocolState();
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
    
    updateUserBalance(walletAddress, reward, 0);
    setState(prev => ({
      ...prev,
      validators: prev.validators.map(v => v.id === vId ? { ...v, accrued_node_rewards: 0 } : v)
    }));
    setFeedback('success', `Withdrew ${reward.toFixed(2)} EXN performance commission.`);
  };

  const handleDepositSeed = (vId: string) => {
    if (exnBalance < SEED_DEPOSIT_AMOUNT) {
      return setFeedback('error', `Insufficient EXN. Seed deposit of ${SEED_DEPOSIT_AMOUNT.toLocaleString()} EXN required.`);
    }
    
    updateUserBalance(walletAddress, -SEED_DEPOSIT_AMOUNT, 0);
    setState(prev => ({
      ...prev,
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

    updateUserBalance(walletAddress, SEED_DEPOSIT_AMOUNT, 0);
    setState(prev => ({
      ...prev,
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
    const activeDelegators = state.userStakes.filter(s => s.validator_id === vId && !s.unstaked && s.owner !== walletAddress);
    
    if (activeDelegators.length > 0) {
       return setFeedback('error', 'Active delegator capital found. Cannot decommission while external capital is locked.');
    }

    const seedRefund = node.seed_deposited ? SEED_DEPOSIT_AMOUNT : 0;
    const rewards = node.accrued_node_rewards || 0;
    
    updateUserBalance(walletAddress, seedRefund + rewards, 0);
    setState(prev => ({
      ...prev,
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
    <div className="max-w-7xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">XNode Management</h1>
        <p className="text-muted-foreground max-w-xl text-sm">
          Optimize your validator parameters, monitor real-time staker activity, and harvest protocol commissions.
        </p>
      </div>

      {myNodes.length === 0 ? (
        <div className="exn-card p-20 flex flex-col items-center justify-center text-center space-y-6">
          <p className="text-muted-foreground uppercase font-black tracking-widest">No XNodes registered to this wallet</p>
          <Link href="/register-node" className="exn-button">Register New XNode</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12">
          {myNodes.map((node) => {
            const isEditing = editingNodeId === node.id;
            const logoToDisplay = isEditing ? formData.logo_uri : node.logo_uri;
            const isUrl = logoToDisplay?.startsWith('http') || logoToDisplay?.startsWith('data:');
            const logoUrl = isUrl ? logoToDisplay : `https://picsum.photos/seed/${logoToDisplay}/400/400`;

            const nodeStakes = state.userStakes.filter(s => s.validator_id === node.id && !s.unstaked);
            const stakerCount = Array.from(new Set(nodeStakes.map(s => s.owner))).length;
            const delegatorCapital = nodeStakes.filter(s => s.owner !== walletAddress).reduce((acc, s) => acc + s.amount, 0);

            const isUpdateDisabled = !formData?.name.trim() || !formData?.location.trim() || !formData?.description.trim();

            return (
              <div key={node.id} className="exn-card p-12 space-y-12 border-primary/20">
                <div className="flex flex-col xl:flex-row justify-between gap-12">
                  <div className="w-full xl:w-1/3 space-y-10">
                    <div className="flex items-center gap-6">
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-border bg-black/40">
                         <Image src={logoUrl} alt={node.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-foreground uppercase tracking-tight">{node.name}</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-black uppercase">Live Identity</span>
                          <p className="text-[9px] text-muted-foreground font-mono">{shortenAddress(node.id)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                         <Activity className="w-4 h-4" /> Node Performance
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-foreground/5 rounded-2xl border border-border/40 group hover:border-primary/20 transition-all">
                             <div className="flex items-center gap-2 mb-2">
                                <Users className="w-3 h-3 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground uppercase font-black">Total Stakers</p>
                             </div>
                             <p className="text-2xl font-bold text-foreground">{stakerCount} <span className="text-xs text-muted-foreground font-medium">Wallets</span></p>
                          </div>
                          <div className="p-5 bg-foreground/5 rounded-2xl border border-border/40 group hover:border-primary/20 transition-all">
                             <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground uppercase font-black">Capital Weight</p>
                             </div>
                             <p className="text-2xl font-bold text-primary">{(node.total_staked || 0).toLocaleString()}</p>
                          </div>
                          <div className="col-span-2 p-5 bg-foreground/5 rounded-2xl border border-border/40">
                             <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-black">Delegator Contributions</p>
                                <p className="text-xs font-bold text-foreground">{delegatorCapital.toLocaleString()} EXN</p>
                             </div>
                             <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${Math.min(100, (delegatorCapital / (node.total_staked || 1)) * 100)}%` }} 
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                           <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">Accrued Commission</p>
                           <p className="text-3xl font-bold text-emerald-500">{(node.accrued_node_rewards || 0).toFixed(2)} <span className="text-sm font-medium">EXN</span></p>
                        </div>
                        <button onClick={() => handleClaimCommission(node.id)} disabled={(node.accrued_node_rewards || 0) <= 0} className={`h-12 px-8 rounded-xl text-[10px] font-black uppercase transition-all ${node.accrued_node_rewards > 0 ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-foreground/5 text-muted-foreground cursor-not-allowed'}`}>
                          Harvest
                        </button>
                      </div>
                    </div>

                    {!node.seed_deposited ? (
                      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3 text-amber-500">
                          <AlertTriangle className="w-5 h-5" />
                          <p className="text-[10px] uppercase font-black tracking-widest">Seed Deposit Required</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Deposit <span className="text-foreground font-bold">{SEED_DEPOSIT_AMOUNT.toLocaleString()} EXN</span> to start sharding epoch rewards.
                        </p>
                        <button onClick={() => handleDepositSeed(node.id)} className="w-full h-12 bg-amber-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-amber-400 transition-all">
                          Initialize Protocol Seed
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleWithdrawSeed(node.id)} className="w-full h-12 border border-destructive/20 text-destructive text-[10px] font-black uppercase rounded-xl hover:bg-destructive/10 transition-all flex items-center justify-center gap-2">
                        <LogOut className="w-3 h-3" /> Withdraw Protocol Seed
                      </button>
                    )}

                    <button onClick={() => toggleNodeStatus(node.id)} disabled={!node.seed_deposited} className={`w-full py-5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all ${!node.seed_deposited ? 'bg-foreground/5 text-muted-foreground cursor-not-allowed' : node.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-destructive/10 text-destructive border border-destructive/30'}`}>
                      {node.is_active ? '● ONLINE' : node.seed_deposited ? '○ PAUSED' : '○ PENDING SEED'}
                    </button>
                  </div>

                  <div className="flex-1 space-y-12">
                    <div className="space-y-8">
                      <div className="flex justify-between items-center pb-6 border-b border-white/5">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Metadata & Configuration</h3>
                        {!isEditing && (
                          <button onClick={() => startEditing(node)} className="exn-button-outline px-6 h-10 text-[10px] font-black uppercase">Edit Node Profile</button>
                        )}
                      </div>

                      {!isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                           <div className="space-y-2">
                              <p className="text-[9px] text-muted-foreground uppercase font-black">XNode Name</p>
                              <p className="text-xl font-bold text-foreground">{node.name}</p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] text-muted-foreground uppercase font-black">Network Location</p>
                              <div className="flex items-center gap-2 text-primary">
                                <MapPin className="w-4 h-4" />
                                <p className="text-lg font-bold">{node.location}</p>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] text-muted-foreground uppercase font-black">Performance Commission</p>
                              <p className="text-xl font-bold text-foreground">{((node.commission_rate || 0) / 100).toFixed(1)}%</p>
                           </div>
                           <div className="md:col-span-2 space-y-2">
                              <p className="text-[9px] text-muted-foreground uppercase font-black">Validator Bio</p>
                              <p className="text-sm text-foreground/70 leading-relaxed italic">{node.description}</p>
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">XNode Name</label>
                              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-14" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Location</label>
                              <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-14" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Commission % (Max 30%)</label>
                              <div className="relative">
                                <input type="number" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: Number(e.target.value)})} className="exn-input h-14" />
                                <span className="absolute right-4 top-4.5 text-muted-foreground font-bold">%</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Logo Seed/URI</label>
                              <div className="flex gap-2">
                                <input value={formData.logo_uri} onChange={e => setFormData({...formData, logo_uri: e.target.value})} className="exn-input h-14 font-mono text-xs flex-1" />
                                <button onClick={() => fileInputRef.current?.click()} className="px-4 bg-foreground/5 border border-border rounded-md hover:bg-foreground/10 transition-all">
                                  <Upload className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                              </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Bio / Description</label>
                              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[120px] py-4" />
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button 
                              onClick={handleUpdate} 
                              disabled={isUpdateDisabled}
                              className={`flex-1 h-14 flex items-center justify-center gap-2 transition-all ${isUpdateDisabled ? 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed' : 'exn-button'}`}
                            >
                               <Save className="w-4 h-4" /> Save Network Updates
                            </button>
                            <button onClick={() => setEditingNodeId(null)} className="exn-button-outline px-10 h-14 text-[10px] font-black uppercase">Discard Changes</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-12 border-t border-destructive/20">
                       <h3 className="text-xs font-black text-destructive uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                         <AlertTriangle className="w-4 h-4" /> Terminal Operations
                       </h3>
                       <div className="p-10 bg-destructive/5 border border-destructive/10 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="space-y-2">
                             <p className="text-lg font-bold text-foreground uppercase">Close XNode Account</p>
                             <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                               Permanent decommissioning. Associated XNode license will be <span className="text-destructive font-bold">BURNED 🔥</span>. Protocol seed and commissions will be fully refunded to your wallet.
                             </p>
                          </div>
                          <button onClick={() => { if (window.confirm("Permanent closure will burn your XNode license and deactivate your node identity. Proceed?")) handleCloseAccount(node.id); }} className="px-10 h-14 bg-destructive/10 text-destructive border border-destructive/40 rounded-xl text-[10px] font-black uppercase hover:bg-destructive hover:text-white transition-all flex items-center gap-3">
                            <Trash2 className="w-4 h-4" /> Terminate Account
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
      
      <div className="exn-card p-6 bg-primary/5 border-primary/20 flex items-start gap-4">
         <Info className="w-5 h-5 text-primary mt-0.5" />
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Management Protocol</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              XNode parameters are recorded on-chain and visible to all network participants. Ensure your bio and commission rates are optimized to attract delegator capital.
            </p>
         </div>
      </div>
    </div>
  );
}
