
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, TrendingUp, ShieldAlert, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress } from '@/lib/utils';

export default function ManageNodePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  
  const { state, isLoaded, setFeedback, exnBalance, updateUserBalance, updateValidator, terminateValidator } = useProtocolState();
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Syncing Cloud Ledger</p>
    </div>
  );

  if (!connected) return (
    <div className="flex flex-col items-center justify-center text-center px-10 py-40 space-y-8 animate-in fade-in duration-500">
       <Wallet className="w-12 h-12 text-primary" />
       <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Wallet Required</h1>
       <p className="text-muted-foreground text-xs">Please connect your wallet to manage your XNode.</p>
    </div>
  );

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
    updateValidator(editingNodeId, {
      name: formData.name,
      location: formData.location,
      description: formData.description,
      logo_uri: formData.logo_uri,
      commission_rate: formData.commission_rate * 100,
    });
    setEditingNodeId(null);
    setFeedback('success', 'XNode identity updated.');
  };

  const handleClaimCommission = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node || (node.accrued_node_rewards || 0) <= 0) return;
    updateUserBalance(walletAddress, node.accrued_node_rewards, 0);
    updateValidator(vId, { accrued_node_rewards: 0 });
    setFeedback('success', 'Protocol commission harvested.');
  };

  const handleDepositSeed = (vId: string) => {
    if (exnBalance < state.seedAmount) return setFeedback('error', `Insufficient EXN.`);
    updateUserBalance(walletAddress, -state.seedAmount, 0);
    updateValidator(vId, { seed_deposited: true, is_active: true, total_staked: state.seedAmount });
    setFeedback('success', 'XNode seed deposited.');
  };

  const handleWithdrawSeed = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node?.seed_deposited) return;
    updateUserBalance(walletAddress, state.seedAmount, 0);
    updateValidator(vId, { seed_deposited: false, is_active: false, total_staked: 0 });
    setFeedback('success', 'Seed withdrawn.');
  };

  const handleCloseAccount = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node) return;
    if (window.confirm("CRITICAL: Terminate this node and burn License?")) {
      terminateValidator(vId, walletAddress, node.seed_deposited ? state.seedAmount : 0, node.accrued_node_rewards || 0, node.license_id!);
      setFeedback('success', 'XNode decommissioned.');
      router.push('/');
    }
  };

  if (myNodes.length === 0) return (
    <div className="max-w-4xl mx-auto px-10 py-40 text-center space-y-8 animate-in fade-in duration-500">
       <div className="p-6 bg-primary/10 rounded-full border border-primary/20 w-fit mx-auto">
         <ShieldAlert className="w-12 h-12 text-primary" />
       </div>
       <div className="space-y-4">
         <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">No Active XNodes</h1>
         <p className="text-muted-foreground text-xs">You do not have any XNodes registered to this wallet.</p>
       </div>
       <Link href="/register-node" className="exn-button inline-block text-[10px]">Register New XNode</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground uppercase text-xs font-black tracking-widest"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text uppercase tracking-tighter">XNode Management</h1>
        <p className="text-muted-foreground text-xs">Configure identity and manage seed capital.</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {myNodes.map((node) => {
          const isEditing = editingNodeId === node.id;
          const logoUrl = node.logo_uri.startsWith('http') || node.logo_uri.startsWith('data:') ? node.logo_uri : `https://picsum.photos/seed/${node.logo_uri}/400/400`;
          const stakerCount = Array.from(new Set(state.userStakes.filter(s => s.validator_id === node.id && !s.unstaked).map(s => s.owner))).length;

          return (
            <div key={node.id} className="exn-card p-12 border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                 <div className={`flex items-center gap-2 text-[9px] font-black uppercase px-4 py-2 rounded-full border backdrop-blur-md ${node.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${node.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                    {node.is_active ? 'Online' : 'Offline'}
                 </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
                <div className="space-y-10">
                  <div className="flex items-center gap-8">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-2xl">
                      <Image src={logoUrl} alt="logo" fill className="object-cover" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold uppercase tracking-tighter text-foreground">{node.name}</h2>
                      <p className="text-[9px] font-mono text-primary font-bold">{shortenAddress(node.id)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-foreground/5 rounded-2xl border border-border/40 space-y-1">
                      <p className="text-[8px] uppercase font-black text-muted-foreground">Users</p>
                      <p className="text-base font-bold font-mono">{stakerCount}</p>
                    </div>
                    <div className="p-6 bg-foreground/5 rounded-2xl border border-border/40 space-y-1">
                      <p className="text-[8px] uppercase font-black text-muted-foreground">Weight</p>
                      <p className="text-base font-bold text-primary font-mono">{node.total_staked.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-6">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-black text-emerald-500 tracking-widest">Rewards</p>
                      <p className="text-lg font-bold text-foreground font-mono">{(node.accrued_node_rewards || 0).toLocaleString()} <span className="text-xs text-emerald-500">EXN</span></p>
                    </div>
                    <button onClick={() => handleClaimCommission(node.id)} disabled={(node.accrued_node_rewards || 0) <= 0} className={`w-full py-3.5 rounded-xl text-[9px] font-black uppercase transition-all ${ (node.accrued_node_rewards || 0) > 0 ? 'bg-emerald-500 text-black' : 'bg-foreground/5 text-muted-foreground cursor-not-allowed'}`}>
                      Harvest
                    </button>
                  </div>
                </div>

                <div className="xl:col-span-2 space-y-10">
                  {isEditing ? (
                    <div className="exn-card p-10 space-y-8 border-secondary/20 bg-secondary/5">
                      <h3 className="text-base font-bold uppercase tracking-widest text-secondary">Update Identity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-12 text-sm" placeholder="Name" />
                        <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-12 text-sm" placeholder="Location" />
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[100px] text-xs py-4 md:col-span-2" placeholder="Description" />
                      </div>
                      <div className="flex gap-4">
                        <button onClick={handleUpdate} className="exn-button flex-1 h-12 uppercase font-black tracking-widest text-[10px]">Save</button>
                        <button onClick={() => setEditingNodeId(null)} className="exn-button-outline flex-1 h-12 uppercase font-black tracking-widest text-[10px]">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Node Actions</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <button onClick={() => startEditing(node)} className="h-14 exn-button-outline uppercase text-[9px] font-black tracking-widest rounded-xl">Edit Identity</button>
                           {!node.seed_deposited ? (
                             <button onClick={() => handleDepositSeed(node.id)} className="h-14 exn-button uppercase text-[9px] font-black tracking-widest">Deposit Seed</button>
                           ) : (
                             <button onClick={() => handleWithdrawSeed(node.id)} className="h-14 bg-destructive/10 text-destructive border border-destructive/20 uppercase text-[9px] font-black tracking-widest rounded-xl">Withdraw Seed</button>
                           )}
                        </div>
                      </div>

                      <div className="p-8 bg-destructive/5 border border-destructive/20 rounded-2xl space-y-6">
                        <div className="flex items-center gap-3 text-destructive">
                           <AlertTriangle className="w-5 h-5" />
                           <p className="text-[9px] uppercase font-black tracking-widest">Decommission Sector</p>
                        </div>
                        <button onClick={() => handleCloseAccount(node.id)} className="w-full h-12 bg-destructive text-white uppercase text-[9px] font-black tracking-[0.2em] rounded-xl">
                          Terminate On-Chain Registration
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
