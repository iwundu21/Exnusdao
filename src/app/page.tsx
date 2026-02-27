
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardStats } from '@/components/staking/DashboardStats';
import { ValidatorDiscovery } from '@/components/staking/ValidatorDiscovery';
import { StakingActionForm } from '@/components/staking/StakingActionForm';
import { GovernancePortal } from '@/components/governance/GovernancePortal';
import { toast } from '@/hooks/use-toast';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';

const REWARD_PRECISION = 1_000_000;
const PROPOSAL_FEE = 100;

export default function Home() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  
  const { state, setState, isLoaded } = useProtocolState();
  const [activeTab, setActiveTab] = useState<'staking' | 'governance'>('staking');
  const [selectedValidator, setSelectedValidator] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userStakeWeight = useMemo(() => {
    if (!walletAddress || !state?.userStakes) return 0;
    return state.userStakes
      .filter(s => s.owner === walletAddress && !s.unstaked)
      .reduce((acc, s) => acc + s.amount, 0);
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
        const reward = (rewardDelta * stake.amount) / REWARD_PRECISION;
        return acc + reward;
      }, 0);
  }, [state?.userStakes, state?.validators, walletAddress]);

  const handleStake = (stakeData: any) => {
    if (!connected) return toast({ title: "Wallet Disconnected", variant: "destructive" });
    const now = Date.now();
    const newStake = { ...stakeData, id: `s${now}`, staked_at: now, owner: walletAddress };
    setState(prev => ({
      ...prev,
      userStakes: [...prev.userStakes, newStake],
      exnBalance: Math.max(0, prev.exnBalance - stakeData.amount),
      validators: prev.validators.map(v => v.id === stakeData.validator_id ? { ...v, total_staked: (v.total_staked || 0) + stakeData.amount } : v)
    }));
    toast({ title: "Tokens Staked", description: `Locked ${stakeData.amount} EXN successfully.` });
  };

  const handleVote = (pId: number, support: boolean, comment: string) => {
    if (!connected) return toast({ title: "Wallet Disconnected", variant: "destructive" });
    const proposal = state.proposals.find(p => p.id === pId);
    if (!proposal) return;

    const voters = proposal.voters || [];
    if (voters.includes(walletAddress)) {
      return toast({ title: "Already Voted", description: "Protocol allows one vote per address.", variant: "destructive" });
    }

    if (Date.now() > proposal.voting_ends_at) {
      return toast({ title: "Voting Locked", description: "The 4-hour pre-deadline lock is active.", variant: "destructive" });
    }

    if (userStakeWeight <= 0) {
      return toast({ title: "No Staked Weight", description: "You must have active stakes to vote.", variant: "destructive" });
    }

    const newComment = {
      id: `c${Date.now()}`,
      author: walletAddress,
      text: comment,
      timestamp: Date.now(),
      vote_stance: support ? 'YES' : 'NO'
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
    toast({ title: "Vote Cast", description: `Voted with ${userStakeWeight.toLocaleString()} weight and rationale.` });
  };

  const handleCreateProposal = (data: any) => {
    if (!connected) return;
    if (state.exnBalance < PROPOSAL_FEE) {
      return toast({ title: "Insufficient Balance", description: `Fee: ${PROPOSAL_FEE} EXN`, variant: "destructive" });
    }

    const now = Date.now();
    const newProp = {
      ...data,
      id: state.proposals.length,
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
    toast({ title: "Proposal Broadcast", description: "Applied 100 EXN governance fee." });
  };

  if (!isMounted || !isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] space-y-4">
        <div className="w-16 h-16 border-4 border-[#00f5ff] border-t-transparent rounded-full animate-spin" />
        <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Syncing Network State</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <Navbar exnBalance={state.exnBalance} usdcBalance={state.usdcBalance} />
      <div className="max-w-7xl mx-auto px-10 py-10 space-y-12">
        <div className="flex gap-8 border-b border-white/10">
          <button onClick={() => setActiveTab('staking')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'staking' ? 'text-[#00f5ff] border-b-2 border-[#00f5ff]' : 'text-white/40 hover:text-white'}`}>Data Overview</button>
          <button onClick={() => setActiveTab('governance')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'governance' ? 'text-[#00f5ff] border-b-2 border-[#00f5ff]' : 'text-white/40 hover:text-white'}`}>DAO Portal</button>
        </div>

        {activeTab === 'staking' ? (
          <>
            <DashboardStats totalStaked={totalStakedReal} treasuryBalance={state.treasuryBalance} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-12">
                <ValidatorDiscovery validators={state.validators} onSelect={setSelectedValidator} userStakes={state.userStakes.filter(s => s.owner === walletAddress)} selectedId={selectedValidator?.id} />
              </div>
              <div className="space-y-6">
                <StakingActionForm selectedNode={selectedValidator} exnBalance={state.exnBalance} onStake={handleStake} userStakes={state.userStakes.filter(s => s.owner === walletAddress)} validators={state.validators} onUnstake={() => {}} onClaim={() => {}} totalPendingRewards={pendingRewardsTotal} connected={connected} />
              </div>
            </div>
          </>
        ) : (
          <GovernancePortal 
            proposals={state.proposals} 
            userStakeWeight={userStakeWeight}
            walletAddress={walletAddress}
            onVote={handleVote}
            onCreate={handleCreateProposal}
          />
        )}
      </div>
    </main>
  );
}
