
"use client";

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardStats } from '@/components/staking/DashboardStats';
import { ValidatorDiscovery } from '@/components/staking/ValidatorDiscovery';
import { StakingActionForm } from '@/components/staking/StakingActionForm';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { GovernancePortal } from '@/components/governance/GovernancePortal';
import { toast } from '@/hooks/use-toast';
import { useProtocolState } from '@/hooks/use-protocol-state';

const REWARD_PRECISION = 1_000_000;

export default function Home() {
  const { state, setState, isLoaded } = useProtocolState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'staking' | 'governance'>('staking');

  const pendingRewardsTotal = useMemo(() => {
    return state.userStakes
      .filter(s => !s.unstaked && !s.claimed)
      .reduce((acc, stake) => {
        const validator = state.validators.find(v => v.id === stake.validator_id);
        if (!validator) return acc;
        const rewardDelta = validator.global_reward_index - stake.reward_checkpoint;
        const reward = (rewardDelta * stake.amount) / REWARD_PRECISION;
        return acc + reward;
      }, 0);
  }, [state.userStakes, state.validators]);

  const [selectedValidator, setSelectedValidator] = useState<any>(null);

  const handleStake = (stakeData: any) => {
    const newStake = { ...stakeData, id: `s${Date.now()}` };
    setState(prev => ({
      ...prev,
      userStakes: [...prev.userStakes, newStake],
      exnBalance: prev.exnBalance - stakeData.amount,
      totalStaked: prev.totalStaked + stakeData.amount,
      validators: prev.validators.map(v => v.id === stakeData.validator_id ? { ...v, total_staked: v.total_staked + stakeData.amount } : v)
    }));
    toast({ title: "Tokens Staked", description: `Locked ${stakeData.amount} EXN with validator.` });
  };

  const handleUnstake = (stakeId: string) => {
    const stake = state.userStakes.find(s => s.id === stakeId);
    if (!stake || stake.unstaked) return;
    if (Date.now() < stake.unlock_timestamp) {
      toast({ title: "Lock Period Active", variant: "destructive" });
      return;
    }

    const validator = state.validators.find(v => v.id === stake.validator_id);
    const rewardDelta = validator ? validator.global_reward_index - stake.reward_checkpoint : 0;
    const reward = (rewardDelta * stake.amount) / REWARD_PRECISION;

    setState(prev => ({
      ...prev,
      userStakes: prev.userStakes.map(s => s.id === stakeId ? { ...s, unstaked: true, claimed: true } : s),
      exnBalance: prev.exnBalance + stake.amount + reward,
      totalStaked: prev.totalStaked - stake.amount,
      validators: prev.validators.map(v => v.id === stake.validator_id ? { ...v, total_staked: v.total_staked - stake.amount } : v)
    }));
    toast({ title: "Tokens Unstaked", description: "Principal and rewards returned to wallet." });
  };

  const handleMigrate = (stakeId: string, targetId: string) => {
    const stake = state.userStakes.find(s => s.id === stakeId);
    const source = state.validators.find(v => v.id === stake?.validator_id);
    const target = state.validators.find(v => v.id === targetId);

    if (!stake || !source || !target || source.is_active || !target.is_active) return;

    const rewardDelta = source.global_reward_index - stake.reward_checkpoint;
    const reward = (rewardDelta * stake.amount) / REWARD_PRECISION;

    setState(prev => ({
      ...prev,
      userStakes: prev.userStakes.map(s => s.id === stakeId ? { ...s, validator_id: targetId, reward_checkpoint: target.global_reward_index } : s),
      exnBalance: prev.exnBalance + reward,
      validators: prev.validators.map(v => {
        if (v.id === source.id) return { ...v, total_staked: v.total_staked - stake.amount };
        if (v.id === target.id) return { ...v, total_staked: v.total_staked + stake.amount };
        return v;
      })
    }));
    toast({ title: "Stake Migrated" });
  };

  const handleSettleEpoch = () => {
    setState(prev => ({
      ...prev,
      validators: prev.validators.map(v => {
        if (!v.is_active || v.total_staked === 0) return v;
        const commission = (prev.rewardCap * v.commission_rate) / 10000;
        const delegatorRewards = prev.rewardCap - commission;
        const indexIncrease = (delegatorRewards * REWARD_PRECISION) / v.total_staked;
        return {
          ...v,
          accrued_node_rewards: v.accrued_node_rewards + commission,
          global_reward_index: v.global_reward_index + indexIncrease
        };
      })
    }));
    toast({ title: "Rewards Distributed" });
  };

  const handleVote = (pId: number, support: boolean) => {
    setState(prev => ({
      ...prev,
      proposals: prev.proposals.map(p => p.id === pId ? { 
        ...p, 
        yes_votes: support ? p.yes_votes + 1000 : p.yes_votes, 
        no_votes: !support ? p.no_votes + 1000 : p.no_votes 
      } : p)
    }));
  };

  const handleExecute = (pId: number) => {
    setState(prev => ({
      ...prev,
      proposals: prev.proposals.map(p => p.id === pId ? { ...p, executed: true } : p)
    }));
    toast({ title: "Proposal Executed" });
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] space-y-4">
        <div className="w-16 h-16 border-4 border-[#00f5ff] border-t-transparent rounded-full animate-spin" />
        <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Syncing Network State</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <Navbar 
        isAdmin={isAdmin} 
        toggleAdmin={() => setIsAdmin(!isAdmin)} 
        exnBalance={state.exnBalance} 
        usdcBalance={state.usdcBalance}
      />
      
      {isAdmin && (
        <AdminPanel 
          globalState={state} 
          setGlobalState={setState} 
          onSettle={handleSettleEpoch}
          validators={state.validators}
          setValidators={(v: any) => setState((prev: any) => ({ ...prev, validators: v }))}
        />
      )}

      <div className="max-w-7xl mx-auto px-10 py-10 space-y-12">
        <div className="flex gap-8 border-b border-white/10">
          <button 
            onClick={() => setActiveTab('staking')}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'staking' ? 'text-[#00f5ff] border-b-2 border-[#00f5ff]' : 'text-white/40 hover:text-white'}`}
          >
            Network Registry
          </button>
          <button 
            onClick={() => setActiveTab('governance')}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'governance' ? 'text-[#00f5ff] border-b-2 border-[#00f5ff]' : 'text-white/40 hover:text-white'}`}
          >
            DAO Portal
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
              </div>
            </div>

            <DashboardStats 
              totalStaked={state.totalStaked} 
              pendingRewards={pendingRewardsTotal}
              treasuryBalance={state.treasuryBalance}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-12">
                <ValidatorDiscovery 
                  validators={state.validators} 
                  onSelect={setSelectedValidator}
                  userStakes={state.userStakes}
                  onMigrate={handleMigrate}
                />
              </div>

              <div className="space-y-6">
                <StakingActionForm 
                  selectedNode={selectedValidator} 
                  exnBalance={state.exnBalance}
                  onStake={handleStake}
                  userStakes={state.userStakes}
                  onUnstake={handleUnstake}
                />
              </div>
            </div>
          </>
        ) : (
          <GovernancePortal 
            proposals={state.proposals} 
            totalStaked={state.totalStaked}
            onVote={handleVote}
            onExecute={handleExecute}
          />
        )}
      </div>
    </main>
  );
}
