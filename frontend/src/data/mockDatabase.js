/**
 * AegisTrial — In-Memory Mock Database
 * Strictly adheres to backend Pydantic models, enums, and relational constraints.
 */

export const INITIAL_TRIALS = [
  {
    trial_id: "T001",
    trial_name: "Type 2 Diabetes Glycemic Control Study (GLYCO-NEXT)",
    description: "A Phase III multi-center randomized evaluation of novel oral incretin-enhancer for optimizing glycemic indices in adult patients with inadequately controlled T2D.",
    source_type: "PDF",
    status: "OPEN",
    target_recruitment: 100,
    original_text: "Phase III Glycemic Control in Adults with Type 2 Diabetes protocol extract.",
    created_at: "2026-06-15T09:00:00Z",
    updated_at: "2026-08-10T14:30:00Z",
    criteria: [
      {
        criterion_id: 101,
        trial_id: "T001",
        field: "age",
        data_type: "NUMERIC",
        classification: "HARD",
        operator: "BETWEEN",
        numeric_min: 18.0,
        numeric_max: 75.0,
        weight: 1.0,
        importance: 1
      },
      {
        criterion_id: 102,
        trial_id: "T001",
        field: "conditions",
        data_type: "CATEGORICAL",
        classification: "HARD",
        operator: "INCLUDES",
        categorical_ideal: "Type 2 Diabetes",
        weight: 1.0,
        importance: 1
      },
      {
        criterion_id: 103,
        trial_id: "T001",
        field: "bp_systolic",
        data_type: "NUMERIC",
        classification: "HARD",
        operator: "BETWEEN",
        numeric_min: 90.0,
        numeric_max: 160.0,
        weight: 1.0,
        importance: 2
      },
      {
        criterion_id: 104,
        trial_id: "T001",
        field: "hba1c",
        data_type: "NUMERIC",
        classification: "SOFT",
        operator: "GAUSSIAN",
        numeric_ideal: 6.5,
        numeric_tolerance: 1.0,
        weight: 1.5,
        importance: 3
      },
      {
        criterion_id: 105,
        trial_id: "T001",
        field: "blood_glucose",
        data_type: "NUMERIC",
        classification: "SOFT",
        operator: "GAUSSIAN",
        numeric_ideal: 120.0,
        numeric_tolerance: 25.0,
        weight: 1.0,
        importance: 4
      },
      {
        criterion_id: 106,
        trial_id: "T001",
        field: "bmi",
        data_type: "NUMERIC",
        classification: "SOFT",
        operator: "GAUSSIAN",
        numeric_ideal: 27.5,
        numeric_tolerance: 4.0,
        weight: 1.0,
        importance: 5
      },
      {
        criterion_id: 107,
        trial_id: "T001",
        field: "smoking",
        data_type: "BOOLEAN",
        classification: "SOFT",
        operator: "EQUALS",
        boolean_ideal: false,
        weight: 0.8,
        importance: 6
      }
    ]
  },
  {
    trial_id: "T002",
    trial_name: "Phase II Renal Biomarkers & Hypertension Protocol",
    description: "Investigation of targeted ACE-inhibitor titration on glomerular filtration rates and urinary albumin excretion in hypertensive cohort.",
    source_type: "TEXT",
    status: "OPEN",
    target_recruitment: 50,
    original_text: "Renal Biomarkers & Hypertension titration protocol text.",
    created_at: "2026-07-01T11:00:00Z",
    updated_at: "2026-08-12T16:00:00Z",
    criteria: [
      {
        criterion_id: 201,
        trial_id: "T002",
        field: "age",
        data_type: "NUMERIC",
        classification: "HARD",
        operator: "BETWEEN",
        numeric_min: 25.0,
        numeric_max: 80.0,
        weight: 1.0,
        importance: 1
      },
      {
        criterion_id: 202,
        trial_id: "T002",
        field: "conditions",
        data_type: "CATEGORICAL",
        classification: "HARD",
        operator: "INCLUDES",
        categorical_ideal: "Hypertension",
        weight: 1.0,
        importance: 1
      },
      {
        criterion_id: 203,
        trial_id: "T002",
        field: "alt",
        data_type: "NUMERIC",
        classification: "HARD",
        operator: "BETWEEN",
        numeric_min: 7.0,
        numeric_max: 56.0,
        weight: 1.0,
        importance: 2
      },
      {
        criterion_id: 204,
        trial_id: "T002",
        field: "creatinine",
        data_type: "NUMERIC",
        classification: "SOFT",
        operator: "GAUSSIAN",
        numeric_ideal: 1.0,
        numeric_tolerance: 0.3,
        weight: 1.5,
        importance: 3
      },
      {
        criterion_id: 205,
        trial_id: "T002",
        field: "bp_systolic",
        data_type: "NUMERIC",
        classification: "SOFT",
        operator: "GAUSSIAN",
        numeric_ideal: 130.0,
        numeric_tolerance: 15.0,
        weight: 1.2,
        importance: 4
      }
    ]
  },
  {
    trial_id: "T003",
    trial_name: "Cardiovascular Lipid Management & PCSK9 Trial",
    description: "Assessment of subcutaneous monoclonal antibody therapy on LDL-C reduction and major adverse cardiovascular events in high-risk patients.",
    source_type: "MANUAL",
    status: "OPEN",
    target_recruitment: 80,
    original_text: "Cardiovascular lipid lowering study protocol.",
    created_at: "2026-07-15T08:30:00Z",
    updated_at: "2026-08-14T10:15:00Z",
    criteria: [
      {
        criterion_id: 301,
        trial_id: "T003",
        field: "age",
        data_type: "NUMERIC",
        classification: "HARD",
        operator: "BETWEEN",
        numeric_min: 40.0,
        numeric_max: 85.0,
        weight: 1.0,
        importance: 1
      },
      {
        criterion_id: 302,
        trial_id: "T003",
        field: "heart_rate",
        data_type: "NUMERIC",
        classification: "HARD",
        operator: "BETWEEN",
        numeric_min: 50.0,
        numeric_max: 100.0,
        weight: 1.0,
        importance: 2
      },
      {
        criterion_id: 303,
        trial_id: "T003",
        field: "smoking",
        data_type: "BOOLEAN",
        classification: "HARD",
        operator: "EQUALS",
        boolean_ideal: false,
        weight: 1.0,
        importance: 3
      },
      {
        criterion_id: 304,
        trial_id: "T003",
        field: "cholesterol",
        data_type: "NUMERIC",
        classification: "SOFT",
        operator: "GAUSSIAN",
        numeric_ideal: 190.0,
        numeric_tolerance: 30.0,
        weight: 1.5,
        importance: 4
      }
    ]
  },
  {
    trial_id: "T004",
    trial_name: "Airway Inflammation & Early Stage Asthma Study",
    description: "Clinical evaluation of inhaled anti-inflammatory biologics on eosinophil counts and FEV1 pulmonary capacity.",
    source_type: "PDF",
    status: "OPEN",
    target_recruitment: 60,
    original_text: "Asthma pulmonary airway study protocol.",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-15T09:45:00Z",
    criteria: [
      {
        criterion_id: 401,
        trial_id: "T004",
        field: "age",
        data_type: "NUMERIC",
        classification: "HARD",
        operator: "BETWEEN",
        numeric_min: 18.0,
        numeric_max: 65.0,
        weight: 1.0,
        importance: 1
      },
      {
        criterion_id: 402,
        trial_id: "T004",
        field: "conditions",
        data_type: "CATEGORICAL",
        classification: "HARD",
        operator: "INCLUDES",
        categorical_ideal: "Asthma",
        weight: 1.0,
        importance: 1
      },
      {
        criterion_id: 403,
        trial_id: "T004",
        field: "smoking",
        data_type: "BOOLEAN",
        classification: "HARD",
        operator: "EQUALS",
        boolean_ideal: false,
        weight: 1.0,
        importance: 2
      }
    ]
  }
];

export const INITIAL_PATIENTS = [
  {
    patient_id: "P014",
    name: "Jane Doe",
    gender: "Female",
    dob: "1994-05-14",
    location: "Boston, MA",
    phone: "+1 (555) 234-5678",
    blood_group: "A+",
    previous_surgery: "Appendectomy (2018)",
    smoking: false,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-05-10T08:00:00Z",
    updated_at: "2026-08-10T09:00:00Z",
    conditions: [
      { condition_id: 1, patient_id: "P014", condition_name: "Type 2 Diabetes", diagnosed_at: "2022-04-12" }
    ],
    allergies: [
      { allergy_id: 1, patient_id: "P014", allergen: "Penicillin" }
    ],
    vitals: [
      {
        vitals_id: 101,
        patient_id: "P014",
        bp_systolic: 122,
        bp_diastolic: 78,
        heart_rate: 72,
        hba1c: 6.8,
        bmi: 26.2,
        cholesterol: 184.0,
        alt: 22.0,
        creatinine: 0.95,
        blood_glucose: 124.0,
        recorded_at: "2026-08-01T10:00:00Z"
      },
      {
        vitals_id: 102,
        patient_id: "P014",
        bp_systolic: 126,
        bp_diastolic: 80,
        heart_rate: 75,
        hba1c: 7.2,
        bmi: 26.8,
        cholesterol: 190.0,
        alt: 24.0,
        creatinine: 0.98,
        blood_glucose: 135.0,
        recorded_at: "2026-05-12T14:30:00Z"
      }
    ]
  },
  {
    patient_id: "P022",
    name: "John Smith",
    gender: "Male",
    dob: "1985-11-20",
    location: "Cambridge, MA",
    phone: "+1 (555) 876-5432",
    blood_group: "O+",
    previous_surgery: null,
    smoking: false,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-08-11T11:00:00Z",
    conditions: [
      { condition_id: 2, patient_id: "P022", condition_name: "Type 2 Diabetes", diagnosed_at: "2021-08-15" },
      { condition_id: 3, patient_id: "P022", condition_name: "Hypertension", diagnosed_at: "2023-01-10" }
    ],
    allergies: [],
    vitals: [
      {
        vitals_id: 103,
        patient_id: "P022",
        bp_systolic: 128,
        bp_diastolic: 82,
        heart_rate: 68,
        hba1c: 7.1,
        bmi: 28.0,
        cholesterol: 195.0,
        alt: 28.0,
        creatinine: 1.05,
        blood_glucose: 132.0,
        recorded_at: "2026-08-05T09:15:00Z"
      }
    ]
  },
  {
    patient_id: "P031",
    name: "Sarah Williams",
    gender: "Female",
    dob: "1978-03-08",
    location: "Newton, MA",
    phone: "+1 (555) 345-6789",
    blood_group: "B+",
    previous_surgery: "Cholecystectomy (2015)",
    smoking: true,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-06-15T12:00:00Z",
    updated_at: "2026-08-08T15:00:00Z",
    conditions: [
      { condition_id: 4, patient_id: "P031", condition_name: "Type 2 Diabetes", diagnosed_at: "2020-11-05" }
    ],
    allergies: [
      { allergy_id: 2, patient_id: "P031", allergen: "Latex" }
    ],
    vitals: [
      {
        vitals_id: 104,
        patient_id: "P031",
        bp_systolic: 138,
        bp_diastolic: 88,
        heart_rate: 76,
        hba1c: 7.9,
        bmi: 31.5,
        cholesterol: 215.0,
        alt: 32.0,
        creatinine: 1.1,
        blood_glucose: 155.0,
        recorded_at: "2026-08-02T11:00:00Z"
      }
    ]
  },
  {
    patient_id: "P004",
    name: "Michael Chang",
    gender: "Male",
    dob: "1965-08-22",
    location: "Brookline, MA",
    phone: "+1 (555) 456-7890",
    blood_group: "AB+",
    previous_surgery: null,
    smoking: false,
    alcohol: true,
    consent: true,
    active_trial_id: null,
    created_at: "2026-05-20T14:00:00Z",
    updated_at: "2026-08-09T16:00:00Z",
    conditions: [
      { condition_id: 5, patient_id: "P004", condition_name: "Hypertension", diagnosed_at: "2019-03-20" }
    ],
    allergies: [],
    vitals: [
      {
        vitals_id: 105,
        patient_id: "P004",
        bp_systolic: 168,
        bp_diastolic: 98,
        heart_rate: 84,
        hba1c: 8.4,
        bmi: 29.1,
        cholesterol: 240.0,
        alt: 42.0,
        creatinine: 1.25,
        blood_glucose: 168.0,
        recorded_at: "2026-08-07T13:30:00Z"
      }
    ]
  },
  {
    patient_id: "P005",
    name: "Elena Rostova",
    gender: "Female",
    dob: "1990-09-12",
    location: "Somerville, MA",
    phone: "+1 (555) 567-8901",
    blood_group: "O-",
    previous_surgery: null,
    smoking: false,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-06-20T09:30:00Z",
    updated_at: "2026-08-12T10:00:00Z",
    conditions: [
      { condition_id: 6, patient_id: "P005", condition_name: "Hypertension", diagnosed_at: "2024-02-18" }
    ],
    allergies: [
      { allergy_id: 3, patient_id: "P005", allergen: "Sulfa drugs" }
    ],
    vitals: [
      {
        vitals_id: 106,
        patient_id: "P005",
        bp_systolic: 132,
        bp_diastolic: 84,
        heart_rate: 70,
        hba1c: 5.4,
        bmi: 23.8,
        cholesterol: 175.0,
        alt: 24.0,
        creatinine: 1.02,
        blood_glucose: 95.0,
        recorded_at: "2026-08-04T15:00:00Z"
      }
    ]
  },
  {
    patient_id: "P006",
    name: "David Miller",
    gender: "Male",
    dob: "1958-02-17",
    location: "Waltham, MA",
    phone: "+1 (555) 678-9012",
    blood_group: "A-",
    previous_surgery: "Knee Arthroscopy (2021)",
    smoking: false,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-06-25T11:20:00Z",
    updated_at: "2026-08-13T14:10:00Z",
    conditions: [
      { condition_id: 7, patient_id: "P006", condition_name: "Atherosclerosis", diagnosed_at: "2022-07-09" }
    ],
    allergies: [],
    vitals: [
      {
        vitals_id: 107,
        patient_id: "P006",
        bp_systolic: 125,
        bp_diastolic: 80,
        heart_rate: 72,
        hba1c: 5.6,
        bmi: 25.4,
        cholesterol: 198.0,
        alt: 26.0,
        creatinine: 0.92,
        blood_glucose: 102.0,
        recorded_at: "2026-08-06T08:45:00Z"
      }
    ]
  },
  {
    patient_id: "P007",
    name: "Amina Al-Mansoor",
    gender: "Female",
    dob: "1988-12-05",
    location: "Quincy, MA",
    phone: "+1 (555) 789-0123",
    blood_group: "B-",
    previous_surgery: null,
    smoking: false,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-07-02T13:40:00Z",
    updated_at: "2026-08-14T11:30:00Z",
    conditions: [
      { condition_id: 8, patient_id: "P007", condition_name: "Asthma", diagnosed_at: "2018-09-14" }
    ],
    allergies: [
      { allergy_id: 4, patient_id: "P007", allergen: "Pollen" }
    ],
    vitals: [
      {
        vitals_id: 108,
        patient_id: "P007",
        bp_systolic: 118,
        bp_diastolic: 74,
        heart_rate: 76,
        hba1c: 5.2,
        bmi: 22.5,
        cholesterol: 168.0,
        alt: 19.0,
        creatinine: 0.88,
        blood_glucose: 92.0,
        recorded_at: "2026-08-08T10:15:00Z"
      }
    ]
  },
  {
    patient_id: "P008",
    name: "Robert Davis",
    gender: "Male",
    dob: "2012-06-10",
    location: "Medford, MA",
    phone: "+1 (555) 890-1234",
    blood_group: "O+",
    previous_surgery: null,
    smoking: false,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-07-10T16:00:00Z",
    updated_at: "2026-08-01T12:00:00Z",
    conditions: [],
    allergies: [],
    vitals: [
      {
        vitals_id: 109,
        patient_id: "P008",
        bp_systolic: 110,
        bp_diastolic: 70,
        heart_rate: 80,
        hba1c: 5.0,
        bmi: 19.2,
        cholesterol: 150.0,
        alt: 18.0,
        creatinine: 0.75,
        blood_glucose: 88.0,
        recorded_at: "2026-08-01T12:00:00Z"
      }
    ]
  },
  {
    patient_id: "P009",
    name: "Maria Garcia",
    gender: "Female",
    dob: "1982-07-19",
    location: "Lowell, MA",
    phone: "+1 (555) 901-2345",
    blood_group: "A+",
    previous_surgery: null,
    smoking: false,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-07-12T10:10:00Z",
    updated_at: "2026-08-11T14:40:00Z",
    conditions: [
      { condition_id: 9, patient_id: "P009", condition_name: "Type 2 Diabetes", diagnosed_at: "2023-05-10" }
    ],
    allergies: [],
    vitals: [
      {
        vitals_id: 110,
        patient_id: "P009",
        bp_systolic: 124,
        bp_diastolic: 80,
        heart_rate: 74,
        hba1c: 6.6,
        bmi: 27.8,
        cholesterol: 188.0,
        alt: 25.0,
        creatinine: 0.94,
        blood_glucose: 122.0,
        recorded_at: "2026-08-09T09:00:00Z"
      }
    ]
  },
  {
    patient_id: "P010",
    name: "James Wilson",
    gender: "Male",
    dob: "1974-01-30",
    location: "Worcester, MA",
    phone: "+1 (555) 012-3456",
    blood_group: "O+",
    previous_surgery: "Hernia Repair (2019)",
    smoking: false,
    alcohol: false,
    consent: true,
    active_trial_id: null,
    created_at: "2026-07-15T11:45:00Z",
    updated_at: "2026-08-12T16:20:00Z",
    conditions: [
      { condition_id: 10, patient_id: "P010", condition_name: "Type 2 Diabetes", diagnosed_at: "2022-09-01" }
    ],
    allergies: [],
    vitals: [
      {
        vitals_id: 111,
        patient_id: "P010",
        bp_systolic: 130,
        bp_diastolic: 82,
        heart_rate: 70,
        hba1c: 6.7,
        bmi: 28.3,
        cholesterol: 192.0,
        alt: 27.0,
        creatinine: 1.0,
        blood_glucose: 126.0,
        recorded_at: "2026-08-10T11:00:00Z"
      }
    ]
  }
];

export const INITIAL_SCREENINGS = [
  {
    screening_id: 41,
    patient_id: "P014",
    trial_id: "T001",
    vitals_id: 101,
    match_percentage: 94.2,
    verdict: "APPROVED",
    eligible: true,
    criteria_snapshot: {
      criteria_used: INITIAL_TRIALS[0].criteria,
      explanations: [
        { field: "age", type: "HARD", passed: true, message: "Passed hard criterion for age (32 yrs within 18-75)." },
        { field: "conditions", type: "HARD", passed: true, message: "Passed hard criterion for conditions (Type 2 Diabetes found)." },
        { field: "bp_systolic", type: "HARD", passed: true, message: "Passed hard criterion for bp_systolic (122 mmHg within 90-160)." },
        { field: "hba1c", type: "SOFT", passed: true, score: 1.43, max_score: 1.5, message: "Contributed 1.43/1.5 to overall score (6.8 vs ideal 6.5)." },
        { field: "blood_glucose", type: "SOFT", passed: true, score: 0.98, max_score: 1.0, message: "Contributed 0.98/1.0 to overall score (124 vs ideal 120)." },
        { field: "bmi", type: "SOFT", passed: true, score: 0.95, max_score: 1.0, message: "Contributed 0.95/1.0 to overall score (26.2 vs ideal 27.5)." },
        { field: "smoking", type: "SOFT", passed: true, score: 0.8, max_score: 0.8, message: "Contributed 0.8/0.8 to overall score (Non-smoker)." }
      ]
    },
    screened_at: "2026-08-12T14:20:00Z"
  },
  {
    screening_id: 42,
    patient_id: "P031",
    trial_id: "T001",
    vitals_id: 104,
    match_percentage: 87.3,
    verdict: "NEEDS_REVIEW",
    eligible: true,
    criteria_snapshot: {
      criteria_used: INITIAL_TRIALS[0].criteria,
      explanations: [
        { field: "age", type: "HARD", passed: true, message: "Passed hard criterion for age (48 yrs within 18-75)." },
        { field: "conditions", type: "HARD", passed: true, message: "Passed hard criterion for conditions (Type 2 Diabetes found)." },
        { field: "bp_systolic", type: "HARD", passed: true, message: "Passed hard criterion for bp_systolic (138 mmHg within 90-160)." },
        { field: "hba1c", type: "SOFT", passed: true, score: 0.56, max_score: 1.5, message: "Contributed 0.56/1.5 to overall score (7.9 vs ideal 6.5)." },
        { field: "blood_glucose", type: "SOFT", passed: true, score: 0.38, max_score: 1.0, message: "Contributed 0.38/1.0 to overall score (155 vs ideal 120)." },
        { field: "bmi", type: "SOFT", passed: true, score: 0.61, max_score: 1.0, message: "Contributed 0.61/1.0 to overall score (31.5 vs ideal 27.5)." },
        { field: "smoking", type: "SOFT", passed: true, score: 0.0, max_score: 0.8, message: "Contributed 0.0/0.8 to overall score (Patient is a smoker)." }
      ]
    },
    screened_at: "2026-08-14T09:15:00Z"
  },
  {
    screening_id: 43,
    patient_id: "P022",
    trial_id: "T001",
    vitals_id: 103,
    match_percentage: 91.7,
    verdict: "APPROVED",
    eligible: true,
    criteria_snapshot: {
      criteria_used: INITIAL_TRIALS[0].criteria,
      explanations: [
        { field: "age", type: "HARD", passed: true, message: "Passed hard criterion for age (40 yrs within 18-75)." },
        { field: "conditions", type: "HARD", passed: true, message: "Passed hard criterion for conditions (Type 2 Diabetes found)." },
        { field: "bp_systolic", type: "HARD", passed: true, message: "Passed hard criterion for bp_systolic (128 mmHg within 90-160)." },
        { field: "hba1c", type: "SOFT", passed: true, score: 1.25, max_score: 1.5, message: "Contributed 1.25/1.5 to overall score (7.1 vs ideal 6.5)." },
        { field: "blood_glucose", type: "SOFT", passed: true, score: 0.89, max_score: 1.0, message: "Contributed 0.89/1.0 to overall score (132 vs ideal 120)." },
        { field: "bmi", type: "SOFT", passed: true, score: 0.99, max_score: 1.0, message: "Contributed 0.99/1.0 to overall score (28.0 vs ideal 27.5)." },
        { field: "smoking", type: "SOFT", passed: true, score: 0.8, max_score: 0.8, message: "Contributed 0.8/0.8 to overall score (Non-smoker)." }
      ]
    },
    screened_at: "2026-08-15T11:30:00Z"
  }
];

export const INITIAL_VERIFICATIONS = [
  {
    verification_id: 1,
    patient_id: "P014",
    trial_id: "T001",
    screening_id: 41,
    verified: true,
    verified_by: "Dr. Rachel Miller",
    verified_at: "2026-08-12T15:00:00Z",
    remarks: "Clinical profile fully matches Glyco-Next eligibility parameters. Verified for invitation."
  }
];

export const INITIAL_ENROLLMENTS = [
  {
    enrollment_id: 1,
    trial_id: "T001",
    patient_id: "P009",
    status: "ENROLLED",
    invited_at: "2026-07-15T10:00:00Z",
    accepted_at: "2026-07-16T14:30:00Z",
    declined_at: null,
    enrolled_at: "2026-07-20T09:00:00Z",
    dropped_at: null
  },
  {
    enrollment_id: 2,
    trial_id: "T001",
    patient_id: "P010",
    status: "ENROLLED",
    invited_at: "2026-07-18T11:00:00Z",
    accepted_at: "2026-07-19T16:00:00Z",
    declined_at: null,
    enrolled_at: "2026-07-22T10:30:00Z",
    dropped_at: null
  },
  {
    enrollment_id: 3,
    trial_id: "T001",
    patient_id: "P014",
    status: "INVITED",
    invited_at: "2026-08-13T10:00:00Z",
    accepted_at: null,
    declined_at: null,
    enrolled_at: null,
    dropped_at: null
  },
  {
    enrollment_id: 4,
    trial_id: "T001",
    patient_id: "P022",
    status: "ACCEPTED",
    invited_at: "2026-08-14T09:00:00Z",
    accepted_at: "2026-08-15T13:45:00Z",
    declined_at: null,
    enrolled_at: null,
    dropped_at: null
  }
];

export const INITIAL_WAITLIST = [
  {
    waitlist_id: 1,
    trial_id: "T001",
    patient_id: "P031",
    rank: 1,
    match_percentage: 87.3,
    status: "WAITING",
    created_at: "2026-08-14T10:00:00Z"
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    notification_id: 101,
    patient_id: "P014",
    trial_id: "T001",
    message: "Dear Jane, you have been invited to participate in the Type 2 Diabetes Glycemic Control Study (GLYCO-NEXT). Please review your invitation in the patient portal.",
    channel: "PORTAL",
    delivery_status: "SENT",
    response: "NONE"
  },
  {
    notification_id: 102,
    patient_id: "P022",
    trial_id: "T001",
    message: "Dear John, your pre-screening for GLYCO-NEXT is complete and you are eligible. Please confirm your participation.",
    channel: "EMAIL",
    delivery_status: "SENT",
    response: "ACCEPTED"
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    audit_id: 1,
    user_id: "Dr. Rachel Miller",
    action: "VERIFY_SCREENING",
    entity_type: "ScreeningResult",
    entity_id: "41",
    old_value: "UNVERIFIED",
    new_value: "VERIFIED",
    reason: "Approved candidate Jane Doe for Phase III enrollment.",
    timestamp: "2026-08-12T15:00:00Z"
  },
  {
    audit_id: 2,
    user_id: "SYSTEM",
    action: "ENROLLMENT_INVITED",
    entity_type: "Enrollment",
    entity_id: "3",
    old_value: "NONE",
    new_value: "INVITED",
    reason: "Automated invitation dispatch following clinical approval.",
    timestamp: "2026-08-13T10:00:00Z"
  },
  {
    audit_id: 3,
    user_id: "Dr. Rachel Miller",
    action: "UPDATE_CRITERIA",
    entity_type: "TrialCriterion",
    entity_id: "104",
    old_value: "numeric_tolerance: 0.8",
    new_value: "numeric_tolerance: 1.0",
    reason: "Expanded HbA1c tolerance based on updated protocol amendment.",
    timestamp: "2026-08-10T14:30:00Z"
  }
];
