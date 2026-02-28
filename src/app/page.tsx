
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { DashboardStats } from '@/components/staking/DashboardStats';
import { ValidatorDiscovery } from '@/components/staking/ValidatorDiscovery';
import { StakingActionForm } from '@/components/staking/StakingActionForm';
import { GovernancePortal } from '@/components/governance/GovernancePortal';
import { CrankTerminal } from '@/components/admin/CrankTerminal';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';

const REWARD_PRECISION = 1_000_000;
const PROPOSAL_FEE = 100;
const EPOCH_REWARD_RATE = 0.0001; // 0.01% per crank

export default function Home() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  
  const { state, setState, isLoaded, setFeedback } = useProtocolState();
  const [activeTab, setActiveTab] = useState<'staking' | 'governance' | 'crank'>('staking');
  const [selectedValidator, setSelectedValidator] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userStakeWeight = useMemo(() => {
    if (!walletAddress || !state?.userStakes) return 0;
    return state.userStakes
      .filter(s => s.owner === walletAddress && !s.unstaked)
      .reduce((acc, s) => acc + (s.amount || 0), 0);
  }, [state?.userStakes, walletAddress]);

  const totalStakedReal = useMemo(() => {
    if (!state?.validators) return 0;
    return state.validators.reduce((acc, v) => acc + (v.total_staked || 0), 0);
  }, [state?.validators]);

  const pendingRewardsTotal = useMemo(() => {
    if (!state?.userStakes || !state?.validators || !walletAddress) return 0;
    return state.userStakes
      .filter(s => s.owner === walletAddress && !s.unstaked && !s.claimed)
      .reduce((acc, stake) => {
        const validator = state.validators.find(v => v.id === stake.validator_id);
        if (!validator) return acc;
        const rewardDelta = Math.max(0, (validator.global_reward_index || 0) - (stake.reward_checkpoint || 0));
        const reward = (rewardDelta * (stake.amount || 0)) / REWARD_PRECISION;
        return acc + reward;
      }, 0);
  }, [state?.userStakes, state?.validators, walletAddress]);

  const handleStake = (stakeData: any) => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    const numAmt = Number(stakeData.amount);
    setState(prev => ({
      ...prev,
      userStakes: [...prev.userStakes, { ...stakeData, id: `s${Date.now()}`, staked_at: Date.now(), owner: walletAddress }],
      exnBalance: Math.max(0, prev.exnBalance - numAmt),
      validators: prev.validators.map(v => v.id === stakeData.validator_id ? { ...v, total_staked: (v.total_staked || 0) + numAmt } : v)
    }));
    setFeedback('success', `Successfully locked ${numAmt.toLocaleString()} EXN in protocol.`);
  };

  const handleVote = (pId: number, support: boolean, comment: string) => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    const proposal = state.proposals.find(p => p.id === pId);
    if (!proposal) return;

    const voters = proposal.voters || [];
    if (voters.includes(walletAddress)) {
      return setFeedback('warning', 'Address has already participated in this vote.');
    }

    if (Date.now() > proposal.voting_ends_at) {
      return setFeedback('error', 'Proposal is currently in voting lock window.');
    }

    if (userStakeWeight <= 0) {
      return setFeedback('error', 'Active staking weight required to cast vote.');
    }

    const newComment = {
      id: `c${Date.now()}`,
      author: walletAddress,
      text: comment,
      timestamp: Date.now(),
      vote_stance: support ? 'YES' : 'NO' as any
    };

    setState(prev => ({
      ...prev,
      proposals: prev.proposals.map(p => p.id === pId ? { 
        ...p, 
        yes_votes: support ? (p.yes_votes || 0) + userStakeWeight : p.yes_votes, 
        no_votes: !support ? (p.no_votes || 0) + userStakeWeight : p.no_votes,
        voters: [...voters, walletAddress],
        comments: [...(p.comments || []), newComment]
      } : p)
    }));
    setFeedback('success', `Vote cast successfully with ${userStakeWeight.toLocaleString()} weight.`);
  };

  const handleCreateProposal = (data: any) => {
    if (!connected) return;
    if (state.exnBalance < PROPOSAL_FEE) {
      return setFeedback('error', `Insufficient EXN. Fee: ${PROPOSAL_FEE} EXN`);
    }

    const now = Date.now();
    const newProp = {
      ...data,
      id: state.proposals.length + 1,
      proposer: walletAddress,
      created_at: now,
      deadline: now + (86400000 * 7),
      voting_ends_at: now + (86400000 * 7) - (3600000 * 4),
      yes_votes: 0,
      no_votes: 0,
      executed: false,
      voters: [],
      comments: []
    };

    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance - PROPOSAL_FEE,
      proposals: [newProp, ...prev.proposals]
    }));
    setFeedback('success', 'Proposal broadcast to network. Governance fee applied.');
  };

  const handleExecuteProposal = (pId: number) => {
    const proposal = state.proposals.find(p => p.id === pId);
    if (!proposal || proposal.executed) return;
    if (Date.now() < proposal.deadline) return setFeedback('warning', 'Consensus window has not concluded.');

    const passed = (proposal.yes_votes || 0) > (proposal.no_votes || 0);
    
    setState(prev => {
      let treasuryDelta = 0;
      let userExnDelta = 0;

      if (passed && proposal.type === 1) {
        treasuryDelta = -proposal.amount;
        if (proposal.recipient === walletAddress) {
          userExnDelta = proposal.amount;
        }
      }

      return {
        ...prev,
        treasuryBalance: prev.treasuryBalance + treasuryDelta,
        exnBalance: prev.exnBalance + userExnDelta,
        proposals: prev.proposals.map(p => p.id === pId ? { ...p, executed: true } : p)
      };
    });

    setFeedback('success', passed ? 'Proposal passed. Protocol action executed.' : 'Proposal failed. Action archived.');
  };

  const handleCrank = () => {
    let totalRewardsDistributed = 0;

    setState(prev => {
      const newValidators = prev.validators.map(v => {
        if (!v.is_active || v.total_staked <= 0) return v;
        const crankReward = v.total_staked * EPOCH_REWARD_RATE; 
        totalRewardsDistributed += crankReward;
        const commission = (crankReward * (v.commission_rate / 10000));
        const stakerPool = crankReward - commission;
        return {
          ...v,
          accrued_node_rewards: (v.accrued_node_rewards || 0) + commission,
          global_reward_index: (v.global_reward_index || 0) + Math.floor(stakerPool * REWARD_PRECISION / v.total_staked)
        };
      });

      return {
        ...prev,
        validators: newValidators
      };
    });

    setFeedback('success', `Network crank successful. Distributed ${totalRewardsDistributed.toFixed(2)} EXN rewards.`);
  };

  const handleClaim = () => {
    if (pendingRewardsTotal <= 0) return;
    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance + pendingRewardsTotal,
      userStakes: prev.userStakes.map(s => {
        if (s.owner === walletAddress && !s.claimed && !s.unstaked) {
          return { ...s, claimed: true, reward_checkpoint: state.validators.find(v => v.id === s.validator_id)?.global_reward_index || 0 };
        }
        return s;
      })
    }));
    setFeedback('success', `Claimed ${pendingRewardsTotal.toFixed(2)} EXN staking rewards.`);
  };

  const handleUnstake = (stakeId: string) => {
    const stake = state.userStakes.find(s => s.id === stakeId);
    if (!stake || Date.now() < stake.unlock_timestamp) return setFeedback('error', 'Principal is currently locked.');

    const validator = state.validators.find(v => v.id === stake.validator_id);
    const rewardDelta = validator ? (validator.global_reward_index - stake.reward_checkpoint) : 0;
    const reward = (rewardDelta * stake.amount) / REWARD_PRECISION;
    const totalReturn = stake.amount + reward;

    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance + totalReturn,
      userStakes: prev.userStakes.map(s => s.id === stakeId ? { ...s, unstaked: true } : s),
      validators: prev.validators.map(v => v.id === stake.validator_id ? { ...v, total_staked: Math.max(0, v.total_staked - stake.amount) } : v)
    }));
    setFeedback('success', `Unstaked ${stake.amount.toLocaleString()} EXN plus ${reward.toFixed(2)} rewards.`);
  };

  const handleMigrate = (stakeId: string, newValidatorId: string) => {
    const stake = state.userStakes.find(s => s.id === stakeId);
    if (!stake || stake.unstaked) return;

    setState(prev => ({
      ...prev,
      userStakes: prev.userStakes.map(s => s.id === stakeId ? { ...s, validator_id: newValidatorId, reward_checkpoint: prev.validators.find(v => v.id === newValidatorId)?.global_reward_index || 0 } : s),
      validators: prev.validators.map(v => {
        if (v.id === stake.validator_id) return { ...v, total_staked: Math.max(0, v.total_staked - stake.amount) };
        if (v.id === newValidatorId) return { ...v, total_staked: v.total_staked + stake.amount };
        return v;
      })
    }));
    setFeedback('success', 'Stake weight migrated to high-performance node.');
  };

  if (!isMounted || !isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Syncing Network State</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-10 space-y-12">
      <div className="flex gap-8 border-b border-border">
        <button onClick={() => setActiveTab('staking')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'staking' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Data Overview</button>
        <button onClick={() => setActiveTab('governance')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'governance' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>DAO Portal</button>
        <button onClick={() => setActiveTab('crank')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'crank' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Network Crank</button>
      </div>

      {activeTab === 'staking' && (
        <>
          <DashboardStats totalStaked={totalStakedReal} treasuryBalance={state.treasuryBalance} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-12">
              <ValidatorDiscovery 
                validators={state.validators} 
                onSelect={setSelectedValidator} 
                userStakes={state.userStakes.filter(s => s.owner === walletAddress)} 
                selectedId={selectedValidator?.id}
                onMigrate={handleMigrate}
                setFeedback={setFeedback}
              />
            </div>
            <div className="space-y-6">
              <StakingActionForm 
                selectedNode={selectedValidator} 
                exnBalance={state.exnBalance} 
                onStake={handleStake} 
                userStakes={state.userStakes.filter(s => s.owner === walletAddress)} 
                validators={state.validators} 
                totalPendingRewards={pendingRewardsTotal} 
                connected={connected}
                onClaim={handleClaim}
                onUnstake={handleUnstake}
                setFeedback={setFeedback}
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'governance' && (
        <GovernancePortal 
          proposals={state.proposals} 
          userStakeWeight={userStakeWeight}
          walletAddress={walletAddress}
          onVote={handleVote}
          onCreate={handleCreateProposal}
          onExecute={handleExecuteProposal}
          setFeedback={setFeedback}
        />
      )}

      {activeTab === 'crank' && (
        <CrankTerminal 
          validators={state.validators} 
          proposals={state.proposals} 
          onCrank={handleCrank}
          connected={connected}
        />
      )}
    </div>
  );
}
