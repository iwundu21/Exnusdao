"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft, Save, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

const USER_WALLET = 'ExnUs...d2f1';
const SEED_DEPOSIT_AMOUNT = 5000;

export default function ManageNodePage() {
  const { state, setState, isLoaded } = useProtocolState();
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

  // Filter validators owned by the user
  const myNodes = state.validators.filter(v => v.owner === USER_WALLET);

  const startEditing = (node: any) => {
    setEditingNodeId(node.id);
    setFormData({
      name: node.name,
      location: node.location,
      description: node.description,
      logo_uri: node.logo_uri,
      commission_rate: node.commission_rate / 100, // Display as percentage 0-30
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
        commission_rate: formData.commission_rate * 100, // Store as basis points
      } : v)
    }));

    setEditingNodeId(null);
    toast({ title: "Node Updated", description: "Changes broadcast to network successfully." });
  };

  const handleClaimCommission = (vId: string) => {
    const validator = state.validators.find(v => v.id === vId);
    if (!validator || validator.accrued_node_rewards <= 0) return;

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
        description: `You need ${SEED_DEPOSIT_AMOUNT} EXN to deposit protocol seed.`, 
        variant: "destructive" 
      });
    }

    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance - SEED_DEPOSIT_AMOUNT,
      totalStaked: prev.totalStaked + SEED_DEPOSIT_AMOUNT,
      validators: prev.validators.map(v => v.id === vId ? { 
        ...v, 
        seed_deposited: true, 
        is_active: true,
        total_staked: v.total_staked + SEED_DEPOSIT_AMOUNT 
      } : v)
    }));

    toast({ 
      title: "Seed Deposited", 
      description: "Validator node is now initialized and active." 
    });
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

  return (
    <main className="min-h-screen pb-20">
      <Navbar 
        exnBalance={state.exnBalance} 
        usdcBalance={state.usdcBalance}
        toggleAdmin={() => {}}
      />
      
      <div className="max-w-6xl mx-auto px-10 py-20 space-y-12">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase">Node Management</h1>
          <p className="text-white/40 max-w-xl">
            As a validator operator, you can optimize your node parameters, manage your protocol seed, and harvest performance commissions.
          </p>
        </div>

        {myNodes.length === 0 ? (
          <div className="exn-card p-20 flex flex-col items-center justify-center text-center space-y-6">
            <p className="text-white/20 uppercase font-black tracking-widest">No nodes registered to this wallet</p>
            <Link href="/register-node" className="exn-button">Register New Node</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {myNodes.map((node) => {
              const isEditing = editingNodeId === node.id;
              const isUrl = node.logo_uri?.startsWith('http') || node.logo_uri?.startsWith('data:');
              const logoUrl = isUrl ? node.logo_uri : `https://picsum.photos/seed/${node.logo_uri}/400/400`;

              return (
                <div key={node.id} className="exn-card p-10 space-y-10 border-[#00f5ff]/20">
                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                    {/* Left Side: Stats & Status */}
                    <div className="w-full lg:w-1/3 space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10">
                           <Image src={logoUrl} alt={node.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white uppercase">{node.name}</h2>
                          <p className="text-xs text-white/40 font-mono">{node.id}</p>
                        </div>
                      </div>

                      {/* Seed Deposit Status */}
                      {!node.seed_deposited ? (
                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-4">
                          <div className="flex items-center gap-3 text-amber-500">
                            <AlertTriangle className="w-5 h-5" />
                            <p className="text-[10px] uppercase font-black tracking-widest">Initialization Required</p>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed">
                            A seed deposit of <span className="text-white font-bold">{SEED_DEPOSIT_AMOUNT} EXN</span> is required to activate this node.
                          </p>
                          <button 
                            onClick={() => handleDepositSeed(node.id)}
                            className="w-full py-3 bg-amber-500 text-black text-[10px] font-black uppercase rounded-lg hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                          >
                            Deposit Protocol Seed
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400">
                          <ShieldCheck className="w-5 h-5" />
                          <p className="text-[10px] uppercase font-black tracking-widest">Protocol Seed Active</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-white/40 uppercase font-black mb-1">Total Stake</p>
                            <p className="text-xl font-bold text-[#00f5ff]">{node.total_staked.toLocaleString()}</p>
                         </div>
                         <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-white/40 uppercase font-black mb-1">Commission</p>
                            <p className="text-xl font-bold text-white">{(node.commission_rate / 100).toFixed(1)}%</p>
                         </div>
                      </div>

                      <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center">
                        <div>
                           <p className="text-[10px] text-emerald-400 uppercase font-black">Accrued Rewards</p>
                           <p className="text-2xl font-bold text-emerald-400">{node.accrued_node_rewards.toFixed(2)} EXN</p>
                        </div>
                        <button 
                          onClick={() => handleClaimCommission(node.id)}
                          disabled={node.accrued_node_rewards <= 0}
                          className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${node.accrued_node_rewards > 0 ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                        >
                          Claim
                        </button>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] text-white/40 uppercase font-black">Operating Status</p>
                        <button 
                          onClick={() => toggleNodeStatus(node.id)}
                          disabled={!node.seed_deposited}
                          className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${!node.seed_deposited ? 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed' : node.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}
                        >
                          {node.is_active ? '● Node Active' : node.seed_deposited ? '○ Node Paused' : '○ Pending Seed'}
                        </button>
                      </div>
                    </div>

                    {/* Right Side: Edit Form */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">Metadata & Parameters</h3>
                        {!isEditing && (
                          <button onClick={() => startEditing(node)} className="exn-button-outline px-4 py-2 text-[10px]">Edit Details</button>
                        )}
                      </div>

                      <div className={`space-y-6 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Node Name</label>
                            <input 
                              value={isEditing ? formData.name : node.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              className="exn-input h-12" 
                              readOnly={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Location</label>
                            <input 
                              value={isEditing ? formData.location : node.location}
                              onChange={e => setFormData({...formData, location: e.target.value})}
                              className="exn-input h-12" 
                              readOnly={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Commission % (Max 30%)</label>
                            <div className="relative">
                              <input 
                                type="number"
                                value={isEditing ? formData.commission_rate : (node.commission_rate / 100)}
                                onChange={e => setFormData({...formData, commission_rate: Number(e.target.value)})}
                                className="exn-input h-12" 
                                readOnly={!isEditing}
                                max="30"
                                min="0"
                              />
                              <span className="absolute right-4 top-3.5 text-white/30 font-bold">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Logo Seed/URI</label>
                            <input 
                              value={isEditing ? formData.logo_uri : node.logo_uri}
                              onChange={e => setFormData({...formData, logo_uri: e.target.value})}
                              className="exn-input h-12 font-mono text-xs" 
                              readOnly={!isEditing}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Bio / Description</label>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
