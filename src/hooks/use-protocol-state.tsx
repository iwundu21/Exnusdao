
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
  license_id?: string;
}

export interface License {
  id: string;
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
  type: number; 
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
  isInitialized: boolean;
  adminWallet: string | null;
  exnMint: string | null;
  usdcMint: string | null;
  rewardVaultPda: string | null;
  treasuryVaultPda: string | null;
  usdcVaultPda: string | null;
  stakedVaultPda: string | null;
}

const INITIAL_STATE: ProtocolState = {
  exnBalance: 25000000, 
  usdcBalance: 10000,
  totalStaked: 0, 
  treasuryBalance: 0,
  rewardVaultBalance: 0,
  usdcVaultBalance: 0,
  stakedVaultBalance: 0,
  rewardCap: 0,
  licenseLimit: 100,
  licensePrice: 0,
  isPaused: false,
  lastTransaction: null,
  lastCrankedBlock: 999,
  networkStartDate: null,
  isInitialized: false,
  adminWallet: null,
  exnMint: 'EXN1111111111111111111111111111111111111111',
  usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  rewardVaultPda: 'REWARD-PDA',
  treasuryVaultPda: 'TREASURY-PDA',
  usdcVaultPda: 'LICENSE-PDA',
  stakedVaultPda: 'STAKED-PDA',
  validators: [],
  userStakes: [],
  licenses: [],
  proposals: [],
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
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsed }));
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
