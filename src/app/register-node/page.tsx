
"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ShieldCheck, ArrowLeft, MapPin, Percent, Image as ImageIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function RegisterNodePage() {
  const router = useRouter();
  const { state, setState, isLoaded } = useProtocolState();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_uri: '',
    location: '',
    commission: 10,
    licenseId: ''
  });

  const handleRegister = () => {
    const license = state.licenses.find(l => l.id === formData.licenseId);
    
    if (!license) {
      return toast({ title: "Invalid License ID", description: "Please provide a valid, purchased license ID.", variant: "destructive" });
    }
    if (license.is_claimed) {
      return toast({ title: "License Already Used", description: "This license has already been linked to a node.", variant: "destructive" });
    }
    if (!formData.name || !formData.location) {
      return toast({ title: "Missing Fields", description: "Name and location are required.", variant: "destructive" });
    }
    if (formData.commission < 0 || formData.commission > 30) {
      return toast({ title: "Invalid Commission", description: "Commission must be between 0% and 30%.", variant: "destructive" });
    }

    const newNode = {
      id: `v${Date.now()}`,
      owner: 'ExnUs...d2f1',
      name: formData.name,
      description: formData.description,
      logo_uri: formData.logo_uri || (Math.floor(Math.random() * 100).toString()),
      location: formData.location,
      is_active: false,
      seed_deposited: false,
      total_staked: 0,
      commission_rate: formData.commission * 100,
      accrued_node_rewards: 0,
      global_reward_index: 0
    };

    setState(prev => ({
      ...prev,
      validators: [...prev.validators, newNode],
      licenses: prev.licenses.map(l => l.id === formData.licenseId ? { ...l, is_claimed: true } : l)
    }));

    toast({ title: "Node Registered", description: "Redirecting to staking registry..." });
    setTimeout(() => router.push('/'), 1500);
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen pb-20">
      <Navbar 
        exnBalance={state.exnBalance} 
        usdcBalance={state.usdcBalance}
        toggleAdmin={() => {}}
      />
      
      <div className="max-w-3xl mx-auto px-10 py-20 space-y-12">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase">Validator Registration</h1>
          <p className="text-white/40 max-w-xl">
            Register your high-performance node. Once registered, you must deposit the 15M EXN seed to activate rewards.
          </p>
        </div>

        <div className="exn-card p-10 space-y-8 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3 text-[#00f5ff]" /> Node Name
              </label>
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="exn-input h-12 text-sm" 
                placeholder="e.g. CyberCore-01" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3 text-red-400" /> Physical Location
              </label>
              <input 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="exn-input h-12 text-sm" 
                placeholder="e.g. Frankfurt, DE" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                <ImageIcon className="w-3 h-3 text-purple-400" /> Logo Seed ID
              </label>
              <input 
                value={formData.logo_uri}
                onChange={e => setFormData({...formData, logo_uri: e.target.value})}
                className="exn-input h-12 text-sm" 
                placeholder="e.g. 42 (random if empty)" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                <Percent className="w-3 h-3 text-yellow-400" /> Commission (0-30%)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={formData.commission}
                  onChange={e => setFormData({...formData, commission: Number(e.target.value)})}
                  className="exn-input h-12 text-sm pr-10" 
                  max="30"
                  min="0"
                />
                <span className="absolute right-3 top-3.5 text-white/40 font-bold">%</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Unique License ID
              </label>
              <input 
                value={formData.licenseId}
                onChange={e => setFormData({...formData, licenseId: e.target.value})}
                className="exn-input h-12 text-sm font-mono tracking-wider border-[#00f5ff]/40" 
                placeholder="LIC-XXXXXXX" 
              />
              <p className="text-[9px] text-white/20 uppercase">Must correspond to an unused license in your wallet.</p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Node Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="exn-input min-h-[100px] py-4 text-sm" 
                placeholder="Hardware specs, reliability guarantees..." 
              />
            </div>
          </div>

          <button 
            onClick={handleRegister}
            className="w-full h-14 exn-button text-sm tracking-[0.2em] font-black uppercase flex items-center justify-center gap-3"
          >
            <ShieldCheck className="w-6 h-6" /> Initialize Validator Node
          </button>
        </div>
      </div>
    </main>
  );
}
