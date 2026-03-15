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
  migrateStake: (stakeId: string, amount: number, oldValidatorId: string, newValidatorId: string) => void;
  claimRewards: (stakeId: string, amount: number, newCheckpoint: number, wallet: string) => void;
  castVote: (pId: number, support: boolean, weight: number, comment: any) => void;
  createProposal: (proposal: any) => void;
  executeProposal: (pId: number, passed: boolean, type: number, amount: number, recipient: string, executorWallet: string) => void;
  crankEpoch: (targetEpoch: number, totalPool: number, activeValidators: any[], totalWeight: number) => void;
  registerValidator: (validator: any, licenseId: string) => void;
  updateValidator: (vId: string, data: any) => void;
  terminateValidator: (vId: string, wallet: string, seedRefund: number, rewards: number, licenseId: string) => void;
  toggleValidator: (vId: string, status: boolean) => void;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

const ADMIN_WALLET_ADDRESS = '9Kqt28pfMVBsBvXYYnYQCT2BZyorAwzbR6dUmgQfsZYW';
const SIMULATED_DELAY = 6000;

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, connected } = useWallet();
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

  const signAction = useCallback(async (intent: string) => {
    if (!connected || !publicKey || !signMessage) {
      setFeedback('error', 'WALLET_AUTH_REQUIRED_FOR_SIGNATURE');
      throw new Error('Wallet not ready or signature function missing.');
    }
    try {
      setFeedback('warning', 'WAITING_FOR_WALLET_SIGNATURE...');
      const messageText = `EXNUS_PROTOCOL_INTENT: ${intent}\nTIMESTAMP: ${Date.now()}\nWALLET: ${walletAddress}\nNETWORK: SOLANA_MAINNET`;
      const encodedMessage = new TextEncoder().encode(messageText);
      await signMessage(encodedMessage);
      return true;
    } catch (e: any) {
      setFeedback('error', e.message || 'SIGNATURE_REJECTED_BY_USER.');
      throw e;
    }
  }, [connected, publicKey, signMessage, walletAddress, setFeedback]);

  const registerUser = useCallback((address: string) => {
    if (!address || !db) return;
    const ref = doc(db, 'users', address);
    setDoc(ref, { address, lastActive: Date.now() }, { merge: true });
  }, [db]);

  const updateUserBalance = useCallback((address: string, exn: number, usdc: number) => {
    if (!address || !db) return;
    const ref = doc(db, 'users', address);
    setDoc(ref, {
      exnBalance: increment(exn),
      usdcBalance: increment(usdc),
      lastActive: Date.now()
    }, { merge: true });
  }, [db]);

  const claimFaucetAssets = useCallback(async (address: string, exn: number, usdc: number, type: 'exn' | 'usdc') => {
    if (!address || !db) return;
    try {
      await signAction(`CLAIM_FAUCET_${type.toUpperCase()}_ASSETS`);
      setFeedback('warning', `BROADCASTING ${type.toUpperCase()} ASSET DROP...`);
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
          setFeedback('success', `${type.toUpperCase()} ASSETS CONFIRMED.`, hash);
        });
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const adminFundVault = useCallback(async (address: string, amount: number, vault: string) => {
    if (!address || !db) return;
    try {
      await signAction(`ADMIN_FUND_VAULT_${vault}_AMT_${amount}`);
      const gRef = doc(db, 'protocol', 'global');
      const uRef = doc(db, 'users', address);
      setDoc(gRef, { [vault]: increment(amount) }, { merge: true });
      setDoc(uRef, { exnBalance: increment(-amount) }, { merge: true });
      setFeedback('success', 'VAULT CAPITAL INJECTED.');
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const adminWithdrawUsdc = useCallback(async (address: string, amount: number) => {
    if (!address || !db) return;
    try {
      await signAction(`ADMIN_WITHDRAW_USDC_AMT_${amount}`);
      const gRef = doc(db, 'protocol', 'global');
      const uRef = doc(db, 'users', address);
      setDoc(gRef, { usdcVaultBalance: increment(-amount) }, { merge: true });
      setDoc(uRef, { usdcBalance: increment(amount) }, { merge: true });
      setFeedback('success', 'USDC WITHDRAWAL COMPLETE.');
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const adminUpdateSettings = useCallback(async (settings: Partial<ProtocolState>) => {
    if (!db) return;
    try {
      await signAction(`ADMIN_UPDATE_PROTOCOL_SETTINGS`);
      const gRef = doc(db, 'protocol', 'global');
      setDoc(gRef, settings, { merge: true }).then(() => {
        setFeedback('success', 'PROTOCOL SETTINGS SYNCHRONIZED.');
      });
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const mintLicense = useCallback(async (address: string, price: number, license: any) => {
    if (!address || !db) return;
    try {
      await signAction(`MINT_XNODE_LICENSE_${license.id}`);
      setFeedback('warning', 'PROVISIONING XNODE LICENSE NFT...');
      setTimeout(() => {
        const lRef = doc(db, 'licenses', license.id);
        const uRef = doc(db, 'users', address);
        const gRef = doc(db, 'protocol', 'global');
        const hash = generateTxHash();
        setDoc(lRef, license);
        setDoc(uRef, { usdcBalance: increment(-price) }, { merge: true });
        setDoc(gRef, { usdcVaultBalance: increment(price) }, { merge: true });
        setFeedback('success', `LICENSE ${license.id} MINTED.`, hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const addStake = useCallback(async (stake: any) => {
    if (!db) return;
    try {
      await signAction(`STAKE_${stake.amount}_EXN_TO_${stake.validator_id}`);
      setFeedback('warning', 'ESTABLISHING STAKING LOCK...');
      setTimeout(() => {
        const sRef = doc(collection(db, 'stakes'));
        const gRef = doc(db, 'protocol', 'global');
        const vRef = doc(db, 'validators', stake.validator_id);
        const hash = generateTxHash();
        setDoc(sRef, { ...stake, id: sRef.id });
        setDoc(gRef, { stakedVaultBalance: increment(stake.amount) }, { merge: true });
        setDoc(vRef, { total_staked: increment(stake.amount) }, { merge: true });
        setFeedback('success', `${stake.amount.toLocaleString()} EXN COMMITTED.`, hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const unstake = useCallback(async (stakeId: string, amount: number, validatorId: string) => {
    if (!db) return;
    try {
      await signAction(`UNSTAKE_${amount}_EXN_FROM_${validatorId}`);
      setFeedback('warning', 'EXECUTING PRINCIPAL WITHDRAWAL...');
      setTimeout(() => {
        const sRef = doc(db, 'stakes', stakeId);
        const gRef = doc(db, 'protocol', 'global');
        const vRef = doc(db, 'validators', validatorId);
        const hash = generateTxHash();
        setDoc(sRef, { unstaked: true }, { merge: true });
        setDoc(gRef, { stakedVaultBalance: increment(-amount) }, { merge: true });
        setDoc(vRef, { total_staked: increment(-amount) }, { merge: true });
        setFeedback('success', 'PRINCIPAL RETURNED TO WALLET.', hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const migrateStake = useCallback(async (stakeId: string, amount: number, oldValidatorId: string, newValidatorId: string) => {
    if (!db) return;
    try {
      await signAction(`MIGRATE_STAKE_${amount}_EXN_TO_${newValidatorId}`);
      setFeedback('warning', 'EXECUTING SECTOR MIGRATION...');
      setTimeout(() => {
        const sRef = doc(db, 'stakes', stakeId);
        const oldVRef = doc(db, 'validators', oldValidatorId);
        const newVRef = doc(db, 'validators', newValidatorId);
        const hash = generateTxHash();
        setDoc(sRef, { validator_id: newValidatorId, reward_checkpoint: 0 }, { merge: true });
        setDoc(oldVRef, { total_staked: increment(-amount) }, { merge: true });
        setDoc(newVRef, { total_staked: increment(amount) }, { merge: true });
        setFeedback('success', 'STAKE MIGRATED TO NEW SECTOR.', hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const claimRewards = useCallback(async (stakeId: string, amount: number, newCheckpoint: number, wallet: string) => {
    if (!db) return;
    try {
      await signAction(`CLAIM_REWARDS_AMT_${amount}`);
      setFeedback('warning', 'HARVESTING ACCRUED YIELD...');
      setTimeout(() => {
        const sRef = doc(db, 'stakes', stakeId);
        const hash = generateTxHash();
        setDoc(sRef, { reward_checkpoint: newCheckpoint }, { merge: true });
        updateUserBalance(wallet, amount, 0);
        setFeedback('success', 'REWARDS DEPOSITED.', hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, updateUserBalance, signAction, setFeedback]);

  const castVote = useCallback(async (pId: number, support: boolean, weight: number, comment: any) => {
    if (!db || !walletAddress) return;
    try {
      await signAction(`CAST_VOTE_${support ? 'YES' : 'NO'}_PROPOSAL_${pId}`);
      setFeedback('warning', 'ESTABLISHING CONSENSUS DECISION...');
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
        setFeedback('success', 'CONSENSUS VOTE RECORDED.', hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, walletAddress, signAction, setFeedback]);

  const createProposal = useCallback(async (proposal: any) => {
    if (!db) return;
    try {
      await signAction(`CREATE_DAO_PROPOSAL_${proposal.title}`);
      setFeedback('warning', 'BROADCASTING PROPOSAL TO NETWORK...');
      setTimeout(() => {
        const pRef = doc(db, 'proposals', proposal.id.toString());
        const gRef = doc(db, 'protocol', 'global');
        const hash = generateTxHash();
        setDoc(pRef, proposal);
        setDoc(gRef, { treasuryBalance: increment(10) }, { merge: true });
        setFeedback('success', 'PROPOSAL BROADCAST SUCCESSFUL.', hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const executeProposal = useCallback(async (pId: number, passed: boolean, type: number, amount: number, recipient: string, executorWallet: string) => {
    if (!db) return;
    try {
      await signAction(`EXECUTE_PROPOSAL_${pId}_STATUS_${passed ? 'PASSED' : 'REJECTED'}`);
      setFeedback('warning', 'ENACTING DAO CONSENSUS...');
      setTimeout(async () => {
        const pRef = doc(db, 'proposals', pId.toString());
        const gRef = doc(db, 'protocol', 'global');
        const hash = generateTxHash();
        
        await setDoc(pRef, { executed: true, passed }, { merge: true });
        
        if (passed && type === 1 && amount > 0 && recipient) {
          const rRef = doc(db, 'users', recipient);
          await setDoc(gRef, { treasuryBalance: increment(-amount) }, { merge: true });
          await setDoc(rRef, { exnBalance: increment(amount) }, { merge: true });
        }
        
        setFeedback('success', passed ? 'PROPOSAL ENACTED & ASSETS SHIFTED.' : 'PROPOSAL REJECTED & FINALIZED.', hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const crankEpoch = useCallback(async (targetEpoch: number, totalPool: number) => {
    if (!db) return;
    try {
      await signAction(`CRANK_NETWORK_EPOCH_${targetEpoch}`);
      setFeedback('warning', 'SETTLING EPOCH REWARDS...');
      setTimeout(() => {
        const gRef = doc(db, 'protocol', 'global');
        const hash = generateTxHash();
        setDoc(gRef, {
          lastCrankedEpoch: targetEpoch,
          rewardVaultBalance: increment(-totalPool)
        }, { merge: true });
        setFeedback('success', `EPOCH ${targetEpoch} SETTLED.`, hash);
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const registerValidator = useCallback(async (validator: any, licenseId: string) => {
    if (!db) return;
    try {
      await signAction(`REGISTER_VALIDATOR_${validator.name}`);
      setFeedback('warning', 'PROVISIONING XNODE SECTOR...');
      setTimeout(() => {
        const vRef = doc(db, 'validators', validator.id);
        const lRef = doc(db, 'licenses', licenseId);
        const hash = generateTxHash();
        setDoc(vRef, validator).then(() => {
          setDoc(lRef, { is_claimed: true }, { merge: true });
          setFeedback('success', 'XNODE IDENTITY REGISTERED.', hash);
        });
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const updateValidator = useCallback(async (vId: string, data: any) => {
    if (!db) return;
    try {
      await signAction(`UPDATE_VALIDATOR_IDENTITY_${vId}`);
      setFeedback('warning', 'PROPAGATING IDENTITY UPDATES...');
      setTimeout(() => {
        const vRef = doc(db, 'validators', vId);
        const hash = generateTxHash();
        setDoc(vRef, data, { merge: true }).then(() => {
          setFeedback('success', 'IDENTITY SYNCHRONIZED.', hash);
        });
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

  const terminateValidator = useCallback(async (vId: string, wallet: string, seedRefund: number, rewards: number, licenseId: string) => {
    if (!db) return;
    try {
      await signAction(`TERMINATE_VALIDATOR_REGISTRATION_${vId}`);
      setFeedback('warning', 'DECOMMISSIONING XNODE IDENTITY...');
      setTimeout(() => {
        const vRef = doc(db, 'validators', vId);
        const lRef = doc(db, 'licenses', licenseId);
        const hash = generateTxHash();
        deleteDoc(vRef).then(() => {
          setDoc(lRef, { is_burned: true, is_claimed: false }, { merge: true });
          updateUserBalance(wallet, seedRefund + rewards, 0);
          setFeedback('success', 'REGISTRATION TERMINATED.', hash);
        });
      }, SIMULATED_DELAY);
    } catch (e) { console.error(e); }
  }, [db, updateUserBalance, signAction, setFeedback]);

  const toggleValidator = useCallback((vId: string, status: boolean) => {
    if (!db) return;
    const vRef = doc(db, 'validators', vId);
    setDoc(vRef, { is_active: status }, { merge: true });
  }, [db]);

  const resetProtocol = useCallback(async () => {
    if (!db) return;
    try {
      await signAction('RESET_PROTOCOL_STATE');
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
      setFeedback('success', 'PROTOCOL RESET SUCCESSFUL.');
    } catch (e) { console.error(e); }
  }, [db, signAction, setFeedback]);

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
      state, isLoaded, setFeedback, clearFeedback, registerUser,
      exnBalance: userProfile?.exnBalance ?? 0,
      usdcBalance: userProfile?.usdcBalance ?? 0,
      lastExnFaucetClaim: userProfile?.lastExnFaucetClaim ?? 0,
      lastUsdcFaucetClaim: userProfile?.lastUsdcFaucetClaim ?? 0,
      updateUserBalance, claimFaucetAssets, adminFundVault, adminWithdrawUsdc,
      adminUpdateSettings, mintLicense, resetProtocol, addStake, unstake,
      migrateStake, claimRewards, castVote, createProposal, executeProposal,
      crankEpoch, registerValidator, updateValidator, terminateValidator, toggleValidator
    }}>
      {children}
    </ProtocolContext.Provider>
  );
}

export function useProtocolState() {
  const context = useContext(ProtocolContext);
  if (!context) throw new Error("useProtocolState error");
  return context;
}
