
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Wallet, TrendingUp } from 'lucide-react';
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
  
  const { state, isLoaded, setFeedback, exnBalance, updateUserBalance, updateValidator, terminateValidator, toggleValidator } = useProtocolState();
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return null;

  if (!connected) return (
    <div className="flex flex-col items-center justify-center text-center px-10 py-40 space-y-8 animate-in fade-in duration-500">
       <Wallet className="w-12 h-12 text-primary" />
       <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">Wallet Required</h1>
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
    setFeedback('success', 'Identity updated.');
  };

  const handleClaimCommission = (vId: string) => {
    const node = state.validators.find(v => v.id === vId);
    if (!node || (node.accrued_node_rewards || 0) <= 0) return;
    updateUserBalance(walletAddress, node.accrued_node_rewards, 0);
    updateValidator(vId, { accrued_node_rewards: 0 });
    setFeedback('success', 'Commission harvested.');
  };

  const handleDepositSeed = (vId: string) => {
    if (exnBalance < state.seedAmount) return setFeedback('error', 'Insufficient EXN');
    updateUserBalance(walletAddress, -state.seedAmount, 0);
    updateValidator(vId, { seed_deposited: true, is_active: true, total_staked: state.seedAmount });
    setFeedback('success', 'Seed deposited.');
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
    terminateValidator(vId, walletAddress, node.seed_deposited ? state.seedAmount : 0, node.accrued_node_rewards || 0, node.license_id!);
    setFeedback('success', 'Node decommissioned.');
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground uppercase text-xs font-black tracking-widest"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <h1 className="text-5xl font-bold exn-gradient-text uppercase tracking-tighter">XNode Management</h1>

      {myNodes.map((node) => {
        const isEditing = editingNodeId === node.id;
        const logoUrl = isEditing && formData.logo_uri.startsWith('http') ? formData.logo_uri : (node.logo_uri.startsWith('http') ? node.logo_uri : `https://picsum.photos/seed/${node.logo_uri}/400/400`);
        const stakerCount = Array.from(new Set(state.userStakes.filter(s => s.validator_id === node.id && !s.unstaked).map(s => s.owner))).length;

        return (
          <div key={node.id} className="exn-card p-12 space-y-12 border-primary/20">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border"><Image src={logoUrl} alt="logo" fill className="object-cover" /></div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase">{node.name}</h2>
                    <p className="text-[10px] font-mono text-muted-foreground">{shortenAddress(node.id)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-foreground/5 rounded-xl border border-border/40">
                    <p className="text-[8px] uppercase font-black text-muted-foreground">Stakers</p>
                    <p className="text-xl font-bold">{stakerCount}</p>
                  </div>
                  <div className="p-4 bg-foreground/5 rounded-xl border border-border/40">
                    <p className="text-[8px] uppercase font-black text-muted-foreground">Weight</p>
                    <p className="text-xl font-bold text-primary">{node.total_staked.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-4">
                  <p className="text-[9px] uppercase font-black text-emerald-500">Commission Pool</p>
                  <p className="text-2xl font-bold text-emerald-500">{(node.accrued_node_rewards || 0).toFixed(2)} EXN</p>
                  <button onClick={() => handleClaimCommission(node.id)} className="w-full py-3 bg-emerald-500 text-black text-[9px] font-black uppercase rounded-lg">Harvest</button>
                </div>
              </div>

              <div className="xl:col-span-2 space-y-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input" placeholder="Name" />
                    <button onClick={handleUpdate} className="exn-button w-full h-12">Save</button>
                    <button onClick={() => setEditingNodeId(null)} className="exn-button-outline w-full h-12">Cancel</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button onClick={() => startEditing(node)} className="w-full h-12 exn-button-outline uppercase text-[10px] font-black">Edit Identity</button>
                    {!node.seed_deposited ? (
                      <button onClick={() => handleDepositSeed(node.id)} className="w-full h-12 bg-primary text-black font-black uppercase rounded-xl">Initialize Seed ({state.seedAmount.toLocaleString()} EXN)</button>
                    ) : (
                      <button onClick={() => handleWithdrawSeed(node.id)} className="w-full h-12 border border-destructive/20 text-destructive font-black uppercase rounded-xl">Withdraw Seed</button>
                    )}
                    <button onClick={() => handleCloseAccount(node.id)} className="w-full h-12 bg-destructive/10 text-destructive border border-destructive/20 font-black uppercase rounded-xl">Terminate Node</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
