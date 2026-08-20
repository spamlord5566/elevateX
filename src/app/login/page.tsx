'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * Mock login handler.
 *
 * TODO: Replace with real NextAuth.js signIn() call:
 *   import { signIn } from 'next-auth/react';
 *   await signIn('credentials', { email, password, redirect: true, callbackUrl: '/dashboard' });
 */
async function mockLogin(payload: LoginForm): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  // Simulate a successful login for demo credentials
  if (payload.email === 'demo@elevatex.in' && payload.password === 'demo123') {
    return { success: true };
  }
  throw new Error('Invalid credentials. Try demo@elevatex.in / demo123');
}

/**
 * Login page — form with validation, password toggle, and mock auth.
 */
export default function LoginPage() {
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});

  const mutation = useMutation({
    mutationFn: mockLogin,
    onSuccess: () => {
      addToast('Welcome back! Redirecting to dashboard…', 'success');
      // TODO: router.push('/dashboard') after real auth
      setTimeout(() => window.location.assign('/dashboard'), 1500);
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });

  function handleChange(field: keyof LoginForm, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof LoginForm, string>> = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as keyof LoginForm] = issue.message;
      });
      setErrors(newErrors);
      return;
    }
    mutation.mutate(formData);
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-16 relative">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 70% 30%, rgba(212,240,0,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group"
            aria-label="Back to home"
          >
            <Zap
              className="w-6 h-6 text-[var(--color-brand-yellow)] group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
            <span
              className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ELEVATE
              <span style={{ color: 'var(--color-brand-yellow)' }}>X</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mt-6 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Sign in to your ElevateX account
          </p>
          <p className="text-xs text-[var(--color-brand-yellow)]/70 mt-1">
            Demo: demo@elevatex.in / demo123
          </p>
        </div>

        {/* Card */}
        <div className="glass-card border border-[var(--color-brand-yellow)]/20 p-8">
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Login form"
            className="flex flex-col gap-5"
          >
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            {/* Password with toggle */}
            <div className="relative">
              <Input
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 bottom-3 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <a
                href="#"
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  addToast('Password reset link has been sent (demo).', 'info');
                }}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={mutation.isPending}
              rightIcon={!mutation.isPending ? <ArrowRight className="w-4 h-4" /> : undefined}
              id="login-submit-btn"
            >
              {mutation.isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--color-glass-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-glass-border)]" />
          </div>

          <p className="text-center text-sm text-[var(--color-text-muted)]">
            New to ElevateX?{' '}
            <Link
              href="/#register"
              className="text-[var(--color-brand-yellow)] font-medium hover:underline"
            >
              Register your team
            </Link>
          </p>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
