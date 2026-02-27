
"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardStats } from '@/components/staking/DashboardStats';
import { ValidatorDiscovery } from '@/components/staking/ValidatorDiscovery';
import { StakingActionForm } from '@/components/staking/StakingActionForm';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { RefreshCw, Coins, Trophy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    
    // Global function for admin toggle from inside components
    (window as any).toggleAdminView = () => setIsAdmin(prev => !prev);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCrank = () => {
    toast({ title: "Protocol Cranked", description: "Rewards have been distributed globally across all active nodes." });
  };

  const handleClaim = () => {
    toast({ title: "Rewards Claimed", description: "1,240.50 EXN tokens have been sent to your wallet." });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] space-y-4">
        <div className="w-16 h-16 border-4 border-[#00f5ff] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,245,255,0.3)]" />
        <p className="exn-gradient-text font-bold tracking-[0.2em] animate-pulse">SYNCHRONIZING PROTOCOL</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <Navbar isAdmin={isAdmin} toggleAdmin={() => setIsAdmin(!isAdmin)} />
      
      {isAdmin && <AdminPanel />}

      <div className="max-w-7xl mx-auto px-10 py-10 space-y-12">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]" />
               <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Solana Mainnet-Beta</span>
            </div>
            <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter">STAKING PORTAL</h1>
            <p className="text-white/40 max-w-md">Maximize your EXN yield with our high-efficiency staking protocol. Secure the network, earn rewards.</p>
          </div>
          
          <div className="flex gap-4">
             <button 
               onClick={handleClaim}
               className="exn-button flex items-center gap-2 group"
             >
               <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
               Claim 1,240 EXN
             </button>
             <button 
               onClick={handleCrank}
               className="exn-button-outline flex items-center gap-2 group"
             >
               <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
               Global Crank
             </button>
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <ValidatorDiscovery onSelect={setSelectedValidator} />
            
            {/* Registered Node Stats for Owner */}
            <section className="exn-card p-8 space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Coins className="w-6 h-6 text-[#00f5ff]" /> Your Validator Node
                 </h3>
                 <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50">Node ID: EXN_8293</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-[10px] text-white/40 uppercase mb-1">Commission Earned</p>
                    <p className="text-xl font-bold text-[#00f5ff]">452.10 EXN</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-[10px] text-white/40 uppercase mb-1">Node Commission</p>
                    <p className="text-xl font-bold text-white">5.0%</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-[10px] text-white/40 uppercase mb-1">Active Stakers</p>
                    <p className="text-xl font-bold text-white">124</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-[10px] text-white/40 uppercase mb-1">Uptime</p>
                    <p className="text-xl font-bold text-emerald-400">99.9%</p>
                 </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-white/10">
                 <button onClick={() => toast({ title: "Commission Withdrawn", description: "452.10 EXN transferred to owner wallet." })} className="flex-1 exn-button text-xs">Withdraw Commission</button>
                 <button className="flex-1 exn-button-outline text-xs">Node Settings</button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <StakingActionForm selectedNode={selectedValidator} />
            
            <div className="exn-card p-6 space-y-4">
               <h4 className="font-bold text-white flex items-center gap-2">
                 <Trophy className="w-5 h-5 text-yellow-400" /> Staking Leaderboard
               </h4>
               {[
                 { rank: 1, user: '0x3a...2f1', amt: '124,000 EXN' },
                 { rank: 2, user: '0x8b...a44', amt: '98,500 EXN' },
                 { rank: 3, user: '0x1c...99d', amt: '82,120 EXN' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 font-bold w-4">{item.rank}.</span>
                      <span className="text-white/70">{item.user}</span>
                    </div>
                    <span className="text-[#00f5ff] font-bold">{item.amt}</span>
                 </div>
               ))}
               <button className="w-full text-center text-[10px] text-white/30 uppercase font-bold pt-2 hover:text-white/50 flex items-center justify-center gap-1">
                 View All Rankings <ExternalLink className="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
