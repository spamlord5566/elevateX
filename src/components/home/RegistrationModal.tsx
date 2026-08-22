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
import { X, ChevronRight, ChevronLeft, CheckCircle, Plus, Trash2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { fetchRegistrationFee, registerTeam, type RegistrationPayload } from '@/lib/api';
import clsx from 'clsx';
import styles from './RegistrationModal.module.css';

const phoneRegex = /^[0-9+\s()-]{8,20}$/;

const step1Schema = z.object({
  teamName: z.string().min(2, 'Team name must be at least 2 characters'),
  trackId: z.string().min(1, 'Please select a track'),
});

const step2Schema = z.object({
  leaderName: z.string().min(2, 'Name must be at least 2 characters'),
  leaderEmail: z.string().email('Enter a valid email address'),
  leaderPhone: z.string().min(8, 'Phone number must be at least 8 digits').regex(phoneRegex, 'Enter a valid phone number'),
});

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').regex(phoneRegex, 'Enter a valid phone number'),
});

interface FormData {
  teamName: string;
  trackId: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: { name: string; email: string; phone: string }[];
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

const STEPS = ['Team Details', 'Leader', 'Participants', 'Payment & Review'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className={styles.stepper} role="list" aria-label="Registration steps">
      {STEPS.map((step, i) => (
        <div key={step} className={styles.stepItem} role="listitem">
          <div className={styles.step}>
            <div
              className={clsx(
                styles.stepCircle,
                i < currentStep ? styles.stepCircleComplete : i === currentStep ? styles.stepCircleActive : undefined,
              )}
              aria-current={i === currentStep ? 'step' : undefined}
            >
              {i < currentStep ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span className={clsx(styles.stepName, i === currentStep && styles.stepNameActive)}>{step}</span>
          </div>
          {i < STEPS.length - 1 && <div className={clsx(styles.connector, i < currentStep && styles.connectorComplete)} aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

function Step1({ data, errors, onChange }: { data: FormData; errors: Errors; onChange: (field: keyof FormData, value: string) => void; }) {
  return ( 
    <div className={styles.formStep}>
      <Input id="teamName" label="Team Name" placeholder="e.g. Neural Nomads" value={data.teamName} onChange={(e) => onChange('teamName', e.target.value)} error={errors.teamName} autoFocus maxLength={50} />
      <div className={styles.trackField}>
        <label htmlFor="trackId" className={styles.fieldLabel}>Select Track</label>
        <select id="trackId" value={data.trackId} onChange={(e) => onChange('trackId', e.target.value)} aria-invalid={!!errors.trackId} className={clsx(styles.select, errors.trackId && styles.selectError)}>
          <option value="">— Choose your track —</option>
          {TRACKS.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {errors.trackId && <p role="alert" className={styles.error}>⚠ {errors.trackId}</p>}
      </div>
    </div>
  );
}

function Step2({ data, errors, onChange }: { data: FormData; errors: Errors; onChange: (field: keyof FormData, value: string) => void; }) {
  return (
    <div className={styles.formStep}>
      <Input id="leaderName" label="Team Leader Name" placeholder="Your full name" value={data.leaderName} onChange={(e) => onChange('leaderName', e.target.value)} error={errors.leaderName} autoFocus />
      <Input id="leaderEmail" label="Leader Email" type="email" placeholder="you@example.com" value={data.leaderEmail} onChange={(e) => onChange('leaderEmail', e.target.value)} error={errors.leaderEmail} />
      <Input id="leaderPhone" label="Leader Phone Number" type="tel" placeholder="+91 98765 43210" value={data.leaderPhone} onChange={(e) => onChange('leaderPhone', e.target.value)} error={errors.leaderPhone} />
    </div>
  );
}

function Step3({
  data,
  errors,
  onMemberChange,
  onAddMember,
  onRemoveMember,
}: {
  data: FormData;
  errors: Errors;
  onMemberChange: (index: number, field: 'name' | 'email' | 'phone', value: string) => void;
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
}) {
  return (
    <div className={styles.formStep}>
      <p className={styles.helper}>A team may have 1 to 4 participants total. The team leader is included in this count.</p>
      {data.members.map((member, i) => (
        <div key={i} className={styles.memberCard} aria-label={`Participant ${i + 2}`}>
          <div className={styles.memberHeader}>
            <span className={styles.memberLabel}>Participant {i + 2}</span>
            <button type="button" onClick={() => onRemoveMember(i)} aria-label={`Remove participant ${i + 2}`} className={styles.removeButton}><Trash2 size={16} /></button>
          </div>
          <Input id={`member-${i}-name`} label="Name" placeholder="Participant full name" value={member.name} onChange={(e) => onMemberChange(i, 'name', e.target.value)} error={errors[`member_${i}_name`]} />
          <Input id={`member-${i}-email`} label="Email" type="email" placeholder="participant@example.com" value={member.email} onChange={(e) => onMemberChange(i, 'email', e.target.value)} error={errors[`member_${i}_email`]} />
          <Input id={`member-${i}-phone`} label="Phone Number" type="tel" placeholder="+91 98765 43210" value={member.phone} onChange={(e) => onMemberChange(i, 'phone', e.target.value)} error={errors[`member_${i}_phone`]} />
        </div>
      ))}
      {data.members.length < 3 && (
        <button type="button" onClick={onAddMember} className={styles.addMember} aria-label="Add another participant">
          <Plus size={16} /> Add Participant ({data.members.length}/3)
        </button>
      )}
    </div>
  );
}

function Step4({
  data,
  feePerParticipant,
  paymentFile,
  onFileChange,
  onSubmit,
  isSubmitting,
  isDisabled,
  errors,
}: {
  data: FormData;
  feePerParticipant: number;
  paymentFile: File | null;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
  errors: Errors;
}) {
  const totalParticipants = data.members.length + 1;
  const totalFee = totalParticipants * feePerParticipant;

  return (
    <div className={styles.reviewStep}>
      <div className={styles.paymentSummary}>
        <div className={styles.summaryRow}>
          <span>Registration Fee</span>
          <strong>₹{feePerParticipant} × {totalParticipants} participants</strong>
        </div>
        <div className={styles.summaryRowTotal}>
          <span>Total Amount Payable</span>
          <strong>₹{totalFee}</strong>
        </div>
      </div>

      <div className={styles.qrBlock}>
        <p className={styles.qrTitle}>Payment</p>
        <p className={styles.helper}>Scan the QR code below using Google Pay and complete the payment.</p>
        <img src="/images/gpay-qr.jpg" alt="Google Pay QR code" className={styles.qrImage} />
      </div>

      <div className={styles.uploadBlock}>
        <label htmlFor="paymentScreenshot" className={styles.fieldLabel}>Upload Payment Screenshot</label>
        <input id="paymentScreenshot" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} className={styles.fileInput} />
        {paymentFile ? <p className={styles.fileName}>{paymentFile.name}</p> : <p className={styles.helper}>A payment screenshot is required before submission.</p>}
        {errors.paymentScreenshot && <p role="alert" className={styles.error}>⚠ {errors.paymentScreenshot}</p>}
      </div>

      <div className={styles.reviewCard}>
        <Row label="Team Name" value={data.teamName} />
        <Row label="Track" value={TRACKS.find((t) => t.id === data.trackId)?.name ?? data.trackId} />
        <Row label="Leader" value={`${data.leaderName} (${data.leaderEmail})`} />
        <Row label="Leader Phone" value={data.leaderPhone} />
        {data.members.length > 0 && (
          <div className={styles.membersList}>
            <span className={styles.reviewLabel}>Participants</span>
            {data.members.map((m, i) => (
              <span key={i} className={styles.memberValue}>{m.name} ({m.email}) — {m.phone}</span>
            ))}
          </div>
        )}
      </div>

      <Button variant="primary" size="sm" onClick={onSubmit} isLoading={isSubmitting} disabled={isDisabled} rightIcon={!isSubmitting ? <CheckCircle size={16} /> : undefined}>
        {isSubmitting ? 'Registering…' : 'Submit Registration'}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={styles.reviewValue}>{value}</span>
    </div>
  );
}

interface RegistrationModalProps { isOpen: boolean; onClose: () => void; }

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const { addToast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [feePerParticipant, setFeePerParticipant] = useState(0);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRegistration, setSubmittedRegistration] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    teamName: '',
    trackId: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    members: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchRegistrationFee().then((fee) => setFeePerParticipant(Number(fee) || 0)).catch(() => setFeePerParticipant(0));
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: () => registerTeam({
      teamName: formData.teamName,
      trackId: formData.trackId,
      leaderName: formData.leaderName,
      leaderEmail: formData.leaderEmail,
      leaderPhone: formData.leaderPhone,
      members: formData.members,
    }, paymentFile),
    onSuccess: (result) => {
      if (result.success) {
        setSubmittedRegistration(result.registration || { teamId: result.teamId, verificationStatus: 'Pending Verification' });
        setIsSubmitted(true);
        addToast(result.message || 'Registration submitted successfully.', 'success', 6000);
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
    setPaymentFile(null);
    setSubmittedRegistration(null);
    setIsSubmitted(false);
    setFormData({ teamName: '', trackId: '', leaderName: '', leaderEmail: '', leaderPhone: '', members: [] });
  }

  function handleFieldChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function handleMemberChange(index: number, field: 'name' | 'email' | 'phone', value: string) {
    setFormData((prev) => {
      const members = [...prev.members];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
    });
    setErrors((prev) => ({ ...prev, [`member_${index}_${field}`]: '' }));
  }

  function handleAddMember() {
    if (formData.members.length < 3) {
      setFormData((prev) => ({ ...prev, members: [...prev.members, { name: '', email: '', phone: '' }] }));
    }
  }

  function handleRemoveMember(index: number) {
    setFormData((prev) => ({ ...prev, members: prev.members.filter((_, i) => i !== index) }));
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
    } else if (step === 3) {
      if (!paymentFile) {
        newErrors.paymentScreenshot = 'A payment screenshot is required.';
      }
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
    mutation.mutate();
  }

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} onKeyDown={handleKeyDown} className={styles.dialog}>
        {!isSubmitted ? (
          <>
            <div className={styles.header}>
              <div>
                <h2 id="modal-title" className={styles.title}>Register Your Team</h2>
                <p className={styles.stepLabel}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
              </div>
              <button onClick={onClose} aria-label="Close registration modal" className={styles.iconButton}><X size={20} /></button>
            </div>

            <StepIndicator currentStep={step} />

            <div className={styles.stepContent}>
              {step === 0 && <Step1 data={formData} errors={errors} onChange={handleFieldChange} />}
              {step === 1 && <Step2 data={formData} errors={errors} onChange={handleFieldChange} />}
              {step === 2 && <Step3 data={formData} errors={errors} onMemberChange={handleMemberChange} onAddMember={handleAddMember} onRemoveMember={handleRemoveMember} />}
              {step === 3 && <Step4 data={formData} feePerParticipant={feePerParticipant} paymentFile={paymentFile} onFileChange={setPaymentFile} onSubmit={handleSubmit} isSubmitting={mutation.isPending} isDisabled={mutation.isPending} errors={errors} />}
            </div>

            <div className={styles.footer}>
              {step > 0 ? (
                <Button variant="ghost" size="sm" onClick={handleBack} leftIcon={<ChevronLeft size={16} />} disabled={mutation.isPending}>Back</Button>
              ) : (
                <div />
              )}
              {step < STEPS.length - 1 ? (
                <Button variant="primary" size="sm" onClick={handleNext} rightIcon={<ChevronRight size={16} />}>Continue</Button>
              ) : (
                <div />
              )}
            </div>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.successIcon}><CheckCircle size={36} /></div>
            <h2 className={styles.successTitle}>Registration over. Verification pending. You may exit.</h2>
            <div className={styles.successCard}>
              <p><strong>Team Name:</strong> {formData.teamName}</p>
              <p><strong>Registration ID:</strong> {submittedRegistration?.teamId || '—'}</p>
              <p><strong>Participants:</strong> {formData.members.length + 1}</p>
              <p><strong>Registration Amount:</strong> ₹{(formData.members.length + 1) * feePerParticipant}</p>
              <p><strong>Status:</strong> Pending Verification</p>
            </div>
            <Button variant="primary" onClick={() => { resetForm(); onClose(); }}>Close</Button>
          </div>
        )}
      </div>
    </div>
  );
}
