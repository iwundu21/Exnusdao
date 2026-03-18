
"use client";

import React, { useState, createContext, useContext, useCallback, ReactNode, useEffect } from 'react';

/**
 * use-fake-wallet hook and provider
 * 
 * Provides a simulated wallet connection and signing interface
 * to bypass real Solana wallet requirements while maintaining
 * the technical protocol feel.
 */

interface FakeWalletContextType {
  connected: boolean;
  publicKey: { toBase58: () => string } | null;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  connect: () => void;
  disconnect: () => void;
  isConnecting: boolean;
}

const FakeWalletContext = createContext<FakeWalletContextType | null>(null);

const STORE_KEY = 'exnus_simulated_identity';

export function FakeWalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      setAddress(saved);
      setConnected(true);
    }
  }, []);

  const connect = useCallback(() => {
    setIsConnecting(true);
    setTimeout(() => {
      const newAddress = 'EXN' + Math.random().toString(36).substring(2, 15).toUpperCase();
      setAddress(newAddress);
      setConnected(true);
      setIsConnecting(false);
      localStorage.setItem(STORE_KEY, newAddress);
    }, 1500);
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    localStorage.removeItem(STORE_KEY);
  }, []);

  const signMessage = useCallback(async (message: Uint8Array) => {
    // Simulated cryptographic handshake delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return message;
  }, []);

  const publicKey = address ? { toBase58: () => address } : null;

  return (
    <FakeWalletContext.Provider value={{ connected, publicKey, signMessage, connect, disconnect, isConnecting }}>
      {children}
    </FakeWalletContext.Provider>
  );
}

export function useFakeWallet() {
  const context = useContext(FakeWalletContext);
  if (!context) throw new Error("useFakeWallet must be used within a FakeWalletProvider");
  return context;
}
