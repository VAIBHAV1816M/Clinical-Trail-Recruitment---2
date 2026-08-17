import React from 'react';
import { User, Activity, Heart, Calendar, Phone, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export function PatientProfileViewPage() {
  const { patients, currentPatientId } = useApp();
  const patient = patients.find(p => p.patient_id === currentPatientId) || patients[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-900)' }}>
          My Health Profile
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--slate-500)' }}>
          Your clinical health parameters and verified biomarker history used for trial qualification matching.
        </p>
      </div>

      {/* Demographics Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem' }}>
            {patient.name?.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--slate-900)' }}>{patient.name}</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: 2 }}>
              Patient ID: <strong>{patient.patient_id}</strong> • DOB: {patient.dob} • Gender: {patient.gender}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Location</div>
            <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: 2 }}>{patient.location}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Blood Group</div>
            <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: 2 }}>{patient.blood_group || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Registry Consent</div>
            <div style={{ fontWeight: 600, color: patient.consent ? '#059669' : '#e11d48', marginTop: 2 }}>
              {patient.consent ? '✓ Verified & Signed' : 'Consent Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals History Table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>
            Biomarker & Vitals History
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date Recorded</th>
                <th>Blood Pressure</th>
                <th>Heart Rate</th>
                <th>HbA1c</th>
                <th>BMI</th>
                <th>Fasting Glucose</th>
              </tr>
            </thead>
            <tbody>
              {patient.vitals && patient.vitals.length > 0 ? (
                patient.vitals.map((v) => (
                  <tr key={v.vitals_id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {formatDate(v.recorded_at)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{v.bp_systolic}/{v.bp_diastolic} mmHg</td>
                    <td style={{ fontWeight: 600 }}>{v.heart_rate} bpm</td>
                    <td style={{ fontWeight: 600 }}>{v.hba1c}%</td>
                    <td style={{ fontWeight: 600 }}>{v.bmi}</td>
                    <td style={{ fontWeight: 600 }}>{v.blood_glucose} mg/dL</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No vitals snapshots recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
