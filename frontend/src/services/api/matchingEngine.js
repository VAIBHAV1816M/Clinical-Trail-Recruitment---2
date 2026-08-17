import { calculateAge } from '../../utils/ageCalculator';

/**
 * Calculates Gaussian affinity score for continuous numeric preferences
 * Formula: weight * exp(-0.5 * ((value - ideal) / tolerance)^2)
 */
export function calculateGaussianScore(value, ideal, tolerance, weight = 1.0) {
  if (value === null || value === undefined || ideal === null || tolerance === null || tolerance <= 0) {
    return 0.0;
  }
  const diff = value - ideal;
  const exponent = -0.5 * Math.pow(diff / tolerance, 2);
  const score = weight * Math.exp(exponent);
  return Math.max(0.0, Math.min(weight, score));
}

/**
 * Flattens structured patient record into key-value map for matching rules.
 */
export function flattenPatientData(patient) {
  const data = {
    age: patient.dob ? calculateAge(patient.dob) : null,
    gender: patient.gender,
    blood_group: patient.blood_group,
    smoking: patient.smoking,
    alcohol: patient.alcohol,
    previous_surgery: patient.previous_surgery,
  };

  let vitalsId = null;

  if (patient.vitals && patient.vitals.length > 0) {
    const sortedVitals = [...patient.vitals].sort(
      (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
    );
    const latest = sortedVitals[0];
    vitalsId = latest.vitals_id;
    data.bp_systolic = latest.bp_systolic;
    data.bp_diastolic = latest.bp_diastolic;
    data.heart_rate = latest.heart_rate;
    data.hba1c = latest.hba1c;
    data.bmi = latest.bmi;
    data.cholesterol = latest.cholesterol;
    data.alt = latest.alt;
    data.creatinine = latest.creatinine;
    data.blood_glucose = latest.blood_glucose;
  }

  data.conditions = patient.conditions ? patient.conditions.map(c => c.condition_name) : [];
  data.allergies = patient.allergies ? patient.allergies.map(a => a.allergen) : [];

  return { patientData: data, vitalsId };
}

/**
 * Evaluates strictly required (HARD) criteria.
 */
export function evaluateHardCriteria(patientData, hardCriteria) {
  const failures = [];

  for (const crit of hardCriteria) {
    const val = patientData[crit.field];

    if (val === null || val === undefined) {
      failures.push({
        field: crit.field,
        reason: `Missing required patient data for '${crit.field}'`
      });
      continue;
    }

    if (crit.data_type === 'NUMERIC') {
      if (val < crit.numeric_min || val > crit.numeric_max) {
        failures.push({
          field: crit.field,
          reason: `Value ${val} is outside strictly required range [${crit.numeric_min} - ${crit.numeric_max}]`
        });
      }
    } else if (crit.data_type === 'CATEGORICAL') {
      if (crit.operator === 'INCLUDES' && Array.isArray(val)) {
        if (!val.includes(crit.categorical_ideal)) {
          failures.push({
            field: crit.field,
            reason: `Required condition '${crit.categorical_ideal}' not found in patient history`
          });
        }
      } else {
        if (val !== crit.categorical_ideal) {
          failures.push({
            field: crit.field,
            reason: `Value '${val}' does not match required '${crit.categorical_ideal}'`
          });
        }
      }
    } else if (crit.data_type === 'BOOLEAN') {
      if (val !== crit.boolean_ideal) {
        failures.push({
          field: crit.field,
          reason: `Required ${crit.boolean_ideal ? 'Yes' : 'No'}, but patient has ${val ? 'Yes' : 'No'}`
        });
      }
    }
  }

  return {
    hardPassed: failures.length === 0,
    failures
  };
}

/**
 * Evaluates preferential (SOFT) criteria.
 */
export function evaluateSoftCriteria(patientData, softCriteria) {
  const contributions = [];

  for (const crit of softCriteria) {
    const val = patientData[crit.field];
    const weight = crit.weight !== null && crit.weight !== undefined ? crit.weight : 1.0;
    let contribution = 0.0;

    if (val !== null && val !== undefined) {
      if (crit.data_type === 'NUMERIC') {
        contribution = calculateGaussianScore(
          Number(val),
          crit.numeric_ideal,
          crit.numeric_tolerance,
          weight
        );
      } else if (crit.data_type === 'CATEGORICAL') {
        if (crit.operator === 'INCLUDES' && Array.isArray(val)) {
          if (val.includes(crit.categorical_ideal)) {
            contribution = weight;
          }
        } else {
          if (val === crit.categorical_ideal) {
            contribution = weight;
          }
        }
      } else if (crit.data_type === 'BOOLEAN') {
        if (val === crit.boolean_ideal) {
          contribution = weight;
        }
      }
    }

    contributions.push({
      field: crit.field,
      contribution: Math.round(contribution * 100) / 100,
      max_possible: weight
    });
  }

  return contributions;
}

/**
 * Computes non-disqualifying gaps from criteria explanations.
 */
export function computeGaps(criteriaSnapshot) {
  const explanations = criteriaSnapshot?.explanations || [];
  return explanations
    .filter(exp => exp.type === 'SOFT' && exp.score < exp.max_score)
    .map(exp => exp.message);
}

/**
 * Core Matching Engine Orchestrator
 * Returns exact schema shape expected by the frontend and backend.
 */
export function runMatchingEngine(patient, trial) {
  // 1. Active trial conflict
  if (patient.active_trial_id && patient.active_trial_id !== trial.trial_id) {
    return {
      patient_id: patient.patient_id,
      trial_id: trial.trial_id,
      match_percentage: 0.0,
      verdict: 'REJECTED',
      eligible: false,
      vitals_id: null,
      criteria_snapshot: {
        reason: 'Patient is actively enrolled in another trial.',
        explanations: [
          {
            field: 'active_trial_id',
            type: 'HARD',
            passed: false,
            message: `Patient is actively enrolled in trial ${patient.active_trial_id}.`
          }
        ]
      }
    };
  }

  const criteria = trial.criteria || [];
  const hardCriteria = criteria.filter(c => c.classification === 'HARD');
  const softCriteria = criteria.filter(c => c.classification === 'SOFT');

  // 2. Flatten patient data
  const { patientData, vitalsId } = flattenPatientData(patient);

  // 3. Evaluate Hard Criteria
  const { hardPassed, failures } = evaluateHardCriteria(patientData, hardCriteria);

  if (!hardPassed) {
    const explanations = failures.map(f => ({
      field: f.field,
      type: 'HARD',
      passed: false,
      message: f.reason
    }));

    return {
      patient_id: patient.patient_id,
      trial_id: trial.trial_id,
      match_percentage: 0.0,
      verdict: 'REJECTED',
      eligible: false,
      vitals_id: vitalsId,
      criteria_snapshot: {
        criteria_used: criteria,
        explanations
      }
    };
  }

  // 4. Evaluate Soft Criteria & Scoring
  const softContributions = evaluateSoftCriteria(patientData, softCriteria);
  
  let matchPercentage = 100.0;
  if (softCriteria.length > 0) {
    const totalScore = softContributions.reduce((acc, curr) => acc + curr.contribution, 0);
    const maxScore = softContributions.reduce((acc, curr) => acc + curr.max_possible, 0);
    matchPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 1000) / 10 : 100.0;
  }

  // 5. Determine Verdict
  const verdict = matchPercentage >= 90.0 ? 'APPROVED' : 'NEEDS_REVIEW';
  const eligible = true;

  // 6. Generate Explanations
  const explanations = [
    ...hardCriteria.map(h => ({
      field: h.field,
      type: 'HARD',
      passed: true,
      message: `Passed hard criterion for ${h.field}.`
    })),
    ...softContributions.map(s => ({
      field: s.field,
      type: 'SOFT',
      passed: true,
      score: s.contribution,
      max_score: s.max_possible,
      message: `Contributed ${s.contribution}/${s.max_possible} to overall score.`
    }))
  ];

  return {
    patient_id: patient.patient_id,
    trial_id: trial.trial_id,
    match_percentage: matchPercentage,
    verdict,
    eligible,
    vitals_id: vitalsId,
    criteria_snapshot: {
      criteria_used: criteria,
      explanations
    }
  };
}
