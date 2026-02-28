
"use client";

import React from 'react';
import { ExternalLink, X, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { getExplorerLink } from '@/lib/utils';

export function TransactionStatus() {
  const { state, clearFeedback } = useProtocolState();
  const tx = state.lastTransaction;

  if (!tx) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-500',
      icon: CheckCircle2
    },
    error: {
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      text: 'text-destructive',
      icon: AlertCircle
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      icon: HelpCircle
    }
  };

  const current = styles[tx.status];
  const Icon = current.icon;

  return (
    <div className={`fixed bottom-24 right-10 z-[60] w-full max-w-sm animate-in slide-in-from-right-10 duration-500`}>
      <div className={`exn-card p-6 border ${current.bg} ${current.border} shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-1 h-full exn-gradient-bg" />
        
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-4">
            <div className={`p-2 rounded-lg bg-background/50 border ${current.border}`}>
              <Icon className={`w-5 h-5 ${current.text}`} />
            </div>
            <div className="space-y-1">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${current.text}`}>
                Transaction {tx.status}
              </h4>
              <p className="text-sm text-foreground/80 leading-snug font-medium">
                {tx.message}
              </p>
              <div className="pt-3 flex items-center gap-4">
                <a 
                  href={getExplorerLink(tx.txHash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1.5"
                >
                  View on Chain <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          
          <button 
            onClick={clearFeedback}
            className="text-foreground/20 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
