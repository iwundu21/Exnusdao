"use client";

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { doc, setDoc, updateDoc, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  userStakes: any[];
  licenses: any[];
  proposals: any[];
  settledEpochs: any[];
  lastTransaction: any | null;
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
  setState: (updater: (prev: any) => any) => void;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const db = useFirestore();
  const walletAddress = publicKey?.toBase58() || '';

  // 1. Global State
  const globalRef = useMemo(() => doc(db, 'protocol', 'global'), [db]);
  const { data: globalData, loading: globalLoading } = useDoc(globalRef);

  // 2. Collections
  const validatorsQuery = useMemo(() => collection(db, 'validators'), [db]);
  const { data: validators, loading: valLoading } = useCollection(validatorsQuery);

  const stakesQuery = useMemo(() => collection(db, 'stakes'), [db]);
  const { data: userStakes, loading: stakesLoading } = useCollection(stakesQuery);

  const proposalsQuery = useMemo(() => collection(db, 'proposals'), [db]);
  const { data: proposals, loading: propsLoading } = useCollection(proposalsQuery);

  const licensesQuery = useMemo(() => collection(db, 'licenses'), [db]);
  const { data: licenses, loading: licLoading } = useCollection(licensesQuery);

  // 3. User Profile
  const userRef = useMemo(() => (walletAddress ? doc(db, 'users', walletAddress) : null), [db, walletAddress]);
  const { data: userProfile, loading: profileLoading } = useDoc(userRef);

  const isLoaded = !globalLoading && !valLoading && !stakesLoading && !propsLoading && !licLoading && !profileLoading;

  const setFeedback = useCallback((status: 'success' | 'error' | 'warning', message: string) => {
    // Feedback is transient UI state, usually better handled via a global state or simple toast
    // but we can store it in a local state here if needed.
    errorEmitter.emit('feedback', { status, message });
  }, []);

  const clearFeedback = useCallback(() => {
    errorEmitter.emit('feedback', null);
  }, []);

  const registerUser = useCallback((address: string) => {
    if (!address || !db) return;
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
    }, { merge: true }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'create' }));
    });
  }, [db]);

  const updateUserBalance = useCallback((address: string, exn: number, usdc: number) => {
    if (!address || !db) return;
    const ref = doc(db, 'users', address);
    updateDoc(ref, {
      exnBalance: (userProfile?.exnBalance || 0) + exn,
      usdcBalance: (userProfile?.usdcBalance || 0) + usdc,
      lastActive: Date.now()
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'update' }));
    });
  }, [db, userProfile]);

  const updateFaucetClaim = useCallback((address: string, type: 'exn' | 'usdc') => {
    if (!address || !db) return;
    const ref = doc(db, 'users', address);
    updateDoc(ref, {
      [type === 'exn' ? 'lastExnFaucetClaim' : 'lastUsdcFaucetClaim']: Date.now()
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'update' }));
    });
  }, [db]);

  const adminFundVault = useCallback((address: string, amount: number, vault: string) => {
    if (!address || !db || !globalData) return;
    const gRef = doc(db, 'protocol', 'global');
    const uRef = doc(db, 'users', address);
    
    updateDoc(gRef, { [vault]: (globalData[vault] || 0) + amount });
    updateDoc(uRef, { exnBalance: (userProfile?.exnBalance || 0) - amount });
  }, [db, globalData, userProfile]);

  const adminWithdrawUsdc = useCallback((address: string, amount: number) => {
    if (!address || !db || !globalData) return;
    const gRef = doc(db, 'protocol', 'global');
    const uRef = doc(db, 'users', address);

    updateDoc(gRef, { usdcVaultBalance: (globalData.usdcVaultBalance || 0) - amount });
    updateDoc(uRef, { usdcBalance: (userProfile?.usdcBalance || 0) + amount });
  }, [db, globalData, userProfile]);

  const mintLicense = useCallback((address: string, price: number, license: any) => {
    if (!address || !db) return;
    const lRef = doc(db, 'licenses', license.id);
    const uRef = doc(db, 'users', address);
    const gRef = doc(db, 'protocol', 'global');

    setDoc(lRef, license);
    updateDoc(uRef, { usdcBalance: (userProfile?.usdcBalance || 0) - price });
    updateDoc(gRef, { usdcVaultBalance: (globalData?.usdcVaultBalance || 0) + price });
  }, [db, userProfile, globalData]);

  // Compatibility helper for older UI calls
  const setState = useCallback((updater: any) => {
    console.warn("Direct setState is deprecated in favor of Firebase atomic updates.");
  }, []);

  const state: ProtocolState = {
    treasuryBalance: globalData?.treasuryBalance ?? 3000000,
    rewardVaultBalance: globalData?.rewardVaultBalance ?? 20000000,
    usdcVaultBalance: globalData?.usdcVaultBalance ?? 0,
    stakedVaultBalance: globalData?.stakedVaultBalance ?? 0,
    rewardCap: globalData?.rewardCap ?? 300000,
    licenseLimit: globalData?.licenseLimit ?? 100,
    licensePrice: globalData?.licensePrice ?? 5000,
    isPaused: globalData?.isPaused ?? false,
    lastCrankedEpoch: globalData?.lastCrankedEpoch ?? 0,
    networkStartDate: globalData?.networkStartDate ?? Date.now(),
    validators: validators as Validator[],
    userStakes: userStakes as any[],
    licenses: licenses as any[],
    proposals: proposals as any[],
    settledEpochs: globalData?.settledEpochs ?? [],
    lastTransaction: null
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
