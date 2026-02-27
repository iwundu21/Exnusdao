
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardStats } from '@/components/staking/DashboardStats';
import { ValidatorDiscovery } from '@/components/staking/ValidatorDiscovery';
import { StakingActionForm } from '@/components/staking/StakingActionForm';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { GovernancePortal } from '@/components/governance/GovernancePortal';
import { RefreshCw, Trophy, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'staking' | 'governance'>('staking');
  const [isLoading, setIsLoading] = useState(true);

  // --- Simulated Protocol State (Phase 0-14) ---
  const [globalState, setGlobalState] = useState({
    totalStaked: 45200,
    rewardCap: 1250,
    validatorCount: 3,
    licensePrice: 500, // USDC
    governanceThreshold: 5100, // 51%
    proposalCount: 2,
    exnBalance: 12500,
    usdcBalance: 2000,
  });

  const [validators, setValidators] = useState([
    { id: 'v1', name: 'CyberCore-01', description: 'Primary edge node', logo_uri: '66', is_active: true, seed_deposited: true, total_staked: 15200, commission_rate: 500, accrued_node_rewards: 452, global_reward_index: 1200 },
    { id: 'v2', name: 'NebulaNode', description: 'Deep space validator', logo_uri: '77', is_active: true, seed_deposited: true, total_staked: 12500, commission_rate: 800, accrued_node_rewards: 210, global_reward_index: 1200 },
    { id: 'v3', name: 'AlphaPulse', description: 'High-frequency pulse', logo_uri: '88', is_active: false, seed_deposited: true, total_staked: 17500, commission_rate: 300, accrued_node_rewards: 125, global_reward_index: 1150 },
  ]);

  const [userStakes, setUserStakes] = useState([
    { id: 's1', validator_id: 'v1', amount: 5000, lock_multiplier: 10000, unlock_timestamp: Date.now() - 86400000, reward_checkpoint: 1000, claimed: false, unstaked: false },
    { id: 's2', validator_id: 'v2', amount: 2500, lock_multiplier: 5000, unlock_timestamp: Date.now() + 86400000 * 30, reward_checkpoint: 1100, claimed: false, unstaked: false },
  ]);

  const [proposals, setProposals] = useState([
    { id: 0, proposer: '0x1c...99d', type: 0, title: 'Upgrade Epoch Length', description: 'Increase epoch from 24h to 48h for stability.', amount: 0, recipient: '', yes_votes: 15000, no_votes: 2000, deadline: Date.now() + 86400000 * 2, executed: false },
    { id: 1, proposer: '0xAdmin', type: 1, title: 'Treasury Grant: UI Redesign', description: 'Release 50,000 EXN for ecosystem development.', amount: 50000, recipient: '0xDev...abc', yes_votes: 45000, no_votes: 1200, deadline: Date.now() - 86400000, executed: false },
  ]);

  const [selectedValidator, setSelectedValidator] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    (window as any).toggleAdminView = () => setIsAdmin(prev => !prev);
    return () => clearTimeout(timer);
  }, []);

  // --- Calculations (Phase 5/6) ---
  const pendingRewards = useMemo(() => {
    return userStakes
      .filter(s => !s.unstaked)
      .reduce((acc, stake) => {
        const validator = validators.find(v => v.id === stake.validator_id);
        if (!validator) return acc;
        const rewardDelta = validator.global_reward_index - stake.reward_checkpoint;
        const reward = (rewardDelta * stake.amount) / 10000; // Simplified precision
        return acc + (stake.claimed ? 0 : reward);
      }, 0);
  }, [userStakes, validators]);

  // --- Handlers ---
  const handleSettleEpoch = () => {
    // Phase 5 Logic
    setValidators(prev => prev.map(v => {
      if (!v.is_active || v.total_staked === 0) return v;
      const totalReward = globalState.reward_cap;
      const commission = (totalReward * v.commission_rate) / 10000;
      const delegatorRewards = totalReward - commission;
      const rewardIncrease = (delegatorRewards * 10000) / v.total_staked;
      
      return {
        ...v,
        accrued_node_rewards: v.accrued_node_rewards + commission,
        global_reward_index: v.global_reward_index + rewardIncrease
      };
    }));
    toast({ title: "Epoch Settled", description: "Rewards distributed across all active validators." });
  };

  const handleClaimAll = () => {
    // Phase 6 Logic
    const claimable = userStakes.filter(s => !s.claimed && Date.now() >= s.unlock_timestamp);
    if (claimable.length === 0) {
      toast({ title: "No Claimable Rewards", description: "Wait for lock periods to end.", variant: "destructive" });
      return;
    }
    setUserStakes(prev => prev.map(s => Date.now() >= s.unlock_timestamp ? { ...s, claimed: true } : s));
    setGlobalState(prev => ({ ...prev, exnBalance: prev.exnBalance + pendingRewards }));
    toast({ title: "Rewards Claimed", description: `${pendingRewards.toFixed(2)} EXN transferred to wallet.` });
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
      <Navbar isAdmin={isAdmin} toggleAdmin={() => setIsAdmin(!isAdmin)} exnBalance={globalState.exnBalance} />
      
      {isAdmin && (
        <AdminPanel 
          globalState={globalState} 
          setGlobalState={setGlobalState} 
          onSettle={handleSettleEpoch}
          validators={validators}
          setValidators={setValidators}
        />
      )}

      <div className="max-w-7xl mx-auto px-10 py-10 space-y-12">
        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-white/10">
          <button 
            onClick={() => setActiveTab('staking')}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'staking' ? 'text-[#00f5ff] border-b-2 border-[#00f5ff]' : 'text-white/40 hover:text-white'}`}
          >
            Staking Portal
          </button>
          <button 
            onClick={() => setActiveTab('governance')}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'governance' ? 'text-[#00f5ff] border-b-2 border-[#00f5ff]' : 'text-white/40 hover:text-white'}`}
          >
            Governance
          </button>
        </div>

        {activeTab === 'staking' ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]" />
                   <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Protocol Version 1.0.4</span>
                </div>
                <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter">EXNUS PROTOCOL</h1>
                <p className="text-white/40 max-w-md">Phase 0-14 fully integrated. Stake EXN, participate in governance, and manage your validator node.</p>
              </div>
              
              <div className="flex gap-4">
                 <button 
                   onClick={handleClaimAll}
                   className="exn-button flex items-center gap-2 group"
                 >
                   <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                   Claim {pendingRewards.toFixed(1)} EXN
                 </button>
                 <button 
                   onClick={handleSettleEpoch}
                   className="exn-button-outline flex items-center gap-2 group"
                 >
                   <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                   Settle Epoch
                 </button>
              </div>
            </div>

            <DashboardStats 
              totalStaked={globalState.totalStaked} 
              pendingRewards={pendingRewards}
              lockedAmount={userStakes.filter(s => Date.now() < s.unlock_timestamp).reduce((a, b) => a + b.amount, 0)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-12">
                <ValidatorDiscovery 
                  validators={validators} 
                  onSelect={setSelectedValidator}
                  userStakes={userStakes}
                  setUserStakes={setUserStakes}
                />
                
                {/* Node Owner Control (Phase 4/7/9) */}
                <section className="exn-card p-8 space-y-6 border-[#00f5ff]/20">
                  <div className="flex justify-between items-center">
                     <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       <ShieldCheck className="w-6 h-6 text-[#00f5ff]" /> Node Operator Console
                     </h3>
                     <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50">Admin Rights detected</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="p-4 bg-white/5 rounded-xl text-center border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase mb-1">Accrued Commission</p>
                        <p className="text-xl font-bold text-[#00f5ff]">452.10 EXN</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-xl text-center border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase mb-1">Fee Rate</p>
                        <p className="text-xl font-bold text-white">5.0%</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-xl text-center border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase mb-1">Active Stakers</p>
                        <p className="text-xl font-bold text-white">124</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-xl text-center border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase mb-1">Seed Status</p>
                        <p className="text-xl font-bold text-emerald-400">Deposited</p>
                     </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-white/10">
                     <button onClick={() => toast({ title: "Commission Withdrawn", description: "Phase 7 execution complete." })} className="flex-1 exn-button text-xs">Claim Commission</button>
                     <button className="flex-1 exn-button-outline text-xs">Update Metadata (Phase 11)</button>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <StakingActionForm 
                  selectedNode={selectedValidator} 
                  exnBalance={globalState.exnBalance}
                  onStake={(stake) => {
                    setUserStakes(prev => [...prev, { ...stake, id: `s${Date.now()}` }]);
                    setGlobalState(prev => ({ ...prev, totalStaked: prev.totalStaked + stake.amount, exnBalance: prev.exnBalance - stake.amount }));
                    setValidators(prev => prev.map(v => v.id === stake.validator_id ? { ...v, total_staked: v.total_staked + stake.amount } : v));
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <GovernancePortal 
            proposals={proposals} 
            totalStaked={globalState.totalStaked}
            onVote={(id, support) => {
               setProposals(prev => prev.map(p => p.id === id ? { 
                 ...p, 
                 yes_votes: support ? p.yes_votes + 1000 : p.yes_votes, 
                 no_votes: !support ? p.no_votes + 1000 : p.no_votes 
               } : p));
               toast({ title: "Vote Cast", description: `You voted ${support ? 'YES' : 'NO'} with 1,000 EXN weight.` });
            }}
          />
        )}
      </div>
    </main>
  );
}
