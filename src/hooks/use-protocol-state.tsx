
"use client";

import { useState, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  deleteDoc, 
  increment 
} from 'firebase/firestore';
import { 
  useFirestore, 
  useDoc, 
  useCollection 
} from '@/firebase';

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
  id: string;
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
  licenses: License[];
  proposals: Proposal[];
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
  mintLicense: (address: string, price: number, license: License) => void;
  setState: (updater: (prev: ProtocolState) => ProtocolState) => void;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const db = useFirestore();
  const [lastFeedback, setLastFeedback] = useState<TransactionFeedback | null>(null);

  // 1. Real-time Singleton State
  const protocolRef = useMemo(() => doc(db, 'protocol', 'global'), [db]);
  const { data: globalState, loading: globalLoading } = useDoc(protocolRef);

  // 2. Real-time Collections
  const validatorsRef = useMemo(() => collection(db, 'validators'), [db]);
  const { data: validators = [], loading: validatorsLoading } = useCollection(validatorsRef);

  const stakesRef = useMemo(() => collection(db, 'stakes'), [db]);
  const { data: stakes = [], loading: stakesLoading } = useCollection(stakesRef);

  const licensesRef = useMemo(() => collection(db, 'licenses'), [db]);
  const { data: licenses = [], loading: licensesLoading } = useCollection(licensesRef);

  const proposalsRef = useMemo(() => collection(db, 'proposals'), [db]);
  const { data: proposals = [], loading: proposalsLoading } = useCollection(proposalsRef);

  const walletAddress = publicKey?.toBase58() || '';
  const userProfileRef = useMemo(() => walletAddress ? doc(db, 'users', walletAddress) : null, [db, walletAddress]);
  const { data: userProfile } = useDoc(userProfileRef);

  const isLoaded = !globalLoading && !validatorsLoading && !stakesLoading && !licensesLoading && !proposalsLoading;

  const setFeedback = useCallback((status: 'success' | 'error' | 'warning', message: string) => {
    setLastFeedback({
      id: `tx-${Date.now()}`,
      status,
      message,
      txHash: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now()
    });
  }, []);

  const clearFeedback = useCallback(() => setLastFeedback(null), []);

  const registerUser = useCallback(async (address: string) => {
    if (!db || !address) return;
    const ref = doc(db, 'users', address);
    setDoc(ref, {
      address,
      exnBalance: 25000000,
      usdcBalance: 10000,
      lastExnFaucetClaim: 0,
      lastUsdcFaucetClaim: 0,
      registeredAt: Date.now(),
      lastActive: Date.now(),
      totalTransactions: 0
    }, { merge: true });
  }, [db]);

  const updateUserBalance = useCallback((address: string, exnDelta: number, usdcDelta: number) => {
    if (!db || !address) return;
    const ref = doc(db, 'users', address);
    updateDoc(ref, {
      exnBalance: increment(exnDelta),
      usdcBalance: increment(usdcDelta),
      lastActive: Date.now(),
      totalTransactions: increment(1)
    });
  }, [db]);

  const adminFundVault = useCallback((address: string, amount: number, vault: string) => {
    if (!db || !address) return;
    updateUserBalance(address, -amount, 0);
    updateDoc(protocolRef, { [vault]: increment(amount) });
  }, [db, protocolRef, updateUserBalance]);

  const adminWithdrawUsdc = useCallback((address: string, amount: number) => {
    if (!db || !address) return;
    updateUserBalance(address, 0, amount);
    updateDoc(protocolRef, { usdcVaultBalance: increment(-amount) });
  }, [db, protocolRef, updateUserBalance]);

  const mintLicense = useCallback((address: string, price: number, license: License) => {
    if (!db || !address) return;
    updateUserBalance(address, 0, -price);
    updateDoc(protocolRef, { usdcVaultBalance: increment(price) });
    setDoc(doc(db, 'licenses', license.id), license);
  }, [db, protocolRef, updateUserBalance]);

  const setState = useCallback((updater: (prev: ProtocolState) => ProtocolState) => {
    // This is a bridge for legacy setState calls
    // Real implementations should use the mutation functions above
    const current = { 
      ...globalState, 
      validators, 
      userStakes: stakes, 
      licenses, 
      proposals, 
      lastTransaction: lastFeedback 
    } as any;
    const next = updater(current);
    
    // Attempting atomic update of the singleton doc
    if (globalState) {
      const { validators, userStakes, licenses, proposals, lastTransaction, ...rest } = next as any;
      setDoc(protocolRef, rest, { merge: true });
    }
  }, [globalState, protocolRef, validators, stakes, licenses, proposals, lastFeedback]);

  const state: ProtocolState = {
    treasuryBalance: globalState?.treasuryBalance ?? 3000000,
    rewardVaultBalance: globalState?.rewardVaultBalance ?? 20000000,
    usdcVaultBalance: globalState?.usdcVaultBalance ?? 0,
    stakedVaultBalance: globalState?.stakedVaultBalance ?? 0,
    rewardCap: globalState?.rewardCap ?? 300000,
    licenseLimit: globalState?.licenseLimit ?? 100,
    licensePrice: globalState?.licensePrice ?? 5000,
    isPaused: globalState?.isPaused ?? false,
    lastCrankedEpoch: globalState?.lastCrankedEpoch ?? 0,
    networkStartDate: globalState?.networkStartDate ?? Date.now(),
    validators: validators as Validator[],
    userStakes: stakes as UserStake[],
    licenses: licenses as License[],
    proposals: proposals as Proposal[],
    lastTransaction: lastFeedback
  };

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
      updateFaucetClaim: (address, type) => {
        const ref = doc(db, 'users', address);
        updateDoc(ref, { [type === 'exn' ? 'lastExnFaucetClaim' : 'lastUsdcFaucetClaim']: Date.now() });
      },
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
  if (!context) {
    throw new Error("useProtocolState must be used within a ProtocolProvider");
  }
  return context;
}
