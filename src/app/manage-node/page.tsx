"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Save, ShieldCheck, AlertTriangle, LogOut, Trash2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';

const SEED_DEPOSIT_AMOUNT = 15000000;

export default function ManageNodePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  
  const { state, setState, isLoaded } = useProtocolState();
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

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

  const handleUpdate = () => {
    if (!editingNodeId || !formData) return;

    if (formData.commission_rate < 0 || formData.commission_rate > 30) {
      return toast({ title: "Invalid Commission", description: "Range: 0% to 30%.", variant: "destructive" });
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
    toast({ title: "Node Updated", description: "Changes broadcast to network successfully." });
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
    toast({ title: "Commission Claimed", description: `Successfully withdrew ${reward.toFixed(2)} EXN.` });
  };

  const handleDepositSeed = (vId: string) => {
    if (state.exnBalance < SEED_DEPOSIT_AMOUNT) {
      return toast({ 
        title: "Insufficient Balance", 
        description: `You need ${SEED_DEPOSIT_AMOUNT.toLocaleString()} EXN to deposit protocol seed.`, 
        variant: "destructive" 
      });
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

    toast({ title: "Seed Deposited", description: "Validator node is now initialized and active." });
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

    toast({ title: "Seed Withdrawn", description: "Protocol seed returned to wallet. Node is now inactive." });
  };

  const handleCloseAccount = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node) return;

    const delegatorStake = (node.total_staked || 0) - (node.seed_deposited ? SEED_DEPOSIT_AMOUNT : 0);
    const activeDelegators = state.userStakes.filter(s => s.validator_id === vId && !s.unstaked);

    if (delegatorStake > 0.01 || activeDelegators.length > 0) {
       return toast({ 
         title: "Active Delegators Found", 
         description: "You cannot close this node while there is active delegator capital.", 
         variant: "destructive" 
       });
    }

    const seedRefund = node.seed_deposited ? SEED_DEPOSIT_AMOUNT : 0;
    const rewards = node.accrued_node_rewards || 0;

    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance + seedRefund + rewards,
      validators: prev.validators.filter(v => v.id !== vId),
      licenses: prev.licenses.map(l => l.id === node.license_id ? { ...l, is_burned: true, is_claimed: false } : l)
    }));

    toast({ title: "Account Closed", description: "Node decommissioned. Associated license has been burned 🔥." });
    router.push('/');
  };

  const toggleNodeStatus = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node?.seed_deposited) {
      return toast({ title: "Seed Required", description: "You must deposit seed before activating node.", variant: "destructive" });
    }

    setState(prev => ({
      ...prev,
      validators: prev.validators.map(v => v.id === vId ? { ...v, is_active: !v.is_active } : v)
    }));
    toast({ title: "Status Changed", description: "Node operational status updated." });
  };

  if (!isLoaded) return null;

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center px-10 py-40 space-y-8">
           <div className="p-6 bg-primary/10 rounded-full border border-primary/20">
             <Wallet className="w-12 h-12 text-primary" />
           </div>
           <div className="space-y-4">
             <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">Wallet Connection Required</h1>
             <p className="text-muted-foreground max-w-md mx-auto">Please connect your Solana wallet to manage your validator nodes and harvest commissions.</p>
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar exnBalance={state.exnBalance} usdcBalance={state.usdcBalance} />
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-10 py-20 space-y-12">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">Node Management</h1>
            <p className="text-muted-foreground max-w-xl">
              Optimize your validator parameters, manage protocol seed, and harvest performance commissions for address <span className="text-foreground font-mono text-[10px] bg-foreground/5 px-2 py-1 rounded">{walletAddress}</span>.
            </p>
          </div>

          {myNodes.length === 0 ? (
            <div className="exn-card p-20 flex flex-col items-center justify-center text-center space-y-6">
              <p className="text-muted-foreground uppercase font-black tracking-widest">No nodes registered to this wallet</p>
              <Link href="/register-node" className="exn-button">Register New Node</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {myNodes.map((node) => {
                const isEditing = editingNodeId === node.id;
                const isUrl = node.logo_uri?.startsWith('http') || node.logo_uri?.startsWith('data:');
                const logoUrl = isUrl ? node.logo_uri : `https://picsum.photos/seed/${node.logo_uri}/400/400`;

                return (
                  <div key={node.id} className="exn-card p-10 space-y-10 border-primary/20">
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="w-full lg:w-1/3 space-y-8">
                        <div className="flex items-center gap-6">
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border">
                             <Image src={logoUrl} alt={node.name} fill className="object-cover" />
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
                            <button 
                              onClick={() => handleDepositSeed(node.id)}
                              className="w-full py-3 bg-amber-500 text-black text-[10px] font-black uppercase rounded-lg hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            >
                              Deposit Protocol Seed
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500">
                              <ShieldCheck className="w-5 h-5" />
                              <p className="text-[10px] uppercase font-black tracking-widest">Protocol Seed Active</p>
                            </div>
                            <button 
                              onClick={() => handleWithdrawSeed(node.id)}
                              className="w-full py-2 border border-destructive/20 text-destructive text-[10px] font-black uppercase rounded-lg hover:bg-destructive/10 transition-all flex items-center justify-center gap-2"
                            >
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
                          <button 
                            onClick={() => handleClaimCommission(node.id)}
                            disabled={(node.accrued_node_rewards || 0) <= 0}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${node.accrued_node_rewards > 0 ? 'bg-emerald-500 text-black' : 'bg-foreground/5 text-muted-foreground cursor-not-allowed'}`}
                          >
                            Claim
                          </button>
                        </div>

                        <div className="space-y-4">
                          <button 
                            onClick={() => toggleNodeStatus(node.id)}
                            disabled={!node.seed_deposited}
                            className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${!node.seed_deposited ? 'bg-foreground/5 text-muted-foreground cursor-not-allowed' : node.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-destructive/10 text-destructive border border-destructive/30'}`}
                          >
                            {node.is_active ? '● Node Active' : node.seed_deposited ? '○ Node Paused' : '○ Pending Seed'}
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
                                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Node Name</label>
                                <input 
                                  value={isEditing ? formData.name : node.name}
                                  onChange={e => setFormData({...formData, name: e.target.value})}
                                  className="exn-input h-12" 
                                  readOnly={!isEditing}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Location</label>
                                <input 
                                  value={isEditing ? formData.location : node.location}
                                  onChange={e => setFormData({...formData, location: e.target.value})}
                                  className="exn-input h-12" 
                                  readOnly={!isEditing}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Commission % (Max 30%)</label>
                                <div className="relative">
                                  <input 
                                    type="number"
                                    value={isEditing ? formData.commission_rate : ((node.commission_rate || 0) / 100)}
                                    onChange={e => setFormData({...formData, commission_rate: Number(e.target.value)})}
                                    className="exn-input h-12" 
                                    readOnly={!isEditing}
                                  />
                                  <span className="absolute right-4 top-3.5 text-muted-foreground font-bold">%</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Logo Seed/URI</label>
                                <input 
                                  value={isEditing ? formData.logo_uri : node.logo_uri}
                                  onChange={e => setFormData({...formData, logo_uri: e.target.value})}
                                  className="exn-input h-12 font-mono text-xs" 
                                  readOnly={!isEditing}
                                />
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Bio / Description</label>
                                <textarea 
                                  value={isEditing ? formData.description : node.description}
                                  onChange={e => setFormData({...formData, description: e.target.value})}
                                  className="exn-input min-h-[100px] py-4" 
                                  readOnly={!isEditing}
                                />
                              </div>
                            </div>

                            {isEditing && (
                              <div className="flex gap-4 pt-4">
                                <button onClick={handleUpdate} className="exn-button flex-1 py-4 flex items-center justify-center gap-2">
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
                                 <p className="text-sm font-bold text-foreground uppercase">Close Node Account</p>
                                 <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                                   Decommissioning is permanent. The associated license will be burned 🔥 and cannot be reused.
                                 </p>
                              </div>
                              <button 
                                onClick={() => {
                                  if (window.confirm("Permanent closure will burn your license. Proceed?")) {
                                    handleCloseAccount(node.id);
                                  }
                                }}
                                className="px-8 py-3 bg-destructive/10 text-destructive border border-destructive/40 rounded-lg text-[10px] font-black uppercase hover:bg-destructive hover:text-white transition-all flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Terminate Node Account
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
      </main>
      <Footer />
    </div>
  );
}
