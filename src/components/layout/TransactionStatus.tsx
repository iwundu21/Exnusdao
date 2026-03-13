
"use client";

import React, { useEffect, useState } from 'react';
import { ExternalLink, X, CheckCircle2, AlertCircle, HelpCircle, Cpu, Zap, Activity, Loader2, ShieldCheck } from 'lucide-react';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { getExplorerLink } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';

export function TransactionStatus() {
  const { clearFeedback } = useProtocolState();
  const [tx, setTx] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleFeedback = (feedback: any) => {
      setTx(feedback);
    };

    errorEmitter.on('feedback', handleFeedback);
    return () => {
      errorEmitter.off('feedback', handleFeedback);
    };
  }, []);

  // Auto-dismiss after 8 seconds (covers the 6s delay + 2s success view)
  useEffect(() => {
    if (tx && tx.status !== 'warning') {
      const timer = setTimeout(() => {
        setTx(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [tx]);

  if (!mounted || !tx) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      text: 'text-emerald-500',
      icon: CheckCircle2,
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
      label: 'NETWORK_CONFIRMED'
    },
    error: {
      bg: 'bg-destructive/10',
      border: 'border-destructive/40',
      text: 'text-destructive',
      icon: AlertCircle,
      glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]',
      label: 'TRANSACTION_REJECTED'
    },
    warning: {
      bg: 'bg-primary/10',
      border: 'border-primary/40',
      text: 'text-primary',
      icon: Cpu,
      glow: 'shadow-[0_0_40px_rgba(0,245,255,0.25)]',
      label: 'BROADCASTING_TO_NETWORK'
    }
  };

  const current = (styles as any)[tx.status] || styles.success;
  const Icon = current.icon;

  return (
    <div className={`fixed bottom-28 right-6 lg:right-10 z-[100] w-full max-w-sm animate-in slide-in-from-right-10 fade-in duration-500`}>
      <div className={`exn-card p-6 border ${current.bg} ${current.border} ${current.glow} backdrop-blur-3xl relative overflow-hidden group`}>
        {/* Dynamic scan line for "Processing" state */}
        {tx.status === 'warning' && (
          <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/5 to-primary/0 h-10 w-full animate-scan pointer-events-none" />
        )}
        
        <div className={`absolute top-0 left-0 w-1 h-full ${tx.status === 'success' ? 'bg-emerald-500' : tx.status === 'warning' ? 'bg-primary' : 'bg-destructive'}`} />
        
        <div className="flex justify-between items-start gap-4 relative z-10">
          <div className="flex gap-4">
            <div className={`p-3 rounded-xl bg-background/80 border ${current.border} relative overflow-hidden`}>
              {tx.status === 'warning' ? (
                <Loader2 className={`w-5 h-5 ${current.text} animate-spin`} />
              ) : (
                <Icon className={`w-5 h-5 ${current.text}`} />
              )}
              {tx.status === 'warning' && (
                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className={`text-[9px] font-black uppercase tracking-[0.3em] ${current.text} font-mono`}>
                  {current.label}
                </h4>
                {tx.status === 'warning' && (
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/90 font-bold leading-relaxed uppercase tracking-tight">
                {tx.message}
              </p>
              
              {tx.status === 'success' && tx.txHash && (
                <div className="pt-2 flex items-center gap-4">
                  <a 
                    href={getExplorerLink(tx.txHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-all flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/20 rounded-md"
                  >
                    View on Solana Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {tx.status === 'warning' && (
                <div className="flex items-center gap-2 text-[8px] text-primary/40 uppercase font-black tracking-widest">
                   <ShieldCheck className="w-3 h-3" />
                   <span>Verifying Block State...</span>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setTx(null)}
            className="text-foreground/20 hover:text-foreground transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Technical progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
           <div className={`h-full ${tx.status === 'success' ? 'bg-emerald-500' : tx.status === 'warning' ? 'bg-primary' : 'bg-destructive'} ${tx.status === 'warning' ? 'animate-progress-6s' : 'animate-progress-fast'}`} />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress-6s {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes progress-fast {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
        .animate-progress-6s {
          animation: progress-6s 6000ms linear forwards;
        }
        .animate-progress-fast {
          animation: progress-fast 6000ms linear forwards;
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
