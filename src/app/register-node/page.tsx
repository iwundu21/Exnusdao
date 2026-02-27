"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ShieldCheck, ArrowLeft, MapPin, Percent, Image as ImageIcon, FileText, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

    if (!file.type.startsWith('image/')) {
      return toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
    }

    if (file.size > 2 * 1024 * 1024) {
      return toast({ title: "File Too Large", description: "Maximum image size is 2MB.", variant: "destructive" });
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({ ...prev, logo_uri: result }));
      toast({ 
        title: "Logo Processed", 
        description: "Image successfully encoded for registration." 
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo_uri: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      logo_uri: formData.logo_uri || "default-seed",
      location: formData.location,
      is_active: true,
      seed_deposited: true,
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

    toast({ title: "Node Registered", description: "Validator successfully initialized on-chain." });
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
      
      <div className="max-w-4xl mx-auto px-10 py-20 space-y-12">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase">Validator Registration</h1>
          <p className="text-white/40 max-w-xl">
            Register your high-performance node. Each registration requires a valid protocol license.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 exn-card p-8 space-y-8 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-purple-400" /> Validator Logo
                </label>
                <div className="flex gap-4">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="relative flex-1">
                    <input 
                      value={formData.logo_uri.startsWith('data:') ? '[Uploaded Image File]' : formData.logo_uri}
                      readOnly
                      className="exn-input h-12 text-sm pl-10 cursor-default" 
                      placeholder="No image selected" 
                    />
                    <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-white/30" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={triggerFileUpload}
                      className="exn-button-outline px-6 flex items-center gap-2 whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4" /> Select Image
                    </button>
                    {formData.logo_uri && (
                      <button 
                        onClick={removeLogo}
                        className="p-3 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[9px] text-white/20 uppercase">Upload a standard image file (PNG, JPG, SVG). Max size: 2MB.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                  <Percent className="w-3 h-3 text-yellow-400" /> Commission (0-30%)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.commission}
                    onChange={e => setFormData({...formData, commission: Math.min(30, Math.max(0, Number(e.target.value)))})}
                    className="exn-input h-12 text-sm pr-10" 
                    max="30"
                    min="0"
                  />
                  <span className="absolute right-3 top-3.5 text-white/40 font-bold">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Unique License ID
                </label>
                <input 
                  value={formData.licenseId}
                  onChange={e => setFormData({...formData, licenseId: e.target.value})}
                  className="exn-input h-12 text-sm font-mono tracking-wider border-[#00f5ff]/40" 
                  placeholder="LIC-XXXXXXX" 
                />
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

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Registration Preview</h3>
            <div className="exn-card aspect-square relative flex items-center justify-center overflow-hidden border-dashed border-white/10">
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={previewUrl} 
                    alt="Logo Preview" 
                    fill 
                    className="object-cover" 
                    data-ai-hint="validator logo"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                      <p className="text-sm font-bold text-white">{formData.name || 'Untitled Node'}</p>
                      <p className="text-[10px] text-[#00f5ff] uppercase">{formData.location || 'Unknown Location'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/10">
                  <ImageIcon className="w-16 h-16" />
                  <p className="text-[10px] uppercase font-black tracking-widest">Awaiting Logo</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
               <h4 className="text-[10px] font-black text-white/40 uppercase mb-2">Registration Status</h4>
               <ul className="space-y-2">
                 <li className={`flex items-center gap-2 text-[10px] ${formData.name ? 'text-emerald-400' : 'text-white/20'}`}>
                    <ShieldCheck className="w-3 h-3" /> Identity String Set
                 </li>
                 <li className={`flex items-center gap-2 text-[10px] ${formData.licenseId ? 'text-emerald-400' : 'text-white/20'}`}>
                    <ShieldCheck className="w-3 h-3" /> License Key Linked
                 </li>
                 <li className={`flex items-center gap-2 text-[10px] ${formData.logo_uri ? 'text-emerald-400' : 'text-white/20'}`}>
                    <ShieldCheck className="w-3 h-3" /> Image Data Encoded
                 </li>
               </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}