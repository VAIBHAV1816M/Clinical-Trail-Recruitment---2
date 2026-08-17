/**
 * AegisTrial — Unified API Client Service
 * 
 * Connects directly to the FastAPI backend routes using VITE_API_BASE_URL.
 * Supports graceful fallback to mock data & client-side matching engine.
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

export const trialsApi = {
  getTrials: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/trials/`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('Backend /trials/ unavailable, using mock data:', e);
    }
    return INITIAL_TRIALS;
  },
  getTrial: async (trialId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trials/${trialId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Backend /trials/${trialId} unavailable, using mock:`, e);
    }
    return INITIAL_TRIALS.find(t => t.trial_id === trialId) || null;
  },
  createManualTrial: async (trialData, criteria) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trials/`, {
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

      const res = await fetch(`${API_BASE_URL}/trials/draft`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend POST /trials/draft unavailable, using mock fallback:', e);
    }
    // Simulated LLM criteria extraction fallback
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
      const res = await fetch(`${API_BASE_URL}/patients/?skip=0&limit=100`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('Backend /patients/ unavailable, using mock data:', e);
    }
    return INITIAL_PATIENTS;
  },
  getPatient: async (patientId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${patientId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Backend /patients/${patientId} unavailable, using mock:`, e);
    }
    return INITIAL_PATIENTS.find(p => p.patient_id === patientId) || null;
  },
  registerPatient: async (patientData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/?force=true`, {
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
  matchPatientToTrial: async (patientId, trialId, patients, trials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/matching/patient/${patientId}/trial/${trialId}`);
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
      const res = await fetch(`${API_BASE_URL}/matching/screen/`, {
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
