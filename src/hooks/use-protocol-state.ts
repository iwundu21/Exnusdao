
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
  proposals: any[];
  isPaused: boolean;
}

const SEED_AMOUNT = 15000000;

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
      owner: 'ExnUs99d2f1f8e7d6c5b4a32109876543210', // Demo legacy format
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
    },
    { 
      id: 'v3', 
      owner: 'Alpha-Mock-Owner', 
      name: 'AlphaPulse', 
      description: 'High-frequency pulse', 
      logo_uri: '88', 
      location: 'London', 
      is_active: true, 
      seed_deposited: true, 
      total_staked: SEED_AMOUNT + 17500, 
      commission_rate: 300, 
      accrued_node_rewards: 125, 
      global_reward_index: 1150000, 
      license_id: 'LIC-DEMO3' 
    },
  ],
  userStakes: [], // Clean start for real wallets
  licenses: [
    { id: 'LIC-DEMO1', owner: 'ExnUs99d2f1f8e7d6c5b4a32109876543210', is_claimed: true, is_burned: false },
    { id: 'LIC-DEMO2', owner: 'Nebula-Mock-Owner', is_claimed: true, is_burned: false },
    { id: 'LIC-DEMO3', owner: 'Alpha-Mock-Owner', is_claimed: true, is_burned: false },
  ],
  proposals: [
    { id: 0, proposer: 'ExnUs99d...', type: 0, title: 'Upgrade Epoch Length', description: 'Increase epoch from 24h to 48h for stability.', amount: 0, recipient: '', yes_votes: 15000, no_votes: 2000, deadline: Date.now() + 86400000 * 2, executed: false },
    { id: 1, proposer: 'ExnUsAdmin', type: 1, title: 'Treasury Grant: AI Integration', description: 'Release 50,000 EXN for ecosystem development.', amount: 50000, recipient: 'ExnUs99abc', yes_votes: 45000, no_votes: 1200, deadline: Date.now() - 86400000, executed: false },
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
