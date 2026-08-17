import React, { useState } from 'react';
import { patientsApi } from '../../services/api';

export function PatientOnboardingModal({ isOpen, onClose, onComplete, initialProfile = null }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: initialProfile?.name || '',
    dob: initialProfile?.dob || '',
    gender: initialProfile?.gender || 'Male',
    location: initialProfile?.location || '',
    phone: initialProfile?.phone || '',
    blood_group: initialProfile?.blood_group || 'O+',
    smoking: initialProfile?.smoking ?? false,
    alcohol: initialProfile?.alcohol ?? false,
    previous_surgery: initialProfile?.previous_surgery || '',
    // Vitals
    bp_systolic: initialProfile?.vitals?.[0]?.bp_systolic || 120,
    bp_diastolic: initialProfile?.vitals?.[0]?.bp_diastolic || 80,
    heart_rate: initialProfile?.vitals?.[0]?.heart_rate || 72,
    bmi: initialProfile?.vitals?.[0]?.bmi || 23.5,
    hba1c: initialProfile?.vitals?.[0]?.hba1c || 5.5,
    // Lists
    conditions: (initialProfile?.conditions || []).map(c => c.condition_name).join(', ') || '',
    allergies: (initialProfile?.allergies || []).map(a => a.allergen).join(', ') || '',
    consent: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === 'true' ? true : (value === 'false' ? false : value))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.dob) {
      setError('Date of Birth is required for clinical protocol matching.');
      return;
    }
    if (!formData.gender) {
      setError('Gender is required for clinical protocol matching.');
      return;
    }
    if (!formData.consent) {
      setError('You must accept the clinical trial research and privacy consent.');
      return;
    }

    setSubmitting(true);
    try {
      // Format payload for backend
      const conditionsList = formData.conditions
        ? formData.conditions.split(',').map(c => ({ condition_name: c.trim() })).filter(c => c.condition_name.length > 0)
        : [];

      const allergiesList = formData.allergies
        ? formData.allergies.split(',').map(a => ({ allergen: a.trim() })).filter(a => a.allergen.length > 0)
        : [];

      const payload = {
        name: formData.name || undefined,
        gender: formData.gender,
        dob: formData.dob,
        location: formData.location || undefined,
        phone: formData.phone || undefined,
        blood_group: formData.blood_group || undefined,
        smoking: Boolean(formData.smoking),
        alcohol: Boolean(formData.alcohol),
        previous_surgery: formData.previous_surgery || 'None',
        consent: true,
        vitals: {
          bp_systolic: Number(formData.bp_systolic) || 120,
          bp_diastolic: Number(formData.bp_diastolic) || 80,
          heart_rate: Number(formData.heart_rate) || 72,
          bmi: Number(formData.bmi) || 23.5,
          hba1c: Number(formData.hba1c) || 5.5
        },
        conditions: conditionsList,
        allergies: allergiesList
      };

      const updated = await patientsApi.updateMyProfile(payload);
      if (onComplete) onComplete(updated);
    } catch (err) {
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div className="modal-content" style={{
        background: '#1e293b',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '16px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            width: 44, height: 44, borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🩺
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Complete Clinical Profile
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
              Provide your clinical background to enable precise, automated trial matching.
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section 1: Demographics */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👤 Personal Demographics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Patient Name"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Vitals */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Baseline Vitals
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>BMI (kg/m²)</label>
                <input
                  type="number"
                  step="0.1"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>BP Systolic (mmHg)</label>
                <input
                  type="number"
                  name="bp_systolic"
                  value={formData.bp_systolic}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>BP Diastolic (mmHg)</label>
                <input
                  type="number"
                  name="bp_diastolic"
                  value={formData.bp_diastolic}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>HbA1c (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="hba1c"
                  value={formData.hba1c}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Lifestyle & History */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🧬 Lifestyle & Medical History
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>Smoking Status</label>
                <select
                  name="smoking"
                  value={String(formData.smoking)}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                >
                  <option value="false">Non-Smoker</option>
                  <option value="true">Active Smoker</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>Alcohol Consumption</label>
                <select
                  name="alcohol"
                  value={String(formData.alcohol)}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                >
                  <option value="false">No / Rarely</option>
                  <option value="true">Regular / Moderate</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>Previous Surgeries</label>
                <input
                  type="text"
                  name="previous_surgery"
                  placeholder="e.g. Appendectomy or None"
                  value={formData.previous_surgery}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>
                  Current Conditions (comma separated)
                </label>
                <input
                  type="text"
                  name="conditions"
                  placeholder="e.g. Type 2 Diabetes, Hypertension"
                  value={formData.conditions}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  name="allergies"
                  placeholder="e.g. Penicillin, Peanuts"
                  value={formData.allergies}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="onboarding-consent"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              style={{ marginTop: 3 }}
            />
            <label htmlFor="onboarding-consent" style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              I confirm that the clinical history provided is accurate and consent to automated protocol matching under institutional privacy guidelines.
            </label>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
              }}
            >
              {submitting ? 'Saving Clinical Profile...' : 'Save & Enter Patient Portal →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
