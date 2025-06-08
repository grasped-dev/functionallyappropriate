import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, Upload, Download, Save, Trash2, GraduationCap, Brain, MessageSquare, Stethoscope, Eye, Users } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { useReports } from '../context/ReportContext';

// Form data interface
interface FormData {
  studentName: string;
  dateOfBirth: string;
  dateOfEvaluation: string;
  grade: string;
  examiner: string;
  reasonForReferral: string;
  backgroundInformation: string;
  behavioralObservations: string;
  testResults: string;
  summaryFindings: string;
  recommendations: string;
  [key: string]: string;
}

// New interfaces for template structure
interface SubTemplate {
  id: string;
  name: string;
  description: string;
  content: string; 
}

interface TemplateCategory {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  icon?: React.ElementType;
  subTemplates: SubTemplate[];
}

// Template categories with sub-templates
const templateCategories: TemplateCategory[] = [
  {
    categoryId: 'academic',
    categoryName: 'Academic Achievement Reports',
    categoryDescription: 'Comprehensive assessments of academic skills including reading, writing, and mathematics',
    icon: GraduationCap,
    subTemplates: [
      {
        id: 'academic-wjiv',
        name: 'Woodcock-Johnson IV (WJ IV ACH)',
        description: 'Comprehensive academic achievement assessment covering broad achievement, reading, written language, and mathematics',
        content: `# ACADEMIC ACHIEVEMENT REPORT

## Student Information
Name: [STUDENT NAME]
Date of Birth: [DOB]
Date of Evaluation: [DOE]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON FOR REFERRAL]

## Background Information
[RELEVANT BACKGROUND INFORMATION]

## Assessment Instruments Administered
Woodcock-Johnson IV Tests of Achievement (WJ IV ACH)
[Other relevant academic tests or checklists]

## Behavioral Observations
[OBSERVATIONS DURING ASSESSMENT]

## Test Results & Interpretation
Woodcock-Johnson IV Tests of Achievement

Clusters:
Broad Achievement: SS [SCORE], PR [PERCENTILE], Range [DESCRIPTIVE RANGE]
Reading: SS [SCORE], PR [PERCENTILE], Range [DESCRIPTIVE RANGE]
Written Language: SS [SCORE], PR [PERCENTILE], Range [DESCRIPTIVE RANGE]
Mathematics: SS [SCORE], PR [PERCENTILE], Range [DESCRIPTIVE RANGE]

Subtests (Examples):
Letter-Word Identification: SS [SCORE], PR [PERCENTILE]
Passage Comprehension: SS [SCORE], PR [PERCENTILE]
Spelling: SS [SCORE], PR [PERCENTILE]
Calculation: SS [SCORE], PR [PERCENTILE]
Applied Problems: SS [SCORE], PR [PERCENTILE]

[NARRATIVE INTERPRETATION OF ACADEMIC SCORES]

## Summary of Findings
[KEY FINDINGS FROM ACADEMIC ASSESSMENT]

## Recommendations
[ACADEMIC RECOMMENDATIONS]`
      },
      {
        id: 'academic-wiat',
        name: 'WIAT-4 (Wechsler Individual Achievement Test)',
        description: 'Comprehensive academic achievement test measuring reading, mathematics, written language, and oral language',
        content: `# ACADEMIC ACHIEVEMENT REPORT - WIAT-4

## Student Information
Name: [STUDENT NAME]
Date of Birth: [DOB]
Date of Evaluation: [DOE]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON FOR REFERRAL]

## Background Information
[RELEVANT BACKGROUND INFORMATION]

## Assessment Instruments Administered
Wechsler Individual Achievement Test - Fourth Edition (WIAT-4)
[Other relevant academic tests or checklists]

## Behavioral Observations
[OBSERVATIONS DURING ASSESSMENT]

## Test Results & Interpretation
WIAT-4 Results:

Composite Scores:
Total Achievement: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Basic Reading: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Reading Comprehension and Fluency: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Written Expression: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Mathematics: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Oral Language: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]

Subtest Scores:
Word Reading: SS [SCORE], PR [PERCENTILE]
Reading Comprehension: SS [SCORE], PR [PERCENTILE]
Pseudoword Decoding: SS [SCORE], PR [PERCENTILE]
Orthographic Fluency: SS [SCORE], PR [PERCENTILE]
Spelling: SS [SCORE], PR [PERCENTILE]
Essay Composition: SS [SCORE], PR [PERCENTILE]
Numerical Operations: SS [SCORE], PR [PERCENTILE]
Math Problem Solving: SS [SCORE], PR [PERCENTILE]

[NARRATIVE INTERPRETATION OF ACADEMIC SCORES]

## Summary of Findings
[KEY FINDINGS FROM ACADEMIC ASSESSMENT]

## Recommendations
[ACADEMIC RECOMMENDATIONS]`
      }
    ]
  },
  {
    categoryId: 'cognitive',
    categoryName: 'Cognitive Processing Reports',
    categoryDescription: 'Assessments of cognitive abilities, processing strengths, and intellectual functioning',
    icon: Brain,
    subTemplates: [
      {
        id: 'cognitive-wisc',
        name: 'WISC-V (Wechsler Intelligence Scale)',
        description: 'Comprehensive cognitive assessment measuring verbal comprehension, visual spatial, fluid reasoning, working memory, and processing speed',
        content: `# COGNITIVE PROCESSING REPORT - WISC-V

## Student Information
Name: [STUDENT NAME]
Date of Birth: [DOB]
Date of Evaluation: [DOE]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON FOR REFERRAL]

## Background Information
[RELEVANT BACKGROUND INFORMATION]

## Assessment Instruments Administered
Wechsler Intelligence Scale for Children - Fifth Edition (WISC-V)
[Other cognitive or processing measures]

## Behavioral Observations
[OBSERVATIONS DURING ASSESSMENT]

## Test Results & Interpretation
WISC-V Results:

Overall/Composite Scores:
Full Scale IQ (FSIQ): Score [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL], Range [DESCRIPTIVE RANGE]

Index Scores:
Verbal Comprehension Index (VCI): Score [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Visual Spatial Index (VSI): Score [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Fluid Reasoning Index (FRI): Score [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Working Memory Index (WMI): Score [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Processing Speed Index (PSI): Score [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]

Subtest Scores:
Similarities: SS [SCORE], PR [PERCENTILE]
Vocabulary: SS [SCORE], PR [PERCENTILE]
Block Design: SS [SCORE], PR [PERCENTILE]
Matrix Reasoning: SS [SCORE], PR [PERCENTILE]
Digit Span: SS [SCORE], PR [PERCENTILE]
Coding: SS [SCORE], PR [PERCENTILE]

[NARRATIVE INTERPRETATION OF COGNITIVE SCORES AND PROCESSING AREAS]

## Summary of Cognitive Strengths and Weaknesses
[SUMMARY OF KEY COGNITIVE FINDINGS]

## Implications for Learning
[HOW COGNITIVE PROFILE IMPACTS LEARNING]

## Recommendations
[RECOMMENDATIONS BASED ON COGNITIVE PROFILE]`
      }
    ]
  },
  {
    categoryId: 'speech-language',
    categoryName: 'Speech & Language Reports',
    categoryDescription: 'Communication assessments including receptive/expressive language, articulation, fluency, and voice',
    icon: MessageSquare,
    subTemplates: [
      {
        id: 'speech-celf',
        name: 'CELF-5 (Clinical Evaluation of Language)',
        description: 'Comprehensive language assessment measuring receptive and expressive language skills',
        content: `# SPEECH AND LANGUAGE EVALUATION REPORT - CELF-5

## Student Information
Name: [STUDENT NAME]
Date of Birth: [DOB]
Date of Evaluation: [DOE]
Grade: [GRADE]
Examiner: [EXAMINER, SLP]

## Reason for Referral
[REASON FOR REFERRAL]

## Background Information & Communication History
[RELEVANT BACKGROUND, DEVELOPMENTAL MILESTONES, PREVIOUS THERAPY]

## Assessment Methods
Clinical Evaluation of Language Fundamentals - Fifth Edition (CELF-5)
Informal Measures (Language Sample, Observation, Criterion-Referenced)
Oral Motor Examination

## Behavioral Observations
[OBSERVATIONS DURING ASSESSMENT]

## Assessment Results & Interpretation
CELF-5 Results:

Core Language Score: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Receptive Language Index: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Expressive Language Index: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Language Content Index: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]
Language Structure Index: SS [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL]

Subtest Scores:
Sentence Comprehension: SS [SCORE], PR [PERCENTILE]
Linguistic Concepts: SS [SCORE], PR [PERCENTILE]
Word Structure: SS [SCORE], PR [PERCENTILE]
Word Classes: SS [SCORE], PR [PERCENTILE]
Following Directions: SS [SCORE], PR [PERCENTILE]
Formulated Sentences: SS [SCORE], PR [PERCENTILE]
Recalling Sentences: SS [SCORE], PR [PERCENTILE]

[NARRATIVE INTERPRETATION OF LANGUAGE SCORES]

Articulation/Phonology
[SOUNDS IN ERROR, PHONOLOGICAL PROCESSES, INTELLIGIBILITY]

Fluency
[OBSERVATIONS, STUTTERING CHARACTERISTICS, IMPACT]

Voice
[QUALITY, PITCH, LOUDNESS]

## Summary of Communication Strengths and Needs
[OVERALL SUMMARY]

## Diagnostic Impressions & Eligibility
[SPEECH/LANGUAGE IMPAIRMENT DIAGNOSIS]

## Recommendations
[THERAPY GOALS, CLASSROOM STRATEGIES, HOME SUGGESTIONS]`
      }
    ]
  },
  {
    categoryId: 'behavioral',
    categoryName: 'Behavioral & Social-Emotional Reports',
    categoryDescription: 'Assessments of behavior, social skills, emotional regulation, and adaptive functioning',
    icon: Users,
    subTemplates: [
      {
        id: 'behavioral-basc',
        name: 'BASC-3 (Behavior Assessment System)',
        description: 'Comprehensive behavioral and emotional assessment including teacher, parent, and self-report measures',
        content: `# BEHAVIORAL AND SOCIAL-EMOTIONAL ASSESSMENT REPORT - BASC-3

## Student Information
Name: [STUDENT NAME]
Date of Birth: [DOB]
Date of Evaluation: [DOE]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON FOR REFERRAL]

## Background Information
[RELEVANT BACKGROUND INFORMATION]

## Assessment Instruments Administered
Behavior Assessment System for Children - Third Edition (BASC-3)
- Teacher Rating Scale (TRS)
- Parent Rating Scale (PRS)
- Self-Report of Personality (SRP) [if age appropriate]
[Other behavioral measures or observations]

## Behavioral Observations
[OBSERVATIONS DURING ASSESSMENT]

## Assessment Results & Interpretation

### BASC-3 Teacher Rating Scale Results:
Composite Scores:
Externalizing Problems: T-Score [SCORE], PR [PERCENTILE], Classification [CLASSIFICATION]
Internalizing Problems: T-Score [SCORE], PR [PERCENTILE], Classification [CLASSIFICATION]
School Problems: T-Score [SCORE], PR [PERCENTILE], Classification [CLASSIFICATION]
Behavioral Symptoms Index: T-Score [SCORE], PR [PERCENTILE], Classification [CLASSIFICATION]
Adaptive Skills: T-Score [SCORE], PR [PERCENTILE], Classification [CLASSIFICATION]

Clinical Scales:
Hyperactivity: T-Score [SCORE], PR [PERCENTILE]
Aggression: T-Score [SCORE], PR [PERCENTILE]
Conduct Problems: T-Score [SCORE], PR [PERCENTILE]
Anxiety: T-Score [SCORE], PR [PERCENTILE]
Depression: T-Score [SCORE], PR [PERCENTILE]
Somatization: T-Score [SCORE], PR [PERCENTILE]
Attention Problems: T-Score [SCORE], PR [PERCENTILE]
Learning Problems: T-Score [SCORE], PR [PERCENTILE]
Atypicality: T-Score [SCORE], PR [PERCENTILE]
Withdrawal: T-Score [SCORE], PR [PERCENTILE]

Adaptive Scales:
Adaptability: T-Score [SCORE], PR [PERCENTILE]
Social Skills: T-Score [SCORE], PR [PERCENTILE]
Leadership: T-Score [SCORE], PR [PERCENTILE]
Activities of Daily Living: T-Score [SCORE], PR [PERCENTILE]
Functional Communication: T-Score [SCORE], PR [PERCENTILE]

### BASC-3 Parent Rating Scale Results:
[SIMILAR FORMAT TO TEACHER RATINGS]

### BASC-3 Self-Report Results (if applicable):
[SELF-REPORT FINDINGS]

[NARRATIVE INTERPRETATION OF BEHAVIORAL AND EMOTIONAL FUNCTIONING]

## Summary of Behavioral and Social-Emotional Functioning
[SUMMARY OF KEY FINDINGS]

## Diagnostic Impressions & Eligibility
[BEHAVIORAL/EMOTIONAL DISABILITY CONSIDERATIONS]

## Recommendations
[BEHAVIORAL INTERVENTIONS, CLASSROOM STRATEGIES, COUNSELING RECOMMENDATIONS]`
      }
    ]
  },
  {
    categoryId: 'medical',
    categoryName: 'Medical & Health Reports',
    categoryDescription: 'Health-related assessments including vision, hearing, occupational therapy, and physical therapy evaluations',
    icon: Stethoscope,
    subTemplates: [
      {
        id: 'medical-ot',
        name: 'Occupational Therapy Evaluation',
        description: 'Assessment of fine motor skills, sensory processing, and activities of daily living',
        content: `# OCCUPATIONAL THERAPY EVALUATION REPORT

## Student Information
Name: [STUDENT NAME]
Date of Birth: [DOB]
Date of Evaluation: [DOE]
Grade: [GRADE]
Examiner: [EXAMINER, OTR/L]

## Reason for Referral
[REASON FOR REFERRAL]

## Background Information
[RELEVANT BACKGROUND, MEDICAL HISTORY, PREVIOUS THERAPY]

## Assessment Methods
[LIST OF STANDARDIZED TESTS AND INFORMAL ASSESSMENTS]
Clinical Observations
Sensory Profile
Fine Motor Skills Assessment
Visual Motor Integration Assessment

## Behavioral Observations
[OBSERVATIONS DURING ASSESSMENT]

## Assessment Results & Interpretation

### Fine Motor Skills
[ASSESSMENT RESULTS AND INTERPRETATION]

### Visual Motor Integration
[ASSESSMENT RESULTS AND INTERPRETATION]

### Sensory Processing
[ASSESSMENT RESULTS AND INTERPRETATION]

### Activities of Daily Living
[ASSESSMENT RESULTS AND INTERPRETATION]

### Handwriting and Written Work
[ASSESSMENT RESULTS AND INTERPRETATION]

## Summary of Occupational Therapy Findings
[SUMMARY OF KEY FINDINGS]

## Recommendations
[OT GOALS, CLASSROOM ACCOMMODATIONS, HOME STRATEGIES]

## Service Recommendations
[FREQUENCY AND DURATION OF OT SERVICES IF NEEDED]`
      }
    ]
  }
];

const CreateReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { addReport } = useReports();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    dateOfBirth: '',
    dateOfEvaluation: '',
    grade: '',
    examiner: '',
    reasonForReferral: '',
    backgroundInformation: '',
    behavioralObservations: '',
    testResults: '',
    summaryFindings: '',
    recommendations: '',
  });
  const [reportContent, setReportContent] = useState<string>('');
  const [draftKey, setDraftKey] = useState<string>('');

  // Get current action from URL
  const currentAction = searchParams.get('action');

  // Load draft and handle URL parameters
  useEffect(() => {
    const templateParam = searchParams.get('template');
    const actionParam = searchParams.get('action');
    
    if (templateParam) {
      // Find the template in categories
      for (const category of templateCategories) {
        const template = category.subTemplates.find(t => t.id === templateParam);
        if (template) {
          setSelectedTemplateId(templateParam);
          setSelectedCategoryId(category.categoryId);
          break;
        }
      }
    }

    // Handle custom template from location state
    if (location.state?.customTemplateContent) {
      setUploadedContent(location.state.customTemplateContent);
      setSelectedTemplateId('custom');
    }

    // Generate or load draft key
    const key = templateParam || actionParam || 'general';
    setDraftKey(key);
    
    // Load draft from localStorage
    const savedDraft = localStorage.getItem(`report-draft-${key}`);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData || formData);
        setReportContent(draft.reportContent || '');
        if (draft.currentStep) {
          setCurrentStep(draft.currentStep);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [searchParams, location.state]);

  // Auto-save draft
  useEffect(() => {
    if (draftKey && (Object.values(formData).some(value => value.trim() !== '') || reportContent.trim() !== '')) {
      const draft = {
        formData,
        reportContent,
        currentStep,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`report-draft-${draftKey}`, JSON.stringify(draft));
    }
  }, [formData, reportContent, currentStep, draftKey]);

  const clearDraft = () => {
    if (draftKey) {
      localStorage.removeItem(`report-draft-${draftKey}`);
    }
    setFormData({
      studentName: '',
      dateOfBirth: '',
      dateOfEvaluation: '',
      grade: '',
      examiner: '',
      reasonForReferral: '',
      backgroundInformation: '',
      behavioralObservations: '',
      testResults: '',
      summaryFindings: '',
      recommendations: '',
    });
    setReportContent('');
  };

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      
      if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setUploadedContent(result.value);
          setSelectedTemplateId('custom');
        } catch (error) {
          console.error("Error converting DOCX to HTML:", error);
          alert("Could not process the DOCX file. Please try a different file.");
        }
      } else {
        alert("Only .docx files are currently supported.");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const getSelectedTemplate = () => {
    if (selectedTemplateId === 'custom') {
      return { content: uploadedContent };
    }
    
    for (const category of templateCategories) {
      const template = category.subTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        return template;
      }
    }
    return null;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = () => {
    const template = getSelectedTemplate();
    if (!template) return;

    let content = template.content;
    
    // Replace placeholders with form data
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = `[${key.toUpperCase().replace(/([A-Z])/g, '_$1')}]`;
      content = content.replace(new RegExp(placeholder, 'g'), value || `[${placeholder}]`);
    });

    // Common replacements
    content = content.replace(/\[STUDENT NAME\]/g, formData.studentName || '[STUDENT NAME]');
    content = content.replace(/\[DOB\]/g, formData.dateOfBirth || '[DOB]');
    content = content.replace(/\[DOE\]/g, formData.dateOfEvaluation || '[DOE]');
    content = content.replace(/\[GRADE\]/g, formData.grade || '[GRADE]');
    content = content.replace(/\[EXAMINER\]/g, formData.examiner || '[EXAMINER]');

    setReportContent(content);
    setCurrentStep(3);
  };

  const handleSaveReport = () => {
    const template = getSelectedTemplate();
    const reportName = `${formData.studentName || 'Unnamed Student'} - ${template?.name || 'Custom Report'}`;
    
    addReport({
      id: Date.now(),
      name: reportName,
      type: template?.name || 'Custom Report',
      date: new Date().toISOString(),
      status: 'Draft',
      content: reportContent,
      formData: formData
    });

    // Clear draft after saving
    clearDraft();
    
    navigate('/reports');
  };

  const handleDownloadReport = async () => {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: reportContent.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line)]
            })
          )
        }]
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${formData.studentName || 'Report'}_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document. Please try again.');
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/reports')}
          className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Reports
        </button>
        <h1 className="text-2xl font-medium">Create New Report</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                step <= currentStep 
                  ? 'bg-gold text-black border-gold' 
                  : 'border-border text-text-secondary'
              }`}>
                <span className="text-sm font-medium">{step}</span>
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 mx-2 transition-all ${
                  step < currentStep ? 'bg-gold' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <div className="animate-fadeIn">
            {!selectedCategoryId && !currentAction && !selectedTemplateId && (
              <>
                <h2 className="text-xl font-medium mb-6 text-center">Step 1: Choose a Report Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templateCategories.map((category) => (
                    <button
                      key={category.categoryId}
                      onClick={() => {
                        setSelectedCategoryId(category.categoryId);
                        clearDraft();
                      }}
                      className="text-left p-6 border border-border rounded-lg hover:border-gold hover:shadow-lg transition-all group bg-bg-secondary"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {category.icon && <category.icon className="text-gold group-hover:scale-110 transition-transform" size={28} />}
                        <h3 className="font-semibold text-lg text-text-primary">{category.categoryName}</h3>
                      </div>
                      <p className="text-sm text-text-secondary mb-4">{category.categoryDescription}</p>
                      <div className="mt-auto flex items-center text-gold text-sm font-medium">
                        <span>View Templates</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-10 pt-6 border-t border-border text-center">
                  <p className="text-text-secondary mb-3">Or, if you have your own template file:</p>
                  <button 
                    className="btn border border-border hover:border-gold text-gold"
                    onClick={() => {
                      setSelectedFile(null);
                      clearDraft();
                      setSelectedCategoryId(null);
                      setSearchParams({action: 'upload'});
                    }}
                  >
                    Upload a Custom Template File
                  </button>
                </div>
              </>
            )}

            {/* Upload UI */}
            {currentAction === 'upload' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Upload Custom Template</h2>
                  <button
                    onClick={() => {
                      setSearchParams({});
                      setSelectedFile(null);
                      setUploadedContent('');
                    }}
                    className="btn border border-border hover:bg-bg-secondary"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Categories
                  </button>
                </div>
                
                <div className="mb-6">
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                      isDragActive 
                        ? 'border-gold bg-gold bg-opacity-5' 
                        : 'border-border hover:border-gold hover:bg-gold hover:bg-opacity-5'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto mb-4 text-gold" size={48} />
                    <h3 className="text-lg font-medium mb-2">
                      {isDragActive ? 'Drop your file here' : 'Upload Template File'}
                    </h3>
                    <p className="text-text-secondary">
                      Drag and drop a .docx file, or click to browse
                    </p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="mb-6 p-4 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="text-gold" size={20} />
                      <div>
                        <h4 className="font-medium">{selectedFile.name}</h4>
                        <p className="text-sm text-text-secondary">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {uploadedContent && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Template Preview</h3>
                    <div className="bg-bg-secondary p-4 rounded-lg max-h-64 overflow-y-auto">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: uploadedContent }}
                      />
                    </div>
                  </div>
                )}

                {selectedTemplateId === 'custom' && uploadedContent && (
                  <div className="flex justify-end">
                    <button
                      onClick={nextStep}
                      className="btn bg-accent-gold text-black flex items-center gap-2"
                    >
                      Continue with Template
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Form Data Entry */}
        {currentStep === 2 && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Step 2: Enter Student Information</h2>
              <div className="flex gap-2">
                <button
                  onClick={prevStep}
                  className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={generateReport}
                  className="btn bg-accent-gold text-black flex items-center gap-2"
                >
                  Generate Report
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Student Name</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Enter student's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Evaluation</label>
                <input
                  type="date"
                  value={formData.dateOfEvaluation}
                  onChange={(e) => handleInputChange('dateOfEvaluation', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Grade</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="e.g., 3rd Grade, Kindergarten"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Examiner</label>
                <input
                  type="text"
                  value={formData.examiner}
                  onChange={(e) => handleInputChange('examiner', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Enter examiner's name and credentials"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Reason for Referral</label>
                <textarea
                  value={formData.reasonForReferral}
                  onChange={(e) => handleInputChange('reasonForReferral', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold h-24"
                  placeholder="Describe the reason for this evaluation..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Background Information</label>
                <textarea
                  value={formData.backgroundInformation}
                  onChange={(e) => handleInputChange('backgroundInformation', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold h-24"
                  placeholder="Relevant background information..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Behavioral Observations</label>
                <textarea
                  value={formData.behavioralObservations}
                  onChange={(e) => handleInputChange('behavioralObservations', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold h-24"
                  placeholder="Observations during assessment..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Test Results & Interpretation</label>
                <textarea
                  value={formData.testResults}
                  onChange={(e) => handleInputChange('testResults', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold h-32"
                  placeholder="Detailed test results and interpretation..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Summary of Findings</label>
                <textarea
                  value={formData.summaryFindings}
                  onChange={(e) => handleInputChange('summaryFindings', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold h-24"
                  placeholder="Key findings from the assessment..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Recommendations</label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold h-24"
                  placeholder="Recommendations based on assessment results..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Export */}
        {currentStep === 3 && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Step 3: Review & Export Report</h2>
              <div className="flex gap-2">
                <button
                  onClick={prevStep}
                  className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Edit Information
                </button>
                <button
                  onClick={() => {
                    clearDraft();
                    setCurrentStep(1);
                    setSelectedTemplateId(null);
                    setSelectedCategoryId(null);
                    setSearchParams({});
                  }}
                  className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear & Start Over
                </button>
                <button
                  onClick={handleSaveReport}
                  className="btn bg-green text-white flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Report
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="btn bg-accent-gold text-black flex items-center gap-2"
                >
                  <Download size={16} />
                  Download DOCX
                </button>
              </div>
            </div>

            <div className="bg-bg-secondary p-6 rounded-lg">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {reportContent}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReportPage;