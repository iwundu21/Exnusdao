
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardStats } from '@/components/staking/DashboardStats';
import { ValidatorDiscovery } from '@/components/staking/ValidatorDiscovery';
import { StakingActionForm } from '@/components/staking/StakingActionForm';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { GovernancePortal } from '@/components/governance/GovernancePortal';
import { RefreshCw, Trophy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const REWARD_PRECISION = 1_000_000;
const LICENSE_PRICE_USDC = 500;

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'staking' | 'governance'>('staking');
  const [isLoading, setIsLoading] = useState(true);

  const [globalState, setGlobalState] = useState({
    totalStaked: 45200,
    rewardCap: 1250,
    validatorCount: 3,
    licensePrice: LICENSE_PRICE_USDC,
    governanceThreshold: 5100,
    proposalCount: 2,
    exnBalance: 12500,
    usdcBalance: 2500,
    isPaused: false,
  });

  const [validators, setValidators] = useState([
    { id: 'v1', owner: 'ExnUs...d2f1', name: 'CyberCore-01', description: 'Primary edge node', logo_uri: '66', is_active: true, seed_deposited: true, total_staked: 15200, commission_rate: 500, accrued_node_rewards: 452, global_reward_index: 1200000 },
    { id: 'v2', owner: 'ExnUs...0002', name: 'NebulaNode', description: 'Deep space validator', logo_uri: '77', is_active: true, seed_deposited: true, total_staked: 12500, commission_rate: 800, accrued_node_rewards: 210, global_reward_index: 1200000 },
    { id: 'v3', owner: 'ExnUs...0003', name: 'AlphaPulse', description: 'High-frequency pulse', logo_uri: '88', is_active: true, seed_deposited: true, total_staked: 17500, commission_rate: 300, accrued_node_rewards: 125, global_reward_index: 1150000 },
  ]);

  const [userStakes, setUserStakes] = useState([
    { id: 's1', validator_id: 'v1', amount: 5000, lock_multiplier: 10000, unlock_timestamp: Date.now() - 86400000, reward_checkpoint: 1000000, claimed: false, unstaked: false },
    { id: 's2', validator_id: 'v2', amount: 2500, lock_multiplier: 5000, unlock_timestamp: Date.now() + 86400000 * 30, reward_checkpoint: 1100000, claimed: false, unstaked: false },
  ]);

  const [userLicenses, setUserLicenses] = useState<any[]>([]);

  const [proposals, setProposals] = useState([
    { id: 0, proposer: 'ExnUs...99d', type: 0, title: 'Upgrade Epoch Length', description: 'Increase epoch from 24h to 48h for stability.', amount: 0, recipient: '', yes_votes: 15000, no_votes: 2000, deadline: Date.now() + 86400000 * 2, executed: false },
    { id: 1, proposer: 'ExnUs...Admin', type: 1, title: 'Treasury Grant: AI Integration', description: 'Release 50,000 EXN for ecosystem development.', amount: 50000, recipient: 'ExnUs...abc', yes_votes: 45000, no_votes: 1200, deadline: Date.now() - 86400000, executed: false },
  ]);

  const [selectedValidator, setSelectedValidator] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const pendingRewardsTotal = useMemo(() => {
    return userStakes
      .filter(s => !s.unstaked && !s.claimed)
      .reduce((acc, stake) => {
        const validator = validators.find(v => v.id === stake.validator_id);
        if (!validator) return acc;
        const rewardDelta = validator.global_reward_index - stake.reward_checkpoint;
        const reward = (rewardDelta * stake.amount) / REWARD_PRECISION;
        return acc + reward;
      }, 0);
  }, [userStakes, validators]);

  const handlePurchaseLicense = () => {
    if (globalState.usdcBalance < LICENSE_PRICE_USDC) {
      return toast({ title: "Insufficient USDC", variant: "destructive" });
    }
    const newLicense = { id: `lic-${Date.now()}`, is_claimed: false };
    setUserLicenses(prev => [...prev, newLicense]);
    setGlobalState(prev => ({ ...prev, usdcBalance: prev.usdcBalance - LICENSE_PRICE_USDC }));
    toast({ title: "License Purchased", description: "You can now register a validator node." });
  };

  const handleRegisterNode = (name: string, description: string) => {
    const availableLicense = userLicenses.find(l => !l.is_claimed);
    if (!availableLicense) {
      return toast({ title: "License Required", description: "Purchase a license first.", variant: "destructive" });
    }

    const newNode = {
      id: `v${Date.now()}`,
      owner: 'ExnUs...d2f1',
      name,
      description,
      logo_uri: Math.floor(Math.random() * 100).toString(),
      is_active: true,
      seed_deposited: true,
      total_staked: 0,
      commission_rate: 1000,
      accrued_node_rewards: 0,
      global_reward_index: 0
    };

    setValidators(prev => [...prev, newNode]);
    setUserLicenses(prev => prev.map(l => l.id === availableLicense.id ? { ...l, is_claimed: true } : l));
    setGlobalState(prev => ({ ...prev, validatorCount: prev.validatorCount + 1 }));
    toast({ title: "Node Registered", description: "Your validator is now live in the registry." });
  };

  const handleStake = (stakeData: any) => {
    if (globalState.isPaused) return toast({ title: "Protocol Paused", variant: "destructive" });
    const newStake = { ...stakeData, id: `s${Date.now()}` };
    setUserStakes(prev => [...prev, newStake]);
    setValidators(prev => prev.map(v => v.id === stakeData.validator_id ? { ...v, total_staked: v.total_staked + stakeData.amount } : v));
    setGlobalState(prev => ({ ...prev, totalStaked: prev.totalStaked + stakeData.amount, exnBalance: prev.exnBalance - stakeData.amount }));
    toast({ title: "Tokens Staked", description: `Locked ${stakeData.amount} EXN with validator.` });
  };

  const handleUnstake = (stakeId: string) => {
    const stake = userStakes.find(s => s.id === stakeId);
    if (!stake || stake.unstaked) return;
    if (Date.now() < stake.unlock_timestamp) {
      toast({ title: "Lock Period Active", variant: "destructive" });
      return;
    }

    const validator = validators.find(v => v.id === stake.validator_id);
    const rewardDelta = validator ? validator.global_reward_index - stake.reward_checkpoint : 0;
    const reward = (rewardDelta * stake.amount) / REWARD_PRECISION;

    setUserStakes(prev => prev.map(s => s.id === stakeId ? { ...s, unstaked: true, claimed: true } : s));
    setValidators(prev => prev.map(v => v.id === stake.validator_id ? { ...v, total_staked: v.total_staked - stake.amount } : v));
    setGlobalState(prev => ({ 
      ...prev, 
      totalStaked: prev.totalStaked - stake.amount, 
      exnBalance: prev.exnBalance + stake.amount + reward 
    }));
    toast({ title: "Tokens Unstaked", description: "Principal and rewards returned to wallet." });
  };

  const handleMigrate = (stakeId: string, targetId: string) => {
    const stake = userStakes.find(s => s.id === stakeId);
    const source = validators.find(v => v.id === stake?.validator_id);
    const target = validators.find(v => v.id === targetId);

    if (!stake || !source || !target || source.is_active || !target.is_active) return;

    const rewardDelta = source.global_reward_index - stake.reward_checkpoint;
    const reward = (rewardDelta * stake.amount) / REWARD_PRECISION;

    setUserStakes(prev => prev.map(s => s.id === stakeId ? { ...s, validator_id: targetId, reward_checkpoint: target.global_reward_index } : s));
    setValidators(prev => prev.map(v => {
      if (v.id === source.id) return { ...v, total_staked: v.total_staked - stake.amount };
      if (v.id === target.id) return { ...v, total_staked: v.total_staked + stake.amount };
      return v;
    }));
    setGlobalState(prev => ({ ...prev, exnBalance: prev.exnBalance + reward }));
    toast({ title: "Stake Migrated" });
  };

  const handleSettleEpoch = () => {
    setValidators(prev => prev.map(v => {
      if (!v.is_active || v.total_staked === 0) return v;
      const commission = (globalState.rewardCap * v.commission_rate) / 10000;
      const delegatorRewards = globalState.rewardCap - commission;
      const indexIncrease = (delegatorRewards * REWARD_PRECISION) / v.total_staked;
      return {
        ...v,
        accrued_node_rewards: v.accrued_node_rewards + commission,
        global_reward_index: v.global_reward_index + indexIncrease
      };
    }));
    toast({ title: "Rewards Distributed" });
  };

  const handleVote = (pId: number, support: boolean) => {
    setProposals(prev => prev.map(p => p.id === pId ? { 
      ...p, 
      yes_votes: support ? p.yes_votes + 1000 : p.yes_votes, 
      no_votes: !support ? p.no_votes + 1000 : p.no_votes 
    } : p));
  };

  const handleExecute = (pId: number) => {
    setProposals(prev => prev.map(p => p.id === pId ? { ...p, executed: true } : p));
    toast({ title: "Proposal Executed" });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] space-y-4">
        <div className="w-16 h-16 border-4 border-[#00f5ff] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,245,255,0.3)]" />
        <p className="exn-gradient-text font-bold tracking-[0.2em] animate-pulse uppercase">Synchronizing Network</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <Navbar 
        isAdmin={isAdmin} 
        toggleAdmin={() => setIsAdmin(!isAdmin)} 
        exnBalance={globalState.exnBalance} 
        usdcBalance={globalState.usdcBalance}
      />
      
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
                   <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Trustless Network Active</span>
                </div>
                <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase">Decentralized Yield</h1>
                <p className="text-white/40 max-w-md">Solana-based staking with zero administrative overrides. Your keys, your validators.</p>
              </div>
              
              <div className="flex gap-4">
                 <button 
                   onClick={() => toast({ title: "Rewards Claimed" })}
                   className="exn-button flex items-center gap-2 group"
                 >
                   <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                   Claim {pendingRewardsTotal.toFixed(1)} EXN
                 </button>
              </div>
            </div>

            <DashboardStats 
              totalStaked={globalState.totalStaked} 
              pendingRewards={pendingRewardsTotal}
              lockedAmount={userStakes.filter(s => Date.now() < s.unlock_timestamp && !s.unstaked).reduce((a, b) => a + b.amount, 0)}
              licenseCount={userLicenses.filter(l => !l.is_claimed).length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-12">
                <ValidatorDiscovery 
                  validators={validators} 
                  onSelect={setSelectedValidator}
                  userStakes={userStakes}
                  onMigrate={handleMigrate}
                />
              </div>

              <div className="space-y-6">
                <StakingActionForm 
                  selectedNode={selectedValidator} 
                  exnBalance={globalState.exnBalance}
                  usdcBalance={globalState.usdcBalance}
                  onStake={handleStake}
                  userStakes={userStakes}
                  onUnstake={handleUnstake}
                  onPurchaseLicense={handlePurchaseLicense}
                  onRegisterNode={handleRegisterNode}
                  availableLicenses={userLicenses.filter(l => !l.is_claimed).length}
                />
              </div>
            </div>
          </>
        ) : (
          <GovernancePortal 
            proposals={proposals} 
            totalStaked={globalState.totalStaked}
            onVote={handleVote}
            onExecute={handleExecute}
          />
        )}
      </div>
    </main>
  );
}
