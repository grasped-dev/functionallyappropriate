import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, Sparkles, Download, Save, Eye, EyeOff, ChevronDown, ChevronUp, BookOpen, Brain, MessageCircle, Loader2 } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addReport } = useReports();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubStep, setCurrentSubStep] = useState<number>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Icon mapping for template categories
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    BookOpen: BookOpen,
    Brain: Brain,
    MessageCircle: MessageCircle,
  };
  const FileTextIcon = FileText; // Default fallback icon
  
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

  // WJIV Standard Battery configuration
  const standardSubtestsConfig = [
    { id: 'letter_word', name: '1. Letter-Word Identification' }, { id: 'applied_problems', name: '2. Applied Problems' },
    { id: 'spelling', name: '3. Spelling' }, { id: 'passage_comp', name: '4. Passage Comprehension' },
    { id: 'calculation', name: '5. Calculation' }, { id: 'writing_samples', name: '6. Writing Samples' },
    { id: 'word_attack', name: '7. Word Attack' }, { id: 'oral_reading', name: '8. Oral Reading' },
    { id: 'sent_read_flu', name: '9. Sentence Reading Fluency' }, { id: 'math_facts_flu', name: '10. Math Facts Fluency' },
    { id: 'sent_write_flu', name: '11. Sentence Writing Fluency' }
  ];
  // WJIV Extended Battery configuration
  const extendedSubtestsConfig = [
    { id: 'read_recall', name: '12. Reading Recall' }, { id: 'num_matrices', name: '13. Number Matrices' },
    { id: 'editing', name: '14. Editing' }, { id: 'word_read_flu', name: '15. Word Reading Fluency' },
    { id: 'spell_sounds', name: '16. Spelling of Sounds' }, { id: 'read_vocab', name: '17. Reading Vocabulary' },
    { id: 'science', name: '18. Science' }, { id: 'social_studies', name: '19. Social Studies' },
    { id: 'humanities', name: '20. Humanities' }
  ];

  // Define the structure for WJIV sub-steps (used for titles and field grouping)
  const wjivSubStepsConfig = [
    { title: "Student Information", fields: ['studentName', 'dob', 'doe', 'grade', 'examiner'] },
    { title: "Background & Referral", fields: ['reasonForReferral', 'backgroundInfo', 'assessmentInstruments', 'behavioralObservations'] },
    { title: "WJIV Clusters", fields: ['wj_broad_ss', 'wj_broad_pr', 'wj_broad_range', 'wj_reading_ss', 'wj_reading_pr', 'wj_reading_range', 'wj_written_ss', 'wj_written_pr', 'wj_written_range', 'wj_math_ss', 'wj_math_pr', 'wj_math_range'] },
    { title: "WJIV Standard & Extended Subtests", fields: [ /* This sub-step will render standardSubtestsConfig and conditionally extendedSubtestsConfig */ ] },
    { title: "Narratives & Recommendations", fields: ['narrativeInterpretation', 'summaryOfFindings', 'recommendations'] }
  ];

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
  const currentAction = searchParams.get('action');

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
      for (const category of templateCategories) { // category is TemplateCategory here
        const subTemplate = subTemplates.find(st => // st is SubTemplate here
          st.category_table_id === category.id && st.sub_template_id === templateParam
        );
        
        if (subTemplate) {
          setSelectedTemplateId(subTemplate.sub_template_id);
          setSelectedCategoryId(category.category_id); // Use category_id (string)
          setCurrentStep(2);
          
          const newInitialFormData: FormData = { /* ... your existing default fields ... */ };
          if (subTemplate.placeholder_keys) {
            subTemplate.placeholder_keys.forEach((key: string) => { // Add type for key
              const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, (g: string) => g[1].toUpperCase());
              if (!(camelKey in newInitialFormData) || newInitialFormData[camelKey] === undefined) {
                newInitialFormData[camelKey] = '';
              }
            });
          }
          if (subTemplate.sub_template_id === 'academic-wjiv' && !newInitialFormData.assessmentInstruments) {
              newInitialFormData.assessmentInstruments = 'Woodcock-Johnson IV Tests of Achievement (WJ IV ACH)\\n';
          }
          setFormData(prevFormData => ({ ...newInitialFormData, ...prevFormData }));
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

  const renderFormField = (
    key: string, 
    label: string, 
    type: 'text' | 'textarea' | 'checkbox' | 'date' | 'number' = 'text',
    placeholder?: string // Add placeholder as optional
  ) => {
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

        <div className="card max-w-4xl mx-auto">
          {currentAction === 'upload' ? (
            // Upload UI
            <div className="animate-fadeIn">
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => { 
                    setSearchParams({}); 
                    setSelectedCategoryId(''); 
                    setSelectedTemplateId(''); 
                  }} 
                  className="btn border border-border hover:bg-bg-secondary mr-4 flex items-center gap-1"
                >
                  <ArrowLeft size={16}/> Back to Categories
                </button>
                <h2 className="text-xl font-medium">Upload Custom Template</h2>
              </div>
              <div className="text-center py-12">
                <FileText className="text-gold mx-auto mb-4" size={64} />
                <h3 className="text-xl font-medium mb-4">Upload Your Template File</h3>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  Upload a .docx file to create a custom template with placeholders
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-gold transition-colors">
                  <p className="text-text-secondary">Drag & drop your .docx file here or click to browse</p>
                </div>
              </div>
            </div>
          ) : selectedCategoryId && !selectedTemplateId ? (
            // Sub-Template Selection UI
            <div className="animate-fadeIn">
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setSelectedCategoryId('')} 
                  className="btn border border-border hover:bg-bg-secondary mr-4 flex items-center gap-1"
                >
                  <ArrowLeft size={16}/> Back to Categories
                </button>
                <h2 className="text-xl font-medium">
                  Choose from: {templateCategories?.find(c => c.category_id === selectedCategoryId)?.category_name || 'Category'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSelectedCategoryTemplates().map((subTemplate: SubTemplate) => (
                  <button
                    key={subTemplate.id}
                    onClick={() => {
                      setSearchParams({ template: subTemplate.sub_template_id });
                    }}
                    className="text-left p-5 border border-border rounded-lg hover:border-gold hover:shadow-md transition-all group bg-bg-primary"
                  >
                    <h4 className="font-semibold text-md text-text-primary mb-1">{subTemplate.name}</h4>
                    <p className="text-xs text-text-secondary line-clamp-2">{subTemplate.description}</p>
                    <div className="mt-3 flex items-center text-gold text-xs font-medium">
                        <span>Use this Specific Template</span>
                        <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : !selectedTemplateId ? (
            // Default: Show Categories
            <div className="animate-fadeIn">
              <h2 className="text-xl font-medium mb-6 text-center">Step 1: Choose a Report Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templateCategories?.map((category) => {
                  const IconComponent = category.icon_name ? iconMap[category.icon_name] || FileTextIcon : FileTextIcon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategoryId(category.category_id);
                      }}
                      className="text-left p-6 border border-border rounded-lg hover:border-gold hover:shadow-lg transition-all group bg-bg-primary"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <IconComponent className="text-gold group-hover:scale-110 transition-transform" size={28} />
                        <h3 className="font-semibold text-lg text-text-primary">{category.category_name}</h3>
                      </div>
                      <p className="text-sm text-text-secondary mb-4">{category.category_description}</p>
                      <div className="mt-auto flex items-center text-gold text-sm font-medium">
                        <span>View Templates</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-10 pt-6 border-t border-border text-center">
                <p className="text-text-secondary mb-3">Or, if you have your own template file:</p>
                <button 
                  className="btn border border-border hover:border-gold text-gold"
                  onClick={() => {
                    setSelectedCategoryId(''); 
                    setSelectedTemplateId('');
                    setSearchParams({action: 'upload'}); 
                  }}
                >
                  Upload a Custom Template File
                </button>
              </div>
            </div>
          ) : (
            // Loading state when selectedTemplateId is set from URL
            <div className="text-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-2" />
                <p className="text-text-secondary">Loading template: {selectedTemplateId}...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Form Input
  if (currentStep === 2 && (selectedTemplateId || isCustomTemplateFlow)) {
    // Determine current template name and placeholder keys for dynamic forms
    let currentFormTitle = "Report Details";
    let currentPlaceholdersForDynamicForm: string[] = [];
    let currentSubTemplateObject: SubTemplate | null = null;

    if (isCustomTemplateFlow && routeState?.customTemplatePlaceholders) {
        currentFormTitle = routeState.customTemplateName || "Custom Report";
        currentPlaceholdersForDynamicForm = routeState.customTemplatePlaceholders;
    } else if (selectedTemplateId && templateCategories && subTemplates) { // Use the state variable names
        // Find the selected sub-template directly from the subTemplatesData array
        const foundSubTemplate = subTemplates.find((st: SubTemplate) => st.sub_template_id === selectedTemplateId);
        
        if (foundSubTemplate) {
            currentSubTemplateObject = foundSubTemplate; // Assign if found
            currentFormTitle = foundSubTemplate.name;
            currentPlaceholdersForDynamicForm = foundSubTemplate.placeholder_keys || [];
        } else {
            // Handle case where selectedTemplateId might not match any subTemplate
            console.warn(`SubTemplate with id "${selectedTemplateId}" not found in mock data.`);
            // Optionally, redirect or show an error, or clear selectedTemplateId
            // For now, currentFormTitle will remain "Report Details" and placeholders empty
        }
    }

    // Specific Multi-Sub-Step UI for 'academic-wjiv'
    if (selectedTemplateId === 'academic-wjiv') {
      return (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => { // Go back to Step 1, clear category/template selections
                setCurrentStep(1);
                setSelectedCategoryId(null);
                setSelectedTemplateId(null);
                setSearchParams({}); // Clear URL params
                setCurrentSubStep(1); // Reset sub-step for next time
              }}
              className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Templates
            </button>
            <h1 className="text-2xl font-medium">
              {currentFormTitle} (Part {currentSubStep} of {wjivSubStepsConfig.length})
            </h1>
          </div>

          <div className="card max-w-4xl mx-auto">
            {/* WJIV Sub-step specific content */}
            {currentSubStep === 1 && ( /* Student Info */
              <div className="p-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[0].title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('studentName', 'Student Name', 'text', "Enter student's full name")}
                  {renderFormField('dob', 'Date of Birth', 'date')}
                  {renderFormField('doe', 'Date of Evaluation', 'date')}
                  {renderFormField('grade', 'Grade Level', 'text', "e.g., 3rd Grade")}
                  {renderFormField('examiner', 'Examiner', 'text', "Enter examiner's name and credentials")}
                </div>
              </div>
            )}
            {currentSubStep === 2 && ( /* Background & Referral */
              <div className="p-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[1].title}</h3>
                <div className="space-y-4">
                  {renderFormField('reasonForReferral', 'Reason for Referral', 'textarea', "Describe why the student was referred...")}
                  {renderFormField('backgroundInfo', 'Background Information', 'textarea', "Include relevant educational history...")}
                  {renderFormField('assessmentInstruments', 'Assessment Instruments Administered', 'textarea', formData.assessmentInstruments || 'Woodcock-Johnson IV Tests of Achievement (WJ IV ACH)\n')}
                  {renderFormField('behavioralObservations', 'Behavioral Observations', 'textarea', "Describe student's behavior during assessment...")}
                </div>
              </div>
            )}
            {currentSubStep === 3 && ( /* WJIV Clusters */
              <div className="p-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[2].title}</h3>
                <div className="space-y-4">
                  {['broad', 'reading', 'written', 'math'].map(cluster => (
                    <div key={cluster} className="p-3 border border-border-secondary rounded bg-bg-secondary">
                      <h4 className="font-medium mb-2 capitalize">{cluster} Achievement</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {renderFormField(`wj_${cluster}_ss`, 'Standard Score (SS)', 'number')}
                        {renderFormField(`wj_${cluster}_pr`, 'Percentile Rank (PR)', 'number')}
                        {renderFormField(`wj_${cluster}_range`, 'Descriptive Range', 'text')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {currentSubStep === 4 && ( /* Standard & Extended Subtests */
              <div className="p-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[3].title}</h3>
                <h4 className="text-md font-medium my-2 text-text-primary">Standard Battery</h4>
                <div className="space-y-3 mb-6">
                  {standardSubtestsConfig.map(st => (
                    <div key={st.id} className="p-2 border rounded bg-bg-secondary">
                      <h5 className="text-sm mb-1 font-medium">{st.name}</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {renderFormField(`wj_${st.id}_ss`, 'SS', 'number')}
                        {renderFormField(`wj_${st.id}_pr`, 'PR', 'number')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 mb-4">
                  {renderFormField('includeExtendedBattery', 'Include Extended Battery Subtests?', 'checkbox')}
                </div>
                {formData.includeExtendedBattery && (
                  <>
                    <h4 className="text-md font-medium my-2 mt-4 text-text-primary">Extended Battery</h4>
                    <div className="space-y-3">
                      {extendedSubtestsConfig.map(st => (
                        <div key={st.id} className="p-2 border rounded bg-bg-secondary">
                          <h5 className="text-sm mb-1 font-medium">{st.name}</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {renderFormField(`wj_${st.id}_ss`, 'SS', 'number')}
                            {renderFormField(`wj_${st.id}_pr`, 'PR', 'number')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {currentSubStep === 5 && ( /* Narratives */
              <div className="p-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[4].title}</h3>
                <div className="space-y-4">
                  {renderFormField('narrativeInterpretation', 'Narrative Interpretation', 'textarea')}
                  {renderFormField('summaryOfFindings', 'Summary of Findings', 'textarea')}
                  {renderFormField('recommendations', 'Recommendations', 'textarea')}
                </div>
              </div>
            )}

            {/* Sub-Step Navigation for WJIV Form */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <button 
                onClick={() => {
                  if (currentSubStep === 1) { 
                    setCurrentStep(1); 
                    setSelectedCategoryId(null); // Go back to category selection
                    setSelectedTemplateId(null);
                    setSearchParams({}); // Clear URL params
                  } else {
                    // Smart back for skipping extended battery if it wasn't shown
                    if (currentSubStep === 5 && !formData.includeExtendedBattery) {
                      setCurrentSubStep(3);
                    } else {
                      setCurrentSubStep(prev => Math.max(1, prev - 1));
                    }
                  }
                }} 
                className="btn border border-border hover:bg-bg-secondary flex items-center gap-1"
              >
                <ArrowLeft size={16}/> {currentSubStep === 1 ? 'Back to Templates' : 'Previous Section'}
              </button>
              <button 
                onClick={() => {
                  if (currentSubStep === 3 && !formData.includeExtendedBattery) {
                    setCurrentSubStep(5); // Skip to narrative
                  } else if (currentSubStep < wjivSubStepsConfig.length) { 
                    setCurrentSubStep(prev => prev + 1);
                  } else { // Last sub-step 
                    generateReport(); // This will set currentStep = 3
                  }
                }}
                className="btn bg-accent-gold text-black flex items-center gap-1"
              >
                {currentSubStep === wjivSubStepsConfig.length ? 'Generate & Review Report' : 'Next Section'} <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      );
    } else { 
      // Fallback for OTHER predefined templates OR custom templates (uses dynamic flat form)
      return (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {setCurrentStep(1); setSelectedTemplateId(null); setSelectedCategoryId(null); setSearchParams({});}}
              className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Templates
            </button>
            <h1 className="text-2xl font-medium">Fill: {currentFormTitle}</h1>
          </div>
          <div className="card max-w-4xl mx-auto">
            <div className="space-y-4">
              {currentPlaceholdersForDynamicForm.length > 0 ? 
                currentPlaceholdersForDynamicForm.map(key => {
                  const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase());
                  const label = key.replace(/_/g, ' ').toLowerCase();
                  const type = key.includes('DATE') || key.includes('DOB') ? 'date' : 
                               (key.includes('SS') || key.includes('PR') || key.includes('SCORE')) ? 'number' : 'textarea';
                  return renderFormField(camelKey, label, type as any, `Enter ${label}`);
                })
                : <p className="text-text-secondary p-4">This template has no defined fields to fill. You can proceed to review.</p>
              }
            </div>
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <button onClick={() => {setCurrentStep(1); setSelectedTemplateId(null); setSelectedCategoryId(null); setSearchParams({});}} className="btn border-border">Back to Templates</button>
              <button onClick={generateReport} className="btn bg-accent-gold text-black">Generate & Review Report</button>
            </div>
          </div>
        </div>
      );
    }
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