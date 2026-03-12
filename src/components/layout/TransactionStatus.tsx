
"use client";

import React, { useEffect, useState } from 'react';
import { ExternalLink, X, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
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

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (tx) {
      const timer = setTimeout(() => {
        setTx(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [tx]);

  if (!mounted || !tx) return null;

  const styles = {
    success: {
      bg: 'bg-primary/10',
      border: 'border-primary/40',
      text: 'text-primary',
      icon: CheckCircle2,
      glow: 'shadow-[0_0_30px_rgba(0,245,255,0.3)]'
    },
    error: {
      bg: 'bg-destructive/10',
      border: 'border-destructive/40',
      text: 'text-destructive',
      icon: AlertCircle,
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]'
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/40',
      text: 'text-amber-500',
      icon: HelpCircle,
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]'
    }
  };

  const current = (styles as any)[tx.status] || styles.success;
  const Icon = current.icon;

  return (
    <div className={`fixed bottom-28 right-10 z-[100] w-full max-w-sm animate-in slide-in-from-right-10 fade-in duration-500`}>
      <div className={`exn-card p-6 border ${current.bg} ${current.border} ${current.glow} backdrop-blur-2xl relative overflow-hidden group`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${tx.status === 'success' ? 'exn-gradient-bg' : tx.status === 'warning' ? 'bg-amber-500' : 'bg-destructive'}`} />
        
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-4">
            <div className={`p-2.5 rounded-xl bg-background/50 border ${current.border}`}>
              <Icon className={`w-5 h-5 ${current.text}`} />
            </div>
            <div className="space-y-1.5">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.25em] ${current.text}`}>
                Network {tx.status}
              </h4>
              <p className="text-sm text-foreground font-medium leading-relaxed">
                {tx.message}
              </p>
              {tx.status === 'success' && tx.txHash && (
                <div className="pt-3 flex items-center gap-4">
                  <a 
                    href={getExplorerLink(tx.txHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-all flex items-center gap-1.5"
                  >
                    View on Chain <ExternalLink className="w-3 h-3" />
                  </a>
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

        {/* Dynamic progress bar for auto-dismiss */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
           <div className={`h-full ${tx.status === 'success' ? 'bg-primary' : tx.status === 'warning' ? 'bg-amber-500' : 'bg-destructive'} animate-progress`} />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 8000ms linear forwards;
        }
      `}</style>
    </div>
  );
}
