'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * FirebaseErrorListener component
 * 
 * Listens for contextual FirestorePermissionErrors emitted by the SDK
 * and surfaces them to the UI as destructive toasts for debugging.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Handle both standard FirebaseErrors and our contextual FirestorePermissionError
      const isContextual = error instanceof FirestorePermissionError;
      
      console.error('Firebase Operation Failed:', error);
      
      toast({
        variant: 'destructive',
        title: isContextual ? 'Security Rule Violation' : 'Database Error',
        description: isContextual 
          ? `Operation "${error.context.operation}" denied at ${error.context.path}.`
          : (error.message || 'Missing or insufficient permissions.'),
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}