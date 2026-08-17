import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Building,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage({ onBrowseRoles }) {
  const { login, register, authError, setAuthError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('RESEARCHER'); // 'RESEARCHER' | 'PATIENT'

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [designation, setDesignation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setLocalError(res.error);
        }
      } else {
        if (!name.trim()) {
          setLocalError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        const payload = {
          email: email.trim(),
          password,
          role,
          name: name.trim(),
          organization: organization.trim() || null,
          designation: designation.trim() || null
        };
        const res = await register(payload);
        if (!res.success) {
          setLocalError(res.error);
        }
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (targetRole) => {
    setLocalError(null);
    setAuthError(null);
    setMode('login');
    if (targetRole === 'RESEARCHER') {
      setEmail('researcher@example.com');
      setPassword('Researcher@123');
    } else {
      setEmail('patient@example.com');
      setPassword('Patient@123');
    }
  };

  const handleQuickLogin = async (targetRole) => {
    setLocalError(null);
    setAuthError(null);
    setIsSubmitting(true);
    const targetEmail = targetRole === 'RESEARCHER' ? 'researcher@example.com' : 'patient@example.com';
    const targetPassword = targetRole === 'RESEARCHER' ? 'Researcher@123' : 'Patient@123';
    
    setEmail(targetEmail);
    setPassword(targetPassword);

    try {
      const res = await login(targetEmail, targetPassword);
      if (!res.success) {
        setLocalError(res.error);
      }
    } catch (err) {
      setLocalError(err.message || 'Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentError = localError || authError;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #075985 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        color: '#ffffff',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)'
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-xl, 16px)',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(2, 132, 199, 0.5)'
            }}
          >
            <Activity size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              AegisTrial
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '4px 0 0 0' }}>
              Secure Clinical Trial Recruitment & Screening Platform
            </p>
          </div>
        </div>

        {/* Quick Demo Logins Box */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
              1-Click Demo Evaluation
            </span>
            <Sparkles size={14} color="#38bdf8" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('RESEARCHER')}
              disabled={isSubmitting}
              style={{
                background: 'rgba(2, 132, 199, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '0.6rem 0.75rem',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(2, 132, 199, 0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(2, 132, 199, 0.2)'}
            >
              <ShieldCheck size={18} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Researcher</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Dr. Rachel Miller</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('PATIENT')}
              disabled={isSubmitting}
              style={{
                background: 'rgba(5, 150, 105, 0.2)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '0.6rem 0.75rem',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(5, 150, 105, 0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(5, 150, 105, 0.2)'}
            >
              <User size={18} color="#34d399" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Patient Portal</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Participant View</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-xl, 16px)',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.35)'
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '0.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setLocalError(null); }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: 'none',
                background: mode === 'login' ? '#0284c7' : 'transparent',
                color: mode === 'login' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setLocalError(null); }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: 'none',
                background: mode === 'register' ? '#0284c7' : 'transparent',
                color: mode === 'register' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Register
            </button>
          </div>

          {/* Role selector on Register */}
          {mode === 'register' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Select Your Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('RESEARCHER')}
                  style={{
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: `1px solid ${role === 'RESEARCHER' ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)'}`,
                    background: role === 'RESEARCHER' ? 'rgba(2, 132, 199, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ShieldCheck size={16} color={role === 'RESEARCHER' ? '#38bdf8' : '#94a3b8'} />
                  <span>Researcher</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('PATIENT')}
                  style={{
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: `1px solid ${role === 'PATIENT' ? '#34d399' : 'rgba(255, 255, 255, 0.15)'}`,
                    background: role === 'PATIENT' ? 'rgba(5, 150, 105, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <User size={16} color={role === 'PATIENT' ? '#34d399' : '#94a3b8'} />
                  <span>Patient</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {currentError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '0.75rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                color: '#fca5a5',
                fontSize: '0.82rem'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{currentError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder={role === 'RESEARCHER' ? 'Dr. Sarah Jenkins' : 'Alice Johnson'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-md, 8px)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {mode === 'register' && role === 'RESEARCHER' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                    Organization
                  </label>
                  <input
                    type="text"
                    placeholder="Mayo Clinic / Johns Hopkins"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-md, 8px)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="Principal Investigator"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-md, 8px)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius-md, 8px)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius-md, 8px)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                background: '#0284c7',
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 16px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.15s ease',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <span>{isSubmitting ? 'Authenticating...' : (mode === 'login' ? 'Sign In to Workspace' : 'Create Secure Account')}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
          Protected with 256-bit JWT Encryption & HIPAA-Compliant Data Isolation
        </div>
      </div>
    </div>
  );
}
