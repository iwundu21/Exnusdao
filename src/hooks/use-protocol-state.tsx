"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

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
  license_id?: string; // This is the Mint Address of the NFT
}

export interface License {
  id: string; // The Mint Address / Unique Identity
  owner: string;
  is_claimed: boolean;
  is_burned?: boolean;
  metadata_uri?: string;
  image_url?: string;
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
  vote_stance?: 'YES' | 'NO';
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
  voting_ends_at: number;
  executed: boolean;
  voters: string[];
  comments: ProposalComment[];
}

export interface TransactionFeedback {
  id: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  txHash: string;
  timestamp: number;
}

export interface ProtocolState {
  exnBalance: number;
  usdcBalance: number;
  totalStaked: number;
  treasuryBalance: number;
  rewardVaultBalance: number;
  usdcVaultBalance: number;
  stakedVaultBalance: number;
  rewardCap: number;
  licenseLimit: number;
  licensePrice: number;
  validators: Validator[];
  userStakes: UserStake[];
  licenses: License[];
  proposals: Proposal[];
  isPaused: boolean;
  lastTransaction: TransactionFeedback | null;
  lastCrankedBlock: number;
  networkStartDate: number | null;
  // Admin & On-Chain State
  isInitialized: boolean;
  adminWallet: string | null;
  exnMint: string | null;
  usdcMint: string | null;
  rewardVaultPda: string | null;
  treasuryVaultPda: string | null;
  usdcVaultPda: string | null;
  stakedVaultPda: string | null;
}

const SEED_AMOUNT = 15000000;
const PROPOSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days for DAO
const VOTING_LOCK_WINDOW = 3600000 * 4;

const INITIAL_STATE: ProtocolState = {
  exnBalance: 25000000, 
  usdcBalance: 2500,
  totalStaked: 45045200, 
  treasuryBalance: 250000,
  rewardVaultBalance: 1000000,
  usdcVaultBalance: 5000,
  stakedVaultBalance: 45045200,
  rewardCap: 0,
  licenseLimit: 21,
  licensePrice: 0,
  isPaused: false,
  lastTransaction: null,
  lastCrankedBlock: 999, // First crank will be 1000
  networkStartDate: null,
  isInitialized: false,
  adminWallet: null,
  exnMint: null,
  usdcMint: null,
  rewardVaultPda: null,
  treasuryVaultPda: null,
  usdcVaultPda: null,
  stakedVaultPda: null,
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
      license_id: 'EXNUS-LIC-001' 
    }
  ],
  userStakes: [],
  licenses: [
    { 
      id: 'EXNUS-LIC-001', 
      owner: 'ExnUs99d2f1f8e7d6c5b4a32109876543210', 
      is_claimed: true, 
      is_burned: false, 
      metadata_uri: 'https://exnus.network/license/001',
      image_url: 'https://picsum.photos/seed/license1/400/400'
    },
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
      deadline: Date.now() + PROPOSAL_DURATION_MS - 86400000, 
      voting_ends_at: Date.now() + PROPOSAL_DURATION_MS - 86400000 - VOTING_LOCK_WINDOW,
      executed: false,
      voters: [],
      comments: [
        { id: 'c1', author: 'Validator-Alpha', text: 'This will help offset hardware costs.', timestamp: Date.now() - 3600000, vote_stance: 'YES' }
      ]
    },
  ],
};

interface ProtocolContextType {
  state: ProtocolState;
  setState: React.Dispatch<React.SetStateAction<ProtocolState>>;
  isLoaded: boolean;
  setFeedback: (status: 'success' | 'error' | 'warning', message: string) => void;
  clearFeedback: () => void;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

export function ProtocolProvider({ children }: { children: ReactNode }) {
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

  const setFeedback = (status: 'success' | 'error' | 'warning', message: string) => {
    const txHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setState(prev => ({
      ...prev,
      lastTransaction: {
        id: `tx-${Date.now()}`,
        status,
        message,
        txHash,
        timestamp: Date.now()
      }
    }));
  };

  const clearFeedback = () => {
    setState(prev => ({ ...prev, lastTransaction: null }));
  };

  return (
    <ProtocolContext.Provider value={{ state, setState, isLoaded, setFeedback, clearFeedback }}>
      {children}
    </ProtocolContext.Provider>
  );
}

export function useProtocolState() {
  const context = useContext(ProtocolContext);
  if (!context) {
    throw new Error("useProtocolState must be used within a ProtocolProvider");
  }
  return context;
}
