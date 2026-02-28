"use client";

import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow flex flex-col items-center justify-center p-10">
        <div className="exn-card p-12 max-w-md w-full text-center space-y-8 border-primary/20">
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-full border border-destructive/20">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold uppercase tracking-tighter exn-gradient-text">404: Lost in Space</h1>
            <p className="text-muted-foreground text-sm uppercase font-black tracking-widest">The requested sector does not exist in the protocol.</p>
          </div>

          <Link 
            href="/" 
            className="exn-button w-full flex items-center justify-center gap-2 h-12"
          >
            <Home className="w-4 h-4" /> Return to Command Center
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
