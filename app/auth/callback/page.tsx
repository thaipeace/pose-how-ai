'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code:', error);
          }
        }

        // Check if session exists (whether via code exchange or implicit flow)
        // supabase-js automatically persists to localStorage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session) {
          console.log('Session established and stored in localStorage');
        } else if (sessionError) {
          console.error('Session error:', sessionError);
        }

      } catch (err) {
        console.error('Auth callback error:', err);
      } finally {
        // Always redirect to home after processing
        router.push('/');
      }
    };

    handleCallback();
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
