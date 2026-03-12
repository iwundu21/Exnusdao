
"use client";

import { useState, createContext, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProtocolState, saveProtocolState } from '@/app/lib/actions';

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
  comments: any[];
}

export interface TransactionFeedback {
  id: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  txHash: string;
  timestamp: number;
}

export interface ProtocolState {
  treasuryBalance: number;
  rewardVaultBalance: number;
  usdcVaultBalance: number;
  stakedVaultBalance: number;
  rewardCap: number;
  licenseLimit: number;
  licensePrice: number;
  isPaused: boolean;
  lastCrankedEpoch: number;
  networkStartDate: number;
  validators: Validator[];
  userStakes: UserStake[];
  licenses: any[];
  proposals: Proposal[];
  profiles: Record<string, any>;
  lastTransaction: TransactionFeedback | null;
}

interface ProtocolContextType {
  state: ProtocolState;
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
  adminFundVault: (address: string, amount: number, vault: string) => void;
  adminWithdrawUsdc: (address: string, amount: number) => void;
  mintLicense: (address: string, price: number, license: any) => void;
  setState: (updater: (prev: ProtocolState) => ProtocolState) => void;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

const DEFAULT_STATE: ProtocolState = {
  treasuryBalance: 3000000,
  rewardVaultBalance: 20000000,
  usdcVaultBalance: 0,
  stakedVaultBalance: 0,
  rewardCap: 300000,
  licenseLimit: 100,
  licensePrice: 5000,
  isPaused: false,
  lastCrankedEpoch: 0,
  networkStartDate: Date.now(),
  validators: [],
  userStakes: [],
  licenses: [],
  proposals: [],
  profiles: {},
  lastTransaction: null,
};

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const [state, setInternalState] = useState<ProtocolState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const fetchState = useCallback(async () => {
    const data = await getProtocolState();
    if (data) {
      setInternalState(prev => ({ ...data, lastTransaction: prev.lastTransaction }));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Robust setState that decoupled state updates from persistence side-effects
  const setState = useCallback(async (updater: (prev: ProtocolState) => ProtocolState) => {
    const nextState = updater(stateRef.current);
    setInternalState(nextState);
    
    // Side effect: save to DB file (fire and forget)
    // Wrap in a microtask to avoid interference with the current render cycle
    Promise.resolve().then(() => {
      saveProtocolState(nextState);
    });
  }, []);

  const setFeedback = useCallback((status: 'success' | 'error' | 'warning', message: string) => {
    setInternalState(prev => ({
      ...prev,
      lastTransaction: {
        id: `tx-${Date.now()}`,
        status,
        message,
        txHash: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now()
      }
    }));
  }, []);

  const clearFeedback = useCallback(() => {
    setInternalState(prev => ({ ...prev, lastTransaction: null }));
  }, []);

  const userProfile = state.profiles[walletAddress] || null;

  const registerUser = useCallback((address: string) => {
    if (!address) return;
    setState(prev => {
      if (prev.profiles[address]) return prev;
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [address]: {
            address,
            exnBalance: 25000000,
            usdcBalance: 10000,
            lastExnFaucetClaim: 0,
            lastUsdcFaucetClaim: 0,
            registeredAt: Date.now(),
            lastActive: Date.now(),
            totalTransactions: 0
          }
        }
      };
    });
  }, [setState]);

  const updateUserBalance = useCallback((address: string, exn: number, usdc: number) => {
    setState(prev => {
      const profile = prev.profiles[address];
      if (!profile) return prev;
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [address]: {
            ...profile,
            exnBalance: profile.exnBalance + exn,
            usdcBalance: profile.usdcBalance + usdc,
            lastActive: Date.now(),
            totalTransactions: profile.totalTransactions + 1
          }
        }
      };
    });
  }, [setState]);

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
            [type === 'exn' ? 'lastExnFaucetClaim' : 'lastUsdcFaucetClaim']: Date.now()
          }
        }
      };
    });
  }, [setState]);

  const adminFundVault = useCallback((address: string, amount: number, vault: string) => {
    setState(prev => {
      const profile = prev.profiles[address];
      if (!profile || profile.exnBalance < amount) return prev;
      return {
        ...prev,
        [vault]: (prev[vault as keyof ProtocolState] as number) + amount,
        profiles: {
          ...prev.profiles,
          [address]: {
            ...profile,
            exnBalance: profile.exnBalance - amount
          }
        }
      };
    });
  }, [setState]);

  const adminWithdrawUsdc = useCallback((address: string, amount: number) => {
    setState(prev => {
      const profile = prev.profiles[address];
      if (!profile || prev.usdcVaultBalance < amount) return prev;
      return {
        ...prev,
        usdcVaultBalance: prev.usdcVaultBalance - amount,
        profiles: {
          ...prev.profiles,
          [address]: {
            ...profile,
            usdcBalance: profile.usdcBalance + amount
          }
        }
      };
    });
  }, [setState]);

  const mintLicense = useCallback((address: string, price: number, license: any) => {
    setState(prev => {
      const profile = prev.profiles[address];
      if (!profile || profile.usdcBalance < price) return prev;
      return {
        ...prev,
        usdcVaultBalance: prev.usdcVaultBalance + price,
        licenses: [...prev.licenses, license],
        profiles: {
          ...prev.profiles,
          [address]: {
            ...profile,
            usdcBalance: profile.usdcBalance - price
          }
        }
      };
    });
  }, [setState]);

  return (
    <ProtocolContext.Provider value={{
      state,
      isLoaded,
      setFeedback,
      clearFeedback,
      registerUser,
      exnBalance: userProfile?.exnBalance ?? 0,
      usdcBalance: userProfile?.usdcBalance ?? 0,
      lastExnFaucetClaim: userProfile?.lastExnFaucetClaim ?? 0,
      lastUsdcFaucetClaim: userProfile?.lastUsdcFaucetClaim ?? 0,
      updateUserBalance,
      updateFaucetClaim,
      adminFundVault,
      adminWithdrawUsdc,
      mintLicense,
      setState
    }}>
      {children}
    </ProtocolContext.Provider>
  );
}

export function useProtocolState() {
  const context = useContext(ProtocolContext);
  if (!context) throw new Error("useProtocolState must be used within a ProtocolProvider");
  return context;
}
