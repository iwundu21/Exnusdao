
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, AlertCircle, Wallet, Ticket, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState, Validator } from '@/hooks/use-protocol-state';
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

export default function RegisterNodePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, isLoaded, setFeedback, registerValidator } = useProtocolState();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showReview, setShowReview] = useState(false);
  
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
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-black uppercase tracking-[0.4em] animate-pulse text-[9px]">VERIFYING_NETWORK_STATE</p>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-10 py-32 space-y-6 animate-in fade-in duration-500">
         <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 shadow-2xl">
           <Wallet className="w-10 h-10 text-primary" />
         </div>
         <div className="space-y-3">
           <h1 className="text-2xl font-black uppercase tracking-tighter text-white">AUTH_REQUIRED</h1>
           <p className="text-white text-[10px] uppercase font-black tracking-[0.3em]">Please connect your Solana wallet to verify XNode License ownership.</p>
         </div>
      </div>
    );
  }

  const myLicenses = state.licenses.filter(l => l.owner === walletAddress && !l.is_burned);
  const existingNode = state.validators.find(v => v.owner === walletAddress);
  const hasExistingNode = !!existingNode;

  if (myLicenses.length === 0) return (
    <div className="max-w-3xl mx-auto px-10 py-32 text-center space-y-8 animate-in fade-in duration-500">
       <div className="p-6 bg-destructive/10 rounded-3xl border border-destructive/20 w-fit mx-auto shadow-2xl">
         <Ticket className="w-12 h-12 text-destructive" />
       </div>
       <div className="space-y-4">
         <h1 className="text-2xl font-black uppercase tracking-tighter text-white">LICENSE_AUTHORIZATION_REQUIRED</h1>
         <p className="text-white text-[11px] uppercase font-black tracking-[0.3em] max-w-md mx-auto leading-relaxed">
           XNode Provisioning is restricted to verified License holders. Please mint a license to initialize your infrastructure sector.
         </p>
       </div>
       <Link href="/purchase-license" className="exn-button inline-flex items-center justify-center px-12 h-12 text-[11px] tracking-[0.2em]">INITIALIZE_MINT_SEQUENCE</Link>
    </div>
  );

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

  const handleRegisterInitiate = () => {
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

    setShowReview(true);
  };

  const confirmRegistration = () => {
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
    setShowReview(false);
    
    setTimeout(() => router.push('/manage-node'), 7000);
  };

  const availableLicenses = state.licenses.filter(l => l.owner === walletAddress && !l.is_claimed && !l.is_burned);
  const previewLogo = formData.logo_uri.length > 0 ? formData.logo_uri : `https://picsum.photos/seed/placeholder/800/400`;
  const isRegistrationDisabled = !formData.licenseId || !formData.name.trim() || !formData.location.trim() || !formData.description.trim();

  return (
    <div className="max-w-6xl mx-auto px-10 py-16 space-y-10 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-white hover:text-white transition-colors uppercase text-[9px] font-black tracking-[0.2em]">
        <ArrowLeft className="w-3.5 h-3.5" /> EXIT_TERMINAL
      </Link>

      <div className="space-y-3">
        <h1 className="text-4xl font-black exn-gradient-text tracking-tighter uppercase text-white leading-none">XNODE_PROVISIONING</h1>
        <p className="text-white text-[10px] font-black uppercase tracking-[0.4em] max-w-lg">
          Establish decentralized infrastructure by binding a verified XNode License NFT to a new validator identity.
        </p>
      </div>

      {hasExistingNode ? (
        <div className="exn-card p-12 flex flex-col items-center justify-center text-center space-y-8 border-primary/30 bg-primary/5 shadow-2xl backdrop-blur-3xl">
           <AlertCircle className="w-12 h-12 text-primary" />
           <div className="space-y-3">
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">ACTIVE_XNODE_DETECTED</h2>
             <p className="text-[10px] text-white uppercase font-black tracking-[0.3em]">Only one XNode registration permitted per unique wallet address.</p>
           </div>
           <Link href="/manage-node" className="exn-button h-12 flex items-center justify-center px-10 text-[10px]">MANAGE_EXISTING_NODE</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 exn-card p-8 space-y-10 bg-black/40 backdrop-blur-3xl border-white/20 shadow-3xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                 <h3 className="text-[9px] font-black text-white uppercase tracking-[0.4em]">NFT_AUTHORIZATION</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-[9px] text-white uppercase font-black tracking-[0.3em]">SELECT_XNODE_LICENSE *</label>
                <div className="relative group">
                   <Ticket className="absolute left-4 top-3.5 w-4.5 h-4.5 text-primary" />
                   <select 
                    value={formData.licenseId} 
                    onChange={e => setFormData({...formData, licenseId: e.target.value})} 
                    className="exn-input h-12 pl-12 text-[10px] font-mono font-black tracking-tight bg-black/60"
                   >
                    <option value="">SCAN_FOR_MINTED_LICENSES...</option>
                    {availableLicenses.map(l => (
                      <option key={l.id} value={l.id}>{l.id}</option>
                    ))}
                   </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] text-white uppercase font-black tracking-[0.3em]">XNODE_NAME *</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-12 text-xs font-mono font-bold bg-black/60" placeholder="ID_STRING_V1" />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] text-white uppercase font-black tracking-[0.3em]">SECTOR_LOCATION *</label>
                <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-12 text-xs font-mono font-bold bg-black/60" placeholder="e.g. FRANKFURT_DE" />
              </div>
              
              <div className="md:col-span-2 space-y-3">
                <label className="text-[9px] text-white uppercase font-black tracking-[0.3em]">IDENTITY_ASSET (LOGO_UPLOAD)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group shadow-inner"
                >
                  <Upload className="w-6 h-6 text-white group-hover:text-primary transition-all duration-500" />
                  <p className="text-[9px] uppercase font-black text-white group-hover:text-primary transition-all tracking-[0.2em]">
                    {formData.logo_uri.length > 0 ? 'REPLACE_ASSET' : 'CLICK_TO_PROVISION_LOGO'}
                  </p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] text-white uppercase font-black tracking-[0.3em]">COMMISSION_TIER (0-30%)</label>
                <div className="relative">
                  <input type="number" value={formData.commission} onChange={e => setFormData({...formData, commission: Math.min(30, Math.max(0, Number(e.target.value)))})} className="exn-input h-12 text-xs font-mono font-bold bg-black/60" />
                  <span className="absolute right-5 top-3.5 text-white font-black text-[9px]">%</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-[9px] text-white uppercase font-black tracking-[0.3em]">PROTOCOL_BIO *</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="exn-input min-h-[100px] py-4 text-[11px] font-mono font-medium leading-relaxed bg-black/60" placeholder="Describe hardware commitment..." />
              </div>
            </div>
            
            <button 
              onClick={handleRegisterInitiate} 
              disabled={isRegistrationDisabled} 
              className={`w-full h-14 uppercase tracking-[0.5em] font-black transition-all shadow-3xl text-[11px] ${isRegistrationDisabled ? 'bg-white/5 text-white border border-white/20 cursor-not-allowed opacity-50' : 'exn-button'}`}
            >
              REVIEW_PROVISIONING
            </button>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-32">
              <h3 className="text-[9px] font-black text-white uppercase tracking-[0.4em] mb-5">IDENTITY_PREVIEW_V2</h3>
              <div className="exn-card overflow-hidden border-primary/30 bg-black/60 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl group">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={previewLogo}
                    alt="Preview"
                    fill
                    className={`object-cover transition-all duration-1000 ${formData.logo_uri.length > 0 ? 'opacity-80 scale-105' : 'opacity-20 grayscale'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  
                  <div className="absolute top-4 right-6">
                    <div className="flex items-center gap-1.5 bg-emerald-500 text-black text-[9px] px-3 py-1.5 rounded-lg font-black uppercase border border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SECURE_ID_VERIFIED
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-8 space-y-2">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
                       <h4 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                         {formData.name || 'UNASSIGNED_NAME'}
                       </h4>
                    </div>
                    {formData.location && (
                      <div className="flex items-center gap-2 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
                        <MapPin className="w-3.5 h-3.5" />
                        {formData.location}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="space-y-3">
                    <p className="text-[9px] text-white uppercase font-black tracking-[0.4em]">NETWORK_BIO</p>
                    <p className="text-[11px] text-white leading-relaxed font-medium italic min-h-[3rem] tracking-tight">
                      {formData.description || "Establish hardware metrics..."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-xl border border-white/20 space-y-1.5 group-hover:border-primary transition-all shadow-xl">
                      <p className="text-[9px] uppercase font-black text-white tracking-widest">NODE_FEE</p>
                      <p className="text-primary font-black text-[12px] font-mono tracking-tighter">{(formData.commission).toFixed(1)}%</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-xl border border-white/20 space-y-1.5 group-hover:border-primary transition-all shadow-xl">
                      <p className="text-[9px] uppercase font-black text-white tracking-widest">NFT_BOND</p>
                      <p className="text-white font-mono font-black text-[9px] truncate tracking-tighter">{formData.licenseId ? shortenAddress(formData.licenseId) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Review Dialog */}
      <AlertDialog open={showReview} onOpenChange={setShowReview}>
        <AlertDialogContent className="exn-card border-primary/60 bg-black/95 backdrop-blur-3xl p-8 space-y-8 overflow-hidden max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
              <ShieldCheck className="w-6 h-6" />
              VERIFY_BINDING
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-6 pt-4">
                <div className="p-6 bg-white/5 rounded-xl border border-white/20 space-y-4 shadow-3xl">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                    <span className="text-white font-black">OP_CODE</span>
                    <span className="text-white font-black font-mono">XNODE_BIND_ATOMIC</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                    <span className="text-white font-black">LICENSE_ID</span>
                    <span className="text-white font-mono font-black text-[9px]">{shortenAddress(formData.licenseId)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.4em]">
                    <span className="text-white font-black">IDENTITY_NAME</span>
                    <span className="text-primary font-black font-mono text-[10px]">{formData.name}</span>
                  </div>
                </div>
                
                <p className="text-[11px] text-white uppercase leading-relaxed font-black tracking-tight">
                  BY CONFIRMING, YOU ARE ATOMICALLY BINDING YOUR XNODE LICENSE NFT TO THIS VALIDATOR IDENTITY.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-4 pt-2">
            <AlertDialogCancel className="exn-button-outline flex-1 text-[10px] h-12 uppercase font-black border-white text-white">ABORT</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRegistration} className="exn-button flex-1 h-12 text-[10px] uppercase font-black">CONFIRM_BIND</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
