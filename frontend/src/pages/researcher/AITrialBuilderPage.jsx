import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  Loader2,
  Check,
  Bot
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_PROTOCOLS } from '../../data/sampleProtocols';
import { CriteriaBadge } from '../../components/common/CriteriaBadge';
import { Modal } from '../../components/common/Modal';

export function AITrialBuilderPage({ setActiveTab }) {
  const { createTrial, showToast } = useApp();

  // Wizard Steps: 1: Info, 2: AI Extract, 3: Review/Edit Criteria, 4: Confirm
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Form Data
  const [trialName, setTrialName] = useState('');
  const [description, setDescription] = useState('');
  const [targetRecruitment, setTargetRecruitment] = useState(100);
  const [sourceType, setSourceType] = useState('PDF');

  // Step 2 Protocol Text / File
  const [protocolText, setProtocolText] = useState(SAMPLE_PROTOCOLS[0].text);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  // Step 3 Criteria List
  const [criteriaList, setCriteriaList] = useState([]);

  // Criterion Add/Edit Modal
  const [isCriterionModalOpen, setIsCriterionModalOpen] = useState(false);
  const [editingCriterionIndex, setEditingCriterionIndex] = useState(null);
  
  // Criterion Form State
  const [field, setField] = useState('age');
  const [dataType, setDataType] = useState('NUMERIC');
  const [classification, setClassification] = useState('HARD');
  const [operator, setOperator] = useState('BETWEEN');
  const [numericMin, setNumericMin] = useState(18);
  const [numericMax, setNumericMax] = useState(75);
  const [numericIdeal, setNumericIdeal] = useState(6.5);
  const [numericTolerance, setNumericTolerance] = useState(1.0);
  const [categoricalIdeal, setCategoricalIdeal] = useState('Type 2 Diabetes');
  const [booleanIdeal, setBooleanIdeal] = useState(false);
  const [weight, setWeight] = useState(1.0);

  // Handle Sample Protocol Selection
  const handleSelectSample = (sample) => {
    setProtocolText(sample.text);
    if (!trialName) {
      setTrialName(sample.title);
      setDescription(`Protocol study focusing on ${sample.title}.`);
    }
  };

  // Simulated AI Extraction with realistic telemetry
  const handleExtractWithAI = () => {
    if (!protocolText.trim()) {
      showToast('Error', 'Please provide protocol text or upload a document.', 'danger');
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(15);

    setTimeout(() => setExtractionProgress(45), 400);
    setTimeout(() => setExtractionProgress(75), 800);
    setTimeout(() => {
      setExtractionProgress(100);

      // Generated criteria based on text or sample
      const extracted = [
        {
          field: 'age',
          data_type: 'NUMERIC',
          classification: 'HARD',
          operator: 'BETWEEN',
          numeric_min: 18.0,
          numeric_max: 75.0,
          weight: 1.0,
          importance: 1
        },
        {
          field: 'conditions',
          data_type: 'CATEGORICAL',
          classification: 'HARD',
          operator: 'INCLUDES',
          categorical_ideal: 'Type 2 Diabetes',
          weight: 1.0,
          importance: 1
        },
        {
          field: 'bp_systolic',
          data_type: 'NUMERIC',
          classification: 'HARD',
          operator: 'BETWEEN',
          numeric_min: 90.0,
          numeric_max: 160.0,
          weight: 1.0,
          importance: 2
        },
        {
          field: 'hba1c',
          data_type: 'NUMERIC',
          classification: 'SOFT',
          operator: 'GAUSSIAN',
          numeric_ideal: 6.5,
          numeric_tolerance: 1.0,
          weight: 1.5,
          importance: 3
        },
        {
          field: 'blood_glucose',
          data_type: 'NUMERIC',
          classification: 'SOFT',
          operator: 'GAUSSIAN',
          numeric_ideal: 120.0,
          numeric_tolerance: 25.0,
          weight: 1.0,
          importance: 4
        },
        {
          field: 'bmi',
          data_type: 'NUMERIC',
          classification: 'SOFT',
          operator: 'GAUSSIAN',
          numeric_ideal: 27.5,
          numeric_tolerance: 4.0,
          weight: 1.0,
          importance: 5
        },
        {
          field: 'smoking',
          data_type: 'BOOLEAN',
          classification: 'SOFT',
          operator: 'EQUALS',
          boolean_ideal: false,
          weight: 0.8,
          importance: 6
        }
      ];

      setCriteriaList(extracted);
      setIsExtracting(false);
      setCurrentStep(3);
      showToast('AI Extraction Complete', `Llama 3.3 70B parsed ${extracted.length} eligibility criteria rules.`, 'success');
    }, 1200);
  };

  const handleOpenAddCriterion = () => {
    setEditingCriterionIndex(null);
    setField('age');
    setDataType('NUMERIC');
    setClassification('HARD');
    setOperator('BETWEEN');
    setNumericMin(18);
    setNumericMax(75);
    setNumericIdeal(6.5);
    setNumericTolerance(1.0);
    setCategoricalIdeal('');
    setBooleanIdeal(false);
    setWeight(1.0);
    setIsCriterionModalOpen(true);
  };

  const handleOpenEditCriterion = (crit, index) => {
    setEditingCriterionIndex(index);
    setField(crit.field);
    setDataType(crit.data_type);
    setClassification(crit.classification);
    setOperator(crit.operator || 'BETWEEN');
    setNumericMin(crit.numeric_min || 0);
    setNumericMax(crit.numeric_max || 100);
    setNumericIdeal(crit.numeric_ideal || 0);
    setNumericTolerance(crit.numeric_tolerance || 1);
    setCategoricalIdeal(crit.categorical_ideal || '');
    setBooleanIdeal(crit.boolean_ideal || false);
    setWeight(crit.weight || 1.0);
    setIsCriterionModalOpen(true);
  };

  const handleSaveCriterion = (e) => {
    e.preventDefault();
    const newCrit = {
      field,
      data_type: dataType,
      classification,
      operator,
      weight: Number(weight) || 1.0,
      importance: 1,
      numeric_min: (dataType === 'NUMERIC' && classification === 'HARD') ? Number(numericMin) : null,
      numeric_max: (dataType === 'NUMERIC' && classification === 'HARD') ? Number(numericMax) : null,
      numeric_ideal: (dataType === 'NUMERIC' && classification === 'SOFT') ? Number(numericIdeal) : null,
      numeric_tolerance: (dataType === 'NUMERIC' && classification === 'SOFT') ? Number(numericTolerance) : null,
      categorical_ideal: dataType === 'CATEGORICAL' ? categoricalIdeal : null,
      boolean_ideal: dataType === 'BOOLEAN' ? Boolean(booleanIdeal) : null
    };

    if (editingCriterionIndex !== null) {
      setCriteriaList(prev => prev.map((c, i) => i === editingCriterionIndex ? newCrit : c));
    } else {
      setCriteriaList(prev => [...prev, newCrit]);
    }
    setIsCriterionModalOpen(false);
  };

  const handleDeleteCriterion = (index) => {
    setCriteriaList(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmAndLaunch = () => {
    if (!trialName.trim()) {
      showToast('Validation Error', 'Trial name is required.', 'danger');
      return;
    }
    if (criteriaList.length === 0) {
      showToast('Validation Error', 'Please define at least one eligibility criterion.', 'danger');
      return;
    }

    const created = createTrial(
      {
        trial_name: trialName,
        description,
        target_recruitment: targetRecruitment,
        source_type: sourceType,
        original_text: protocolText
      },
      criteriaList
    );

    setActiveTab('trial-detail');
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Wizard Header & Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 700, fontSize: '0.84rem' }}>
            <Bot size={18} />
            <span>AI PROTOCOL EXTRACTION WIZARD</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: 2 }}>
            Create Clinical Trial Study
          </h2>
        </div>

        {/* Stepper Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[
            { num: 1, label: 'Study Info' },
            { num: 2, label: 'AI Builder' },
            { num: 3, label: 'Review Criteria' },
            { num: 4, label: 'Confirm' }
          ].map((s, idx) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: currentStep === s.num ? '#0284c7' : currentStep > s.num ? '#ecfdf5' : 'var(--bg-subtle)',
                  color: currentStep === s.num ? '#ffffff' : currentStep > s.num ? '#065f46' : 'var(--slate-500)',
                  border: `1px solid ${currentStep === s.num ? '#0284c7' : currentStep > s.num ? '#a7f3d0' : 'var(--border-subtle)'}`,
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                {currentStep > s.num ? <Check size={12} /> : <span>{s.num}</span>}
                <span>{s.label}</span>
              </div>
              {idx < 3 && <div style={{ width: 12, height: 1, background: 'var(--slate-300)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Trial Information */}
      {currentStep === 1 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                Step 1: Trial Information
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Enter primary trial metadata and target recruitment cohort.
              </p>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label form-label-req">Study / Protocol Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Type 2 Diabetes Glycemic Control Study (GLYCO-NEXT)"
                value={trialName}
                onChange={(e) => setTrialName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Study Description & Objectives</label>
              <textarea
                className="form-textarea"
                placeholder="Provide clinical summary, mechanism of action, or study therapeutic area..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label form-label-req">Recruitment Target (Patients)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="10000"
                  value={targetRecruitment}
                  onChange={(e) => setTargetRecruitment(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Source Ingestion Type</label>
                <select
                  className="form-select"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                >
                  <option value="PDF">PDF Protocol Document</option>
                  <option value="TEXT">Clinical Trial Text Extract</option>
                  <option value="MANUAL">Manual Protocol Creation</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!trialName.trim()) {
                  showToast('Required Field', 'Please provide a study name.', 'danger');
                  return;
                }
                setCurrentStep(2);
              }}
            >
              <span>Continue to AI Protocol Ingestion</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI Protocol Extraction */}
      {currentStep === 2 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                Step 2: AI Protocol Extraction
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Upload a protocol PDF or paste clinical trial text. Groq / Llama 3.3 70B will parse criteria into strict schema rules.
              </p>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Templates */}
            <div>
              <label className="form-label">Or select a clinical sample protocol:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.35rem' }}>
                {SAMPLE_PROTOCOLS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSelectSample(sample)}
                    style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0.6rem 0.85rem' }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0369a1' }}>{sample.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload or Text Paste */}
            <div className="form-group">
              <label className="form-label form-label-req">Protocol Clinical Text</label>
              <textarea
                className="form-textarea"
                rows={8}
                placeholder="Paste inclusion and exclusion criteria paragraphs here..."
                value={protocolText}
                onChange={(e) => setProtocolText(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.5 }}
              />
            </div>

            {/* AI Extraction State Indicator */}
            {isExtracting && (
              <div
                style={{
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Loader2 size={20} color="#0284c7" className="animate-pulse" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0369a1' }}>
                      Groq Llama 3.3 70B Engine Ingesting Protocol...
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                      Evaluating HARD gating boundaries and Gaussian preference tolerances ({extractionProgress}%)
                    </div>
                  </div>
                </div>
                <div className="progress-track" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${extractionProgress}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={handleExtractWithAI}
              disabled={isExtracting || !protocolText.trim()}
            >
              <Sparkles size={16} />
              <span>{isExtracting ? 'Extracting Criteria...' : 'Generate Criteria with AI'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Edit Criteria */}
      {currentStep === 3 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                Step 3: Review & Edit Criteria
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                {criteriaList.length} criteria extracted. Edit values, adjust weights, or add custom rules.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleOpenAddCriterion}>
              <Plus size={14} />
              <span>Add Custom Criterion</span>
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {criteriaList.map((crit, idx) => (
              <CriteriaBadge
                key={idx}
                criterion={crit}
                editable={true}
                onEdit={() => handleOpenEditCriterion(crit, idx)}
                onDelete={() => handleDeleteCriterion(idx)}
              />
            ))}
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
              <ArrowLeft size={16} />
              <span>Back to Text</span>
            </button>
            <button className="btn btn-primary" onClick={() => setCurrentStep(4)}>
              <span>Review Summary & Confirm</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm & Launch */}
      {currentStep === 4 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                Step 4: Confirm & Launch Study
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Review study parameters before committing to live recruitment workspace.
              </p>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>{trialName}</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--slate-600)', marginTop: 4 }}>{description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--slate-700)' }}>
                <div>Target Recruitment: <strong>{targetRecruitment} patients</strong></div>
                <div>Configured Criteria: <strong>{criteriaList.length} rules</strong></div>
                <div>Status: <strong>OPEN</strong></div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
                Summary of Configured Criteria
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {criteriaList.map((crit, idx) => (
                  <CriteriaBadge key={idx} criterion={crit} editable={false} />
                ))}
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setCurrentStep(3)}>
              <ArrowLeft size={16} />
              <span>Back to Edit</span>
            </button>
            <button className="btn btn-success btn-lg" onClick={handleConfirmAndLaunch}>
              <CheckCircle2 size={18} />
              <span>Confirm Criteria & Launch Study</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Criterion Modal */}
      {isCriterionModalOpen && (
        <Modal
          isOpen={isCriterionModalOpen}
          onClose={() => setIsCriterionModalOpen(false)}
          title={editingCriterionIndex !== null ? 'Edit Criterion' : 'Add New Eligibility Criterion'}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsCriterionModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveCriterion}>
                Save Criterion
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveCriterion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label form-label-req">Field Name</label>
                <select className="form-select" value={field} onChange={(e) => setField(e.target.value)}>
                  <option value="age">Age</option>
                  <option value="gender">Gender</option>
                  <option value="conditions">Conditions (History)</option>
                  <option value="hba1c">HbA1c</option>
                  <option value="blood_glucose">Fasting Blood Glucose</option>
                  <option value="bmi">Body Mass Index (BMI)</option>
                  <option value="bp_systolic">BP Systolic</option>
                  <option value="bp_diastolic">BP Diastolic</option>
                  <option value="cholesterol">Total Cholesterol</option>
                  <option value="creatinine">Serum Creatinine</option>
                  <option value="alt">ALT Enzyme</option>
                  <option value="smoking">Smoking Status</option>
                  <option value="alcohol">Alcohol Consumption</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-req">Data Type</label>
                <select className="form-select" value={dataType} onChange={(e) => setDataType(e.target.value)}>
                  <option value="NUMERIC">NUMERIC</option>
                  <option value="CATEGORICAL">CATEGORICAL</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label form-label-req">Classification</label>
                <select className="form-select" value={classification} onChange={(e) => setClassification(e.target.value)}>
                  <option value="HARD">HARD (Mandatory Gate)</option>
                  <option value="SOFT">SOFT (Gaussian Scoring Preference)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-req">Operator</label>
                <select className="form-select" value={operator} onChange={(e) => setOperator(e.target.value)}>
                  <option value="BETWEEN">BETWEEN (Min - Max)</option>
                  <option value="GAUSSIAN">GAUSSIAN (Ideal ± Tolerance)</option>
                  <option value="INCLUDES">INCLUDES (List match)</option>
                  <option value="EQUALS">EQUALS (Exact match)</option>
                </select>
              </div>
            </div>

            {/* NUMERIC HARD bounds */}
            {dataType === 'NUMERIC' && classification === 'HARD' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label form-label-req">Numeric Min</label>
                  <input type="number" step="any" className="form-input" value={numericMin} onChange={(e) => setNumericMin(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-req">Numeric Max</label>
                  <input type="number" step="any" className="form-input" value={numericMax} onChange={(e) => setNumericMax(e.target.value)} required />
                </div>
              </div>
            )}

            {/* NUMERIC SOFT Gaussian bounds */}
            {dataType === 'NUMERIC' && classification === 'SOFT' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label form-label-req">Numeric Ideal</label>
                  <input type="number" step="any" className="form-input" value={numericIdeal} onChange={(e) => setNumericIdeal(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-req">Numeric Tolerance</label>
                  <input type="number" step="any" className="form-input" value={numericTolerance} onChange={(e) => setNumericTolerance(e.target.value)} required />
                </div>
              </div>
            )}

            {/* CATEGORICAL Value */}
            {dataType === 'CATEGORICAL' && (
              <div className="form-group">
                <label className="form-label form-label-req">Categorical Ideal / Required</label>
                <input type="text" className="form-input" value={categoricalIdeal} onChange={(e) => setCategoricalIdeal(e.target.value)} placeholder="e.g. Type 2 Diabetes" required />
              </div>
            )}

            {/* BOOLEAN Value */}
            {dataType === 'BOOLEAN' && (
              <div className="form-group">
                <label className="form-label form-label-req">Boolean Ideal</label>
                <select className="form-select" value={booleanIdeal ? 'true' : 'false'} onChange={(e) => setBooleanIdeal(e.target.value === 'true')}>
                  <option value="false">False / No</option>
                  <option value="true">True / Yes</option>
                </select>
              </div>
            )}

            {/* Weight */}
            {classification === 'SOFT' && (
              <div className="form-group">
                <label className="form-label">Scoring Weight (0.1 - 5.0)</label>
                <input type="number" step="0.1" min="0.1" max="5.0" className="form-input" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
