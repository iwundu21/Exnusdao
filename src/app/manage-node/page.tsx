
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, ShieldAlert, AlertTriangle, Terminal, Activity, Database, Cpu, Globe, Settings2, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ManageNodePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  
  const { state, isLoaded, setFeedback, exnBalance, updateUserBalance, updateValidator, terminateValidator } = useProtocolState();
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [reviewAction, setReviewAction] = useState<'update' | 'terminate' | 'seed' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Accessing Cloud Console</p>
    </div>
  );

  if (!connected) return (
    <div className="flex flex-col items-center justify-center text-center px-10 py-40 space-y-8 animate-in fade-in duration-500">
       <Wallet className="w-12 h-12 text-primary" />
       <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Auth Required</h1>
       <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Establish wallet link to access management protocols.</p>
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
    setReviewAction(null);
  };

  const handleTerminate = () => {
    const node = myNodes[0];
    if (!node) return;
    terminateValidator(node.id, walletAddress, node.seed_deposited ? state.seedAmount : 0, node.accrued_node_rewards || 0, node.license_id!);
    setReviewAction(null);
    router.push('/');
  };

  const handleDepositSeed = (vId: string) => {
    if (exnBalance < state.seedAmount) return setFeedback('error', `Insufficient EXN capital for seed.`);
    updateUserBalance(walletAddress, -state.seedAmount, 0);
    updateValidator(vId, { seed_deposited: true, is_active: true, total_staked: state.seedAmount });
    setFeedback('success', 'XNode seed committed to protocol.');
  };

  const handleWithdrawSeed = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node?.seed_deposited) return;
    updateUserBalance(walletAddress, state.seedAmount, 0);
    updateValidator(vId, { seed_deposited: false, is_active: false, total_staked: 0 });
    setFeedback('success', 'Seed capital withdrawn.');
  };

  if (myNodes.length === 0) return (
    <div className="max-w-4xl mx-auto px-10 py-40 text-center space-y-8 animate-in fade-in duration-500">
       <div className="p-6 bg-primary/10 rounded-full border border-primary/20 w-fit mx-auto">
         <ShieldAlert className="w-12 h-12 text-primary" />
       </div>
       <div className="space-y-4">
         <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">No Registered Nodes</h1>
         <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Wallet address has no bound XNode registrations.</p>
       </div>
       <Link href="/register-node" className="exn-button inline-block text-[10px]">Initialize Registration</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500 pb-40">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground uppercase text-[10px] font-black tracking-[0.2em] transition-all"><ArrowLeft className="w-4 h-4" /> Exit Terminal</Link>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Terminal className="w-5 h-5 text-primary" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Management Console v1.0.4</p>
          </div>
          <h1 className="text-5xl font-bold exn-gradient-text uppercase tracking-tighter">XNode Command</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 px-6 py-4 rounded-2xl">
           <div className="space-y-1">
              <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Active Identity</p>
              <p className="text-xs font-mono font-bold text-foreground">{shortenAddress(walletAddress)}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {myNodes.map((node) => {
          const isEditing = editingNodeId === node.id;
          const logoUrl = node.logo_uri.startsWith('http') || node.logo_uri.startsWith('data:') ? node.logo_uri : `https://picsum.photos/seed/${node.logo_uri}/400/400`;
          const stakerCount = Array.from(new Set(state.userStakes.filter(s => s.validator_id === node.id && !s.unstaked).map(s => s.owner))).length;

          return (
            <div key={node.id} className="exn-card p-0 border-primary/20 relative overflow-hidden group bg-black/40 backdrop-blur-3xl">
              <div className="absolute top-0 right-0 p-8 z-10">
                 <div className={`flex items-center gap-2 text-[8px] font-black uppercase px-4 py-2 rounded-full border backdrop-blur-md ${node.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${node.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                    {node.is_active ? 'Online' : 'Operational Offline'}
                 </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12">
                {/* Status Column */}
                <div className="xl:col-span-4 p-12 border-r border-white/5 space-y-10">
                  <div className="flex items-center gap-8">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <Image src={logoUrl} alt="logo" fill className="object-cover" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold uppercase tracking-tighter text-foreground">{node.name}</h2>
                      <p className="text-[10px] font-mono text-primary font-bold">{shortenAddress(node.id)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <Activity className="w-4 h-4 text-muted-foreground" />
                         <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Network Weight</span>
                       </div>
                       <span className="text-xs font-bold font-mono text-primary">{node.total_staked.toLocaleString()}</span>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <Database className="w-4 h-4 text-muted-foreground" />
                         <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Active Stakers</span>
                       </div>
                       <span className="text-xs font-bold font-mono text-foreground">{stakerCount}</span>
                    </div>
                  </div>

                  <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase font-black text-emerald-500 tracking-widest">Accrued Commission</p>
                        <p className="text-lg font-bold text-foreground font-mono">{(node.accrued_node_rewards || 0).toLocaleString()} <span className="text-[10px] text-emerald-500">EXN</span></p>
                      </div>
                      <Zap className="w-5 h-5 text-emerald-500/40" />
                    </div>
                    <button 
                      onClick={() => {
                        updateUserBalance(walletAddress, node.accrued_node_rewards, 0);
                        updateValidator(node.id, { accrued_node_rewards: 0 });
                        setFeedback('success', 'Economic commission harvested.');
                      }} 
                      disabled={(node.accrued_node_rewards || 0) <= 0} 
                      className={`w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${ (node.accrued_node_rewards || 0) > 0 ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                    >
                      Harvest Yield
                    </button>
                  </div>
                </div>

                {/* Configuration Column */}
                <div className="xl:col-span-8 p-12 space-y-12">
                  {isEditing ? (
                    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                      <div className="flex items-center gap-3">
                        <Settings2 className="w-5 h-5 text-secondary" />
                        <h3 className="text-lg font-bold uppercase tracking-widest text-secondary">Protocol Identity Patch</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">XNode Name</label>
                           <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-14 bg-white/5 text-xs font-mono" placeholder="Identification String" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Global Sector</label>
                           <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-14 bg-white/5 text-xs font-mono" placeholder="e.g. Frankfurt, DE" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                           <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Protocol Bio</label>
                           <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[120px] bg-white/5 text-xs font-mono py-4" placeholder="Hardware and reliability commitment..." />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Commission Rate (0-30%)</label>
                           <div className="relative">
                              <input type="number" step="0.1" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: Math.min(30, Math.max(0, Number(e.target.value)))})} className="exn-input h-14 bg-white/5 text-xs font-mono" />
                              <span className="absolute right-4 top-4.5 text-[10px] font-bold text-muted-foreground">%</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button onClick={() => setReviewAction('update')} className="exn-button flex-1 h-14 uppercase font-black tracking-widest text-[10px]">Synchronize Metadata</button>
                        <button onClick={() => setEditingNodeId(null)} className="exn-button-outline flex-1 h-14 uppercase font-black tracking-widest text-[10px] border-white/10 text-white/40">Abort Patch</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-6">
                            <div className="flex items-center gap-2">
                               <Globe className="w-4 h-4 text-primary" />
                               <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Network Localization</h3>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                  <span className="text-white/20">Sector</span>
                                  <span className="text-white font-bold">{node.location}</span>
                               </div>
                               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                  <span className="text-white/20">Commission</span>
                                  <span className="text-primary font-bold">{(node.commission_rate / 100).toFixed(1)}%</span>
                               </div>
                               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                  <span className="text-white/20">License Link</span>
                                  <span className="text-foreground font-mono font-bold">{shortenAddress(node.license_id || 'N/A')}</span>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div className="flex items-center gap-2">
                               <Cpu className="w-4 h-4 text-primary" />
                               <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">System Controller</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                               <button onClick={() => startEditing(node)} className="h-14 exn-button-outline border-primary/20 hover:bg-primary/5 uppercase text-[9px] font-black tracking-widest rounded-xl transition-all">Patch Identity</button>
                               {!node.seed_deposited ? (
                                 <button onClick={() => handleDepositSeed(node.id)} className="h-14 exn-button uppercase text-[9px] font-black tracking-widest">Inject Seed Capital</button>
                               ) : (
                                 <button onClick={() => handleWithdrawSeed(node.id)} className="h-14 bg-primary/5 text-primary border border-primary/20 uppercase text-[9px] font-black tracking-widest rounded-xl hover:bg-primary/10 transition-all">Withdraw Seed</button>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-destructive">Decommission Protocols</h3>
                         </div>
                         <div className="p-8 bg-destructive/5 border border-destructive/20 rounded-2xl space-y-6">
                            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold">
                               Warning: Decommissioning this validator will permanently terminate its on-chain registration and burn the associated XNode License NFT. This action cannot be reversed.
                            </p>
                            <button onClick={() => setReviewAction('terminate')} className="w-full h-14 bg-destructive text-white uppercase text-[9px] font-black tracking-[0.3em] rounded-xl hover:opacity-90 transition-all">
                              Terminate On-Chain Registration
                            </button>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Review Dialog */}
      <AlertDialog open={reviewAction !== null} onOpenChange={() => setReviewAction(null)}>
        <AlertDialogContent asChild>
          <div className="exn-card border-primary/40 bg-black/95 backdrop-blur-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" />
                Review Protocol Operation
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                      <span className="text-white/30">Operation</span>
                      <span className="text-white font-black">{reviewAction === 'update' ? 'IDENTITY_PATCH' : reviewAction === 'terminate' ? 'SYSTEM_DECOMMISSION' : 'SEED_INJECTION'}</span>
                    </div>
                    {reviewAction === 'update' && (
                      <>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                          <span className="text-white/30">New Commission</span>
                          <span className="text-primary font-bold">{formData?.commission_rate}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                          <span className="text-white/30">Target Node</span>
                          <span className="text-white font-mono font-bold">{shortenAddress(editingNodeId || '')}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                      <span className="text-white/30">Network Status</span>
                      <span className="text-emerald-500 font-black">VALIDATED</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-white/40 uppercase leading-relaxed font-bold">
                    This operation will be recorded on the global network ledger. A 6-second verification window will follow confirmation. Proceed?
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-8">
              <AlertDialogCancel className="exn-button-outline text-[9px] h-12 uppercase font-black border-white/10 text-white">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={reviewAction === 'update' ? handleUpdate : reviewAction === 'terminate' ? handleTerminate : undefined} className="exn-button text-[9px] h-12 uppercase font-black">Confirm Operation</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
