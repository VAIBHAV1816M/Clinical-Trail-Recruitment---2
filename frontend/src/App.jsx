import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

// Layouts
import { ResearcherLayout } from './components/layout/ResearcherLayout';
import { PatientLayout } from './components/layout/PatientLayout';

// Auth & Landing Pages
import { LoginPage } from './pages/LoginPage';
import { RoleSelectorPage } from './pages/RoleSelectorPage';

// Researcher Pages
import { DashboardPage } from './pages/researcher/DashboardPage';
import { TrialsListPage } from './pages/researcher/TrialsListPage';
import { TrialDetailPage } from './pages/researcher/TrialDetailPage';
import { AITrialBuilderPage } from './pages/researcher/AITrialBuilderPage';
import { PatientsPage } from './pages/researcher/PatientsPage';
import { PatientProfilePage } from './pages/researcher/PatientProfilePage';
import { ScreeningLogPage } from './pages/researcher/ScreeningLogPage';
import { EnrollmentHubPage } from './pages/researcher/EnrollmentHubPage';
import { NotificationsPage } from './pages/researcher/NotificationsPage';
import { ReportsPage } from './pages/researcher/ReportsPage';
import { AuditTrailPage } from './pages/researcher/AuditTrailPage';

// Patient Pages
import { PatientHomePage } from './pages/patient/PatientHomePage';
import { RecommendedTrialsPage } from './pages/patient/RecommendedTrialsPage';
import { PatientTrialDetailPage } from './pages/patient/PatientTrialDetailPage';
import { InvitationsPage } from './pages/patient/InvitationsPage';
import { MyEnrollmentPage } from './pages/patient/MyEnrollmentPage';
import { PatientProfileViewPage } from './pages/patient/PatientProfileViewPage';
import { PatientNotificationsPage } from './pages/patient/PatientNotificationsPage';

function AppContent() {
  const { isAuthenticated, role, user, profile, loading: authLoading } = useAuth();
  const { currentRole, setCurrentRole, selectedTrialId, setSelectedTrialId, setCurrentPatientId } = useApp();

  // Keep AppContext synced with authenticated role & profile
  useEffect(() => {
    if (isAuthenticated && role) {
      setCurrentRole(role);
      if (role === 'PATIENT' && profile?.patient_id) {
        setCurrentPatientId(profile.patient_id);
      }
    }
  }, [isAuthenticated, role, profile, setCurrentRole, setCurrentPatientId]);

  // Navigation states
  const [researcherTab, setResearcherTab] = useState('dashboard');
  const [patientTab, setPatientTab] = useState('home');
  const [selectedPatientIdForProfile, setSelectedPatientIdForProfile] = useState(null);
  const [patientSelectedTrialId, setPatientSelectedTrialId] = useState(null);

  // Titles map for Researcher Layout
  const titleMap = {
    'dashboard': 'Recruitment Operations Overview',
    'trials-list': 'Clinical Trials Portfolio',
    'create-trial': 'AI Protocol Extraction Wizard',
    'trial-detail': 'Clinical Study Workspace',
    'candidates': 'Candidate Match Discovery Pool',
    'patients': 'Patient Clinical Registry',
    'patient-profile': 'Patient Clinical Dossier',
    'screening': 'Official Screening & Verification Log',
    'enrollment': 'Enrollment & Waitlist Operations',
    'notifications': 'Communications & Alerts Center',
    'reports': 'Reports & Institutional Exports',
    'audit': 'Institutional Activity & Audit Log'
  };

  // Loading Screen while restoring JWT session
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #075985 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          gap: '1rem'
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: '3px solid rgba(255, 255, 255, 0.2)',
            borderTopColor: '#38bdf8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <div style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600 }}>
          Restoring secure clinical session...
        </div>
      </div>
    );
  }

  // If Unauthenticated, present Login Page
  if (!isAuthenticated) {
    return <LoginPage onBrowseRoles={() => {}} />;
  }

  // Researcher Experience
  if (role === 'RESEARCHER' || currentRole === 'RESEARCHER') {
    return (
      <ResearcherLayout
        activeTab={researcherTab}
        setActiveTab={setResearcherTab}
        title={titleMap[researcherTab] || 'Workspace'}
      >
        {researcherTab === 'dashboard' && (
          <DashboardPage setActiveTab={setResearcherTab} />
        )}

        {researcherTab === 'trials-list' && (
          <TrialsListPage
            setActiveTab={setResearcherTab}
            onSelectTrial={(id) => {
              setSelectedTrialId(id);
              setResearcherTab('trial-detail');
            }}
          />
        )}

        {researcherTab === 'create-trial' && (
          <AITrialBuilderPage setActiveTab={setResearcherTab} />
        )}

        {(researcherTab === 'trial-detail' || researcherTab === 'candidates') && (
          <TrialDetailPage setActiveTab={setResearcherTab} />
        )}

        {researcherTab === 'patients' && (
          <PatientsPage
            onSelectPatient={(id) => {
              setSelectedPatientIdForProfile(id);
              setResearcherTab('patient-profile');
            }}
          />
        )}

        {researcherTab === 'patient-profile' && (
          <PatientProfilePage
            patientId={selectedPatientIdForProfile}
            onBack={() => setResearcherTab('patients')}
            onSelectTrial={(id) => {
              setSelectedTrialId(id);
              setResearcherTab('trial-detail');
            }}
          />
        )}

        {researcherTab === 'screening' && (
          <ScreeningLogPage />
        )}

        {researcherTab === 'enrollment' && (
          <EnrollmentHubPage
            onSelectTrial={(id) => {
              setSelectedTrialId(id);
              setResearcherTab('trial-detail');
            }}
          />
        )}

        {researcherTab === 'notifications' && (
          <NotificationsPage />
        )}

        {researcherTab === 'reports' && (
          <ReportsPage />
        )}

        {researcherTab === 'audit' && (
          <AuditTrailPage />
        )}
      </ResearcherLayout>
    );
  }

  // Patient Experience
  return (
    <PatientLayout activeTab={patientTab} setActiveTab={setPatientTab}>
      {patientTab === 'home' && (
        <PatientHomePage
          setActiveTab={setPatientTab}
          onSelectTrial={(id) => {
            setPatientSelectedTrialId(id);
            setPatientTab('trial-detail');
          }}
        />
      )}

      {patientTab === 'recommended' && (
        <RecommendedTrialsPage
          setActiveTab={setPatientTab}
          onSelectTrial={(id) => {
            setPatientSelectedTrialId(id);
            setPatientTab('trial-detail');
          }}
        />
      )}

      {patientTab === 'trial-detail' && (
        <PatientTrialDetailPage
          trialId={patientSelectedTrialId}
          onBack={() => setPatientTab('recommended')}
          setActiveTab={setPatientTab}
        />
      )}

      {patientTab === 'invitations' && (
        <InvitationsPage setActiveTab={setPatientTab} />
      )}

      {patientTab === 'enrollment' && (
        <MyEnrollmentPage setActiveTab={setPatientTab} />
      )}

      {patientTab === 'profile' && (
        <PatientProfileViewPage />
      )}

      {patientTab === 'notifications' && (
        <PatientNotificationsPage />
      )}
    </PatientLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
