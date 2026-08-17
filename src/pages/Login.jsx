import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('magic'); // 'magic' | 'password' | 'signup'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setMessage('Check your inbox for the sign-in link.');
      } else if (mode === 'password') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/';
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setMessage('Account created. Check your inbox to confirm, then sign in.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif tracking-tight text-foreground">FitMe</h1>
          <p className="text-muted-foreground mt-2 text-sm">Your digital closet & style assistant</p>
        </div>

        <div className="bg-background border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>

            {mode !== 'magic' && (
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Password</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'magic' ? 'Send magic link' : mode === 'password' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {message && <p className="mt-4 text-sm text-success">{message}</p>}
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={handleGoogle} type="button">
            Continue with Google
          </Button>

          <div className="mt-6 text-center text-xs text-muted-foreground space-x-3">
            {mode !== 'magic' && (
              <button className="underline" onClick={() => setMode('magic')} type="button">Magic link</button>
            )}
            {mode !== 'password' && (
              <button className="underline" onClick={() => setMode('password')} type="button">Password sign-in</button>
            )}
            {mode !== 'signup' && (
              <button className="underline" onClick={() => setMode('signup')} type="button">Create account</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
