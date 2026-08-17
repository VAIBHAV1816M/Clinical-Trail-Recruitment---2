import React from 'react';
import {
  UserCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Building,
  FileText,
  Clock,
  Inbox
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export function MyEnrollmentPage({ setActiveTab }) {
  const { patients, currentPatientId, enrollments, trials } = useApp();

  const patient = patients.find(p => p.patient_id === currentPatientId) || patients[0];
  const activeEnrollment = enrollments.find(e => e.patient_id === patient.patient_id && (e.status === 'ENROLLED' || e.status === 'ACCEPTED'));
  const trial = activeEnrollment ? trials.find(t => t.trial_id === activeEnrollment.trial_id) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-900)' }}>
          My Active Study Journey
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--slate-500)' }}>
          Track your milestone progress, clinic visits, study coordinator contacts, and research materials.
        </p>
      </div>

      {activeEnrollment && trial ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Study Overview Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              borderLeft: '5px solid #059669',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>
                    {trial.trial_id}
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: 4, background: '#ecfdf5', color: '#065f46' }}>
                    ACTIVE PARTICIPANT
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--slate-900)' }}>
                  {trial.trial_name}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginTop: 4 }}>
                  {trial.description}
                </p>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Enrolled on: <strong>{formatDate(activeEnrollment.enrolled_at || activeEnrollment.accepted_at)}</strong>
              </div>
            </div>

            {/* Milestones Tracker */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
                Study Milestones & Progress
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', position: 'relative' }}>
                {[
                  { step: '1', title: 'Invitation Accepted', date: formatDate(activeEnrollment.accepted_at), done: true },
                  { step: '2', title: 'Baseline Screening', date: formatDate(activeEnrollment.enrolled_at || activeEnrollment.accepted_at), done: true },
                  { step: '3', title: 'Study Visit 1 (Week 4)', date: 'Scheduled Sept 10', done: false },
                  { step: '4', title: 'Mid-Point Evaluation', date: 'Upcoming Oct 24', done: false }
                ].map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: m.done ? '#059669' : '#ffffff',
                          color: m.done ? '#ffffff' : 'var(--slate-600)',
                          border: `2px solid ${m.done ? '#059669' : 'var(--slate-300)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.78rem'
                        }}
                      >
                        {m.done ? <CheckCircle2 size={16} /> : m.step}
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: m.done ? '#065f46' : 'var(--slate-700)' }}>
                        {m.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', paddingLeft: '2.1rem' }}>
                      {m.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coordinator Contact Card */}
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                  Study Team & Coordinator
                </h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>Dr. Rachel Miller, MD</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Principal Investigator</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-600)' }}>
                  <Phone size={15} color="#0284c7" />
                  <span>Clinical Hotline: +1 (555) 019-2831</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-600)' }}>
                  <Mail size={15} color="#0284c7" />
                  <span>Email: trials-support@aegistrial.org</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                  Clinical Site Location
                </h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.86rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                  Boston Medical Research Center
                </div>
                <div style={{ color: 'var(--slate-600)' }}>
                  85 East Concord Street, Suite 400<br />
                  Boston, MA 02118
                </div>
                <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
                  ✓ Validated parking & transit reimbursement provided
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--bg-subtle)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>
            <Inbox size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-800)' }}>No Active Study Enrollment</h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: 4, maxWidth: 440, margin: '4px auto 1.25rem' }}>
            You are not currently enrolled in an active trial. Check out your recommended studies to find relevant opportunities.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveTab('recommended')}>
            <span>Explore Recommended Trials</span>
          </button>
        </div>
      )}
    </div>
  );
}
