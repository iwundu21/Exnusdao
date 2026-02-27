
"use client";

import { useState, useEffect } from 'react';

export interface Validator {
  id: string;
  owner: string;
  name: string;
  description: string;
  logo_uri: string;
  location: string;
  is_active: boolean;
  seed_deposited: boolean;
  total_staked: number;
  commission_rate: number;
  accrued_node_rewards: number;
  global_reward_index: number;
  license_id?: string;
}

export interface License {
  id: string;
  owner: string;
  is_claimed: boolean;
  is_burned?: boolean;
}

export interface UserStake {
  id: string;
  owner: string;
  validator_id: string;
  amount: number;
  lock_multiplier: number;
  staked_at: number;
  unlock_timestamp: number;
  reward_checkpoint: number;
  claimed: boolean;
  unstaked: boolean;
}

export interface ProposalComment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface Proposal {
  id: number;
  proposer: string;
  type: number; // 0: Parameter, 1: Treasury
  title: string;
  description: string;
  amount: number;
  recipient: string;
  yes_votes: number;
  no_votes: number;
  created_at: number;
  deadline: number;
  voting_ends_at: number; // 4 hours before deadline
  executed: boolean;
  voters: string[]; // Addresses that have already voted
  comments: ProposalComment[];
}

export interface ProtocolState {
  exnBalance: number;
  usdcBalance: number;
  totalStaked: number;
  treasuryBalance: number;
  rewardCap: number;
  licenseLimit: number;
  validators: Validator[];
  userStakes: UserStake[];
  licenses: License[];
  proposals: Proposal[];
  isPaused: boolean;
}

const SEED_AMOUNT = 15000000;
const PROPOSAL_DURATION = 86400000 * 7; // 7 Days
const VOTING_LOCK_WINDOW = 3600000 * 4; // 4 Hours

const INITIAL_STATE: ProtocolState = {
  exnBalance: 25000000, 
  usdcBalance: 2500,
  totalStaked: 45045200, 
  treasuryBalance: 250000,
  rewardCap: 1250,
  licenseLimit: 21,
  isPaused: false,
  validators: [
    { 
      id: 'v1', 
      owner: 'ExnUs99d2f1f8e7d6c5b4a32109876543210',
      name: 'CyberCore-01', 
      description: 'Primary edge node', 
      logo_uri: '66', 
      location: 'Singapore', 
      is_active: true, 
      seed_deposited: true, 
      total_staked: SEED_AMOUNT + 15200, 
      commission_rate: 500, 
      accrued_node_rewards: 452, 
      global_reward_index: 1200000, 
      license_id: 'LIC-DEMO1' 
    },
    { 
      id: 'v2', 
      owner: 'Nebula-Mock-Owner', 
      name: 'NebulaNode', 
      description: 'Deep space validator', 
      logo_uri: '77', 
      location: 'Mars Alpha', 
      is_active: true, 
      seed_deposited: true, 
      total_staked: SEED_AMOUNT + 12500, 
      commission_rate: 800, 
      accrued_node_rewards: 210, 
      global_reward_index: 1200000, 
      license_id: 'LIC-DEMO2' 
    }
  ],
  userStakes: [],
  licenses: [
    { id: 'LIC-DEMO1', owner: 'ExnUs99d2f1f8e7d6c5b4a32109876543210', is_claimed: true, is_burned: false },
    { id: 'LIC-DEMO2', owner: 'Nebula-Mock-Owner', is_claimed: true, is_burned: false },
  ],
  proposals: [
    { 
      id: 0, 
      proposer: 'ExnUs99d...', 
      type: 0, 
      title: 'PIP-001: Increase Reward Cap', 
      description: 'Increase the global reward cap from 1,250 to 1,500 EXN to encourage more network participation.', 
      amount: 0, 
      recipient: '', 
      yes_votes: 15000, 
      no_votes: 2000, 
      created_at: Date.now() - 86400000, 
      deadline: Date.now() + 86400000 * 6, 
      voting_ends_at: Date.now() + 86400000 * 6 - VOTING_LOCK_WINDOW,
      executed: false,
      voters: [],
      comments: [
        { id: 'c1', author: 'Validator-Alpha', text: 'This will help offset hardware costs.', timestamp: Date.now() - 3600000 }
      ]
    },
  ],
};

export function useProtocolState() {
  const [state, setState] = useState<ProtocolState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('exnus_protocol_state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse protocol state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('exnus_protocol_state', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  return { state, setState, isLoaded };
}
