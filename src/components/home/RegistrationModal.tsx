'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { X, ChevronRight, ChevronLeft, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { registerTeam, type RegistrationPayload } from '@/lib/api';
import clsx from 'clsx';

// ─── Validation Schemas ───────────────────────────────────

const step1Schema = z.object({
  teamName: z.string().min(2, 'Team name must be at least 2 characters'),
  trackId: z.string().min(1, 'Please select a track'),
});

const step2Schema = z.object({
  leaderName: z.string().min(2, 'Name must be at least 2 characters'),
  leaderEmail: z.string().email('Enter a valid email address'),
});

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
});

// ─── Types ────────────────────────────────────────────────

interface FormData {
  teamName: string;
  trackId: string;
  leaderName: string;
  leaderEmail: string;
  members: { name: string; email: string }[];
}

interface Errors {
  [key: string]: string;
}

const TRACKS = [
  { id: 'ai-ml', name: 'AI & Machine Learning' },
  { id: 'web3', name: 'Web3 & Blockchain' },
  { id: 'open-innovation', name: 'Open Innovation' },
  { id: 'sustainability', name: 'Sustainability & Climate Tech' },
  { id: 'fintech', name: 'FinTech & Payments' },
  { id: 'healthtech', name: 'Health & MedTech' },
];

const STEPS = ['Team Info', 'Leader', 'Members', 'Review'];

// ─── Step Indicators ──────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10" role="list" aria-label="Registration steps">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center" role="listitem">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                i < currentStep
                  ? 'bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)]'
                  : i === currentStep
                    ? 'bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)] ring-4 ring-[var(--color-brand-yellow)]/30'
                    : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]',
              )}
              aria-current={i === currentStep ? 'step' : undefined}
            >
              {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={clsx(
                'text-[10px] tracking-wide hidden sm:block',
                i === currentStep ? 'text-[var(--color-brand-yellow)]' : 'text-[var(--color-text-muted)]',
              )}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={clsx(
                'w-12 sm:w-16 h-px mx-2 transition-all duration-300 mb-4',
                i < currentStep
                  ? 'bg-[var(--color-brand-yellow)]'
                  : 'bg-[var(--color-surface-3)]',
              )}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Team Info ────────────────────────────────────

function Step1({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Errors;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Input
        id="teamName"
        label="Team Name"
        placeholder="e.g. Neural Nomads"
        value={data.teamName}
        onChange={(e) => onChange('teamName', e.target.value)}
        error={errors.teamName}
        autoFocus
        maxLength={50}
      />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="trackId"
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          Select Track
        </label>
        <select
          id="trackId"
          value={data.trackId}
          onChange={(e) => onChange('trackId', e.target.value)}
          aria-invalid={!!errors.trackId}
          className={clsx(
            'w-full px-4 py-3 rounded-xl text-sm',
            'bg-[var(--color-surface-2)] text-[var(--color-text-primary)]',
            'border transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent',
            errors.trackId
              ? 'border-red-500'
              : 'border-[var(--color-glass-border)]',
          )}
        >
          <option value="">— Choose your track —</option>
          {TRACKS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.trackId && (
          <p role="alert" className="text-xs text-red-400">
            ⚠ {errors.trackId}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Leader ───────────────────────────────────────

function Step2({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Errors;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Input
        id="leaderName"
        label="Team Leader Name"
        placeholder="Your full name"
        value={data.leaderName}
        onChange={(e) => onChange('leaderName', e.target.value)}
        error={errors.leaderName}
        autoFocus
      />
      <Input
        id="leaderEmail"
        label="Leader Email"
        type="email"
        placeholder="you@example.com"
        value={data.leaderEmail}
        onChange={(e) => onChange('leaderEmail', e.target.value)}
        error={errors.leaderEmail}
        hint="We'll send confirmation to this address."
      />
    </div>
  );
}

// ─── Step 3: Members ──────────────────────────────────────

function Step3({
  data,
  errors,
  onMemberChange,
  onAddMember,
  onRemoveMember,
}: {
  data: FormData;
  errors: Errors;
  onMemberChange: (index: number, field: 'name' | 'email', value: string) => void;
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-[var(--color-text-muted)]">
        Add up to 3 additional team members (you are already set as leader).
      </p>

      {data.members.map((member, i) => (
        <div
          key={i}
          className="glass-card p-5 sm:p-6 flex flex-col gap-5 relative"
          aria-label={`Team member ${i + 1}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-brand-yellow)] uppercase tracking-wide">
              Member {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemoveMember(i)}
              aria-label={`Remove member ${i + 1}`}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <Input
            id={`member-${i}-name`}
            label="Name"
            placeholder="Member full name"
            value={member.name}
            onChange={(e) => onMemberChange(i, 'name', e.target.value)}
            error={errors[`member_${i}_name`]}
          />
          <Input
            id={`member-${i}-email`}
            label="Email"
            type="email"
            placeholder="member@example.com"
            value={member.email}
            onChange={(e) => onMemberChange(i, 'email', e.target.value)}
            error={errors[`member_${i}_email`]}
          />
        </div>
      ))}

      {data.members.length < 3 && (
        <button
          type="button"
          onClick={onAddMember}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-[var(--color-glass-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-brand-yellow)]/50 hover:text-[var(--color-brand-yellow)] transition-all"
          aria-label="Add another team member"
        >
          <Plus className="w-4 h-4" />
          Add Member ({data.members.length}/3)
        </button>
      )}
    </div>
  );
}

// ─── Step 4: Review ───────────────────────────────────────

function Step4({ data }: { data: FormData }) {
  const trackName = TRACKS.find((t) => t.id === data.trackId)?.name ?? data.trackId;

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-6 flex flex-col gap-4">
        <Row label="Team Name" value={data.teamName} />
        <Row label="Track" value={trackName} />
        <Row label="Leader" value={`${data.leaderName} (${data.leaderEmail})`} />
        {data.members.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Members
            </span>
            {data.members.map((m, i) => (
              <span key={i} className="text-sm text-[var(--color-text-primary)]">
                {m.name} ({m.email})
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] text-center">
        By submitting, you agree to the ElevateX Code of Conduct.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({
  isOpen,
  onClose,
}: RegistrationModalProps) {
  const { addToast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<FormData>({
    teamName: '',
    trackId: '',
    leaderName: '',
    leaderEmail: '',
    members: [],
  });

  // Focus trap: when opened, focus the dialog
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  const mutation = useMutation({
    mutationFn: (payload: RegistrationPayload) => registerTeam(payload),
    onSuccess: (result) => {
      if (result.success) {
        addToast(
          `🎉 ${result.message} Team ID: ${result.teamId}`,
          'success',
          6000,
        );
        onClose();
        resetForm();
      } else {
        addToast(result.message, 'error');
      }
    },
    onError: () => {
      addToast('Registration failed. Please try again.', 'error');
    },
  });

  function resetForm() {
    setStep(0);
    setErrors({});
    setFormData({ teamName: '', trackId: '', leaderName: '', leaderEmail: '', members: [] });
  }

  function handleFieldChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function handleMemberChange(index: number, field: 'name' | 'email', value: string) {
    setFormData((prev) => {
      const members = [...prev.members];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
    });
    setErrors((prev) => ({ ...prev, [`member_${index}_${field}`]: '' }));
  }

  function handleAddMember() {
    if (formData.members.length < 3) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, { name: '', email: '' }],
      }));
    }
  }

  function handleRemoveMember(index: number) {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  }

  function validateStep(): boolean {
    const newErrors: Errors = {};

    if (step === 0) {
      const result = step1Schema.safeParse(formData);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          newErrors[issue.path[0] as string] = issue.message;
        });
      }
    } else if (step === 1) {
      const result = step2Schema.safeParse(formData);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          newErrors[issue.path[0] as string] = issue.message;
        });
      }
    } else if (step === 2) {
      formData.members.forEach((m, i) => {
        const result = memberSchema.safeParse(m);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            newErrors[`member_${i}_${issue.path[0] as string}`] = issue.message;
          });
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep()) setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
    setErrors({});
  }

  function handleSubmit() {
    if (!validateStep()) return;
    mutation.mutate({
      teamName: formData.teamName,
      leaderName: formData.leaderName,
      leaderEmail: formData.leaderEmail,
      trackId: formData.trackId,
      members: formData.members,
    });
  }

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-lg glass-card border border-[var(--color-brand-yellow)]/25 p-6 sm:p-8 max-h-[90dvh] overflow-y-auto focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Register Your Team
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close registration modal"
            className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] hover:bg-[var(--color-glass)] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <StepIndicator currentStep={step} />

        {/* Step Content */}
        <div className="flex-1">
          {step === 0 && (
            <Step1 data={formData} errors={errors} onChange={handleFieldChange} />
          )}
          {step === 1 && (
            <Step2 data={formData} errors={errors} onChange={handleFieldChange} />
          )}
          {step === 2 && (
            <Step3
              data={formData}
              errors={errors}
              onMemberChange={handleMemberChange}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          )}
          {step === 3 && <Step4 data={formData} />}
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-wrap items-center justify-between mt-10 gap-4">
          {step > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              disabled={mutation.isPending}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={mutation.isPending}
              rightIcon={!mutation.isPending ? <CheckCircle className="w-4 h-4" /> : undefined}
            >
              {mutation.isPending ? 'Registering…' : 'Submit Registration'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
