
"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, ShieldAlert, User, CheckCircle2, ChevronDown, ChevronUp, Landmark, Clock, ExternalLink, Zap, Info, ShieldCheck, Wallet } from 'lucide-react';
import { shortenAddress, getExplorerLink } from '@/lib/utils';

function ProposalCountdown({ deadline, votingEndsAt }: { deadline: number; votingEndsAt: number }) {
  const [timeLeft, setTimeLeft] = useState<{ label: string; value: string; colorClass: string }>({
    label: 'Syncing...',
    value: '',
    colorClass: 'text-muted-foreground'
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      
      // Phase 3: Concluded
      if (now > deadline) {
        setTimeLeft({ label: 'Proposal Concluded', value: '', colorClass: 'text-muted-foreground' });
        return true;
      }

      // Phase 2: Voting Locked (Last 24 hours)
      if (now > votingEndsAt) {
        const diff = Math.max(0, deadline - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const f = (n: number) => n.toString().padStart(2, '0');
        setTimeLeft({ 
          label: 'Voting Locked | Final Results In: ', 
          value: `${days}d ${f(hours)}h ${f(minutes)}m ${f(seconds)}s`,
          colorClass: 'text-destructive' 
        });
        return false;
      }

      // Phase 1: Voting Active (First 6 days)
      const diff = Math.max(0, votingEndsAt - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const f = (n: number) => n.toString().padStart(2, '0');
      setTimeLeft({ 
        label: 'Voting Ends In: ', 
        value: `${days}d ${f(hours)}h ${f(minutes)}m ${f(seconds)}s`,
        colorClass: 'text-emerald-500' 
      });
      return false;
    };

    updateCountdown();
    const timer = setInterval(() => {
      if (updateCountdown()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, votingEndsAt]);

  return (
    <div className={`flex items-center gap-2 text-[10px] uppercase font-black tracking-widest ${timeLeft.colorClass}`}>
      <Clock className="w-3 h-3" />
      <span>{timeLeft.label}</span>
      <span className="font-mono text-foreground">{timeLeft.value}</span>
    </div>
  );
}

export function GovernancePortal({ proposals = [], userStakeWeight = 0, isNodeOwner = false, walletAddress = '', onVote, onCreate, onExecute, setFeedback }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [newProp, setNewProp] = useState({ title: '', description: '', type: 0, amount: '', recipient: '' });
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [votingOn, setVotingOn] = useState<{ id: number; support: boolean } | null>(null);
  const [voteRationale, setVoteRationale] = useState('');

  const connected = !!walletAddress;

  const handleCreate = () => {
    if (!connected) return setFeedback('warning', 'Please connect your wallet to submit proposals.');
    if (userStakeWeight < 1000000) {
      return setFeedback('error', 'Stake Requirement Not Met: 1,000,000 EXN minimum weight required to propose network changes.');
    }

    onCreate({
      ...newProp,
      amount: Number(newProp.amount) || 0
    });
    
    setShowCreate(false);
    setNewProp({ title: '', description: '', type: 0, amount: '', recipient: '' });
  };

  const handleConfirmVote = () => {
    if (!connected) return setFeedback('warning', 'Please connect your wallet to participate in DAO consensus.');
    if (!votingOn) return;
    
    if (!isNodeOwner && userStakeWeight < 10000) {
      return setFeedback('error', 'Consensus Requirement: 10,000 EXN minimum weight required to participate in DAO consensus.');
    }
    
    if (!voteRationale.trim()) {
      return setFeedback('warning', 'Rationale Required: Please provide context for your consensus decision.');
    }
    onVote(votingOn.id, votingOn.support, voteRationale);
    setVotingOn(null);
    setVoteRationale('');
  };

  const isProposalDisabled = !newProp.title.trim() || !newProp.description.trim() || !connected || (newProp.type === 1 && (!newProp.recipient.trim() || !newProp.amount || Number(newProp.amount) <= 0));

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">DAO Governance</h2>
          <p className="text-muted-foreground text-sm">Direct stake-weighted voting. Outcomes determined by majority consensus over a 7-day window.</p>
        </div>
        <button 
          onClick={() => {
            if (!connected) return setFeedback('warning', 'Connect wallet to create a new proposal.');
            setShowCreate(!showCreate);
          }}
          className={`exn-button uppercase tracking-widest text-xs font-black ${!connected ? 'opacity-50' : ''}`}
        >
          {showCreate ? 'Close Form' : 'New Proposal'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-3">
             <User className="w-4 h-4 text-primary" />
             <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Combined Consensus Weight</p>
           </div>
           <div className="text-right">
             <p className="text-xl font-bold text-primary">{connected ? userStakeWeight.toLocaleString() : '0'} EXN</p>
             {connected && isNodeOwner && (
               <div className="flex items-center gap-1.5 justify-end text-[8px] text-emerald-500 font-black uppercase">
                 <ShieldCheck className="w-2.5 h-2.5" /> Includes 15M Seed Power
               </div>
             )}
           </div>
        </div>
        <div className="p-4 bg-foreground/5 border border-border rounded-xl flex items-center gap-4">
           <Info className="w-4 h-4 text-muted-foreground" />
           <p className="text-[10px] text-muted-foreground uppercase font-black leading-tight tracking-tight">
             7-DAY LIFECYCLE: 6 DAYS VOTING (EMERALD) <br/>
             FINAL 24H: VOTING LOCK & CONSENSUS FREEZE (RED)
           </p>
        </div>
      </div>

      {showCreate && connected && (
        <div className="exn-card p-8 border-secondary/40 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Landmark className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest">Submit Proposal (Fee: 10 EXN)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Proposal Title</label>
                 <input 
                   value={newProp.title}
                   onChange={e => setNewProp({...newProp, title: e.target.value})}
                   className="exn-input text-xs" 
                   placeholder="e.g. PIP-004: Network Expansion" 
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Proposal Category</label>
                 <select 
                   value={newProp.type}
                   onChange={e => setNewProp({...newProp, type: Number(e.target.value)})}
                   className="exn-input text-xs"
                 >
                   <option value={0}>Protocol Parameter Change</option>
                   <option value={1}>Treasury Distribution</option>
                 </select>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Rationale & Details</label>
              <textarea 
                value={newProp.description}
                onChange={e => setNewProp({...newProp, description: e.target.value})}
                className="exn-input h-[210px] text-xs py-4" 
                placeholder="Describe the change. Required combined weight: 1M EXN." 
              />
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button 
              onClick={handleCreate} 
              disabled={isProposalDisabled}
              className={`px-10 text-[10px] transition-all h-12 flex items-center justify-center font-black uppercase ${!isProposalDisabled ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
            >
              Broadcast (10 EXN Fee)
            </button>
            <button onClick={() => setShowCreate(false)} className="exn-button-outline px-10 text-[10px]">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {proposals.map((prop: any) => {
          const totalVotes = (prop.yes_votes || 0) + (prop.no_votes || 0);
          const yesPercent = totalVotes > 0 ? (prop.yes_votes / totalVotes) * 100 : 0;
          
          const now = Date.now();
          const isExpired = now > prop.deadline;
          const isVotingLocked = now > prop.voting_ends_at && !isExpired;
          const hasVoted = connected && prop.voters?.includes(walletAddress);
          const isVotingForThis = connected && votingOn?.id === prop.id;

          return (
            <div key={prop.id} className="exn-card p-0 border-border overflow-hidden">
              <div className="p-8 flex flex-col md:flex-row justify-between gap-8 border-b border-border">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${prop.type === 1 ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                      {prop.type === 1 ? 'Treasury' : 'Parameter'}
                    </span>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight uppercase">{prop.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{prop.description}</p>
                  
                  <div className="flex items-center gap-6 pt-2">
                    <ProposalCountdown deadline={prop.deadline} votingEndsAt={prop.voting_ends_at} />
                    {isVotingLocked && (
                      <div className="flex items-center gap-2 text-[10px] text-destructive uppercase font-black bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20 animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        Voting Locked
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-80 space-y-6 bg-foreground/5 p-6 rounded-2xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start text-[10px] font-black uppercase tracking-widest">
                        <span className="text-emerald-500">YES {yesPercent.toFixed(1)}%</span>
                        <span className="text-destructive">NO {(100 - yesPercent).toFixed(1)}%</span>
                    </div>
                    <Progress value={yesPercent} className="h-2 bg-destructive/20" />
                    <p className="text-[8px] text-muted-foreground uppercase font-bold text-center">Total Weight: {totalVotes.toLocaleString()} EXN</p>
                  </div>

                  {!isExpired && !isVotingLocked && !hasVoted && !isVotingForThis && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setVotingOn({ id: prop.id, support: true })} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold py-3 rounded-lg border border-emerald-500/20 text-[10px] uppercase">Vote Yes</button>
                      <button onClick={() => setVotingOn({ id: prop.id, support: false })} className="bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold py-3 rounded-lg border border-destructive/20 text-[10px] uppercase">Vote No</button>
                    </div>
                  )}

                  {isVotingForThis && (
                    <div className="space-y-4 animate-in zoom-in-95">
                      <textarea 
                        value={voteRationale}
                        onChange={e => setVoteRationale(e.target.value)}
                        placeholder="State your rationale... (3 EXN Fee)"
                        className="exn-input h-24 text-xs bg-background"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleConfirmVote} disabled={!voteRationale.trim()} className={`py-2 text-[10px] font-black uppercase ${voteRationale.trim() ? 'exn-button' : 'bg-foreground/5 text-muted-foreground cursor-not-allowed'}`}>Confirm</button>
                        <button onClick={() => setVotingOn(null)} className="exn-button-outline py-2 text-[10px]">Cancel</button>
                      </div>
                    </div>
                  )}

                  {isVotingLocked && !isExpired && (
                    <div className="py-3 bg-destructive/5 border border-destructive/20 rounded-lg text-center text-[10px] text-destructive uppercase font-black">
                      Consensus Freeze
                    </div>
                  )}

                  {isExpired && (
                    <button onClick={() => onExecute(prop.id)} disabled={prop.executed} className={`w-full h-12 uppercase text-[10px] font-black tracking-widest flex items-center justify-center gap-2 ${prop.executed ? 'bg-foreground/5 text-muted-foreground border border-border' : 'exn-button'}`}>
                      <Zap className="w-4 h-4 fill-current" /> {prop.executed ? 'Finalized' : 'Execute Action'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
