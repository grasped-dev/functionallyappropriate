import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, ArrowLeft, ArrowRight, Download, Eye, EyeOff, Sparkles, User, Calendar, GraduationCap, FileCheck, Brain, MessageSquare, Target, Lightbulb, CheckCircle } from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Define the form data interface
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
  // Add index signature for custom template fields
  [key: string]: string;
}

// Predefined templates
const predefinedTemplates = {
  'academic-achievement': {
    name: 'Academic Achievement Report',
    description: 'Comprehensive report on student academic skills',
    content: `# ACADEMIC ACHIEVEMENT REPORT

## Student Information
Name: [STUDENT_NAME]
Date of Birth: [DATE_OF_BIRTH]
Date of Evaluation: [DATE_OF_EVALUATION]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON_FOR_REFERRAL]

## Background Information
[BACKGROUND_INFORMATION]

## Assessment Instruments Administered
Woodcock-Johnson IV Tests of Achievement (WJ IV ACH)
[Other relevant academic tests or checklists]

## Behavioral Observations
[BEHAVIORAL_OBSERVATIONS]

## Test Results & Interpretation
[TEST_RESULTS]

## Summary of Findings
[SUMMARY_FINDINGS]

## Recommendations
[RECOMMENDATIONS]`
  },
  'cognitive-processing': {
    name: 'Cognitive Processing Report',
    description: 'Details student cognitive abilities and processing',
    content: `# COGNITIVE PROCESSING REPORT

## Student Information
Name: [STUDENT_NAME]
Date of Birth: [DATE_OF_BIRTH]
Date of Evaluation: [DATE_OF_EVALUATION]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON_FOR_REFERRAL]

## Background Information
[BACKGROUND_INFORMATION]

## Assessment Instruments Administered
[Name of Cognitive Assessment, e.g., WISC-V, DAS-II, KABC-II]
[Other cognitive or processing measures]

## Behavioral Observations
[BEHAVIORAL_OBSERVATIONS]

## Test Results & Interpretation
[TEST_RESULTS]

## Summary of Cognitive Strengths and Weaknesses
[SUMMARY_FINDINGS]

## Implications for Learning
[How cognitive profile impacts learning]

## Recommendations
[RECOMMENDATIONS]`
  },
  'speech-language': {
    name: 'Speech & Language Report',
    description: 'Assesses communication including receptive/expressive language',
    content: `# SPEECH AND LANGUAGE EVALUATION REPORT

## Student Information
Name: [STUDENT_NAME]
Date of Birth: [DATE_OF_BIRTH]
Date of Evaluation: [DATE_OF_EVALUATION]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON_FOR_REFERRAL]

## Background Information & Communication History
[BACKGROUND_INFORMATION]

## Assessment Methods
Standardized Tests (e.g., CELF-5, PLS-5, GFTA-3)
Informal Measures (Language Sample, Observation, Criterion-Referenced)
Oral Motor Examination

## Behavioral Observations
[BEHAVIORAL_OBSERVATIONS]

## Assessment Results & Interpretation
[TEST_RESULTS]

## Summary of Communication Strengths and Needs
[SUMMARY_FINDINGS]

## Diagnostic Impressions & Eligibility
[Speech/Language Impairment Diagnosis]

## Recommendations
[RECOMMENDATIONS]`
  }
};

const CreateReportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addReport } = useReports();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
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
  
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Get custom template data from route state
  const routeState = location.state as {
    customTemplateContent?: string;
    customTemplatePlaceholders?: string[];
    customTemplateName?: string;
  } | null;

  const isCustomTemplate = !!routeState?.customTemplateContent;
  const customContent = routeState?.customTemplateContent || '';
  const customPlaceholders = routeState?.customTemplatePlaceholders || [];
  const customName = routeState?.customTemplateName || '';

  // Initialize from URL params
  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      setSelectedTemplateId(templateParam);
      if (!isCustomTemplate && predefinedTemplates[templateParam as keyof typeof predefinedTemplates]) {
        setCurrentStep(2);
      } else if (isCustomTemplate) {
        setCurrentStep(2);
      }
    }
  }, [searchParams, isCustomTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setCurrentStep(2);
  };

  const populateTemplate = (template: string, data: FormData): string => {
    let populated = template;
    
    // Replace placeholders with form data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `[${key.toUpperCase()}]`;
      populated = populated.replace(new RegExp(placeholder, 'g'), value || '[Not provided]');
    });
    
    return populated;
  };

  const populateCustomTemplate = (htmlContent: string, data: FormData): string => {
    let populated = htmlContent;
    
    // Replace custom placeholders with form data
    customPlaceholders.forEach(placeholderKey => {
      const placeholder = `[${placeholderKey}]`;
      const value = data[placeholderKey] || '[Not provided]';
      populated = populated.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return populated;
  };

  const createDocxDocument = async (content: string, isCustomHtml: boolean = false) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: isCustomHtml ? 
          parseHtmlToDocxParagraphs(content) : 
          parseMarkdownToDocxParagraphs(content)
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = isCustomTemplate ? 
      `${customName || 'Custom Report'} - ${formData.studentName || 'Student'}.docx` :
      `${predefinedTemplates[selectedTemplateId as keyof typeof predefinedTemplates]?.name || 'Report'} - ${formData.studentName || 'Student'}.docx`;
    
    saveAs(blob, fileName);
  };

  const parseHtmlToDocxParagraphs = (htmlContent: string): Paragraph[] => {
    // Simple HTML to DOCX conversion for custom templates
    const paragraphs: Paragraph[] = [];
    
    // Remove HTML tags and split by common block elements
    const cleanText = htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?(p|div|h[1-6])[^>]*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .split('\n')
      .filter(line => line.trim());

    cleanText.forEach(line => {
      if (line.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun(line.trim())]
        }));
      }
    });

    return paragraphs;
  };

  const parseMarkdownToDocxParagraphs = (content: string): Paragraph[] => {
    const lines = content.split('\n');
    const paragraphs: Paragraph[] = [];

    lines.forEach(line => {
      if (line.trim() === '') {
        return;
      }

      if (line.startsWith('# ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1
        }));
      } else if (line.startsWith('## ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2
        }));
      } else if (line.startsWith('### ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3
        }));
      } else {
        paragraphs.push(new Paragraph({
          children: [new TextRun(line)]
        }));
      }
    });

    return paragraphs;
  };

  const handleSaveReport = () => {
    const templateContentForPopulation = isCustomTemplate ? customContent : 
      predefinedTemplates[selectedTemplateId as keyof typeof predefinedTemplates]?.content || '';
    
    const populatedContent = isCustomTemplate ? 
      populateCustomTemplate(templateContentForPopulation, formData) :
      populateTemplate(templateContentForPopulation, formData);

    const templateNameForDisplay = isCustomTemplate ? customName :
      predefinedTemplates[selectedTemplateId as keyof typeof predefinedTemplates]?.name || 'Unknown Template';

    const newReport = {
      id: Date.now(),
      name: `${formData.studentName || 'Student'} - ${templateNameForDisplay}`,
      type: templateNameForDisplay,
      date: new Date().toISOString(),
      status: 'Draft' as const,
      content: populatedContent,
      formData: formData
    };

    addReport(newReport);
    navigate('/reports');
  };

  // Academic Achievement sub-steps
  const academicSubSteps = [
    {
      title: 'Student Information',
      icon: <User className="text-gold" size={20} />,
      fields: ['studentName', 'dateOfBirth', 'dateOfEvaluation', 'grade', 'examiner']
    },
    {
      title: 'Referral & Background',
      icon: <FileText className="text-gold" size={20} />,
      fields: ['reasonForReferral', 'backgroundInformation']
    },
    {
      title: 'Assessment & Observations',
      icon: <Brain className="text-gold" size={20} />,
      fields: ['behavioralObservations', 'testResults']
    },
    {
      title: 'Summary & Recommendations',
      icon: <Target className="text-gold" size={20} />,
      fields: ['summaryFindings', 'recommendations']
    }
  ];

  const renderFieldInput = (fieldName: string, label: string, type: 'input' | 'textarea' | 'date' = 'input', placeholder?: string) => {
    const commonProps = {
      name: fieldName,
      value: formData[fieldName as keyof FormData] || '',
      onChange: handleInputChange,
      className: "w-full p-3 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold text-text-primary",
      placeholder: placeholder || `Enter ${label.toLowerCase()}`
    };

    return (
      <div key={fieldName} className="space-y-2">
        <label htmlFor={fieldName} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            {...commonProps}
            id={fieldName}
            rows={4}
          />
        ) : (
          <input
            {...commonProps}
            id={fieldName}
            type={type}
          />
        )}
      </div>
    );
  };

  // Step 1: Template Selection
  if (currentStep === 1) {
    return (
      <div className="animate-fadeIn">
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

        <div className="card max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <FileText className="text-gold mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-medium mb-2">Choose a Report Template</h2>
            <p className="text-text-secondary">Select a template to get started with your report</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(predefinedTemplates).map(([id, template]) => (
              <button
                key={id}
                onClick={() => handleTemplateSelect(id)}
                className="text-left p-6 border border-border rounded-lg hover:border-gold hover:bg-gold hover:bg-opacity-5 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="text-gold group-hover:scale-110 transition-transform" size={24} />
                  <h3 className="font-medium text-lg">{template.name}</h3>
                </div>
                <p className="text-sm text-text-secondary">{template.description}</p>
                <div className="mt-4 flex items-center text-gold text-sm">
                  <span>Use Template</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          {isCustomTemplate && (
            <div className="mt-8 p-6 border-2 border-dashed border-gold rounded-lg bg-gold bg-opacity-5">
              <div className="text-center">
                <Sparkles className="text-gold mx-auto mb-3" size={32} />
                <h3 className="text-lg font-medium mb-2">Custom Template Detected</h3>
                <p className="text-text-secondary mb-4">
                  You've selected a custom template: <strong>{customName}</strong>
                </p>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn bg-accent-gold text-black"
                >
                  Use Custom Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Form Input
  if (currentStep === 2) {
    return (
      <div className="animate-fadeIn">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Templates
          </button>
          <h1 className="text-2xl font-medium">
            {isCustomTemplate ? `Fill Custom Template: ${customName}` : 
             predefinedTemplates[selectedTemplateId as keyof typeof predefinedTemplates]?.name || 'Report Details'}
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Custom Template Form */}
          {isCustomTemplate && (
            <div className="space-y-6 animate-fadeIn" id="substep-custom-template-fields">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 text-gold">
                  Fill in Details for: {customName || 'Your Custom Template'}
                </h3>
                
                {customPlaceholders && customPlaceholders.length > 0 ? (
                  <div className="space-y-6">
                    {customPlaceholders.map(placeholderKey => (
                      <div key={placeholderKey} className="p-4 border border-border rounded-md bg-bg-secondary">
                        <label 
                          htmlFor={`custom_field_${placeholderKey}`} 
                          className="block text-sm font-medium mb-2 capitalize text-text-primary"
                        >
                          {placeholderKey.replace(/_/g, ' ').toLowerCase()}:
                        </label>
                        <textarea
                          name={placeholderKey}
                          id={`custom_field_${placeholderKey}`}
                          rows={3}
                          value={formData[placeholderKey as keyof FormData] || ''}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold text-text-primary"
                          placeholder={`Enter data for ${placeholderKey.replace(/_/g, ' ').toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileCheck className="text-text-secondary mx-auto mb-3" size={48} />
                    <p className="text-text-secondary">
                      This custom template does not have any defined placeholders. You can proceed directly to review.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                  <button 
                    onClick={() => setCurrentStep(1)} 
                    className="btn border border-border hover:bg-bg-secondary"
                  >
                    Back to Templates
                  </button>
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="btn bg-accent-gold text-black"
                  >
                    Review Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Predefined Template Forms */}
          {!isCustomTemplate && selectedTemplateId === 'academic-achievement' && (
            <div className="space-y-6">
              {/* Progress indicator */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Academic Achievement Report</h3>
                  <span className="text-sm text-text-secondary">
                    Step {currentSubStep + 1} of {academicSubSteps.length}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mb-8">
                  {academicSubSteps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        index <= currentSubStep 
                          ? 'bg-gold text-black border-gold' 
                          : 'border-border text-text-secondary'
                      }`}>
                        {index < currentSubStep ? (
                          <CheckCircle size={20} />
                        ) : (
                          step.icon
                        )}
                      </div>
                      {index < academicSubSteps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 transition-all ${
                          index < currentSubStep ? 'bg-gold' : 'bg-border'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h4 className="text-xl font-medium mb-2 flex items-center gap-2">
                    {academicSubSteps[currentSubStep].icon}
                    {academicSubSteps[currentSubStep].title}
                  </h4>
                </div>

                <div className="space-y-6">
                  {currentSubStep === 0 && (
                    <>
                      {renderFieldInput('studentName', 'Student Name')}
                      {renderFieldInput('dateOfBirth', 'Date of Birth', 'date')}
                      {renderFieldInput('dateOfEvaluation', 'Date of Evaluation', 'date')}
                      {renderFieldInput('grade', 'Grade Level')}
                      {renderFieldInput('examiner', 'Examiner Name')}
                    </>
                  )}

                  {currentSubStep === 1 && (
                    <>
                      {renderFieldInput('reasonForReferral', 'Reason for Referral', 'textarea', 'Describe why the student was referred for evaluation...')}
                      {renderFieldInput('backgroundInformation', 'Background Information', 'textarea', 'Include relevant educational history, previous assessments, interventions...')}
                    </>
                  )}

                  {currentSubStep === 2 && (
                    <>
                      {renderFieldInput('behavioralObservations', 'Behavioral Observations', 'textarea', 'Describe the student\'s behavior during assessment...')}
                      {renderFieldInput('testResults', 'Test Results & Interpretation', 'textarea', 'Include specific test scores, standard scores, percentiles, and interpretation...')}
                    </>
                  )}

                  {currentSubStep === 3 && (
                    <>
                      {renderFieldInput('summaryFindings', 'Summary of Findings', 'textarea', 'Summarize key findings from the assessment...')}
                      {renderFieldInput('recommendations', 'Recommendations', 'textarea', 'Provide specific recommendations for instruction, accommodations, services...')}
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                  <button
                    onClick={() => {
                      if (currentSubStep > 0) {
                        setCurrentSubStep(currentSubStep - 1);
                      } else {
                        setCurrentStep(1);
                      }
                    }}
                    className="btn border border-border hover:bg-bg-secondary"
                  >
                    {currentSubStep === 0 ? 'Back to Templates' : 'Previous'}
                  </button>

                  <button
                    onClick={() => {
                      if (currentSubStep < academicSubSteps.length - 1) {
                        setCurrentSubStep(currentSubStep + 1);
                      } else {
                        setCurrentStep(3);
                      }
                    }}
                    className="btn bg-accent-gold text-black"
                  >
                    {currentSubStep === academicSubSteps.length - 1 ? 'Review Report' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other predefined templates - simplified single-step forms */}
          {!isCustomTemplate && (selectedTemplateId === 'cognitive-processing' || selectedTemplateId === 'speech-language') && (
            <div className="card space-y-6">
              <h3 className="text-xl font-semibold mb-4 text-gold">
                {predefinedTemplates[selectedTemplateId as keyof typeof predefinedTemplates]?.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFieldInput('studentName', 'Student Name')}
                {renderFieldInput('dateOfBirth', 'Date of Birth', 'date')}
                {renderFieldInput('dateOfEvaluation', 'Date of Evaluation', 'date')}
                {renderFieldInput('grade', 'Grade Level')}
                {renderFieldInput('examiner', 'Examiner Name')}
              </div>

              <div className="space-y-6">
                {renderFieldInput('reasonForReferral', 'Reason for Referral', 'textarea')}
                {renderFieldInput('backgroundInformation', 'Background Information', 'textarea')}
                {renderFieldInput('behavioralObservations', 'Behavioral Observations', 'textarea')}
                {renderFieldInput('testResults', 'Test Results & Interpretation', 'textarea')}
                {renderFieldInput('summaryFindings', 'Summary of Findings', 'textarea')}
                {renderFieldInput('recommendations', 'Recommendations', 'textarea')}
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn border border-border hover:bg-bg-secondary"
                >
                  Back to Templates
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn bg-accent-gold text-black"
                >
                  Review Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Preview and Save
  if (currentStep === 3) {
    const templateContentForPopulation = isCustomTemplate ? customContent : 
      predefinedTemplates[selectedTemplateId as keyof typeof predefinedTemplates]?.content || '';
    
    const populatedContent = isCustomTemplate ? 
      populateCustomTemplate(templateContentForPopulation, formData) :
      populateTemplate(templateContentForPopulation, formData);

    const templateNameForDisplay = isCustomTemplate ? customName :
      predefinedTemplates[selectedTemplateId as keyof typeof predefinedTemplates]?.name || 'Unknown Template';

    return (
      <div className="animate-fadeIn">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Form
          </button>
          <h1 className="text-2xl font-medium">Review Report</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium">{templateNameForDisplay}</h2>
                <p className="text-text-secondary">
                  Student: {formData.studentName || 'Not specified'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  onClick={() => createDocxDocument(populatedContent, isCustomTemplate)}
                  className="btn border border-gold text-gold hover:bg-gold hover:bg-opacity-10 flex items-center gap-2"
                >
                  <Download size={16} />
                  Download DOCX
                </button>
                <button
                  onClick={handleSaveReport}
                  className="btn bg-accent-gold text-black flex items-center gap-2"
                >
                  <FileText size={16} />
                  Save Report
                </button>
              </div>
            </div>

            {showPreview && (
              <div className="border border-border rounded-md p-6 bg-bg-secondary max-h-96 overflow-y-auto">
                {isCustomTemplate ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: populatedContent }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {populatedContent}
                  </pre>
                )}
              </div>
            )}

            {!showPreview && (
              <div className="text-center py-12 text-text-secondary">
                <Eye size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">Report Ready for Review</p>
                <p>Click "Show Preview" to see the populated report content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CreateReportPage;