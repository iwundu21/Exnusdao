
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { DashboardStats } from '@/components/staking/DashboardStats';
import { ValidatorDiscovery } from '@/components/staking/ValidatorDiscovery';
import { StakingActionForm } from '@/components/staking/StakingActionForm';
import { GovernancePortal } from '@/components/governance/GovernancePortal';
import { CrankTerminal } from '@/components/admin/CrankTerminal';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import { Activity, ShieldAlert } from 'lucide-react';

const REWARD_PRECISION = 1_000_000;
const PROPOSAL_FEE = 10;
const VOTE_FEE = 3;
const MIN_STAKE_FOR_PROPOSAL = 1_000_000;
const MIN_STAKE_FOR_VOTE = 10_000;
const BLOCK_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export default function Home() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  
  const { state, setState, isLoaded, setFeedback } = useProtocolState();
  const [activeTab, setActiveTab] = useState<'staking' | 'governance' | 'crank'>('staking');
  const [selectedValidator, setSelectedValidator] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
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
      .filter(s => s.owner === walletAddress && !s.unstaked && now >= s.unlock_timestamp)
      .reduce((acc, stake) => {
        const validator = state.validators.find(v => v.id === stake.validator_id);
        if (!validator) return acc;
        const rewardDelta = Math.max(0, (validator.global_reward_index || 0) - (stake.reward_checkpoint || 0));
        const reward = (rewardDelta * (stake.amount || 0)) / REWARD_PRECISION;
        return acc + reward;
      }, 0);
  }, [state?.userStakes, state?.validators, walletAddress, now]);

  const handleStake = (stakeData: any) => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    const numAmt = Number(stakeData.amount);
    setState(prev => ({
      ...prev,
      userStakes: [...prev.userStakes, { ...stakeData, id: `s${Date.now()}`, staked_at: Date.now(), owner: walletAddress }],
      exnBalance: Math.max(0, prev.exnBalance - numAmt),
      stakedVaultBalance: (prev.stakedVaultBalance || 0) + numAmt,
      validators: prev.validators.map(v => v.id === stakeData.validator_id ? { ...v, total_staked: (v.total_staked || 0) + numAmt } : v)
    }));
    setFeedback('success', `Successfully locked ${numAmt.toLocaleString()} EXN in protocol.`);
  };

  const handleVote = (pId: number, support: boolean, comment: string) => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    if (userStakeWeight < MIN_STAKE_FOR_VOTE) return setFeedback('error', `Minimum Staking Requirement: ${MIN_STAKE_FOR_VOTE.toLocaleString()} EXN required.`);
    if (state.exnBalance < VOTE_FEE) return setFeedback('error', `Insufficient EXN for voting fee.`);

    const proposal = state.proposals.find(p => p.id === pId);
    if (!proposal || proposal.voters?.includes(walletAddress)) return;

    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance - VOTE_FEE,
      treasuryBalance: prev.treasuryBalance + VOTE_FEE,
      proposals: prev.proposals.map(p => p.id === pId ? { 
        ...p, 
        yes_votes: support ? (p.yes_votes || 0) + userStakeWeight : p.yes_votes, 
        no_votes: !support ? (p.no_votes || 0) + userStakeWeight : p.no_votes,
        voters: [...(p.voters || []), walletAddress],
        comments: [...(p.comments || []), { id: `c${Date.now()}`, author: walletAddress, text: comment, timestamp: Date.now(), vote_stance: support ? 'YES' : 'NO' }]
      } : p)
    }));
    setFeedback('success', 'Vote cast successfully.');
  };

  const handleCreateProposal = (data: any) => {
    if (!connected || userStakeWeight < MIN_STAKE_FOR_PROPOSAL || state.exnBalance < PROPOSAL_FEE) return;

    const nowTime = Date.now();
    const newProp = {
      ...data,
      id: state.proposals.length + 1,
      proposer: walletAddress,
      created_at: nowTime,
      deadline: nowTime + (7 * 24 * 60 * 60 * 1000),
      voting_ends_at: nowTime + (7 * 24 * 60 * 60 * 1000) - (3600000 * 4),
      yes_votes: 0,
      no_votes: 0,
      executed: false,
      voters: [],
      comments: []
    };

    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance - PROPOSAL_FEE,
      treasuryBalance: prev.treasuryBalance + PROPOSAL_FEE,
      proposals: [newProp, ...prev.proposals]
    }));
    setFeedback('success', 'Proposal broadcast to network.');
  };

  const handleCrank = () => {
    if (!state.networkStartDate) {
      return setFeedback('error', 'Network start date not anchored.');
    }

    const currentBlock = Math.floor((Date.now() - state.networkStartDate) / BLOCK_DURATION_MS) + 1000;
    
    if (state.lastCrankedBlock >= currentBlock) {
      return setFeedback('warning', `Reward Block ${currentBlock} has already been finalized.`);
    }

    const totalPool = state.rewardCap || 0;
    const activeValidators = state.validators.filter(v => v.is_active && v.total_staked > 0);
    const totalActiveWeight = activeValidators.reduce((acc, v) => acc + v.total_staked, 0);

    if (totalActiveWeight <= 0) {
      return setFeedback('warning', 'No active validators with stake found for reward sharding.');
    }

    setState(prev => {
      const newValidators = prev.validators.map(v => {
        if (!v.is_active || v.total_staked <= 0) return v;
        const poolShare = (v.total_staked / totalActiveWeight) * totalPool;
        const commission = (poolShare * (v.commission_rate / 10000));
        const stakerPool = poolShare - commission;
        return {
          ...v,
          accrued_node_rewards: (v.accrued_node_rewards || 0) + commission,
          global_reward_index: (v.global_reward_index || 0) + Math.floor(stakerPool * REWARD_PRECISION / v.total_staked)
        };
      });

      return {
        ...prev,
        validators: newValidators,
        lastCrankedBlock: currentBlock
      };
    });

    setFeedback('success', `Reward Block ${currentBlock} finalized. Yield sharded across network weight.`);
  };

  const handleClaim = () => {
    if (pendingRewardsTotal <= 0) return;
    setState(prev => {
      let total = 0;
      const newUserStakes = prev.userStakes.map(s => {
        if (s.owner === walletAddress && !s.unstaked && now >= s.unlock_timestamp) {
          const v = prev.validators.find(val => val.id === s.validator_id);
          if (v) {
            const reward = ((v.global_reward_index - s.reward_checkpoint) * s.amount) / REWARD_PRECISION;
            total += reward;
            return { ...s, reward_checkpoint: v.global_reward_index };
          }
        }
        return s;
      });
      return { ...prev, exnBalance: prev.exnBalance + total, userStakes: newUserStakes };
    });
    setFeedback('success', `Claimed ${pendingRewardsTotal.toFixed(2)} EXN rewards.`);
  };

  const handleUnstake = (stakeId: string) => {
    const stake = state.userStakes.find(s => s.id === stakeId);
    if (!stake || now < stake.unlock_timestamp) return;
    setState(prev => ({
      ...prev,
      exnBalance: prev.exnBalance + stake.amount,
      stakedVaultBalance: Math.max(0, (prev.stakedVaultBalance || 0) - stake.amount),
      userStakes: prev.userStakes.map(s => s.id === stakeId ? { ...s, unstaked: true } : s),
      validators: prev.validators.map(v => v.id === stake.validator_id ? { ...v, total_staked: Math.max(0, v.total_staked - stake.amount) } : v)
    }));
    setFeedback('success', 'Principal unstaked successfully.');
  };

  if (!isMounted || !isLoaded) return null;

  return (
    <div className="max-w-7xl mx-auto px-10 py-10 space-y-12">
      <div className="flex gap-8 border-b border-border">
        <button onClick={() => setActiveTab('staking')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'staking' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('governance')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'governance' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>DAO Portal</button>
        <button onClick={() => setActiveTab('crank')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'crank' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Network Crank</button>
      </div>

      {activeTab === 'staking' && (
        <>
          <DashboardStats totalStaked={totalStakedReal} treasuryBalance={state.treasuryBalance} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <ValidatorDiscovery 
                validators={state.validators} 
                onSelect={setSelectedValidator} 
                userStakes={state.userStakes.filter(s => s.owner === walletAddress)} 
                selectedId={selectedValidator?.id}
                setFeedback={setFeedback}
              />
            </div>
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
        </>
      )}

      {activeTab === 'governance' && (
        <GovernancePortal 
          proposals={state.proposals} 
          userStakeWeight={userStakeWeight}
          walletAddress={walletAddress}
          onVote={handleVote}
          onCreate={handleCreateProposal}
          setFeedback={setFeedback}
        />
      )}

      {activeTab === 'crank' && (
        <CrankTerminal 
          validators={state.validators} 
          rewardCap={state.rewardCap}
          lastCrankedBlock={state.lastCrankedBlock}
          networkStartDate={state.networkStartDate}
          onCrank={handleCrank}
          connected={connected}
        />
      )}
    </div>
  );
}
