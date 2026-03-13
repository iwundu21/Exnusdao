
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
const PROPOSAL_FEE = 10;
const VOTE_FEE = 3;
const MIN_STAKE_FOR_PROPOSAL = 1_000_000;
const MIN_STAKE_FOR_VOTE = 10_000;
const EPOCH_DURATION = 30 * 24 * 60 * 60 * 1000;

export default function Home() {
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  
  const { 
    state, 
    isLoaded, 
    setFeedback, 
    exnBalance, 
    updateUserBalance,
    addStake,
    unstake,
    claimRewards,
    castVote,
    createProposal,
    executeProposal,
    crankEpoch
  } = useProtocolState();

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
    if (!walletAddress || !state?.userStakes || !state?.validators) return 0;
    
    const stakesWeight = state.userStakes
      .filter(s => s.owner === walletAddress && !s.unstaked)
      .reduce((acc, s) => acc + (s.amount || 0), 0);
      
    const seedWeight = state.validators
      .filter(v => v.owner === walletAddress && v.seed_deposited)
      .length * (state.seedAmount || 15000000);
      
    return stakesWeight + seedWeight;
  }, [state?.userStakes, state?.validators, walletAddress, state.seedAmount]);

  const isNodeOwner = useMemo(() => {
    if (!walletAddress || !state?.validators) return false;
    return state.validators.some(v => v.owner === walletAddress);
  }, [state?.validators, walletAddress]);

  const totalStakedReal = useMemo(() => {
    if (!state?.validators) return 0;
    return state.validators.reduce((acc, v) => acc + (v.total_staked || 0), 0);
  }, [state?.validators]);

  const pendingRewardsTotal = useMemo(() => {
    if (!state?.userStakes || !state?.validators || !walletAddress) return 0;
    return state.userStakes
      .filter(s => s.owner === walletAddress && !s.unstaked)
      .reduce((acc, stake) => {
        const validator = state.validators.find(v => v.id === stake.validator_id);
        if (!validator) return acc;
        const rewardDelta = Math.max(0, (validator.global_reward_index || 0) - (stake.reward_checkpoint || 0));
        const multiplier = stake.lock_multiplier || 1000;
        const reward = (rewardDelta * (stake.amount || 0) * multiplier) / (REWARD_PRECISION * 1000);
        return acc + reward;
      }, 0);
  }, [state?.userStakes, state?.validators, walletAddress]);

  const handleStake = (stakeData: any) => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    const numAmt = stakeData.amount;
    updateUserBalance(walletAddress, -numAmt, 0);
    addStake({ ...stakeData, owner: walletAddress });
    setFeedback('success', `Successfully locked ${numAmt.toLocaleString()} EXN in protocol.`);
  };

  const handleVote = (pId: number, support: boolean, comment: string) => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    if (!isNodeOwner && userStakeWeight < MIN_STAKE_FOR_VOTE) return setFeedback('error', 'Min stake 10k EXN required.');
    if (exnBalance < VOTE_FEE) return setFeedback('error', 'Insufficient EXN fee.');

    const weight = userStakeWeight;
    updateUserBalance(walletAddress, -VOTE_FEE, 0);
    castVote(pId, support, weight, {
      id: `c${Date.now()}`,
      author: walletAddress,
      text: comment,
      timestamp: Date.now(),
      vote_stance: support ? 'YES' : 'NO'
    });
    setFeedback('success', 'Vote cast.');
  };

  const handleCreateProposal = (data: any) => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    if (userStakeWeight < MIN_STAKE_FOR_PROPOSAL) return setFeedback('error', 'Stake Weight Insufficient');
    if (exnBalance < PROPOSAL_FEE) return setFeedback('error', 'Insufficient Fee');

    const nowTime = Date.now();
    updateUserBalance(walletAddress, -PROPOSAL_FEE, 0);
    createProposal({
      ...data,
      id: state.proposals.length + 1,
      proposer: walletAddress,
      created_at: nowTime,
      deadline: nowTime + (7 * 24 * 60 * 60 * 1000), 
      voting_ends_at: nowTime + (6 * 24 * 60 * 60 * 1000), 
      yes_votes: 0,
      no_votes: 0,
      executed: false,
      voters: [],
      comments: []
    });
    setFeedback('success', 'Proposal broadcast.');
  };

  const handleExecute = (pId: number) => {
    const proposal = state.proposals.find(p => p.id === pId);
    if (!proposal || proposal.executed) return;
    const passed = proposal.yes_votes > proposal.no_votes;
    executeProposal(pId, passed, proposal.type, proposal.amount || 0, proposal.recipient || '', walletAddress);
    setFeedback('success', passed ? 'Enacted.' : 'Rejected.');
  };

  const handleCrank = (targetEpoch: number) => {
    const elapsed = Date.now() - state.networkStartDate;
    const currentEpoch = Math.floor(elapsed / EPOCH_DURATION) + 1;
    if (targetEpoch >= currentEpoch) return setFeedback('error', 'Epoch active.');

    const activeValidators = state.validators.filter(v => v.is_active && v.total_staked > 0);
    const totalWeight = activeValidators.reduce((acc, v) => acc + v.total_staked, 0);
    if (totalWeight <= 0) return setFeedback('error', 'No active weight.');

    crankEpoch(targetEpoch, state.rewardCap, activeValidators, totalWeight);
    setFeedback('success', `Epoch ${targetEpoch} settled.`);
  };

  const handleClaim = () => {
    if (pendingRewardsTotal <= 0) return;
    state.userStakes
      .filter(s => s.owner === walletAddress && !s.unstaked)
      .forEach(s => {
        const v = state.validators.find(val => val.id === s.validator_id);
        if (v) {
          const multiplier = s.lock_multiplier || 1000;
          const reward = ((v.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000);
          if (reward > 0) claimRewards(s.id, reward, v.global_reward_index, walletAddress);
        }
      });
    setFeedback('success', 'Rewards harvested.');
  };

  const handleClaimSingle = (stakeId: string) => {
    const s = state.userStakes.find(x => x.id === stakeId);
    const v = state.validators.find(val => val.id === s?.validator_id);
    if (!s || !v) return;
    const multiplier = s.lock_multiplier || 1000;
    const reward = ((v.global_reward_index - s.reward_checkpoint) * s.amount * multiplier) / (REWARD_PRECISION * 1000);
    if (reward > 0) claimRewards(s.id, reward, v.global_reward_index, walletAddress);
    setFeedback('success', 'Reward harvested.');
  };

  const handleUnstake = (stakeId: string) => {
    const s = state.userStakes.find(x => x.id === stakeId);
    if (!s || now < s.unlock_timestamp) return;
    updateUserBalance(walletAddress, s.amount, 0);
    unstake(s.id, s.amount, s.validator_id);
    setFeedback('success', 'Principal unstaked.');
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-10 py-10 space-y-12">
      <div className="flex gap-8 border-b border-border">
        <button onClick={() => setActiveTab('staking')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'staking' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('governance')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'governance' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>DAO Portal</button>
        <button onClick={() => setActiveTab('crank')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'crank' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Network Crank</button>
      </div>

      {!isLoaded ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-4">
           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] uppercase font-black tracking-widest text-primary animate-pulse">Syncing Cloud Ledger</p>
        </div>
      ) : (
        <>
          {activeTab === 'staking' && (
            <>
              <DashboardStats 
                totalStaked={totalStakedReal} 
                treasuryBalance={state.treasuryBalance || 0} 
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                <div className="lg:col-span-2">
                  <ValidatorDiscovery 
                    validators={state.validators} 
                    onSelect={setSelectedValidator} 
                    userStakes={state.userStakes} 
                    walletAddress={walletAddress}
                    selectedId={selectedValidator?.id}
                    setFeedback={setFeedback}
                  />
                </div>
                <div className="relative">
                  <StakingActionForm 
                    selectedNode={selectedValidator} 
                    exnBalance={exnBalance} 
                    onStake={handleStake} 
                    userStakes={state.userStakes.filter(s => s.owner === walletAddress)} 
                    validators={state.validators} 
                    totalPendingRewards={pendingRewardsTotal} 
                    connected={connected}
                    onClaim={handleClaim}
                    onClaimSingle={handleClaimSingle}
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
              isNodeOwner={isNodeOwner}
              walletAddress={walletAddress}
              onVote={handleVote}
              onCreate={handleCreateProposal}
              onExecute={handleExecute}
              setFeedback={setFeedback}
            />
          )}

          {activeTab === 'crank' && (
            <CrankTerminal 
              validators={state.validators} 
              rewardCap={state.rewardCap}
              lastCrankedEpoch={state.lastCrankedEpoch}
              networkStartDate={state.networkStartDate}
              onCrank={handleCrank}
              connected={connected}
              settledEpochs={state.settledEpochs}
            />
          )}
        </>
      )}
    </div>
  );
}
