'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import styles from './Login.module.css';

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
    <main className={styles.main}>
      {/* Background glow */}
      <div
        aria-hidden="true"
        className={styles.background}
      />

      <div className={styles.content}>
        {/* Brand */}
        <div className={styles.brandBlock}>
          <Link
            href="/"
            className={styles.brandLink}
            aria-label="Back to home"
          >
            <Zap
              className={styles.brandIcon}
              aria-hidden="true"
            />
            <span
              className={styles.brand}
            >
              ELEVATE
              <span className={styles.wordmarkX}>X</span>
            </span>
          </Link>
          <h1 className={styles.heading}>
            Welcome Back
          </h1>
          <p className={styles.subtitle}>
            Sign in to your ElevateX account
          </p>
          <p className={styles.demo}>
            Demo: demo@elevatex.in / demo123
          </p>
        </div>

        {/* Card */}
        <div className={`glass-card ${styles.card}`}>
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Login form"
            className={styles.form}
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
            <div className={styles.passwordField}>
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
                className={styles.passwordToggle}
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>

            {/* Forgot password */}
            <div className={styles.forgot}>
              <a
                href="#"
                className={styles.link}
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
              className={styles.fullWidth}
              isLoading={mutation.isPending}
              rightIcon={!mutation.isPending ? <ArrowRight size={16} /> : undefined}
              id="login-submit-btn"
            >
              {mutation.isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerLabel}>or</span>
            <div className={styles.dividerLine} />
          </div>

          <p className={styles.registerPrompt}>
            New to ElevateX?{' '}
            <Link
              href="/#register"
              className={styles.registerLink}
            >
              Register your team
            </Link>
          </p>
        </div>

        {/* Back */}
        <div className={styles.backBlock}>
          <Link
            href="/"
            className={styles.back}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
