import React, { useState } from 'react';
import {
  Menu,
  FlaskConical,
  User,
  ArrowRightLeft,
  ChevronDown,
  Bell,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Header({ onToggleSidebar, activeTabTitle = 'Overview' }) {
  const {
    trials,
    selectedTrialId,
    setSelectedTrialId,
    currentRole,
    setCurrentRole,
    patients,
    currentPatientId,
    setCurrentPatientId,
    notifications,
    showToast
  } = useApp();

  const [isTrialMenuOpen, setIsTrialMenuOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  const selectedTrial = trials.find(t => t.trial_id === selectedTrialId) || trials[0];
  const activePatient = patients.find(p => p.patient_id === currentPatientId) || patients[0];

  const handleRoleSwitch = (newRole) => {
    setCurrentRole(newRole);
    setIsPersonaMenuOpen(false);
    showToast('Role Switched', `Active view switched to ${newRole === 'RESEARCHER' ? 'Researcher Workspace' : 'Patient Experience'}.`, 'info');
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn-ghost"
          onClick={onToggleSidebar}
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-md)' }}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            {activeTabTitle}
          </h2>

          {/* Active Trial Context Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsTrialMenuOpen(!isTrialMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                cursor: 'pointer'
              }}
            >
              <FlaskConical size={14} color="#0284c7" />
              <span style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedTrial?.trial_id}: {selectedTrial?.trial_name}
              </span>
              <ChevronDown size={14} />
            </button>

            {isTrialMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: 320,
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 50,
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                  Select Active Study
                </div>
                {trials.map(t => (
                  <div
                    key={t.trial_id}
                    onClick={() => {
                      setSelectedTrialId(t.trial_id);
                      setIsTrialMenuOpen(false);
                      showToast('Context Changed', `Active trial focused on ${t.trial_id}.`, 'info');
                    }}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: t.trial_id === selectedTrialId ? 'var(--primary-50)' : 'transparent',
                      color: t.trial_id === selectedTrialId ? 'var(--primary-700)' : 'var(--slate-800)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: t.trial_id === selectedTrialId ? 600 : 500
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.trial_id}: {t.trial_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                        Target: {t.target_recruitment} • {t.criteria?.length || 0} Criteria
                      </div>
                    </div>
                    {t.trial_id === selectedTrialId && <Check size={16} color="#0284c7" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions & Persona Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role & Persona Switcher Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            className="role-switcher-badge"
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
          >
            <ArrowRightLeft size={14} />
            <span>Workspace: <strong>{currentRole}</strong></span>
            <ChevronDown size={12} />
          </button>

          {isPersonaMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 300,
                background: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', padding: '0.2rem 0.5rem' }}>
                Switch User Experience
              </div>

              <div
                onClick={() => handleRoleSwitch('RESEARCHER')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: currentRole === 'RESEARCHER' ? 'var(--primary-50)' : 'var(--bg-subtle)',
                  border: `1px solid ${currentRole === 'RESEARCHER' ? 'var(--primary-200)' : 'transparent'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                    Researcher Workspace
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Full PI operations, AI criteria, screening & enrollment
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleRoleSwitch('PATIENT')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: currentRole === 'PATIENT' ? '#f0fdf4' : 'var(--bg-subtle)',
                  border: `1px solid ${currentRole === 'PATIENT' ? '#bbf7d0' : 'transparent'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                    Patient Portal
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    View recommendations, accept invitations & track status
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', padding: '0.2rem 0.5rem' }}>
                  Select Demo Patient Persona
                </div>
                {patients.slice(0, 4).map(p => (
                  <div
                    key={p.patient_id}
                    onClick={() => {
                      setCurrentPatientId(p.patient_id);
                      if (currentRole !== 'PATIENT') {
                        setCurrentRole('PATIENT');
                      }
                      setIsPersonaMenuOpen(false);
                      showToast('Persona Changed', `Logged in as patient ${p.name} (${p.patient_id}).`, 'info');
                    }}
                    style={{
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: p.patient_id === currentPatientId ? 'var(--primary-50)' : 'transparent',
                      color: p.patient_id === currentPatientId ? 'var(--primary-700)' : 'var(--slate-700)'
                    }}
                  >
                    <span>{p.name} ({p.patient_id})</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{p.gender}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
