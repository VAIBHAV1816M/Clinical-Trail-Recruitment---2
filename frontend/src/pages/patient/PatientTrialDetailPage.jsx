import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  Sparkles,
  Heart,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MatchScoreBadge } from '../../components/common/MatchScoreBadge';
import { StatusBadge } from '../../components/common/StatusBadge';

export function PatientTrialDetailPage({ trialId, onBack, setActiveTab }) {
  const { trials, patients, currentPatientId, enrollments, acceptInvite, showToast } = useApp();
  const [interestSubmitted, setInterestSubmitted] = useState(false);

  const trial = trials.find(t => t.trial_id === trialId) || trials[0];
  const patient = patients.find(p => p.patient_id === currentPatientId) || patients[0];
  
  const existingEnrollment = enrollments.find(e => e.trial_id === trial.trial_id && e.patient_id === patient.patient_id);

  const handleExpressInterest = () => {
    setInterestSubmitted(true);
    showToast('Interest Recorded', `The clinical research team for ${trial.trial_name} has received your inquiry.`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Back Button */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={onBack}
        style={{ width: 'fit-content', color: 'var(--slate-600)' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Recommended Trials</span>
      </button>

      {/* Trial Header */}
      <div
        className="card"
        style={{
          padding: '2rem',
          borderLeft: '5px solid #059669',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 700, color: '#0284c7' }}>
              Study ID: {trial.trial_id}
            </span>
            <StatusBadge status={trial.status} size="sm" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {trial.trial_name}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--slate-600)', marginTop: 6, lineHeight: 1.6 }}>
            {trial.description}
          </p>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', textAlign: 'center', minWidth: 160 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
            Your Match Score
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-mono)' }}>
            94%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
            Highly Qualified
          </div>
        </div>
      </div>

      {/* What You Can Expect in this Study */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
            What to Expect During the Study
          </h3>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <Calendar size={22} color="#0284c7" />
            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--slate-900)', marginTop: 8 }}>
              Study Duration
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: 4 }}>
              24 weeks total duration with 6 scheduled on-site clinic visits.
            </p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <Heart size={22} color="#059669" />
            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--slate-900)', marginTop: 8 }}>
              Medical Care & Testing
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: 4 }}>
              All study-related lab tests, monitoring, and study medication provided at no cost.
            </p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <Building size={22} color="#d97706" />
            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--slate-900)', marginTop: 8 }}>
              Compensation & Travel
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: 4 }}>
              Travel reimbursement provided for each completed clinical evaluation visit.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer Card */}
      <div
        className="card"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
            Interested in participating?
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--slate-600)' }}>
            Expressing interest sends your profile to the principal investigator for formal screening.
          </div>
        </div>

        {existingEnrollment?.status === 'INVITED' ? (
          <button
            className="btn btn-success btn-lg"
            onClick={() => {
              acceptInvite(trial.trial_id, patient.patient_id);
              if (setActiveTab) setActiveTab('enrollment');
            }}
          >
            <CheckCircle2 size={18} />
            <span>Accept Official Invitation</span>
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleExpressInterest}
            disabled={interestSubmitted}
          >
            {interestSubmitted ? (
              <>
                <CheckCircle2 size={18} />
                <span>Interest Registered</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Express Interest to Study Team</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
