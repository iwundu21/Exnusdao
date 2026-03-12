
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, AlertCircle, Wallet, Ticket, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState, Validator } from '@/hooks/use-protocol-state';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress } from '@/lib/utils';

export default function RegisterNodePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, isLoaded, setFeedback, registerValidator } = useProtocolState();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
           <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">Wallet Required</h1>
           <p className="text-muted-foreground max-w-md mx-auto">Please connect your Solana wallet to verify XNode License ownership.</p>
         </div>
      </div>
    );
  }

  const existingNode = state.validators.find(v => v.owner === walletAddress);
  const hasExistingNode = !!existingNode;

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

  const handleRegister = () => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    if (hasExistingNode) return setFeedback('warning', 'Only one XNode registration permitted per wallet.');
    
    const license = state.licenses.find(l => l.id === formData.licenseId);
    if (!license) return setFeedback('error', 'Invalid license NFT selected.');
    if (license.owner !== walletAddress) return setFeedback('error', 'License ownership verification failed.');
    if (license.is_burned) return setFeedback('error', 'XNode License has been burned.');
    if (license.is_claimed) return setFeedback('error', 'License is already bound to another node.');

    if (!formData.name.trim() || !formData.location.trim() || !formData.description.trim() || !formData.licenseId) {
      return setFeedback('error', 'All required fields must be completed.');
    }

    const newNode: Validator = {
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

    registerValidator(newNode, formData.licenseId);
    
    setFeedback('success', 'On-chain XNode registration successful.');
    setTimeout(() => router.push('/manage-node'), 1500);
  };

  const availableLicenses = state.licenses.filter(l => l.owner === walletAddress && !l.is_claimed && !l.is_burned);

  const isLogoSet = formData.logo_uri.length > 0;
  const previewLogo = isLogoSet ? formData.logo_uri : `https://picsum.photos/seed/placeholder/800/400`;

  const isRegistrationDisabled = !formData.licenseId || !formData.name.trim() || !formData.location.trim() || !formData.description.trim();

  return (
    <div className="max-w-6xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">XNode Provisioning</h1>
        <p className="text-muted-foreground max-w-xl">
          Register an XNode by binding it to a verified **XNode License NFT** and configuring your identity.
        </p>
      </div>

      {hasExistingNode ? (
        <div className="exn-card p-12 flex flex-col items-center justify-center text-center space-y-8 border-amber-500/20 bg-amber-500/5">
           <AlertCircle className="w-12 h-12 text-amber-500" />
           <div className="space-y-2">
             <h2 className="text-2xl font-bold text-foreground uppercase">Active XNode Detected</h2>
             <p className="text-xs text-muted-foreground uppercase tracking-widest">Only one XNode registration permitted per wallet address.</p>
           </div>
           <Link href="/manage-node" className="exn-button">Manage Existing XNode</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 exn-card p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">NFT Authorization</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Select XNode License *</label>
                <div className="relative">
                   <Ticket className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground/40" />
                   <select 
                    value={formData.licenseId} 
                    onChange={e => setFormData({...formData, licenseId: e.target.value})} 
                    className="exn-input h-12 pl-12 text-[10px] font-mono"
                   >
                    <option value="">Select a Minted XNode...</option>
                    {availableLicenses.map(l => (
                      <option key={l.id} value={l.id}>{l.id}</option>
                    ))}
                   </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">XNode Name *</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-12 text-sm" placeholder="e.g. CyberCore-01" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Location *</label>
                <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-12 text-sm" placeholder="e.g. Frankfurt, DE" />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Logo (Upload Image)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-[10px] uppercase font-black text-muted-foreground group-hover:text-primary transition-colors">
                    {isLogoSet ? 'Change Image' : 'Click to Upload XNode Logo'}
                  </p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Commission (0-30%)</label>
                <div className="relative">
                  <input type="number" value={formData.commission} onChange={e => setFormData({...formData, commission: Math.min(30, Math.max(0, Number(e.target.value)))})} className="exn-input h-12 text-sm" />
                  <span className="absolute right-4 top-3.5 text-muted-foreground font-bold">%</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">XNode Bio *</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[100px] py-4 text-xs" placeholder="Describe your hardware and commitment..." />
              </div>
            </div>
            
            <button 
              onClick={handleRegister} 
              disabled={isRegistrationDisabled} 
              className={`w-full h-14 uppercase tracking-widest font-black transition-all ${isRegistrationDisabled ? 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed opacity-50' : 'exn-button'}`}
            >
              {isRegistrationDisabled ? 'Complete All Required Fields' : 'Register XNode On-Chain'}
            </button>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-28">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Identity Preview</h3>
              <div className="exn-card overflow-hidden border-primary/20 bg-black/40 group">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={previewLogo}
                    alt="Preview"
                    fill
                    className={`object-cover transition-opacity duration-500 ${isLogoSet ? 'opacity-60' : 'opacity-20 grayscale'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  
                  <div className="absolute top-4 right-6">
                    <div className="flex items-center gap-1.5 bg-emerald-500 text-black text-[9px] px-2 py-1 rounded font-black uppercase border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-in fade-in zoom-in duration-500">
                      <CheckCircle2 className="w-3 h-3" />
                      XNode Identity Verified
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-8 space-y-1">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                       <h4 className="text-3xl font-bold text-white tracking-tighter uppercase">
                         {formData.name || 'Your XNode Name'}
                       </h4>
                    </div>
                    {formData.location && (
                      <div className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest">
                        <MapPin className="w-3 h-3" />
                        {formData.location}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] text-foreground/30 uppercase font-black tracking-widest">Network Bio</p>
                    <p className="text-xs text-foreground/60 leading-relaxed italic min-h-[3rem]">
                      {formData.description || "Describe your hardware and commitment to the Exnus network. This metadata will be visible to all stakers on the discovery dashboard."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-foreground/5 rounded-xl border border-border/10 space-y-1">
                      <p className="text-[9px] uppercase font-black text-foreground/30">Node Fee</p>
                      <p className="text-primary font-bold text-lg">{formData.commission.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-foreground/5 rounded-xl border border-border/10 space-y-1">
                      <p className="text-[9px] uppercase font-black text-foreground/30">Bound License</p>
                      <p className="text-foreground font-mono text-[11px] truncate">{formData.licenseId ? shortenAddress(formData.licenseId) : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <p className="text-[10px] text-primary leading-tight uppercase font-black tracking-tighter">
                      Previewing atomic binding between XNode License and Validator Identity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
