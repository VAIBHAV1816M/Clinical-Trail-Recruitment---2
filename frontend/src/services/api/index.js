/**
 * AegisTrial — Unified API Client Service
 * 
 * Connects directly to the FastAPI backend routes using VITE_API_BASE_URL.
 * Supports JWT authentication headers and graceful fallback to mock data & client-side matching engine.
 */

import {
  INITIAL_TRIALS,
  INITIAL_PATIENTS,
  INITIAL_SCREENINGS,
  INITIAL_VERIFICATIONS,
  INITIAL_ENROLLMENTS,
  INITIAL_WAITLIST,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../../data/mockDatabase';
import { runMatchingEngine, computeGaps } from './matchingEngine';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Authenticated fetch helper that injects Bearer JWT token if present.
 */
export async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem('aegis_auth_token');
  const headers = {
    ...options.headers
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  return fetch(url, { ...options, headers });
}

export const authApi = {
  login: async ({ email, password }) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Invalid email or password');
    }
    return await res.json();
  },

  register: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return await res.json();
  },

  getMe: async (customToken = null) => {
    const token = customToken || localStorage.getItem('aegis_auth_token');
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
    return null;
  },

  getMyResearcherProfile: async () => {
    const res = await authFetch('/researchers/me');
    if (res.ok) return await res.json();
    return null;
  },

  getMyPatientProfile: async () => {
    const res = await authFetch('/patients/me');
    if (res.ok) return await res.json();
    return null;
  },

  getMyTrials: async () => {
    const res = await authFetch('/trials/my');
    if (res.ok) return await res.json();
    return [];
  },

  getMyRecommendedTrials: async () => {
    const res = await authFetch('/matching/my/trials');
    if (res.ok) return await res.json();
    return [];
  },

  getMyNotifications: async () => {
    const res = await authFetch('/notifications/my');
    if (res.ok) return await res.json();
    return [];
  },

  getMyEnrollments: async () => {
    const res = await authFetch('/trials/enrollments/my');
    if (res.ok) return await res.json();
    return [];
  }
};

export const trialsApi = {
  getTrials: async (filters = {}) => {
    try {
      const query = new URLSearchParams();
      if (filters.status) query.append('status', filters.status);
      if (filters.search) query.append('search', filters.search);
      if (filters.year) query.append('year', filters.year);
      if (filters.month) query.append('month', filters.month);

      const qs = query.toString();
      const res = await authFetch(`/trials/${qs ? `?${qs}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('Backend /trials/ unavailable, using fallback:', e);
    }
    return INITIAL_TRIALS;
  },
  getMyTrials: async () => {
    try {
      const res = await authFetch('/trials/my');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('Backend /trials/my unavailable:', e);
    }
    return [];
  },
  getTrial: async (trialId) => {
    try {
      const res = await authFetch(`/trials/${trialId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Backend /trials/${trialId} unavailable, using mock:`, e);
    }
    return INITIAL_TRIALS.find(t => t.trial_id === trialId) || null;
  },
  getTrialCriteria: async (trialId) => {
    try {
      const res = await authFetch(`/trials/${trialId}/criteria`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Backend /trials/${trialId}/criteria unavailable:`, e);
    }
    const t = INITIAL_TRIALS.find(tr => tr.trial_id === trialId);
    return t ? t.criteria || [] : [];
  },
  createManualTrial: async (trialData, criteria) => {
    try {
      const res = await authFetch('/trials/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trial_data: trialData, criteria })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend POST /trials/ unavailable, using local return:', e);
    }
    return { ...trialData, criteria };
  },
  createDraft: async ({ text, file }) => {
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (text) formData.append('text', text);

      const res = await authFetch('/trials/draft', {
        method: 'POST',
        body: formData
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend POST /trials/draft unavailable, using mock fallback:', e);
    }
    await new Promise(res => setTimeout(res, 800));
    return [
      { field: 'age', data_type: 'NUMERIC', classification: 'HARD', operator: 'BETWEEN', numeric_min: 18.0, numeric_max: 75.0, weight: 1.0 },
      { field: 'conditions', data_type: 'CATEGORICAL', classification: 'HARD', operator: 'INCLUDES', categorical_ideal: 'Type 2 Diabetes', weight: 1.0 },
      { field: 'hba1c', data_type: 'NUMERIC', classification: 'SOFT', operator: 'GAUSSIAN', numeric_ideal: 6.5, numeric_tolerance: 1.0, weight: 1.5 },
      { field: 'bp_systolic', data_type: 'NUMERIC', classification: 'HARD', operator: 'BETWEEN', numeric_min: 90.0, numeric_max: 160.0, weight: 1.0 },
      { field: 'smoking', data_type: 'BOOLEAN', classification: 'SOFT', operator: 'EQUALS', boolean_ideal: false, weight: 0.8 }
    ];
  }
};

export const patientsApi = {
  getPatients: async () => {
    try {
      const res = await authFetch('/patients/?skip=0&limit=100');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('Backend /patients/ unavailable, using mock data:', e);
    }
    return INITIAL_PATIENTS;
  },
  getMyPatientProfile: async () => {
    try {
      const res = await authFetch('/patients/me');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend /patients/me unavailable:', e);
    }
    return null;
  },
  updateMyProfile: async (profileData) => {
    try {
      const res = await authFetch('/patients/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({ detail: 'Failed to update profile' }));
      throw new Error(err.detail || 'Failed to update profile');
    } catch (e) {
      console.warn('Backend PUT /patients/me error:', e);
      throw e;
    }
  },
  getPatient: async (patientId) => {
    try {
      const res = await authFetch(`/patients/${patientId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Backend /patients/${patientId} unavailable, using mock:`, e);
    }
    return INITIAL_PATIENTS.find(p => p.patient_id === patientId) || null;
  },
  registerPatient: async (patientData) => {
    try {
      const res = await authFetch('/patients/?force=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend POST /patients/ unavailable, using local:', e);
    }
    return { patient_id: `P${Date.now()}`, ...patientData };
  }
};

export const matchingApi = {
  checkTrialEligibility: async (trialId, formInputs = {}) => {
    try {
      const res = await authFetch(`/matching/trial/${trialId}/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_inputs: formInputs })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
      const err = await res.json().catch(() => ({ detail: 'Eligibility check failed' }));
      throw new Error(err.detail || 'Eligibility check failed');
    } catch (e) {
      console.warn('Backend check-eligibility error:', e);
      throw e;
    }
  },
  matchPatientToTrial: async (patientId, trialId, patients, trials) => {
    try {
      const res = await authFetch(`/matching/patient/${patientId}/trial/${trialId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      console.warn('Backend match preview unavailable, using client engine:', e);
    }
    const patient = patients.find(p => p.patient_id === patientId);
    const trial = trials.find(t => t.trial_id === trialId);
    if (!patient || !trial) throw new Error('Patient or Trial not found');
    return runMatchingEngine(patient, trial);
  },
  screenPatient: async (patientId, trialId, patients, trials) => {
    try {
      const res = await authFetch('/matching/screen/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, trial_id: trialId })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      console.warn('Backend screening API unavailable, using client engine:', e);
    }
    const patient = patients.find(p => p.patient_id === patientId);
    const trial = trials.find(t => t.trial_id === trialId);
    if (!patient || !trial) throw new Error('Patient or Trial not found');
    const result = runMatchingEngine(patient, trial);
    return {
      ...result,
      screening_id: Date.now(),
      screened_at: new Date().toISOString()
    };
  },
  getMyRecommendedTrials: async () => {
    try {
      const res = await authFetch('/matching/my/trials');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend /matching/my/trials unavailable:', e);
    }
    return [];
  }
};

export const enrollmentsApi = {
  getMyEnrollments: async () => {
    try {
      const res = await authFetch('/trials/enrollments/my');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend /trials/enrollments/my unavailable:', e);
    }
    return [];
  },
  applyToTrial: async (trialId, reason = null) => {
    try {
      const res = await authFetch(`/trials/${trialId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({ detail: 'Application failed' }));
      throw new Error(err.detail || 'Application failed');
    } catch (e) {
      console.warn('Backend applyToTrial error:', e);
      throw e;
    }
  },
  invitePatient: async (trialId, patientId, reason = null) => {
    try {
      const res = await authFetch(`/trials/${trialId}/invite/${patientId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend invite failed:', e);
    }
    return null;
  },
  acceptInvite: async (trialId, patientId, reason = null) => {
    try {
      const res = await authFetch(`/trials/${trialId}/accept/${patientId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend accept failed:', e);
    }
    return null;
  },
  declineInvite: async (trialId, patientId, reason = null) => {
    try {
      const res = await authFetch(`/trials/${trialId}/decline/${patientId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend decline failed:', e);
    }
    return null;
  },
  enrollPatient: async (trialId, patientId, reason = null) => {
    try {
      const res = await authFetch(`/trials/${trialId}/enroll/${patientId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend enroll failed:', e);
    }
    return null;
  },
  dropPatient: async (trialId, patientId, reason = null) => {
    try {
      const res = await authFetch(`/trials/${trialId}/drop/${patientId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend drop failed:', e);
    }
    return null;
  }
};

export const notificationsApi = {
  getMyNotifications: async () => {
    try {
      const res = await authFetch('/notifications/my');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend /notifications/my unavailable:', e);
    }
    return [];
  },
  sendNotification: async ({ patientId, trialId, message, channel = 'IN_APP' }) => {
    try {
      const res = await authFetch('/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, trial_id: trialId, message, channel })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend notification send failed:', e);
    }
    return null;
  },
  respondNotification: async (notificationId, response) => {
    try {
      const res = await authFetch(`/notifications/${notificationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend respond notification failed:', e);
    }
    return null;
  }
};

export const exportApi = {
  exportCandidatesCsv: (candidates, trialId) => {
    const downloadUrl = `${API_BASE_URL}/export/trials/${trialId}/candidates.csv`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `candidates_${trialId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  exportDashboardPdfUrl: (trialId) => `${API_BASE_URL}/export/trials/${trialId}/report.pdf`
};
