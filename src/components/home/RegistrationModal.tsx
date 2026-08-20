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
import styles from './RegistrationModal.module.css';

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
    <div className={styles.stepper} role="list" aria-label="Registration steps">
      {STEPS.map((step, i) => (
        <div key={step} className={styles.stepItem} role="listitem">
          <div className={styles.step}>
            <div
              className={clsx(
                styles.stepCircle,
                i < currentStep
                  ? styles.stepCircleComplete
                  : i === currentStep
                    ? styles.stepCircleActive
                    : undefined,
              )}
              aria-current={i === currentStep ? 'step' : undefined}
            >
              {i < currentStep ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span
              className={clsx(styles.stepName, i === currentStep && styles.stepNameActive)}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={clsx(
                styles.connector,
                i < currentStep && styles.connectorComplete,
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
    <div className={styles.formStep}>
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
      <div className={styles.trackField}>
        <label
          htmlFor="trackId"
          className={styles.fieldLabel}
        >
          Select Track
        </label>
        <select
          id="trackId"
          value={data.trackId}
          onChange={(e) => onChange('trackId', e.target.value)}
          aria-invalid={!!errors.trackId}
          className={clsx(styles.select, errors.trackId && styles.selectError)}
        >
          <option value="">— Choose your track —</option>
          {TRACKS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.trackId && (
          <p role="alert" className={styles.error}>
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
    <div className={styles.formStep}>
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
    <div className={styles.formStep}>
      <p className={styles.helper}>
        Add up to 3 additional team members (you are already set as leader).
      </p>

      {data.members.map((member, i) => (
        <div
          key={i}
          className={styles.memberCard}
          aria-label={`Team member ${i + 1}`}
        >
          <div className={styles.memberHeader}>
            <span className={styles.memberLabel}>
              Member {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemoveMember(i)}
              aria-label={`Remove member ${i + 1}`}
              className={styles.removeButton}
            >
              <Trash2 size={16} />
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
          className={styles.addMember}
          aria-label="Add another team member"
        >
          <Plus size={16} />
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
    <div className={styles.reviewStep}>
      <div className={styles.reviewCard}>
        <Row label="Team Name" value={data.teamName} />
        <Row label="Track" value={trackName} />
        <Row label="Leader" value={`${data.leaderName} (${data.leaderEmail})`} />
        {data.members.length > 0 && (
          <div className={styles.membersList}>
            <span className={styles.reviewLabel}>
              Members
            </span>
            {data.members.map((m, i) => (
              <span key={i} className={styles.memberValue}>
                {m.name} ({m.email})
              </span>
            ))}
          </div>
        )}
      </div>
      <p className={styles.consent}>
        By submitting, you agree to the ElevateX Code of Conduct.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>
        {label}
      </span>
      <span className={styles.reviewValue}>{value}</span>
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
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={styles.dialog}
      >
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2
              id="modal-title"
              className={styles.title}
            >
              Register Your Team
            </h2>
            <p className={styles.stepLabel}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close registration modal"
            className={styles.iconButton}
          >
            <X size={20} />
          </button>
        </div>

        <StepIndicator currentStep={step} />

        {/* Step Content */}
        <div className={styles.stepContent}>
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
        <div className={styles.footer}>
          {step > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              leftIcon={<ChevronLeft size={16} />}
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
              rightIcon={<ChevronRight size={16} />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={mutation.isPending}
              rightIcon={!mutation.isPending ? <CheckCircle size={16} /> : undefined}
            >
              {mutation.isPending ? 'Registering…' : 'Submit Registration'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
