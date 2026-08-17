import React, { useState } from 'react';
import {
  Heart,
  Home,
  Sparkles,
  Mail,
  UserCheck,
  User,
  Bell,
  ArrowRightLeft,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function PatientNavbar({ activeTab, setActiveTab }) {
  const {
    patients,
    currentPatientId,
    setCurrentPatientId,
    setCurrentRole,
    notifications,
    enrollments,
    showToast
  } = useApp();

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activePatient = patients.find(p => p.patient_id === currentPatientId) || patients[0];
  
  // Pending invitations count for this patient
  const pendingInvites = enrollments.filter(e => e.patient_id === currentPatientId && e.status === 'INVITED').length;
  const unreadNotifs = notifications.filter(n => n.patient_id === currentPatientId && n.response === 'NONE').length;

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'recommended', label: 'Recommended Trials', icon: Sparkles },
    { id: 'invitations', label: 'Invitations', icon: Mail, badge: pendingInvites > 0 ? pendingInvites : null },
    { id: 'enrollment', label: 'My Enrollment', icon: UserCheck },
    { id: 'profile', label: 'My Health Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : null }
  ];

  return (
    <header className="patient-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}
          >
            <Heart size={20} fill="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--slate-900)' }}>
              AegisTrial
            </div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669', fontWeight: 700 }}>
              Patient Health Portal
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="patient-nav-links">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                className={`patient-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(link.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    style={{
                      background: '#e11d48',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-full)',
                      padding: '0.05rem 0.45rem'
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Persona Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#059669',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              {activePatient?.name?.charAt(0) || 'P'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                {activePatient?.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#15803d' }}>
                ID: {activePatient?.patient_id}
              </div>
            </div>
            <ChevronDown size={14} color="#166534" />
          </button>

          {isPersonaOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 280,
                background: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', padding: '0.2rem 0.5rem' }}>
                Switch Patient Profile
              </div>
              {patients.slice(0, 5).map(p => (
                <div
                  key={p.patient_id}
                  onClick={() => {
                    setCurrentPatientId(p.patient_id);
                    setIsPersonaOpen(false);
                    showToast('Switched Persona', `Active patient profile changed to ${p.name}.`, 'info');
                  }}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: p.patient_id === currentPatientId ? '#f0fdf4' : 'transparent',
                    border: `1px solid ${p.patient_id === currentPatientId ? '#bbf7d0' : 'transparent'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--slate-900)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                      {p.gender} • {p.blood_group} • ID: {p.patient_id}
                    </div>
                  </div>
                  {p.patient_id === currentPatientId && (
                    <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>Active</span>
                  )}
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setCurrentRole('RESEARCHER');
                    setIsPersonaOpen(false);
                    showToast('Role Switched', 'Switched to Clinician / Researcher workspace.', 'info');
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <ArrowRightLeft size={14} />
                  <span>Switch to Researcher Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Switch to Researcher Quick Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setCurrentRole('RESEARCHER');
            showToast('Role Switched', 'Switched to Researcher Workspace.', 'info');
          }}
          style={{ display: 'none', md: 'flex' }}
        >
          <ArrowRightLeft size={14} />
          <span>Researcher View</span>
        </button>

        {/* Mobile menu toggle */}
        <button
          className="btn-ghost"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ display: 'inline-flex', padding: '0.4rem' }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            left: 0,
            right: 0,
            background: '#ffffff',
            borderBottom: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 35
          }}
        >
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setIsMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === link.id ? 'var(--primary-50)' : 'transparent',
                color: activeTab === link.id ? 'var(--primary-700)' : 'var(--slate-800)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span style={{ background: '#e11d48', color: '#fff', fontSize: '0.72rem', padding: '0.1rem 0.5rem', borderRadius: 9999 }}>
                  {link.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
