import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Layouts
import { ResearcherLayout } from './components/layout/ResearcherLayout';
import { PatientLayout } from './components/layout/PatientLayout';

// Landing / Role Selector
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
  const { currentRole, setCurrentRole, selectedTrialId, setSelectedTrialId } = useApp();

  // Navigation states
  const [researcherTab, setResearcherTab] = useState('dashboard');
  const [patientTab, setPatientTab] = useState('home');
  const [selectedPatientIdForProfile, setSelectedPatientIdForProfile] = useState('P014');
  const [patientSelectedTrialId, setPatientSelectedTrialId] = useState('T001');

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

  // If on Landing / Role Selector
  if (currentRole === 'ROLE_SELECTOR') {
    return <RoleSelectorPage onEnter={() => {}} />;
  }

  // Researcher Experience
  if (currentRole === 'RESEARCHER') {
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
