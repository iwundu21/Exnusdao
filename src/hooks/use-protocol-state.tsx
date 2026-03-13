
"use client";

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { doc, setDoc, collection, deleteDoc, increment, arrayUnion } from 'firebase/firestore';
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
  setFeedback: (status: 'success' | 'error' | 'warning', message: string, txHash?: string) => void;
  clearFeedback: () => void;
  registerUser: (address: string) => void;
  exnBalance: number;
  usdcBalance: number;
  lastExnFaucetClaim: number;
  lastUsdcFaucetClaim: number;
  updateUserBalance: (address: string, exn: number, usdc: number) => void;
  claimFaucetAssets: (address: string, exn: number, usdc: number, type: 'exn' | 'usdc') => void;
  adminFundVault: (address: string, amount: number, vault: string) => void;
  adminWithdrawUsdc: (address: string, amount: number) => void;
  adminUpdateSettings: (settings: Partial<ProtocolState>) => void;
  mintLicense: (address: string, price: number, license: any) => void;
  resetProtocol: () => Promise<void>;
  
  addStake: (stake: any) => void;
  unstake: (stakeId: string, amount: number, validatorId: string) => void;
  claimRewards: (stakeId: string, amount: number, newCheckpoint: number, wallet: string) => void;
  castVote: (pId: number, support: boolean, weight: number, comment: any) => void;
  createProposal: (proposal: any) => void;
  executeProposal: (pId: number, passed: boolean, type: number, amount: number, recipient: string, wallet: string) => void;
  crankEpoch: (targetEpoch: number, totalPool: number, activeValidators: any[], totalWeight: number) => void;
  registerValidator: (validator: any, licenseId: string) => void;
  updateValidator: (vId: string, data: any) => void;
  terminateValidator: (vId: string, wallet: string, seedRefund: number, rewards: number, licenseId: string) => void;
  toggleValidator: (vId: string, status: boolean) => void;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

const ADMIN_WALLET_ADDRESS = '9Kqt28pfMVBsBvXYYnYQCT2BZyorAwzbR6dUmgQfsZYW';

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const db = useFirestore();
  const walletAddress = publicKey?.toBase58() || '';

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

  const isLoaded = !globalLoading && !valLoading && !stakesLoading && !propsLoading && !licLoading && !profileLoading;

  const setFeedback = useCallback((status: 'success' | 'error' | 'warning', message: string, txHash?: string) => {
    errorEmitter.emit('feedback', { status, message, txHash });
  }, []);

  const clearFeedback = useCallback(() => {
    errorEmitter.emit('feedback', null);
  }, []);

  const generateTxHash = () => `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;

  const registerUser = useCallback((address: string) => {
    if (!address || !db) return;
    const ref = doc(db, 'users', address);
    setDoc(ref, {
      address,
      lastActive: Date.now()
    }, { merge: true }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'write' }));
    });
  }, [db]);

  const updateUserBalance = useCallback((address: string, exn: number, usdc: number) => {
    if (!address || !db) return;
    const ref = doc(db, 'users', address);
    setDoc(ref, {
      exnBalance: increment(exn),
      usdcBalance: increment(usdc),
      lastActive: Date.now()
    }, { merge: true }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'write' }));
    });
  }, [db]);

  const claimFaucetAssets = useCallback((address: string, exn: number, usdc: number, type: 'exn' | 'usdc') => {
    if (!address || !db) return;
    setFeedback('warning', 'Processing claim request... (6s simulation)');
    
    setTimeout(() => {
      const ref = doc(db, 'users', address);
      const timestampField = type === 'exn' ? 'lastExnFaucetClaim' : 'lastUsdcFaucetClaim';
      const hash = generateTxHash();
      
      setDoc(ref, {
        exnBalance: increment(exn),
        usdcBalance: increment(usdc),
        [timestampField]: Date.now(),
        lastActive: Date.now()
      }, { merge: true }).then(() => {
        setFeedback('success', `${type.toUpperCase()} assets deposited successfully.`, hash);
      }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: ref.path, 
          operation: 'write'
        }));
      });
    }, 6000);
  }, [db, setFeedback]);

  const adminFundVault = useCallback((address: string, amount: number, vault: string) => {
    if (!address || !db) return;
    const gRef = doc(db, 'protocol', 'global');
    const uRef = doc(db, 'users', address);
    setDoc(gRef, { [vault]: increment(amount) }, { merge: true });
    setDoc(uRef, { exnBalance: increment(-amount) }, { merge: true });
  }, [db]);

  const adminWithdrawUsdc = useCallback((address: string, amount: number) => {
    if (!address || !db) return;
    const gRef = doc(db, 'protocol', 'global');
    const uRef = doc(db, 'users', address);
    setDoc(gRef, { usdcVaultBalance: increment(-amount) }, { merge: true });
    setDoc(uRef, { usdcBalance: increment(amount) }, { merge: true });
  }, [db]);

  const adminUpdateSettings = useCallback((settings: Partial<ProtocolState>) => {
    if (!db) return;
    const gRef = doc(db, 'protocol', 'global');
    setDoc(gRef, settings, { merge: true }).then(() => {
      setFeedback('success', 'Global network parameters updated in cloud ledger.');
    }).catch(err => {
      setFeedback('error', 'Failed to update global protocol settings.');
    });
  }, [db, setFeedback]);

  const mintLicense = useCallback((address: string, price: number, license: any) => {
    if (!address || !db) return;
    setFeedback('warning', 'Minting XNode License NFT... (6s simulation)');
    
    setTimeout(() => {
      const lRef = doc(db, 'licenses', license.id);
      const uRef = doc(db, 'users', address);
      const gRef = doc(db, 'protocol', 'global');
      const hash = generateTxHash();
      
      setDoc(lRef, license);
      setDoc(uRef, { usdcBalance: increment(-price) }, { merge: true });
      setDoc(gRef, { usdcVaultBalance: increment(price) }, { merge: true });
      setFeedback('success', `XNode License ${license.id} minted successfully.`, hash);
    }, 6000);
  }, [db, setFeedback]);

  const addStake = useCallback((stake: any) => {
    if (!db) return;
    setFeedback('warning', 'Executing on-chain stake... (6s simulation)');
    
    setTimeout(() => {
      const sRef = doc(collection(db, 'stakes'));
      const gRef = doc(db, 'protocol', 'global');
      const vRef = doc(db, 'validators', stake.validator_id);
      const hash = generateTxHash();
      
      setDoc(sRef, { ...stake, id: sRef.id });
      setDoc(gRef, { stakedVaultBalance: increment(stake.amount) }, { merge: true });
      setDoc(vRef, { total_staked: increment(stake.amount) }, { merge: true });
      setFeedback('success', `${stake.amount.toLocaleString()} EXN successfully locked.`, hash);
    }, 6000);
  }, [db, setFeedback]);

  const unstake = useCallback((stakeId: string, amount: number, validatorId: string) => {
    if (!db) return;
    setFeedback('warning', 'Processing unstake request... (6s simulation)');
    
    setTimeout(() => {
      const sRef = doc(db, 'stakes', stakeId);
      const gRef = doc(db, 'protocol', 'global');
      const vRef = doc(db, 'validators', validatorId);
      const hash = generateTxHash();
      
      setDoc(sRef, { unstaked: true }, { merge: true });
      setDoc(gRef, { stakedVaultBalance: increment(-amount) }, { merge: true });
      setDoc(vRef, { total_staked: increment(-amount) }, { merge: true });
      setFeedback('success', 'Principal returned to wallet.', hash);
    }, 6000);
  }, [db, setFeedback]);

  const claimRewards = useCallback((stakeId: string, amount: number, newCheckpoint: number, wallet: string) => {
    if (!db) return;
    setFeedback('warning', 'Harvesting yield... (6s simulation)');
    
    setTimeout(() => {
      const sRef = doc(db, 'stakes', stakeId);
      const hash = generateTxHash();
      setDoc(sRef, { reward_checkpoint: newCheckpoint }, { merge: true });
      updateUserBalance(wallet, amount, 0);
      setFeedback('success', 'Rewards successfully harvested.', hash);
    }, 6000);
  }, [db, updateUserBalance, setFeedback]);

  const castVote = useCallback((pId: number, support: boolean, weight: number, comment: any) => {
    if (!db || !walletAddress) return;
    setFeedback('warning', 'Recording consensus decision... (6s simulation)');
    
    setTimeout(() => {
      const pRef = doc(db, 'proposals', pId.toString());
      const gRef = doc(db, 'protocol', 'global');
      const hash = generateTxHash();
      
      setDoc(pRef, {
        yes_votes: increment(support ? weight : 0),
        no_votes: increment(!support ? weight : 0),
        comments: arrayUnion(comment),
        voters: arrayUnion(walletAddress)
      }, { merge: true });
      setDoc(gRef, { treasuryBalance: increment(3) }, { merge: true });
      setFeedback('success', 'Vote recorded on-chain.', hash);
    }, 6000);
  }, [db, walletAddress, setFeedback]);

  const createProposal = useCallback((proposal: any) => {
    if (!db) return;
    setFeedback('warning', 'Broadcasting proposal to network... (6s simulation)');
    
    setTimeout(() => {
      const pRef = doc(db, 'proposals', proposal.id.toString());
      const gRef = doc(db, 'protocol', 'global');
      const hash = generateTxHash();
      
      setDoc(pRef, proposal);
      setDoc(gRef, { treasuryBalance: increment(10) }, { merge: true });
      setFeedback('success', 'Proposal broadcast successfully.', hash);
    }, 6000);
  }, [db, setFeedback]);

  const executeProposal = useCallback((pId: number, passed: boolean, type: number, amount: number, recipient: string, wallet: string) => {
    if (!db) return;
    setFeedback('warning', 'Enacting DAO consensus... (6s simulation)');
    
    setTimeout(() => {
      const pRef = doc(db, 'proposals', pId.toString());
      const gRef = doc(db, 'protocol', 'global');
      const hash = generateTxHash();
      
      setDoc(pRef, { executed: true }, { merge: true });
      if (passed && type === 1) {
        setDoc(gRef, { treasuryBalance: increment(-amount) }, { merge: true });
        if (recipient === wallet) updateUserBalance(wallet, amount, 0);
      }
      setFeedback('success', 'Proposal execution complete.', hash);
    }, 6000);
  }, [db, updateUserBalance, setFeedback]);

  const crankEpoch = useCallback((targetEpoch: number, totalPool: number, activeValidators: any[], totalWeight: number) => {
    if (!db) return;
    setFeedback('warning', 'Settling epoch rewards... (6s simulation)');
    
    setTimeout(() => {
      const gRef = doc(db, 'protocol', 'global');
      const hash = generateTxHash();
      setDoc(gRef, {
        lastCrankedEpoch: targetEpoch,
        rewardVaultBalance: increment(-totalPool)
      }, { merge: true });
      setFeedback('success', `Epoch ${targetEpoch} successfully settled.`, hash);
    }, 6000);
  }, [db, setFeedback]);

  const registerValidator = useCallback((validator: any, licenseId: string) => {
    if (!db) return;
    setFeedback('warning', 'Provisioning XNode sector... (6s simulation)');
    
    setTimeout(() => {
      const vRef = doc(db, 'validators', validator.id);
      const lRef = doc(db, 'licenses', licenseId);
      const hash = generateTxHash();
      
      setDoc(vRef, validator).then(() => {
        setDoc(lRef, { is_claimed: true }, { merge: true });
        setFeedback('success', 'XNode identity registered.', hash);
      }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: vRef.path, operation: 'create' }));
      });
    }, 6000);
  }, [db, setFeedback]);

  const updateValidator = useCallback((vId: string, data: any) => {
    if (!db) return;
    setFeedback('warning', 'Propagating identity updates... (6s simulation)');
    
    setTimeout(() => {
      const vRef = doc(db, 'validators', vId);
      const hash = generateTxHash();
      setDoc(vRef, data, { merge: true }).then(() => {
        setFeedback('success', 'Identity metadata synchronized.', hash);
      }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: vRef.path, operation: 'update' }));
      });
    }, 6000);
  }, [db, setFeedback]);

  const terminateValidator = useCallback((vId: string, wallet: string, seedRefund: number, rewards: number, licenseId: string) => {
    if (!db) return;
    setFeedback('warning', 'Decommissioning XNode identity... (6s simulation)');
    
    setTimeout(() => {
      const vRef = doc(db, 'validators', vId);
      const lRef = doc(db, 'licenses', licenseId);
      const hash = generateTxHash();
      
      deleteDoc(vRef).then(() => {
        setDoc(lRef, { is_burned: true, is_claimed: false }, { merge: true });
        updateUserBalance(wallet, seedRefund + rewards, 0);
        setFeedback('success', 'Registration terminated and license burned.', hash);
      }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: vRef.path, operation: 'delete' }));
      });
    }, 6000);
  }, [db, updateUserBalance, setFeedback]);

  const toggleValidator = useCallback((vId: string, status: boolean) => {
    if (!db) return;
    const vRef = doc(db, 'validators', vId);
    setDoc(vRef, { is_active: status }, { merge: true }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: vRef.path, operation: 'update' }));
    });
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
      adminWallet: ADMIN_WALLET_ADDRESS,
      faucetExnLimit: 16000000,
      faucetUsdcLimit: 10000,
      exnPrice: 0.23,
      isPaused: false,
      lastCrankedEpoch: 0,
      networkStartDate: Date.now(),
      settledEpochs: []
    }, { merge: true });
  }, [db]);

  const state: ProtocolState = {
    treasuryBalance: globalData?.treasuryBalance ?? 0,
    rewardVaultBalance: globalData?.rewardVaultBalance ?? 0,
    usdcVaultBalance: globalData?.usdcVaultBalance ?? 0,
    stakedVaultBalance: globalData?.stakedVaultBalance ?? 0,
    rewardCap: globalData?.rewardCap ?? 0,
    licenseLimit: globalData?.licenseLimit ?? 0,
    licensePrice: globalData?.licensePrice ?? 0,
    seedAmount: globalData?.seedAmount ?? 15000000,
    adminWallet: globalData?.adminWallet || ADMIN_WALLET_ADDRESS,
    faucetExnLimit: globalData?.faucetExnLimit ?? 16000000,
    faucetUsdcLimit: globalData?.faucetUsdcLimit ?? 10000,
    exnPrice: globalData?.exnPrice ?? 0.23,
    isPaused: globalData?.isPaused ?? false,
    lastCrankedEpoch: globalData?.lastCrankedEpoch ?? 0,
    networkStartDate: globalData?.networkStartDate ?? 0,
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
      claimFaucetAssets,
      adminFundVault,
      adminWithdrawUsdc,
      adminUpdateSettings,
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
      toggleValidator
    }}>
      {children}
    </ProtocolContext.Provider>
  );
}

export function useProtocolState() {
  const context = useContext(ProtocolContext);
  if (!context) throw new Error("useProtocolState must be used within a FirebaseProvider");
  return context;
}
