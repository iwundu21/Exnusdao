"use client";

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { doc, setDoc, updateDoc, collection, deleteDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useUser } from '@/firebase';
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
  seedAmount: number;
  adminWallet: string;
  faucetExnLimit: number;
  faucetUsdcLimit: number;
  exnPrice: number;
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
  resetProtocol: () => Promise<void>;
  
  // Protocol Mutations
  addStake: (stake: any) => void;
  unstake: (stakeId: string, amount: number, validatorId: string) => void;
  claimRewards: (stakeId: string, amount: number, validatorId: string, wallet: string) => void;
  castVote: (pId: number, support: boolean, weight: number, comment: any) => void;
  createProposal: (proposal: any) => void;
  executeProposal: (pId: number, passed: boolean, type: number, amount: number, recipient: string, wallet: string) => void;
  crankEpoch: (targetEpoch: number, totalPool: number, activeValidators: any[], totalWeight: number) => void;
  registerValidator: (validator: any, licenseId: string) => void;
  updateValidator: (vId: string, data: any) => void;
  terminateValidator: (vId: string, wallet: string, seedRefund: number, rewards: number, licenseId: string) => void;
  toggleValidator: (vId: string, status: boolean) => void;
  setState: (updater: any) => void;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const db = useFirestore();
  const { user: firebaseUser, loading: authLoading } = useUser();
  const walletAddress = publicKey?.toBase58() || '';

  // Cloud Firestore References
  const globalRef = useMemo(() => doc(db, 'protocol', 'global'), [db]);
  const { data: globalData, loading: globalLoading } = useDoc(globalRef);

  const validatorsQuery = useMemo(() => collection(db, 'validators'), [db]);
  const { data: validatorsData, loading: valLoading } = useCollection<Validator>(validatorsQuery);

  const stakesQuery = useMemo(() => collection(db, 'stakes'), [db]);
  const { data: stakesData, loading: stakesLoading } = useCollection(stakesQuery);

  const proposalsQuery = useMemo(() => collection(db, 'proposals'), [db]);
  const { data: proposalsData, loading: propsLoading } = useCollection(proposalsQuery);

  const licensesQuery = useMemo(() => collection(db, 'licenses'), [db]);
  const { data: licensesData, loading: licLoading } = useCollection(licensesQuery);

  const userRef = useMemo(() => (walletAddress ? doc(db, 'users', walletAddress) : null), [db, walletAddress]);
  const { data: userProfile, loading: profileLoading } = useDoc(userRef);

  const isLoaded = !authLoading && !globalLoading && !valLoading && !stakesLoading && !propsLoading && !licLoading && !profileLoading;

  const setFeedback = useCallback((status: 'success' | 'error' | 'warning', message: string) => {
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

  const addStake = useCallback((stake: any) => {
    if (!db) return;
    const sRef = doc(collection(db, 'stakes'));
    const gRef = doc(db, 'protocol', 'global');
    const vRef = doc(db, 'validators', stake.validator_id);
    setDoc(sRef, { ...stake, id: sRef.id });
    updateDoc(gRef, { stakedVaultBalance: (globalData?.stakedVaultBalance || 0) + stake.amount });
    updateDoc(vRef, { total_staked: (validatorsData?.find(v => v.id === stake.validator_id)?.total_staked || 0) + stake.amount });
  }, [db, globalData, validatorsData]);

  const unstake = useCallback((stakeId: string, amount: number, validatorId: string) => {
    if (!db) return;
    const sRef = doc(db, 'stakes', stakeId);
    const gRef = doc(db, 'protocol', 'global');
    const vRef = doc(db, 'validators', validatorId);
    updateDoc(sRef, { unstaked: true });
    updateDoc(gRef, { stakedVaultBalance: Math.max(0, (globalData?.stakedVaultBalance || 0) - amount) });
    updateDoc(vRef, { total_staked: Math.max(0, (validatorsData?.find(v => v.id === validatorId)?.total_staked || 0) - amount) });
  }, [db, globalData, validatorsData]);

  const claimRewards = useCallback((stakeId: string, amount: number, validatorId: string, wallet: string) => {
    if (!db) return;
    const sRef = doc(db, 'stakes', stakeId);
    const validator = validatorsData?.find(v => v.id === validatorId);
    if (!validator) return;
    updateDoc(sRef, { reward_checkpoint: validator.global_reward_index });
    updateUserBalance(wallet, amount, 0);
  }, [db, validatorsData, updateUserBalance]);

  const castVote = useCallback((pId: number, support: boolean, weight: number, comment: any) => {
    if (!db) return;
    const pRef = doc(db, 'proposals', pId.toString());
    const gRef = doc(db, 'protocol', 'global');
    const prop = proposalsData?.find(p => p.id === pId);
    if (!prop) return;
    updateDoc(pRef, {
      yes_votes: support ? (prop.yes_votes || 0) + weight : prop.yes_votes,
      no_votes: !support ? (prop.no_votes || 0) + weight : prop.no_votes,
      voters: [...(prop.voters || []), walletAddress],
      comments: [...(prop.comments || []), comment]
    });
    updateDoc(gRef, { treasuryBalance: (globalData?.treasuryBalance || 0) + 3 });
  }, [db, proposalsData, walletAddress, globalData]);

  const createProposal = useCallback((proposal: any) => {
    if (!db) return;
    const pRef = doc(db, 'proposals', proposal.id.toString());
    const gRef = doc(db, 'protocol', 'global');
    setDoc(pRef, proposal);
    updateDoc(gRef, { treasuryBalance: (globalData?.treasuryBalance || 0) + 10 });
  }, [db, globalData]);

  const executeProposal = useCallback((pId: number, passed: boolean, type: number, amount: number, recipient: string, wallet: string) => {
    if (!db) return;
    const pRef = doc(db, 'proposals', pId.toString());
    const gRef = doc(db, 'protocol', 'global');
    updateDoc(pRef, { executed: true });
    if (passed && type === 1) {
      updateDoc(gRef, { treasuryBalance: Math.max(0, (globalData?.treasuryBalance || 0) - amount) });
      if (recipient === wallet) updateUserBalance(wallet, amount, 0);
    }
  }, [db, globalData, updateUserBalance]);

  const crankEpoch = useCallback((targetEpoch: number, totalPool: number, activeValidators: any[], totalWeight: number) => {
    if (!db) return;
    const gRef = doc(db, 'protocol', 'global');
    const epochShares: any[] = [];
    
    activeValidators.forEach(v => {
      const vRef = doc(db, 'validators', v.id);
      const poolShare = (v.total_staked / totalWeight) * totalPool;
      const commission = (poolShare * (v.commission_rate / 10000));
      const stakerPool = poolShare - commission;
      const rewardIndexDelta = Math.floor(stakerPool * 1000000 / v.total_staked);
      
      epochShares.push({ validatorId: v.id, share: stakerPool, commission: commission });
      updateDoc(vRef, {
        accrued_node_rewards: (v.accrued_node_rewards || 0) + commission,
        global_reward_index: (v.global_reward_index || 0) + rewardIndexDelta
      });
    });

    updateDoc(gRef, {
      lastCrankedEpoch: targetEpoch,
      rewardVaultBalance: Math.max(0, (globalData?.rewardVaultBalance || 0) - totalPool),
      settledEpochs: [...(globalData?.settledEpochs || []), { epoch: targetEpoch, settledAt: Date.now(), totalPool, validatorShares: epochShares }]
    });
  }, [db, globalData]);

  const registerValidator = useCallback((validator: any, licenseId: string) => {
    if (!db) return;
    const vRef = doc(db, 'validators', validator.id);
    const lRef = doc(db, 'licenses', licenseId);
    setDoc(vRef, validator);
    updateDoc(lRef, { is_claimed: true });
  }, [db]);

  const updateValidator = useCallback((vId: string, data: any) => {
    if (!db) return;
    const vRef = doc(db, 'validators', vId);
    updateDoc(vRef, data);
  }, [db]);

  const terminateValidator = useCallback((vId: string, wallet: string, seedRefund: number, rewards: number, licenseId: string) => {
    if (!db) return;
    const vRef = doc(db, 'validators', vId);
    const lRef = doc(db, 'licenses', licenseId);
    deleteDoc(vRef);
    updateDoc(lRef, { is_burned: true, is_claimed: false });
    updateUserBalance(wallet, seedRefund + rewards, 0);
  }, [db, updateUserBalance]);

  const toggleValidator = useCallback((vId: string, status: boolean) => {
    if (!db) return;
    const vRef = doc(db, 'validators', vId);
    updateDoc(vRef, { is_active: status });
  }, [db]);

  const resetProtocol = useCallback(async () => {
    if (!db) return;
    const gRef = doc(db, 'protocol', 'global');
    await setDoc(gRef, {
      treasuryBalance: 3000000,
      rewardVaultBalance: 20000000,
      usdcVaultBalance: 0,
      stakedVaultBalance: 0,
      rewardCap: 300000,
      licenseLimit: 100,
      licensePrice: 5000,
      seedAmount: 15000000,
      adminWallet: '9Kqt28pfMVBsBvXYYnYQCT2BZyorAwzbR6dUmgQfsZYW',
      faucetExnLimit: 16000000,
      faucetUsdcLimit: 10000,
      exnPrice: 0.23,
      isPaused: false,
      lastCrankedEpoch: 0,
      networkStartDate: Date.now(),
      settledEpochs: []
    });
  }, [db]);

  const state: ProtocolState = {
    treasuryBalance: globalData?.treasuryBalance ?? 0,
    rewardVaultBalance: globalData?.rewardVaultBalance ?? 0,
    usdcVaultBalance: globalData?.usdcVaultBalance ?? 0,
    stakedVaultBalance: globalData?.stakedVaultBalance ?? 0,
    rewardCap: globalData?.rewardCap ?? 0,
    licenseLimit: globalData?.licenseLimit ?? 0,
    licensePrice: globalData?.licensePrice ?? 0,
    seedAmount: globalData?.seedAmount ?? 0,
    adminWallet: globalData?.adminWallet ?? '',
    faucetExnLimit: globalData?.faucetExnLimit ?? 0,
    faucetUsdcLimit: globalData?.faucetUsdcLimit ?? 0,
    exnPrice: globalData?.exnPrice ?? 0.23,
    isPaused: globalData?.isPaused ?? false,
    lastCrankedEpoch: globalData?.lastCrankedEpoch ?? 0,
    networkStartDate: globalData?.networkStartDate ?? Date.now(),
    validators: (validatorsData || []) as Validator[],
    userStakes: (stakesData || []) as any[],
    licenses: (licensesData || []) as any[],
    proposals: (proposalsData || []) as any[],
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
      resetProtocol,
      addStake,
      unstake,
      claimRewards,
      castVote,
      createProposal,
      executeProposal,
      crankEpoch,
      registerValidator,
      updateValidator,
      terminateValidator,
      toggleValidator,
      setState: () => {} 
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
