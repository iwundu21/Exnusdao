"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

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

export interface EpochRecord {
  epoch: number;
  settledAt: number;
  totalPool: number;
  validatorShares: {
    validatorId: string;
    share: number;
    commission: number;
  }[];
}

export interface TransactionFeedback {
  id: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  txHash: string;
  timestamp: number;
}

export interface UserProfile {
  address: string;
  exnBalance: number;
  usdcBalance: number;
  lastExnFaucetClaim: number;
  lastUsdcFaucetClaim: number;
  registeredAt: number;
  lastActive: number;
  totalTransactions: number;
}

export interface NetworkMetadata {
  version: string;
  totalVolume: number;
  totalUsers: number;
  lastUpdate: number;
}

export interface ProtocolState {
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
  settledEpochs: EpochRecord[];
  isPaused: boolean;
  lastTransaction: TransactionFeedback | null;
  lastCrankedEpoch: number;
  networkStartDate: number;
  exnMint: string;
  usdcMint: string;
  rewardVaultPda: string;
  treasuryVaultPda: string;
  usdcVaultPda: string;
  stakedVaultPda: string;
  adminWallet?: string;
  profiles: Record<string, UserProfile>;
  metadata: NetworkMetadata;
}

const INITIAL_STATE: ProtocolState = {
  totalStaked: 15000000, 
  treasuryBalance: 50000,
  rewardVaultBalance: 100000,
  usdcVaultBalance: 5000,
  stakedVaultBalance: 15000000,
  rewardCap: 1500,
  licenseLimit: 100,
  licensePrice: 500,
  isPaused: false,
  lastTransaction: null,
  lastCrankedEpoch: 0, 
  networkStartDate: Date.now(), 
  exnMint: 'EXN1111111111111111111111111111111111111111',
  usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  rewardVaultPda: 'REWARD-PDA',
  treasuryVaultPda: 'TREASURY-PDA',
  usdcVaultPda: 'LICENSE-PDA',
  stakedVaultPda: 'STAKED-PDA',
  adminWallet: '9Kqt28pfMVBsBvXYYnYQCT2BZyorAwzbR6dUmgQfsZYW',
  validators: [
    { 
      id: 'v1', 
      owner: '9Kqt28pfMVBsBvXYYnYQCT2BZyorAwzbR6dUmgQfsZYW',
      name: 'CyberCore-01', 
      description: 'Primary edge node', 
      logo_uri: '66', 
      location: 'Singapore', 
      is_active: true, 
      seed_deposited: true, 
      total_staked: 15000000, 
      commission_rate: 500, 
      accrued_node_rewards: 0, 
      global_reward_index: 0, 
      license_id: 'XNODE-DEFAULT' 
    }
  ],
  userStakes: [],
  licenses: [
    {
      id: 'XNODE-DEFAULT',
      owner: '9Kqt28pfMVBsBvXYYnYQCT2BZyorAwzbR6dUmgQfsZYW',
      is_claimed: true,
      is_burned: false,
      image_url: 'https://picsum.photos/seed/XNODE-DEFAULT/400/400'
    }
  ],
  proposals: [],
  settledEpochs: [],
  profiles: {},
  metadata: {
    version: '1.0.0-DEMO',
    totalVolume: 0,
    totalUsers: 0,
    lastUpdate: Date.now()
  }
};

interface ProtocolContextType {
  state: ProtocolState;
  setState: React.Dispatch<React.SetStateAction<ProtocolState>>;
  isLoaded: boolean;
  setFeedback: (status: 'success' | 'error' | 'warning', message: string) => void;
  clearFeedback: () => void;
  registerUser: (address: string) => void;
  exnBalance: number;
  usdcBalance: number;
  lastExnFaucetClaim: number;
  lastUsdcFaucetClaim: number;
  updateUserBalance: (address: string, exn: number, usdc: number) => void;
  updateFaucetClaim: (address: string, type: 'exn' | 'usdc') => void;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const [state, setState] = useState<ProtocolState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('exnus_general_memory_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ 
          ...prev, 
          ...parsed
        }));
      } catch (e) {
        console.error("Failed to parse general memory", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('exnus_general_memory_v1', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const setFeedback = useCallback((status: 'success' | 'error' | 'warning', message: string) => {
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
  }, []);

  const clearFeedback = useCallback(() => {
    setState(prev => ({ ...prev, lastTransaction: null }));
  }, []);

  const registerUser = useCallback((address: string) => {
    setState(prev => {
      if (prev.profiles[address]) {
        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            [address]: {
              ...prev.profiles[address],
              lastActive: Date.now(),
              totalTransactions: prev.profiles[address].totalTransactions + 1
            }
          }
        };
      }

      const newProfile: UserProfile = {
        address,
        exnBalance: 25000000,
        usdcBalance: 10000,
        lastExnFaucetClaim: 0,
        lastUsdcFaucetClaim: 0,
        registeredAt: Date.now(),
        lastActive: Date.now(),
        totalTransactions: 1
      };

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [address]: newProfile
        },
        metadata: {
          ...prev.metadata,
          totalUsers: Object.keys(prev.profiles).length + 1,
          lastUpdate: Date.now()
        }
      };
    });
  }, []);

  const updateUserBalance = useCallback((address: string, exnDelta: number, usdcDelta: number) => {
    setState(prev => {
      const profile = prev.profiles[address];
      if (!profile) return prev;
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [address]: {
            ...profile,
            exnBalance: Math.max(0, profile.exnBalance + exnDelta),
            usdcBalance: Math.max(0, profile.usdcBalance + usdcDelta),
            lastActive: Date.now(),
            totalTransactions: profile.totalTransactions + 1
          }
        }
      };
    });
  }, []);

  const updateFaucetClaim = useCallback((address: string, type: 'exn' | 'usdc') => {
    setState(prev => {
      const profile = prev.profiles[address];
      if (!profile) return prev;
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [address]: {
            ...profile,
            [type === 'exn' ? 'lastExnFaucetClaim' : 'lastUsdcFaucetClaim']: Date.now(),
            lastActive: Date.now()
          }
        }
      };
    });
  }, []);

  const walletAddress = publicKey?.toBase58();
  const activeProfile = walletAddress ? state.profiles[walletAddress] : null;

  return (
    <ProtocolContext.Provider value={{ 
      state, 
      setState, 
      isLoaded, 
      setFeedback, 
      clearFeedback, 
      registerUser,
      exnBalance: activeProfile?.exnBalance ?? 0,
      usdcBalance: activeProfile?.usdcBalance ?? 0,
      lastExnFaucetClaim: activeProfile?.lastExnFaucetClaim ?? 0,
      lastUsdcFaucetClaim: activeProfile?.lastUsdcFaucetClaim ?? 0,
      updateUserBalance,
      updateFaucetClaim
    }}>
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
