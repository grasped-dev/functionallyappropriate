import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, Sparkles, Download, Save, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useReports } from '../context/ReportContext';

// Updated FormData interface with index signature for dynamic keys
interface FormData {
  studentName?: string; // Example of a common, optional predefined key
  dob?: string;         // Example
  doe?: string;         // Example
  grade?: string;
  examiner?: string;
  reasonForReferral?: string;
  backgroundInfo?: string;
  assessmentInstruments?: string;
  behavioralObservations?: string;
  narrativeInterpretation?: string;
  summaryOfFindings?: string;
  recommendations?: string;
  includeExtendedBattery?: boolean; // Specific for some templates
  // Index signature for all other dynamic placeholder keys
  [key: string]: any; 
}

interface TemplateCategory {
  id: string;
  category_id: string;
  category_name: string;
  category_description: string | null;
  icon_name: string | null;
  sort_order: number | null;
  created_at: string | null;
}

interface SubTemplate {
  id: string;
  category_table_id: string;
  sub_template_id: string;
  name: string;
  description: string | null;
  content: string;
  placeholder_keys: string[] | null;
  is_predefined: boolean | null;
  sort_order: number | null;
  created_at: string | null;
}

const CreateReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addReport } = useReports();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({});
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Mock data for template categories and sub-templates
  const [templateCategories] = useState<TemplateCategory[]>([
    {
      id: '1',
      category_id: 'academic-achievement',
      category_name: 'Academic Achievement',
      category_description: 'Comprehensive reports on student academic skills',
      icon_name: 'BookOpen',
      sort_order: 1,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '2', 
      category_id: 'cognitive-processing',
      category_name: 'Cognitive Processing',
      category_description: 'Details student cognitive abilities and processing',
      icon_name: 'Brain',
      sort_order: 2,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '3',
      category_id: 'speech-language',
      category_name: 'Speech & Language',
      category_description: 'Communication assessments and evaluations',
      icon_name: 'MessageCircle',
      sort_order: 3,
      created_at: '2025-01-01T00:00:00Z'
    }
  ]);

  const [subTemplates] = useState<SubTemplate[]>([
    {
      id: '1',
      category_table_id: '1',
      sub_template_id: 'academic-wjiv',
      name: 'WJ-IV Academic Achievement',
      description: 'Woodcock-Johnson IV Tests of Achievement report template',
      content: `# ACADEMIC ACHIEVEMENT REPORT

## Student Information
Name: [STUDENT_NAME]
Date of Birth: [DOB]
Date of Evaluation: [DOE]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON_FOR_REFERRAL]

## Background Information
[BACKGROUND_INFO]

## Assessment Instruments Administered
[ASSESSMENT_INSTRUMENTS]

## Behavioral Observations
[BEHAVIORAL_OBSERVATIONS]

## Test Results & Interpretation
[NARRATIVE_INTERPRETATION]

## Summary of Findings
[SUMMARY_OF_FINDINGS]

## Recommendations
[RECOMMENDATIONS]`,
      placeholder_keys: ['STUDENT_NAME', 'DOB', 'DOE', 'GRADE', 'EXAMINER', 'REASON_FOR_REFERRAL', 'BACKGROUND_INFO', 'ASSESSMENT_INSTRUMENTS', 'BEHAVIORAL_OBSERVATIONS', 'NARRATIVE_INTERPRETATION', 'SUMMARY_OF_FINDINGS', 'RECOMMENDATIONS'],
      is_predefined: true,
      sort_order: 1,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      category_table_id: '2',
      sub_template_id: 'cognitive-wisc',
      name: 'WISC-V Cognitive Assessment',
      description: 'Wechsler Intelligence Scale for Children report template',
      content: `# COGNITIVE PROCESSING REPORT

## Student Information
Name: [STUDENT_NAME]
Date of Birth: [DOB]
Date of Evaluation: [DOE]
Grade: [GRADE]
Examiner: [EXAMINER]

## Reason for Referral
[REASON_FOR_REFERRAL]

## Background Information
[BACKGROUND_INFO]

## Assessment Instruments Administered
Wechsler Intelligence Scale for Children - Fifth Edition (WISC-V)

## Behavioral Observations
[BEHAVIORAL_OBSERVATIONS]

## Test Results & Interpretation
[COGNITIVE_RESULTS]

## Summary of Cognitive Strengths and Weaknesses
[COGNITIVE_SUMMARY]

## Implications for Learning
[LEARNING_IMPLICATIONS]

## Recommendations
[RECOMMENDATIONS]`,
      placeholder_keys: ['STUDENT_NAME', 'DOB', 'DOE', 'GRADE', 'EXAMINER', 'REASON_FOR_REFERRAL', 'BACKGROUND_INFO', 'BEHAVIORAL_OBSERVATIONS', 'COGNITIVE_RESULTS', 'COGNITIVE_SUMMARY', 'LEARNING_IMPLICATIONS', 'RECOMMENDATIONS'],
      is_predefined: true,
      sort_order: 1,
      created_at: '2025-01-01T00:00:00Z'
    }
  ]);

  const [isLoadingTemplates] = useState(false);
  const routeState = location.state;
  const isCustomTemplateFlow = routeState?.customTemplateContent;

  // Initialize from URL params or route state
  useEffect(() => {
    if (isLoadingTemplates) return;

    const templateParam = searchParams.get('template');
    
    if (isCustomTemplateFlow) {
      // Custom template flow
      setCurrentStep(2);
      setSelectedTemplateId('custom');
      setSelectedCategoryId('custom');
      
      // Initialize form data for custom template
      const customPlaceholders = routeState?.customTemplatePlaceholders || [];
      const initialCustomFormData: FormData = {
        studentName: '',
        dob: '',
        doe: '',
        grade: '',
        examiner: '',
        reasonForReferral: '',
        backgroundInfo: '',
        assessmentInstruments: '',
        behavioralObservations: '',
        includeExtendedBattery: false,
        narrativeInterpretation: '',
        summaryOfFindings: '',
        recommendations: ''
      };
      
      customPlaceholders.forEach((key: string) => {
        const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, (g: string) => g[1].toUpperCase());
        if (!(camelKey in initialCustomFormData)) {
          initialCustomFormData[camelKey] = '';
        }
      });
      
      setFormData(initialCustomFormData);
    } else if (templateParam && templateCategories.length > 0) {
      // Predefined template flow
      for (const category of templateCategories) {
        const subTemplate = subTemplates.find(st => 
          st.category_table_id === category.id && st.sub_template_id === templateParam
        );
        
        if (subTemplate) {
          setSelectedTemplateId(subTemplate.sub_template_id);
          setSelectedCategoryId(category.category_id);
          setCurrentStep(2);
          
          // Updated FormData initialization logic
          const newInitialFormData: FormData = { 
            // Ensure essential common fields are initialized if not in placeholders
            studentName: formData.studentName || '', 
            dob: formData.dob || '', 
            doe: formData.doe || '',
            grade: formData.grade || '',
            examiner: formData.examiner || '',
            reasonForReferral: formData.reasonForReferral || '',
            backgroundInfo: formData.backgroundInfo || '',
            assessmentInstruments: formData.assessmentInstruments || '',
            behavioralObservations: formData.behavioralObservations || '',
            includeExtendedBattery: typeof formData.includeExtendedBattery === 'boolean' ? formData.includeExtendedBattery : false,
            narrativeInterpretation: formData.narrativeInterpretation || '',
            summaryOfFindings: formData.summaryOfFindings || '',
            recommendations: formData.recommendations || ''
          };

          if (subTemplate.placeholder_keys) {
            subTemplate.placeholder_keys.forEach(key => {
              const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase());
              // Initialize if not already set by a draft or common defaults
              if (!(camelKey in newInitialFormData) || newInitialFormData[camelKey] === undefined) {
                 newInitialFormData[camelKey] = '';
              }
            });
          }
          // Specific default for WJIV assessment instruments
          if (subTemplate.sub_template_id === 'academic-wjiv' && !newInitialFormData.assessmentInstruments) {
              newInitialFormData.assessmentInstruments = 'Woodcock-Johnson IV Tests of Achievement (WJ IV ACH)\\n';
          }
          
          setFormData(prevFormData => ({ ...newInitialFormData, ...prevFormData })); // Merge, allowing draft to override defaults
          break;
        }
      }
    }
  }, [searchParams, routeState, templateCategories, isLoadingTemplates, isCustomTemplateFlow]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedTemplateId('');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = () => {
    let template = '';
    
    if (isCustomTemplateFlow) {
      template = routeState?.customTemplateContent || '';
    } else {
      const category = templateCategories.find(c => c.category_id === selectedCategoryId);
      if (category) {
        const subTemplate = subTemplates.find(st => 
          st.category_table_id === category.id && st.sub_template_id === selectedTemplateId
        );
        template = subTemplate?.content || '';
      }
    }
    
    // Replace placeholders with form data
    let report = template;
    Object.entries(formData).forEach(([key, value]) => {
      // Convert camelCase back to UPPER_SNAKE_CASE for placeholder replacement
      const placeholderKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
      const placeholder = `[${placeholderKey}]`;
      
      if (typeof value === 'string') {
        report = report.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      } else if (typeof value === 'boolean') {
        report = report.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value ? 'Yes' : 'No');
      }
    });
    
    setGeneratedReport(report);
    setCurrentStep(3);
  };

  const handleSaveReport = () => {
    const reportName = formData.studentName ? 
      `${formData.studentName} - ${getSelectedTemplateName()}` : 
      `New Report - ${getSelectedTemplateName()}`;
    
    addReport({
      id: Date.now(),
      name: reportName,
      type: getSelectedTemplateName(),
      date: new Date().toISOString(),
      status: 'Draft',
      content: generatedReport,
      formData: formData
    });
    
    navigate('/reports');
  };

  const getSelectedTemplateName = (): string => {
    if (isCustomTemplateFlow) {
      return routeState?.customTemplateName || 'Custom Template';
    }
    
    const category = templateCategories.find(c => c.category_id === selectedCategoryId);
    if (category) {
      const subTemplate = subTemplates.find(st => 
        st.category_table_id === category.id && st.sub_template_id === selectedTemplateId
      );
      return subTemplate?.name || 'Unknown Template';
    }
    return 'Unknown Template';
  };

  const getSelectedCategoryTemplates = () => {
    const category = templateCategories.find(c => c.category_id === selectedCategoryId);
    if (!category) return [];
    
    return subTemplates.filter(st => st.category_table_id === category.id);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const renderFormField = (key: string, label: string, type: 'text' | 'textarea' | 'checkbox' = 'text') => {
    const value = formData[key] || '';
    
    if (type === 'checkbox') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={key}
            checked={!!value}
            onChange={(e) => handleFormChange(key, e.target.checked)}
            className="rounded border-border focus:ring-2 focus:ring-gold"
          />
          <label htmlFor={key} className="text-sm font-medium">
            {label}
          </label>
        </div>
      );
    }
    
    return (
      <div>
        <label htmlFor={key} className="block text-sm font-medium mb-1">
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            id={key}
            value={value}
            onChange={(e) => handleFormChange(key, e.target.value)}
            className="w-full p-3 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold min-h-[100px]"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type="text"
            id={key}
            value={value}
            onChange={(e) => handleFormChange(key, e.target.value)}
            className="w-full p-3 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  // Step 1: Template Selection
  if (currentStep === 1) {
    return (
      <div className="animate-fade-in">
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-medium mb-4">Choose Report Template</h2>
            <p className="text-text-secondary">Select a category and template to get started</p>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {templateCategories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.category_id)}
                className={`p-6 border rounded-lg text-left transition-all ${
                  selectedCategoryId === category.category_id
                    ? 'border-gold bg-gold bg-opacity-10'
                    : 'border-border hover:border-gold hover:bg-gold hover:bg-opacity-5'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="text-gold" size={24} />
                  <h3 className="font-medium text-lg">{category.category_name}</h3>
                </div>
                <p className="text-sm text-text-secondary">
                  {category.category_description}
                </p>
              </button>
            ))}
          </div>

          {/* Templates */}
          {selectedCategoryId && (
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Select Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSelectedCategoryTemplates().map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.sub_template_id)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedTemplateId === template.sub_template_id
                        ? 'border-gold bg-gold bg-opacity-10'
                        : 'border-border hover:border-gold hover:bg-gold hover:bg-opacity-5'
                    }`}
                  >
                    <h4 className="font-medium mb-2">{template.name}</h4>
                    <p className="text-sm text-text-secondary">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Next Button */}
          {selectedTemplateId && (
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                className="btn bg-accent-gold text-black flex items-center gap-2"
              >
                Continue to Form
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Form Input
  if (currentStep === 2) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handlePrevStep}
            className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-medium">Report Information</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-gold" size={24} />
              <div>
                <h2 className="text-xl font-medium">{getSelectedTemplateName()}</h2>
                <p className="text-text-secondary">Fill in the required information</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Student Information Section */}
            <div className="card">
              <button
                onClick={() => toggleSection('student-info')}
                className="w-full flex items-center justify-between p-4 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <h3 className="text-lg font-medium">Student Information</h3>
                {expandedSections.has('student-info') ? 
                  <ChevronUp size={20} /> : <ChevronDown size={20} />
                }
              </button>
              
              {expandedSections.has('student-info') && (
                <div className="p-4 border-t border-border space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderFormField('studentName', 'Student Name')}
                    {renderFormField('dob', 'Date of Birth')}
                    {renderFormField('doe', 'Date of Evaluation')}
                    {renderFormField('grade', 'Grade')}
                    {renderFormField('examiner', 'Examiner')}
                  </div>
                </div>
              )}
            </div>

            {/* Assessment Information Section */}
            <div className="card">
              <button
                onClick={() => toggleSection('assessment-info')}
                className="w-full flex items-center justify-between p-4 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <h3 className="text-lg font-medium">Assessment Information</h3>
                {expandedSections.has('assessment-info') ? 
                  <ChevronUp size={20} /> : <ChevronDown size={20} />
                }
              </button>
              
              {expandedSections.has('assessment-info') && (
                <div className="p-4 border-t border-border space-y-4">
                  {renderFormField('reasonForReferral', 'Reason for Referral', 'textarea')}
                  {renderFormField('backgroundInfo', 'Background Information', 'textarea')}
                  {renderFormField('assessmentInstruments', 'Assessment Instruments', 'textarea')}
                  {renderFormField('behavioralObservations', 'Behavioral Observations', 'textarea')}
                  
                  {selectedTemplateId === 'academic-wjiv' && (
                    <div className="mt-4">
                      {renderFormField('includeExtendedBattery', 'Include Extended Battery', 'checkbox')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results & Interpretation Section */}
            <div className="card">
              <button
                onClick={() => toggleSection('results-interpretation')}
                className="w-full flex items-center justify-between p-4 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <h3 className="text-lg font-medium">Results & Interpretation</h3>
                {expandedSections.has('results-interpretation') ? 
                  <ChevronUp size={20} /> : <ChevronDown size={20} />
                }
              </button>
              
              {expandedSections.has('results-interpretation') && (
                <div className="p-4 border-t border-border space-y-4">
                  {renderFormField('narrativeInterpretation', 'Test Results & Narrative Interpretation', 'textarea')}
                  {renderFormField('summaryOfFindings', 'Summary of Findings', 'textarea')}
                  {renderFormField('recommendations', 'Recommendations', 'textarea')}
                </div>
              )}
            </div>

            {/* Dynamic Fields from Template */}
            {(() => {
              const dynamicFields = Object.keys(formData).filter(key => 
                !['studentName', 'dob', 'doe', 'grade', 'examiner', 'reasonForReferral', 
                  'backgroundInfo', 'assessmentInstruments', 'behavioralObservations', 
                  'narrativeInterpretation', 'summaryOfFindings', 'recommendations', 
                  'includeExtendedBattery'].includes(key)
              );

              if (dynamicFields.length === 0) return null;

              return (
                <div className="card">
                  <button
                    onClick={() => toggleSection('additional-fields')}
                    className="w-full flex items-center justify-between p-4 hover:bg-bg-secondary rounded-lg transition-colors"
                  >
                    <h3 className="text-lg font-medium">Additional Template Fields</h3>
                    {expandedSections.has('additional-fields') ? 
                      <ChevronUp size={20} /> : <ChevronDown size={20} />
                    }
                  </button>
                  
                  {expandedSections.has('additional-fields') && (
                    <div className="p-4 border-t border-border space-y-4">
                      {dynamicFields.map(key => {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return renderFormField(key, label, 'textarea');
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevStep}
              className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Templates
            </button>
            <button
              onClick={generateReport}
              className="btn bg-accent-gold text-black flex items-center gap-2"
            >
              <Sparkles size={16} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Preview & Save
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePrevStep}
          className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Form
        </button>
        <h1 className="text-2xl font-medium">Report Preview</h1>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-gold" size={24} />
              <div>
                <h2 className="text-xl font-medium">{getSelectedTemplateName()}</h2>
                <p className="text-text-secondary">Review and save your report</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn border border-border hover:bg-bg-secondary flex items-center gap-2">
                <Download size={16} />
                Export
              </button>
              <button
                onClick={handleSaveReport}
                className="btn bg-accent-gold text-black flex items-center gap-2"
              >
                <Save size={16} />
                Save Report
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          {isPreviewMode ? (
            <div className="prose max-w-none">
              <div 
                className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: generatedReport.replace(/\n/g, '<br>') }}
              />
            </div>
          ) : (
            <textarea
              value={generatedReport}
              onChange={(e) => setGeneratedReport(e.target.value)}
              className="w-full h-96 p-4 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold font-mono text-sm"
              placeholder="Generated report will appear here..."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateReportPage;