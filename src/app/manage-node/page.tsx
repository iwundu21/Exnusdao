
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, ShieldAlert, AlertTriangle, Terminal, Database, Cpu, Globe, Settings2, ShieldCheck, Zap, Ticket } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-black uppercase tracking-[0.4em] animate-pulse text-[10px]">SYNCING_CLOUD_TERMINAL</p>
    </div>
  );

  if (!connected) return (
    <div className="flex flex-col items-center justify-center text-center px-10 py-32 space-y-6 animate-in fade-in duration-500">
       <div className="p-5 bg-primary/15 rounded-2xl border border-primary/30 shadow-2xl">
         <Wallet className="w-10 h-10 text-primary" />
       </div>
       <div className="space-y-3">
         <h1 className="text-xl font-black uppercase tracking-tighter text-white">AUTHENTICATION_REQUIRED</h1>
         <p className="text-white font-black text-[11px] uppercase tracking-[0.3em]">Establish wallet link to access management protocols.</p>
       </div>
    </div>
  );

  const myLicenses = state.licenses.filter(l => l.owner === walletAddress && !l.is_burned);
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

  const startProcessing = (action: string, callback: () => void) => {
    setIsProcessing(action);
    setTimeout(() => {
      callback();
      setIsProcessing(null);
    }, 6000);
  };

  const handleUpdate = () => {
    if (!editingNodeId || !formData) return;
    setReviewAction(null);
    startProcessing('PATCH_IDENTITY', () => {
      updateValidator(editingNodeId, {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        logo_uri: formData.logo_uri,
        commission_rate: formData.commission_rate * 100,
      });
      setEditingNodeId(null);
    });
  };

  const handleTerminate = () => {
    const node = myNodes[0];
    if (!node) return;
    setReviewAction(null);
    startProcessing('TERMINATE_REGISTRATION', () => {
      terminateValidator(node.id, walletAddress, node.seed_deposited ? state.seedAmount : 0, node.accrued_node_rewards || 0, node.license_id!);
      router.push('/');
    });
  };

  const handleDepositSeed = (vId: string) => {
    if (exnBalance < state.seedAmount) return setFeedback('error', `Insufficient EXN capital for seed.`);
    startProcessing('INJECT_SEED', () => {
      updateUserBalance(walletAddress, -state.seedAmount, 0);
      updateValidator(vId, { seed_deposited: true, is_active: true, total_staked: state.seedAmount });
      setFeedback('success', 'XNode seed committed to protocol.');
    });
  };

  const handleWithdrawSeed = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node?.seed_deposited) return;
    startProcessing('WITHDRAW_SEED', () => {
      updateUserBalance(walletAddress, state.seedAmount, 0);
      updateValidator(vId, { seed_deposited: false, is_active: false, total_staked: 0 });
      setFeedback('success', 'Seed capital withdrawn.');
    });
  };

  if (myLicenses.length === 0) return (
    <div className="max-w-3xl mx-auto px-10 py-32 text-center space-y-8 animate-in fade-in duration-500">
       <div className="p-6 bg-destructive/15 rounded-3xl border border-destructive/30 w-fit mx-auto shadow-2xl">
         <Ticket className="w-12 h-12 text-destructive" />
       </div>
       <div className="space-y-4">
         <h1 className="text-2xl font-black uppercase tracking-tighter text-white">LICENSE_AUTHORIZATION_REQUIRED</h1>
         <p className="text-white text-[11px] uppercase font-black tracking-[0.3em] max-w-md mx-auto leading-relaxed">
           Validator management is restricted to verified XNode License holders. Please mint a license to initialize your infrastructure sector.
         </p>
       </div>
       <Link href="/purchase-license" className="exn-button inline-flex items-center justify-center px-12 h-12 text-[11px] tracking-[0.2em]">INITIALIZE_MINT_SEQUENCE</Link>
    </div>
  );

  if (myNodes.length === 0) return (
    <div className="max-w-3xl mx-auto px-10 py-32 text-center space-y-8 animate-in fade-in duration-500">
       <div className="p-6 bg-primary/15 rounded-3xl border border-primary/30 w-fit mx-auto shadow-2xl">
         <ShieldAlert className="w-12 h-12 text-primary" />
       </div>
       <div className="space-y-4">
         <h1 className="text-2xl font-black uppercase tracking-tighter text-white">NO_REGISTERED_NODES</h1>
         <p className="text-white text-[11px] uppercase font-black tracking-[0.3em] max-w-md mx-auto leading-relaxed">
           Wallet address has verified licenses but no bound XNode registrations. Provision your validator sector to begin operations.
         </p>
       </div>
       <Link href="/register-node" className="exn-button inline-flex items-center justify-center px-12 h-12 text-[11px] tracking-[0.2em]">INITIALIZE_PROVISIONING</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-10 py-16 space-y-12 animate-in fade-in duration-500 pb-32">
      <Link href="/" className="flex items-center gap-2 text-white hover:text-primary uppercase text-[10px] font-black tracking-[0.3em] transition-all"><ArrowLeft className="w-4 h-4" /> EXIT_TERMINAL</Link>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Terminal className="w-5 h-5 text-primary" />
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">MGMT_CONSOLE_V2.0.2</p>
          </div>
          <h1 className="text-4xl font-black exn-gradient-text uppercase tracking-tighter">XNODE_MANAGEMENT</h1>
        </div>
        
        <div className="flex items-center gap-6 bg-primary/15 border border-primary/30 px-8 py-4 rounded-xl backdrop-blur-3xl shadow-3xl">
           <div className="space-y-1">
              <p className="text-[10px] text-white uppercase font-black tracking-[0.4em]">ACTIVE_IDENTITY</p>
              <p className="text-[12px] font-mono font-black text-white">{shortenAddress(walletAddress)}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {myNodes.map((node) => {
          const isEditing = editingNodeId === node.id;
          const logoUrl = node.logo_uri.startsWith('http') || node.logo_uri.startsWith('data:') ? node.logo_uri : `https://picsum.photos/seed/${node.logo_uri}/400/400`;
          const stakerCount = Array.from(new Set(state.userStakes.filter(s => s.validator_id === node.id && !s.unstaked).map(s => s.owner))).length;

          return (
            <div key={node.id} className="exn-card p-0 border-white/30 relative overflow-hidden group bg-black/80 backdrop-blur-3xl shadow-3xl">
              <div className="absolute top-0 right-0 p-10 z-10">
                 <div className={`flex items-center gap-3 text-[11px] font-black uppercase px-6 py-2.5 rounded-xl border backdrop-blur-3xl ${node.is_active ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-destructive/20 text-destructive border-destructive/50'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${node.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                    {node.is_active ? 'STATUS_ONLINE' : 'STATUS_OFFLINE'}
                 </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12">
                <div className="xl:col-span-4 p-10 border-r border-white/20 space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-3xl">
                      <Image src={logoUrl} alt="logo" fill className="object-cover" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">{node.name}</h2>
                      <p className="text-[12px] font-mono text-primary font-black">{shortenAddress(node.id)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-6 bg-white/10 rounded-2xl border border-white/30 flex items-center justify-between group/metric hover:border-primary transition-all shadow-xl">
                       <div className="flex items-center gap-4">
                         <span className="text-[11px] uppercase font-black text-white tracking-[0.3em]">NETWORK_WEIGHT</span>
                       </div>
                       <span className="text-[13px] font-black font-mono text-primary">{(node.total_staked || 0).toLocaleString()}</span>
                    </div>
                    <div className="p-6 bg-white/10 rounded-2xl border border-white/30 flex items-center justify-between group/metric hover:border-primary transition-all shadow-xl">
                       <div className="flex items-center gap-4">
                         <Database className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                         <span className="text-[11px] uppercase font-black text-white tracking-[0.3em]">ACTIVE_STAKERS</span>
                       </div>
                       <span className="text-[13px] font-black font-mono text-white">{stakerCount}</span>
                    </div>
                  </div>

                  <div className="p-8 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl space-y-8 relative overflow-hidden group/yield shadow-2xl">
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="flex justify-between items-end relative z-10">
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase font-black text-emerald-500 tracking-[0.4em]">ACCRUED_COMMISSION</p>
                        <p className="text-xl font-black text-white font-mono tracking-tighter">{(node.accrued_node_rewards || 0).toLocaleString()} <span className="text-[11px] text-emerald-500 font-bold ml-1">EXN</span></p>
                      </div>
                      <Zap className="w-6 h-6 text-emerald-500" />
                    </div>
                    <button 
                      onClick={() => {
                        startProcessing('HARVEST_COMMISSION', () => {
                          updateUserBalance(walletAddress, node.accrued_node_rewards, 0);
                          updateValidator(node.id, { accrued_node_rewards: 0 });
                          setFeedback('success', 'ECONOMIC_YIELD_HARVESTED');
                        });
                      }} 
                      disabled={(node.accrued_node_rewards || 0) <= 0 || !!isProcessing} 
                      className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all relative z-10 shadow-3xl ${ (node.accrued_node_rewards || 0) > 0 && !isProcessing ? 'bg-emerald-500 text-black hover:opacity-90 active:scale-95' : 'bg-white/10 text-white border border-white/30 cursor-not-allowed'}`}
                    >
                      {isProcessing === 'HARVEST_COMMISSION' ? 'HARVESTING...' : ( (node.accrued_node_rewards || 0) > 0 ? 'HARVEST_COMMISSION' : 'NO_PENDING_YIELD')}
                    </button>
                  </div>
                </div>

                <div className="xl:col-span-8 p-10 space-y-12 bg-white/5">
                  {isEditing ? (
                    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                      <div className="flex items-center gap-4 border-b border-white/30 pb-6">
                        <Settings2 className="w-6 h-6 text-secondary" />
                        <h3 className="text-lg font-black uppercase tracking-[0.4em] text-secondary">PROTOCOL_IDENTITY_PATCH</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <label className="text-[11px] uppercase font-black text-white tracking-[0.4em]">XNODE_IDENTIFIER</label>
                           <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-14 bg-white/10 border-white/40 text-[12px] font-mono font-bold tracking-tight text-white" placeholder="ID_STRING" />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[11px] uppercase font-black text-white tracking-[0.4em]">GLOBAL_SECTOR</label>
                           <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-14 bg-white/10 border-white/40 text-[12px] font-mono font-bold tracking-tight text-white" placeholder="e.g. FRANKFURT_DE" />
                        </div>
                        <div className="space-y-4 md:col-span-2">
                           <label className="text-[11px] uppercase font-black text-white tracking-[0.4em]">PROTOCOL_BIO</label>
                           <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[140px] bg-white/10 border-white/40 text-[12px] font-mono py-6 font-medium leading-relaxed text-white" placeholder="Hardware and reliability commitment metrics..." />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[11px] uppercase font-black text-white tracking-[0.4em]">COMMISSION_RATE (0-30%)</label>
                           <div className="relative">
                              <input type="number" step="0.1" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: Math.min(30, Math.max(0, Number(e.target.value)))})} className="exn-input h-14 bg-white/10 border-white/40 text-[13px] font-mono font-bold text-white" />
                              <span className="absolute right-6 top-4.5 text-[11px] font-black text-white">%</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-6 pt-6">
                        <button onClick={() => setReviewAction('update')} disabled={!!isProcessing} className="exn-button flex-1 h-14 uppercase font-black tracking-[0.4em] text-[12px]">
                          {isProcessing === 'PATCH_IDENTITY' ? 'SYNCHRONIZING...' : 'SYNCHRONIZE_PATCH'}
                        </button>
                        <button onClick={() => setEditingNodeId(null)} className="exn-button-outline flex-1 h-14 uppercase font-black tracking-[0.4em] text-[12px] border-white/30 text-white hover:bg-white/15">ABORT_SEQUENCE</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-8">
                            <div className="flex items-center gap-4">
                               <Globe className="w-5 h-5 text-primary" />
                               <h3 className="text-[11px] uppercase font-black tracking-[0.5em] text-white">NETWORK_LOCALIZATION</h3>
                            </div>
                            <div className="p-8 bg-white/10 rounded-2xl border border-white/30 space-y-6 shadow-3xl">
                               <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                                  <span className="text-white font-black">SECTOR</span>
                                  <span className="text-white font-black font-mono">{node.location}</span>
                               </div>
                               <div className="h-px w-full bg-white/20" />
                               <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                                  <span className="text-white font-black">COMMISSION</span>
                                  <span className="text-primary font-black font-mono">{(node.commission_rate / 100).toFixed(1)}%</span>
                               </div>
                               <div className="h-px w-full bg-white/20" />
                               <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                                  <span className="text-white font-black">LICENSE_LINK</span>
                                  <span className="text-white font-mono font-black">{shortenAddress(node.license_id || 'N/A')}</span>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-8">
                            <div className="flex items-center gap-4">
                               <Cpu className="w-5 h-5 text-primary" />
                               <h3 className="text-[11px] uppercase font-black tracking-[0.5em] text-white">SYSTEM_CONTROLLER</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                               <button onClick={() => startEditing(node)} disabled={!!isProcessing} className="h-14 exn-button-outline border-white/30 hover:bg-primary/20 hover:border-primary uppercase text-[11px] font-black tracking-[0.4em] rounded-2xl transition-all shadow-xl text-white">PATCH_IDENTITY</button>
                               {!node.seed_deposited ? (
                                 <button onClick={() => handleDepositSeed(node.id)} disabled={!!isProcessing} className="h-14 exn-button uppercase text-[11px] font-black tracking-[0.4em]">
                                   {isProcessing === 'INJECT_SEED' ? 'INJECTING...' : 'INJECT_SEED_CAPITAL'}
                                 </button>
                               ) : (
                                 <button onClick={() => handleWithdrawSeed(node.id)} disabled={!!isProcessing} className="h-14 bg-primary/20 text-primary border border-primary/50 uppercase text-[11px] font-black tracking-[0.4em] rounded-2xl hover:bg-primary/30 transition-all">
                                   {isProcessing === 'WITHDRAW_SEED' ? 'WITHDRAWING...' : 'WITHDRAW_SEED'}
                                 </button>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8 border-t border-white/20 pt-12">
                         <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            <h3 className="text-[11px] uppercase font-black tracking-[0.5em] text-destructive">DECOMMISSION_PROTOCOLS</h3>
                         </div>
                         <div className="p-10 bg-destructive/15 border border-destructive/40 rounded-2xl space-y-8 shadow-3xl">
                            <p className="text-[11px] text-destructive font-black leading-relaxed uppercase tracking-tight">
                               CRITICAL_WARNING: DECOMMISSIONING THIS VALIDATOR WILL PERMANENTLY TERMINATE ITS ON-CHAIN REGISTRATION AND BURN THE ASSOCIATED XNODE LICENSE NFT.
                            </p>
                            <button onClick={() => setReviewAction('terminate')} disabled={!!isProcessing} className="w-full h-14 bg-destructive text-white uppercase text-[11px] font-black tracking-[0.5em] rounded-2xl hover:opacity-95 active:scale-95 transition-all shadow-3xl">
                              {isProcessing === 'TERMINATE_REGISTRATION' ? 'TERMINATING...' : 'TERMINATE_REGISTRATION'}
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

      <AlertDialog open={reviewAction !== null} onOpenChange={() => setReviewAction(null)}>
        <AlertDialogContent className="exn-card border-primary/60 bg-black/95 backdrop-blur-3xl p-10 space-y-10 overflow-hidden max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-[0.4em] text-primary flex items-center gap-4">
              <ShieldCheck className="w-7 h-7" />
              VERIFY_OPERATION
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-8 pt-6">
              <div className="p-8 bg-white/10 rounded-2xl border border-white/30 space-y-6 shadow-3xl">
                <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                  <span className="text-white font-black">OP_CODE</span>
                  <span className="text-white font-black font-mono uppercase">
                    {reviewAction === 'update' ? 'IDENTITY_PATCH' : reviewAction === 'terminate' ? 'SYSTEM_DECOMMISSION' : 'SEED_INJECTION'}
                  </span>
                </div>
                {reviewAction === 'update' && (
                  <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                    <span className="text-white font-black">FEES_SET</span>
                    <span className="text-primary font-black font-mono">{formData?.commission_rate}%</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                  <span className="text-white font-black">NETWORK_LAYER</span>
                  <span className="text-emerald-500 font-black font-mono">PROTOCOL_MAINNET</span>
                </div>
              </div>
              
              <p className="text-[11px] text-white uppercase leading-relaxed font-black tracking-[0.1em]">
                THIS OPERATION WILL BE PERMANENTLY RECORDED ON THE GLOBAL NETWORK LEDGER. PROCEED?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-6">
            <AlertDialogCancel className="exn-button-outline flex-1 text-[11px] h-14 uppercase font-black border-white/30 text-white hover:bg-white/15">ABORT</AlertDialogCancel>
            <AlertDialogAction onClick={reviewAction === 'update' ? handleUpdate : reviewAction === 'terminate' ? handleTerminate : undefined} className="exn-button flex-1 text-[11px] h-14 uppercase font-black">CONFIRM_OPS</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
