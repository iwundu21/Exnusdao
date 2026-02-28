
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, AlertCircle, ExternalLink, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress, getExplorerLink } from '@/lib/utils';

export default function RegisterNodePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, setState, isLoaded } = useProtocolState();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const existingNode = state.validators.find(v => v.owner === walletAddress);
  const hasExistingNode = !!existingNode;

  useEffect(() => {
    if (formData.logo_uri) {
      const isUrl = formData.logo_uri.startsWith('http') || formData.logo_uri.startsWith('data:');
      const url = isUrl ? formData.logo_uri : `https://picsum.photos/seed/${formData.logo_uri}/400/400`;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [formData.logo_uri]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) return toast({ title: "File too large", description: "Logo must be under 500KB", variant: "destructive" });
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({ ...prev, logo_uri: result }));
      toast({ title: "Logo Processed", description: "Custom identity loaded." });
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = () => {
    if (!connected) return toast({ title: "Wallet Disconnected", variant: "destructive" });
    if (hasExistingNode) return toast({ title: "Registration Denied", description: "One node limit per wallet reached.", variant: "destructive" });
    const license = state.licenses.find(l => l.id === formData.licenseId);
    if (!license) return toast({ title: "Invalid License ID", variant: "destructive" });
    if (license.is_burned) return toast({ title: "Burned License", description: "This license has been permanently burned 🔥.", variant: "destructive" });
    if (license.is_claimed) return toast({ title: "License Already Used", variant: "destructive" });
    if (!formData.name || !formData.location) return toast({ title: "Missing Fields", description: "Node name and location are required.", variant: "destructive" });

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
    toast({ title: "Node Registered", description: "Broadcasting initialization to network." });
    setTimeout(() => router.push('/manage-node'), 1500);
  };

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
           <p className="text-muted-foreground max-w-md mx-auto">Please connect your Solana wallet to register as a network validator.</p>
         </div>
      </div>
    );
  }

  const userLicenses = state.licenses.filter(l => l.owner === walletAddress && !l.is_claimed && !l.is_burned);

  return (
    <div className="max-w-4xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">Validator Registration</h1>
        <p className="text-muted-foreground max-w-xl">Provision high-performance infrastructure for wallet <a href={getExplorerLink(walletAddress)} target="_blank" rel="noopener noreferrer" className="text-foreground font-mono text-[10px] bg-foreground/5 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-primary/20 transition-all">{shortenAddress(walletAddress)} <ExternalLink className="w-2.5 h-2.5" /></a>.</p>
      </div>

      {hasExistingNode ? (
        <div className="exn-card p-12 flex flex-col items-center justify-center text-center space-y-8 border-amber-500/20 bg-amber-500/5">
           <AlertCircle className="w-12 h-12 text-amber-500" />
           <div className="space-y-2">
             <h2 className="text-2xl font-bold text-foreground uppercase">Active Node Detected</h2>
             <p className="text-xs text-muted-foreground uppercase tracking-widest">Protocol policy allows only one node per wallet address.</p>
           </div>
           <Link href="/manage-node" className="exn-button">Manage Existing Node</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 exn-card p-8 space-y-8">
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
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">License ID</label>
                <select value={formData.licenseId} onChange={e => setFormData({...formData, licenseId: e.target.value})} className="exn-input h-12 text-xs font-mono">
                  <option value="">Select a License</option>
                  {userLicenses.map(l => (<option key={l.id} value={l.id}>{l.id}</option>))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Validator Bio</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[100px] py-4 text-xs" placeholder="Briefly describe your hardware specs and uptime commitment..." />
              </div>
            </div>
            <button onClick={handleRegister} disabled={!formData.licenseId || !formData.name} className={`w-full h-14 uppercase tracking-widest font-black transition-all ${(!formData.licenseId || !formData.name) ? 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed' : 'exn-button'}`}>
              Initialize Node
            </button>
          </div>
          <div className="space-y-6">
            <div className="exn-card aspect-square relative flex items-center justify-center overflow-hidden border-primary/20">
              {previewUrl ? (<Image src={previewUrl} alt="Logo" fill className="object-cover" />) : (
                <div className="text-center space-y-2 p-6">
                  <Upload className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                  <p className="text-[10px] uppercase font-black text-muted-foreground/40">Logo Preview</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border border-primary/20 text-primary text-[10px] font-black uppercase rounded-lg hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Upload Identity Logo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
