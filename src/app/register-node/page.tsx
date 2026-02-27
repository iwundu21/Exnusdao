"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft, AlertCircle, ExternalLink, Flame } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const USER_WALLET = 'ExnUs...d2f1';

export default function RegisterNodePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, setState, isLoaded } = useProtocolState();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_uri: '',
    location: '',
    commission: 10,
    licenseId: ''
  });

  const existingNode = state.validators.find(v => v.owner === USER_WALLET);
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

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({ ...prev, logo_uri: result }));
      toast({ title: "Logo Processed" });
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = () => {
    if (hasExistingNode) {
      return toast({ title: "Registration Denied", variant: "destructive" });
    }

    const license = state.licenses.find(l => l.id === formData.licenseId);
    
    if (!license) {
      return toast({ title: "Invalid License ID", variant: "destructive" });
    }
    if (license.is_burned) {
      return toast({ 
        title: "Burned License", 
        description: "This license has been permanently burned 🔥 and cannot be reused.", 
        variant: "destructive" 
      });
    }
    if (license.is_claimed) {
      return toast({ title: "License Already Used", variant: "destructive" });
    }
    if (!formData.name || !formData.location) {
      return toast({ title: "Missing Fields", variant: "destructive" });
    }

    const newNode = {
      id: `v${Date.now()}`,
      owner: USER_WALLET,
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

    toast({ title: "Node Registered", description: "Initialization successful." });
    setTimeout(() => router.push('/manage-node'), 1500);
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen pb-20">
      <Navbar exnBalance={state.exnBalance} usdcBalance={state.usdcBalance} />
      
      <div className="max-w-4xl mx-auto px-10 py-20 space-y-12">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase">Validator Registration</h1>
          <p className="text-white/40 max-w-xl">
            Register your node using a unique protocol license. Each license is single-use and non-reusable.
          </p>
        </div>

        {hasExistingNode ? (
          <div className="exn-card p-12 flex flex-col items-center justify-center text-center space-y-8 border-amber-500/20 bg-amber-500/5">
             <AlertCircle className="w-12 h-12 text-amber-500" />
             <h2 className="text-2xl font-bold text-white uppercase">Active Node Detected</h2>
             <Link href="/manage-node" className="exn-button">Manage Existing Node</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 exn-card p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Node Name</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="exn-input h-12 text-sm" placeholder="e.g. CyberCore-01" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Location</label>
                  <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="exn-input h-12 text-sm" placeholder="e.g. Frankfurt, DE" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Commission (0-30%)</label>
                  <input type="number" value={formData.commission} onChange={e => setFormData({...formData, commission: Math.min(30, Math.max(0, Number(e.target.value)))})} className="exn-input h-12 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">License ID</label>
                  <input value={formData.licenseId} onChange={e => setFormData({...formData, licenseId: e.target.value})} className="exn-input h-12 text-sm font-mono" placeholder="LIC-XXXXXXX" />
                </div>
              </div>
              <button onClick={handleRegister} className="w-full h-14 exn-button text-sm font-black uppercase tracking-widest">Initialize Node</button>
            </div>

            <div className="space-y-6">
              <div className="exn-card aspect-square relative flex items-center justify-center overflow-hidden">
                {previewUrl ? <Image src={previewUrl} alt="Logo" fill className="object-cover" /> : <p className="text-[10px] uppercase font-black text-white/10">Preview</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
