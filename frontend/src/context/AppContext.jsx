import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { runMatchingEngine, computeGaps } from '../services/api/matchingEngine';
import { trialsApi, patientsApi, matchingApi, enrollmentsApi, notificationsApi } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { isAuthenticated, role, user, profile } = useAuth();

  // Database States (Clean by default for strict data isolation)
  const [trials, setTrials] = useState([]);
  const [patients, setPatients] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // App Session / Persona States
  const [currentRole, setCurrentRole] = useState(role || 'RESEARCHER');
  const [selectedTrialId, setSelectedTrialId] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [clinicianName, setClinicianName] = useState('Principal Investigator');
  
  // UI Toasts
  const [toasts, setToasts] = useState([]);

  // Sync with FastAPI backend whenever auth state or role changes
  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) {
      setTrials([]);
      setPatients([]);
      setEnrollments([]);
      setNotifications([]);
      setSelectedTrialId(null);
      setCurrentPatientId(null);
      return;
    }

    async function loadUserData() {
      try {
        if (role === 'RESEARCHER') {
          setCurrentRole('RESEARCHER');
          if (profile?.name) setClinicianName(profile.name);

          // Fetch only researcher's owned trials from /trials/my
          const [myTrials, backendPatients] = await Promise.all([
            trialsApi.getMyTrials(),
            patientsApi.getPatients()
          ]);

          if (isMounted) {
            const safeTrials = Array.isArray(myTrials) ? myTrials : [];
            setTrials(safeTrials);
            if (safeTrials.length > 0) {
              setSelectedTrialId(safeTrials[0].trial_id);
            } else {
              setSelectedTrialId(null);
            }
            setPatients(Array.isArray(backendPatients) ? backendPatients : []);
            setEnrollments([]);
            setNotifications([]);
          }
        } else if (role === 'PATIENT') {
          setCurrentRole('PATIENT');
          
          // Fetch authenticated patient's profile, open trials, enrollments, and notifications
          const [myProfile, openTrials, myEnrollments, myNotifs] = await Promise.all([
            patientsApi.getMyPatientProfile(),
            trialsApi.getTrials(),
            enrollmentsApi.getMyEnrollments(),
            notificationsApi.getMyNotifications()
          ]);

          if (isMounted) {
            if (myProfile && myProfile.patient_id) {
              setPatients([myProfile]);
              setCurrentPatientId(myProfile.patient_id);
            } else if (profile?.patient_id) {
              setCurrentPatientId(profile.patient_id);
              setPatients([{
                patient_id: profile.patient_id,
                name: profile.name || user?.email?.split('@')[0] || 'Patient',
                gender: profile.gender || 'Not specified',
                dob: profile.dob || '',
                location: profile.location || '',
                phone: profile.phone || '',
                blood_group: profile.blood_group || '',
                consent: true,
                vitals: [],
                conditions: [],
                allergies: []
              }]);
            } else {
              setPatients([]);
              setCurrentPatientId(null);
            }

            setTrials(Array.isArray(openTrials) ? openTrials : []);
            setEnrollments(Array.isArray(myEnrollments) ? myEnrollments : []);
            setNotifications(Array.isArray(myNotifs) ? myNotifs : []);
          }
        }
      } catch (err) {
        console.warn('Backend data sync failed:', err);
      }
    }

    loadUserData();
    return () => { isMounted = false; };
  }, [isAuthenticated, role, user, profile]);

  const showToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper: Create Audit Log
  const logAudit = (action, entityType, entityId, oldValue, newValue, reason, userId = clinicianName) => {
    const newLog = {
      audit_id: auditLogs.length + 1,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      old_value: oldValue ? String(oldValue) : 'NONE',
      new_value: String(newValue),
      reason: reason || null,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // ==========================================
  // Trial Operations
  // ==========================================

  const createTrial = async (trialData, criteriaList) => {
    try {
      const created = await trialsApi.createManualTrial(trialData, criteriaList);
      if (created && created.trial_id) {
        setTrials(prev => [created, ...prev]);
        setSelectedTrialId(created.trial_id);
        logAudit('CREATE_TRIAL', 'Trial', created.trial_id, null, 'OPEN', 'Created new clinical trial protocol with AI criteria');
        showToast('Trial Created', `Trial ${created.trial_id} (${created.trial_name}) has been launched.`, 'success');
        return created;
      }
    } catch (e) {
      console.warn('Backend createManualTrial error:', e);
    }

    const nextNum = trials.length + 1;
    const trial_id = `T${String(nextNum).padStart(3, '0')}`;
    
    const formattedCriteria = criteriaList.map((c, idx) => ({
      ...c,
      criterion_id: nextNum * 100 + (idx + 1),
      trial_id
    }));

    const newTrial = {
      trial_id,
      trial_name: trialData.trial_name,
      description: trialData.description || '',
      source_type: trialData.source_type || 'MANUAL',
      target_recruitment: Number(trialData.target_recruitment) || 50,
      original_text: trialData.original_text || '',
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      criteria: formattedCriteria
    };

    setTrials(prev => [newTrial, ...prev]);
    setSelectedTrialId(trial_id);

    logAudit('CREATE_TRIAL', 'Trial', trial_id, null, 'OPEN', 'Created new clinical trial protocol with AI criteria');
    showToast('Trial Created', `Trial ${trial_id} (${newTrial.trial_name}) has been launched.`, 'success');
    return newTrial;
  };

  const updateTrial = (trial_id, updateData) => {
    setTrials(prev => prev.map(t => {
      if (t.trial_id === trial_id) {
        const updated = { ...t, ...updateData, updated_at: new Date().toISOString() };
        logAudit('UPDATE_TRIAL', 'Trial', trial_id, JSON.stringify(t), JSON.stringify(updated), 'Updated trial parameters');
        return updated;
      }
      return t;
    }));
    showToast('Trial Updated', `Trial ${trial_id} details updated.`, 'success');
  };

  // ==========================================
  // Patient Operations
  // ==========================================

  const registerPatient = (patientData) => {
    const nextNum = patients.length + 1;
    const patient_id = `P${String(nextNum).padStart(3, '0')}`;

    const newPatient = {
      patient_id,
      name: patientData.name,
      gender: patientData.gender || 'Other',
      dob: patientData.dob || '1990-01-01',
      location: patientData.location || 'Boston, MA',
      phone: patientData.phone || '+1 (555) 000-0000',
      blood_group: patientData.blood_group || 'O+',
      previous_surgery: patientData.previous_surgery || null,
      smoking: Boolean(patientData.smoking),
      alcohol: Boolean(patientData.alcohol),
      consent: Boolean(patientData.consent),
      active_trial_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      conditions: (patientData.conditions || []).map((c, i) => ({
        condition_id: Date.now() + i,
        patient_id,
        condition_name: typeof c === 'string' ? c : c.condition_name,
        diagnosed_at: c.diagnosed_at || new Date().toISOString().split('T')[0]
      })),
      allergies: (patientData.allergies || []).map((a, i) => ({
        allergy_id: Date.now() + i + 100,
        patient_id,
        allergen: typeof a === 'string' ? a : a.allergen
      })),
      vitals: patientData.vitals ? [{
        vitals_id: Date.now() + 200,
        patient_id,
        ...patientData.vitals,
        recorded_at: new Date().toISOString()
      }] : []
    };

    setPatients(prev => [newPatient, ...prev]);
    logAudit('REGISTER_PATIENT', 'Patient', patient_id, null, patientData.name, 'Direct patient registration');
    showToast('Patient Registered', `Patient ${patient_id} (${newPatient.name}) registered successfully.`, 'success');
    return newPatient;
  };

  const updatePatient = (patient_id, updateData) => {
    setPatients(prev => prev.map(p => {
      if (p.patient_id === patient_id) {
        // Enforce active_trial_id route invariant
        const cleanUpdate = { ...updateData };
        delete cleanUpdate.active_trial_id;
        const updated = { ...p, ...cleanUpdate, updated_at: new Date().toISOString() };
        logAudit('UPDATE_PATIENT', 'Patient', patient_id, JSON.stringify(p), JSON.stringify(updated), 'Updated patient profile');
        return updated;
      }
      return p;
    }));
    showToast('Profile Updated', `Patient ${patient_id} record saved.`, 'success');
  };

  // ==========================================
  // Matching & Official Screening
  // ==========================================

  const performOfficialScreening = (patientId, trialId) => {
    const patient = patients.find(p => p.patient_id === patientId);
    const trial = trials.find(t => t.trial_id === trialId);

    if (!patient || !trial) {
      showToast('Error', 'Patient or Trial not found.', 'danger');
      return null;
    }

    const matchResult = runMatchingEngine(patient, trial);
    const screening_id = screenings.length > 0 ? Math.max(...screenings.map(s => s.screening_id)) + 1 : 1;

    const newScreening = {
      screening_id,
      patient_id: patientId,
      trial_id: trialId,
      vitals_id: matchResult.vitals_id,
      match_percentage: matchResult.match_percentage,
      verdict: matchResult.verdict,
      eligible: matchResult.eligible,
      criteria_snapshot: matchResult.criteria_snapshot,
      screened_at: new Date().toISOString()
    };

    setScreenings(prev => [newScreening, ...prev]);
    logAudit('OFFICIAL_SCREENING', 'ScreeningResult', String(screening_id), null, matchResult.verdict, `Official screening for ${patient.name} against ${trial.trial_name}`);
    showToast('Patient Screened', `Official screening #${screening_id} recorded: ${matchResult.verdict} (${matchResult.match_percentage}%).`, matchResult.verdict === 'APPROVED' ? 'success' : matchResult.verdict === 'NEEDS_REVIEW' ? 'warning' : 'danger');

    return newScreening;
  };

  // ==========================================
  // Verification & Clinician Override
  // ==========================================

  const verifyScreening = (screening_id, remarks = '') => {
    const screening = screenings.find(s => s.screening_id === screening_id);
    if (!screening) return;

    const newVerification = {
      verification_id: verifications.length + 1,
      patient_id: screening.patient_id,
      trial_id: screening.trial_id,
      screening_id,
      verified: true,
      verified_by: clinicianName,
      verified_at: new Date().toISOString(),
      remarks: remarks || 'Verified as clinically reviewed by clinician.'
    };

    setVerifications(prev => [newVerification, ...prev]);
    logAudit('VERIFY_SCREENING', 'ScreeningResult', String(screening_id), 'UNVERIFIED', 'VERIFIED', remarks);
    showToast('Screening Verified', `Screening #${screening_id} marked as reviewed by ${clinicianName}.`, 'success');
  };

  const overrideVerdict = (screening_id, newVerdict, remarks) => {
    if (!remarks || !remarks.trim()) {
      showToast('Validation Error', 'Clinical reason/remarks are mandatory for verdict overrides.', 'danger');
      return false;
    }

    const screening = screenings.find(s => s.screening_id === screening_id);
    if (!screening) return false;

    const oldVerdict = screening.verdict;

    // Update screening record
    setScreenings(prev => prev.map(s => {
      if (s.screening_id === screening_id) {
        return {
          ...s,
          verdict: newVerdict,
          eligible: (newVerdict === 'APPROVED' || newVerdict === 'NEEDS_REVIEW')
        };
      }
      return s;
    }));

    // Record verification with override
    const newVerification = {
      verification_id: verifications.length + 1,
      patient_id: screening.patient_id,
      trial_id: screening.trial_id,
      screening_id,
      verified: true,
      verified_by: clinicianName,
      verified_at: new Date().toISOString(),
      remarks: `[OVERRIDE from ${oldVerdict} to ${newVerdict}]: ${remarks}`
    };

    setVerifications(prev => [newVerification, ...prev]);
    logAudit('OVERRIDE_VERDICT', 'ScreeningResult', String(screening_id), oldVerdict, newVerdict, remarks);
    showToast('Verdict Overridden', `Verdict changed to ${newVerdict} for screening #${screening_id}.`, 'warning');
    return true;
  };

  // ==========================================
  // Enrollment Lifecycle & State Machine
  // ==========================================

  const VALID_TRANSITIONS = {
    null: ['INVITED', 'ENROLLED'],
    'INVITED': ['ACCEPTED', 'DECLINED', 'ENROLLED'],
    'ACCEPTED': ['ENROLLED', 'DECLINED'],
    'ENROLLED': ['DROPPED'],
    'DECLINED': [],
    'DROPPED': []
  };

  const transitionEnrollment = (trial_id, patient_id, new_status, reason = null) => {
    const existing = enrollments.find(e => e.trial_id === trial_id && e.patient_id === patient_id);
    const oldStatus = existing ? existing.status : null;

    const allowed = VALID_TRANSITIONS[oldStatus] || [];
    if (!allowed.includes(new_status) && oldStatus !== new_status) {
      showToast('Invalid Transition', `Cannot transition enrollment from ${oldStatus || 'NONE'} to ${new_status}.`, 'danger');
      return false;
    }

    const patient = patients.find(p => p.patient_id === patient_id);
    if (!patient) return false;

    // Check active_trial_id conflict for ENROLLED
    if (new_status === 'ENROLLED') {
      if (patient.active_trial_id && patient.active_trial_id !== trial_id) {
        showToast('Active Trial Conflict', `Patient ${patient_id} is already enrolled in trial ${patient.active_trial_id}.`, 'danger');
        return false;
      }
    }

    const now = new Date().toISOString();

    if (!existing) {
      const newEnr = {
        enrollment_id: enrollments.length + 1,
        trial_id,
        patient_id,
        status: new_status,
        invited_at: new_status === 'INVITED' ? now : null,
        accepted_at: new_status === 'ACCEPTED' ? now : null,
        declined_at: new_status === 'DECLINED' ? now : null,
        enrolled_at: new_status === 'ENROLLED' ? now : null,
        dropped_at: new_status === 'DROPPED' ? now : null
      };
      setEnrollments(prev => [newEnr, ...prev]);
    } else {
      setEnrollments(prev => prev.map(e => {
        if (e.trial_id === trial_id && e.patient_id === patient_id) {
          return {
            ...e,
            status: new_status,
            invited_at: new_status === 'INVITED' ? now : e.invited_at,
            accepted_at: new_status === 'ACCEPTED' ? now : e.accepted_at,
            declined_at: new_status === 'DECLINED' ? now : e.declined_at,
            enrolled_at: new_status === 'ENROLLED' ? now : e.enrolled_at,
            dropped_at: new_status === 'DROPPED' ? now : e.dropped_at
          };
        }
        return e;
      }));
    }

    // Side effect: update patient active_trial_id
    if (new_status === 'ENROLLED') {
      setPatients(prev => prev.map(p => p.patient_id === patient_id ? { ...p, active_trial_id: trial_id } : p));
    } else if (new_status === 'DROPPED') {
      setPatients(prev => prev.map(p => (p.patient_id === patient_id && p.active_trial_id === trial_id) ? { ...p, active_trial_id: null } : p));

      // Auto-promote top waiting candidate from waitlist!
      const topWaiting = waitlists
        .filter(w => w.trial_id === trial_id && w.status === 'WAITING')
        .sort((a, b) => a.rank - b.rank)[0];

      if (topWaiting) {
        setWaitlists(prev => prev.map(w => w.waitlist_id === topWaiting.waitlist_id ? { ...w, status: 'PROMOTED' } : w));
        // Enroll promoted patient
        transitionEnrollment(trial_id, topWaiting.patient_id, 'ENROLLED', 'Auto-promoted from waitlist rank 1');
        showToast('Waitlist Promoted', `Patient ${topWaiting.patient_id} auto-promoted from waitlist and enrolled into ${trial_id}!`, 'info');
      }
    }

    // Automatically send notification if invited
    if (new_status === 'INVITED') {
      const trial = trials.find(t => t.trial_id === trial_id);
      sendNotification({
        patient_id,
        trial_id,
        message: `You have been officially invited to participate in ${trial?.trial_name || trial_id}. Please review your invitation and confirm.`,
        channel: 'PORTAL'
      });
    }

    logAudit(`ENROLLMENT_${new_status}`, 'Enrollment', `${trial_id}:${patient_id}`, oldStatus || 'NONE', new_status, reason);
    showToast('Enrollment Updated', `Patient ${patient_id} status updated to ${new_status}.`, 'success');
    return true;
  };

  const invitePatient = (trialId, patientId, reason) => transitionEnrollment(trialId, patientId, 'INVITED', reason);
  const acceptInvite = (trialId, patientId) => transitionEnrollment(trialId, patientId, 'ACCEPTED', 'Accepted via patient portal');
  const declineInvite = (trialId, patientId, reason) => transitionEnrollment(trialId, patientId, 'DECLINED', reason || 'Declined by patient');
  const enrollPatient = (trialId, patientId) => transitionEnrollment(trialId, patientId, 'ENROLLED', 'Confirmed clinical enrollment');
  const dropPatient = (trialId, patientId, reason) => transitionEnrollment(trialId, patientId, 'DROPPED', reason || 'Clinical withdrawal / dropped');

  const addToWaitlist = (trialId, patientId, matchPercentage) => {
    const existing = waitlists.find(w => w.trial_id === trialId && w.patient_id === patientId);
    if (existing) {
      showToast('Notice', 'Patient is already on the waitlist for this trial.', 'warning');
      return;
    }

    const currentTrialWaitlist = waitlists.filter(w => w.trial_id === trialId);
    const rank = currentTrialWaitlist.length + 1;

    const newWait = {
      waitlist_id: waitlists.length + 1,
      trial_id: trialId,
      patient_id: patientId,
      rank,
      match_percentage: matchPercentage || 85.0,
      status: 'WAITING',
      created_at: new Date().toISOString()
    };

    setWaitlists(prev => [...prev, newWait]);
    logAudit('ADD_WAITLIST', 'Waitlist', `${trialId}:${patientId}`, null, 'WAITING', `Added to waitlist at rank #${rank}`);
    showToast('Waitlisted', `Patient ${patientId} added to waitlist (Rank #${rank}).`, 'info');
  };

  // ==========================================
  // Notifications
  // ==========================================

  const sendNotification = (payload) => {
    const newNotif = {
      notification_id: notifications.length + 100,
      patient_id: payload.patient_id,
      trial_id: payload.trial_id,
      message: payload.message,
      channel: payload.channel || 'PORTAL',
      delivery_status: 'SENT',
      response: 'NONE'
    };

    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const respondNotification = (notification_id, responseChoice) => {
    setNotifications(prev => prev.map(n => {
      if (n.notification_id === notification_id) {
        return { ...n, response: responseChoice };
      }
      return n;
    }));

    const notif = notifications.find(n => n.notification_id === notification_id);
    if (notif) {
      if (responseChoice === 'ACCEPTED') {
        acceptInvite(notif.trial_id, notif.patient_id);
      } else if (responseChoice === 'DECLINED') {
        declineInvite(notif.trial_id, notif.patient_id, 'Declined via notification response');
      }
    }
  };

  // ==========================================
  // Analytical Helpers
  // ==========================================

  const getDashboardStats = (trialId) => {
    const trial = trials.find(t => t.trial_id === trialId);
    if (!trial) {
      return {
        target: 0,
        screened: 0,
        approved: 0,
        needs_review: 0,
        rejected: 0,
        enrolled: 0,
        progress: 0.0,
        top_exclusion_reasons: [],
        top_candidates: []
      };
    }

    // Deduplicate screenings to latest per patient
    const trialScreenings = screenings.filter(s => s.trial_id === trialId);
    const latestByPatient = {};
    trialScreenings.forEach(s => {
      if (!latestByPatient[s.patient_id] || new Date(s.screened_at) > new Date(latestByPatient[s.patient_id].screened_at)) {
        latestByPatient[s.patient_id] = s;
      }
    });

    const latestList = Object.values(latestByPatient);
    const screened_count = latestList.length;
    const approved_count = latestList.filter(s => s.verdict === 'APPROVED').length;
    const needs_review_count = latestList.filter(s => s.verdict === 'NEEDS_REVIEW').length;
    const rejected_count = latestList.filter(s => s.verdict === 'REJECTED').length;

    const enrolled_count = enrollments.filter(e => e.trial_id === trialId && e.status === 'ENROLLED').length;
    const target = trial.target_recruitment || 0;
    const progress = target > 0 ? Math.round((enrolled_count / target) * 1000) / 10 : 0.0;

    const topCandidates = latestList
      .filter(s => s.eligible)
      .sort((a, b) => b.match_percentage - a.match_percentage)
      .slice(0, 5)
      .map(s => ({
        patient_id: s.patient_id,
        score: s.match_percentage
      }));

    const reasonsTally = {};
    latestList.forEach(s => {
      if (s.verdict === 'REJECTED' && s.criteria_snapshot?.explanations) {
        s.criteria_snapshot.explanations.forEach(exp => {
          if (!exp.passed) {
            const f = exp.field || 'General Ineligibility';
            reasonsTally[f] = (reasonsTally[f] || 0) + 1;
          }
        });
      }
    });

    const top_exclusion_reasons = Object.entries(reasonsTally)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      target,
      screened: screened_count,
      approved: approved_count,
      needs_review: needs_review_count,
      rejected: rejected_count,
      enrolled: enrolled_count,
      progress,
      top_exclusion_reasons,
      top_candidates: topCandidates
    };
  };

  const getCandidatesForTrial = (trialId) => {
    const trial = trials.find(t => t.trial_id === trialId);
    if (!trial) return [];

    return patients.map(patient => {
      const match = runMatchingEngine(patient, trial);
      const enrollment = enrollments.find(e => e.trial_id === trialId && e.patient_id === patient.patient_id);
      const existingScreening = screenings.find(s => s.trial_id === trialId && s.patient_id === patient.patient_id);
      const verification = existingScreening ? verifications.find(v => v.screening_id === existingScreening.screening_id) : null;

      return {
        patient_id: patient.patient_id,
        patient_name: patient.name,
        gender: patient.gender,
        dob: patient.dob,
        location: patient.location,
        match_percentage: match.match_percentage,
        verdict: match.verdict,
        eligible: match.eligible,
        gaps: computeGaps(match.criteria_snapshot),
        criteria_snapshot: match.criteria_snapshot,
        enrollment_status: enrollment ? enrollment.status : null,
        screening_id: existingScreening ? existingScreening.screening_id : null,
        is_verified: verification ? verification.verified : false,
        verified_by: verification ? verification.verified_by : null
      };
    }).sort((a, b) => b.match_percentage - a.match_percentage);
  };

  const getTrialsForPatient = (patientId) => {
    const patient = patients.find(p => p.patient_id === patientId);
    if (!patient) return [];

    return trials
      .filter(t => t.status === 'OPEN')
      .map(trial => {
        const match = runMatchingEngine(patient, trial);
        const enrollment = enrollments.find(e => e.trial_id === trial.trial_id && e.patient_id === patientId);

        return {
          trial_id: trial.trial_id,
          trial_name: trial.trial_name,
          description: trial.description,
          target_recruitment: trial.target_recruitment,
          match_percentage: match.match_percentage,
          verdict: match.verdict,
          eligible: match.eligible,
          gaps: computeGaps(match.criteria_snapshot),
          criteria_snapshot: match.criteria_snapshot,
          enrollment_status: enrollment ? enrollment.status : null
        };
      })
      .sort((a, b) => b.match_percentage - a.match_percentage);
  };

  return (
    <AppContext.Provider
      value={{
        trials,
        patients,
        screenings,
        verifications,
        enrollments,
        waitlists,
        notifications,
        auditLogs,
        currentRole,
        setCurrentRole,
        selectedTrialId,
        setSelectedTrialId,
        currentPatientId,
        setCurrentPatientId,
        clinicianName,
        toasts,
        showToast,
        removeToast,
        createTrial,
        updateTrial,
        registerPatient,
        updatePatient,
        performOfficialScreening,
        verifyScreening,
        overrideVerdict,
        invitePatient,
        acceptInvite,
        declineInvite,
        enrollPatient,
        dropPatient,
        addToWaitlist,
        sendNotification,
        respondNotification,
        getDashboardStats,
        getCandidatesForTrial,
        getTrialsForPatient
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
