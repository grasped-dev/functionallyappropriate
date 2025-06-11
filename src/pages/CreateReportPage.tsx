import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, Sparkles, Download, Save, Eye, EyeOff, ChevronDown, ChevronUp, BookOpen, Brain, MessageCircle, Loader2, UploadCloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useReports } from '../context/ReportContext';

// Utility function to convert basic Markdown-like text to HTML
const markdownToBasicHtml = (markdownText: string): string => {
  if (!markdownText) return '';
  return markdownText
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.substring(4)}</h3>`;
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.substring(3)}</h2>`;
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.substring(2)}</h1>`;
      if (trimmed.startsWith('- ')) return `<ul><li>${trimmed.substring(2)}</li></ul>`;
      if (trimmed === '') return '<br>';
      const boldedLine = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<p>${boldedLine}</p>`;
    })
    .join('');
};

// Updated FormData interface with comprehensive fields
interface FormData {
  // Basic student information
  studentName?: string;
  dob?: string;
  doe?: string;
  grade?: string;
  examiner?: string;
  
  // Background sections
  reasonForReferral?: string;
  backgroundInfo?: string;
  assessmentInstruments?: string;
  behavioralObservations?: string;
  
  // WJIV Clusters
  wj_broad_ss?: string;
  wj_broad_pr?: string;
  wj_broad_range?: string;
  wj_reading_ss?: string;
  wj_reading_pr?: string;
  wj_reading_range?: string;
  wj_written_ss?: string;
  wj_written_pr?: string;
  wj_written_range?: string;
  wj_math_ss?: string;
  wj_math_pr?: string;
  wj_math_range?: string;
  
  // Standard Battery Subtests
  wj_letter_word_ss?: string;
  wj_letter_word_pr?: string;
  wj_applied_problems_ss?: string;
  wj_applied_problems_pr?: string;
  wj_spelling_ss?: string;
  wj_spelling_pr?: string;
  wj_passage_comp_ss?: string;
  wj_passage_comp_pr?: string;
  wj_calculation_ss?: string;
  wj_calculation_pr?: string;
  wj_writing_samples_ss?: string;
  wj_writing_samples_pr?: string;
  wj_word_attack_ss?: string;
  wj_word_attack_pr?: string;
  wj_oral_reading_ss?: string;
  wj_oral_reading_pr?: string;
  wj_sent_read_flu_ss?: string;
  wj_sent_read_flu_pr?: string;
  wj_math_facts_flu_ss?: string;
  wj_math_facts_flu_pr?: string;
  wj_sent_write_flu_ss?: string;
  wj_sent_write_flu_pr?: string;
  
  // Extended Battery Subtests
  wj_read_recall_ss?: string;
  wj_read_recall_pr?: string;
  wj_num_matrices_ss?: string;
  wj_num_matrices_pr?: string;
  wj_editing_ss?: string;
  wj_editing_pr?: string;
  wj_word_read_flu_ss?: string;
  wj_word_read_flu_pr?: string;
  wj_spell_sounds_ss?: string;
  wj_spell_sounds_pr?: string;
  wj_read_vocab_ss?: string;
  wj_read_vocab_pr?: string;
  wj_science_ss?: string;
  wj_science_pr?: string;
  wj_social_studies_ss?: string;
  wj_social_studies_pr?: string;
  wj_humanities_ss?: string;
  wj_humanities_pr?: string;
  
  // Extended battery toggle
  includeExtendedBattery?: boolean;
  
  // Narrative sections
  narrativeInterpretation?: string;
  summaryOfFindings?: string;
  recommendations?: string;
  
  // Index signature for dynamic fields
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

// Draft management interfaces and constants
const DRAFT_KEY_PREFIX = 'createReport_draft_';
const DRAFT_EXPIRY_HOURS = 24;

interface DraftData {
  formData: FormData;
  selectedTemplateId: string | null;
  currentStep: number;
  currentSubStep: number;
  selectedCategoryId?: string | null;
  
  // Fields for custom template specifics
  isCustomFlag?: boolean;
  customTemplateName?: string;
  customTemplateContent?: string;
  customTemplatePlaceholders?: string[];
  
  timestamp: number;
}

// Draft utility functions
const saveDraft = (key: string, data: DraftData) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch (error) {
    console.warn('Failed to save draft:', error);
  }
};

const loadDraft = (key: string): DraftData | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const draft = JSON.parse(stored) as DraftData;
    const hoursOld = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
    
    if (hoursOld > DRAFT_EXPIRY_HOURS) {
      localStorage.removeItem(key);
      return null;
    }
    
    return draft;
  } catch (error) {
    console.warn('Failed to load draft:', error);
    return null;
  }
};

const clearDraft = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear draft:', error);
  }
};

const CreateReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addReport } = useReports();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubStep, setCurrentSubStep] = useState<number>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Custom template state for draft handling
  const [draftedCustomContent, setDraftedCustomContent] = useState<string | undefined>(undefined);
  const [draftedCustomPlaceholders, setDraftedCustomPlaceholders] = useState<string[] | undefined>(undefined);
  const [draftedCustomName, setDraftedCustomName] = useState<string | undefined>(undefined);
  
  // Icon mapping for template categories
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    BookOpen: BookOpen,
    Brain: Brain,
    MessageCircle: MessageCircle,
  };
  const FileTextIcon = FileText;
  
  // Template categories data
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

  // WJIV Subtest configurations
  const standardSubtestsConfig = [
    { id: 'letter_word', name: '1. Letter-Word Identification' },
    { id: 'applied_problems', name: '2. Applied Problems' },
    { id: 'spelling', name: '3. Spelling' },
    { id: 'passage_comp', name: '4. Passage Comprehension' },
    { id: 'calculation', name: '5. Calculation' },
    { id: 'writing_samples', name: '6. Writing Samples' },
    { id: 'word_attack', name: '7. Word Attack' },
    { id: 'oral_reading', name: '8. Oral Reading' },
    { id: 'sent_read_flu', name: '9. Sentence Reading Fluency' },
    { id: 'math_facts_flu', name: '10. Math Facts Fluency' },
    { id: 'sent_write_flu', name: '11. Sentence Writing Fluency' }
  ];

  const extendedSubtestsConfig = [
    { id: 'read_recall', name: '12. Reading Recall' },
    { id: 'num_matrices', name: '13. Number Matrices' },
    { id: 'editing', name: '14. Editing' },
    { id: 'word_read_flu', name: '15. Word Reading Fluency' },
    { id: 'spell_sounds', name: '16. Spelling of Sounds' },
    { id: 'read_vocab', name: '17. Reading Vocabulary' },
    { id: 'science', name: '18. Science' },
    { id: 'social_studies', name: '19. Social Studies' },
    { id: 'humanities', name: '20. Humanities' }
  ];

  const wjivSubStepsConfig = [
    { title: "Student Information", fields: ['studentName', 'dob', 'doe', 'grade', 'examiner'] },
    { title: "Background & Referral", fields: ['reasonForReferral', 'backgroundInfo', 'assessmentInstruments', 'behavioralObservations'] },
    { title: "WJIV Clusters", fields: ['wj_broad_ss', 'wj_broad_pr', 'wj_broad_range', 'wj_reading_ss', 'wj_reading_pr', 'wj_reading_range', 'wj_written_ss', 'wj_written_pr', 'wj_written_range', 'wj_math_ss', 'wj_math_pr', 'wj_math_range'] },
    { title: "WJIV Standard & Extended Subtests", fields: [] },
    { title: "Narratives & Recommendations", fields: ['narrativeInterpretation', 'summaryOfFindings', 'recommendations'] }
  ];

  // Sub-templates data with comprehensive academic achievement template
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
### Woodcock-Johnson IV Tests of Achievement
**Clusters:**
- Broad Achievement: SS [WJ_BROAD_SS], PR [WJ_BROAD_PR], Range [WJ_BROAD_RANGE]
- Reading: SS [WJ_READING_SS], PR [WJ_READING_PR], Range [WJ_READING_RANGE]
- Written Language: SS [WJ_WRITTEN_SS], PR [WJ_WRITTEN_PR], Range [WJ_WRITTEN_RANGE]
- Mathematics: SS [WJ_MATH_SS], PR [WJ_MATH_PR], Range [WJ_MATH_RANGE]

**Standard Battery Subtests:**
- Letter-Word Identification: SS [WJ_LETTER_WORD_SS], PR [WJ_LETTER_WORD_PR]
- Applied Problems: SS [WJ_APPLIED_PROBLEMS_SS], PR [WJ_APPLIED_PROBLEMS_PR]
- Spelling: SS [WJ_SPELLING_SS], PR [WJ_SPELLING_PR]
- Passage Comprehension: SS [WJ_PASSAGE_COMP_SS], PR [WJ_PASSAGE_COMP_PR]
- Calculation: SS [WJ_CALCULATION_SS], PR [WJ_CALCULATION_PR]
- Writing Samples: SS [WJ_WRITING_SAMPLES_SS], PR [WJ_WRITING_SAMPLES_PR]
- Word Attack: SS [WJ_WORD_ATTACK_SS], PR [WJ_WORD_ATTACK_PR]
- Oral Reading: SS [WJ_ORAL_READING_SS], PR [WJ_ORAL_READING_PR]
- Sentence Reading Fluency: SS [WJ_SENT_READ_FLU_SS], PR [WJ_SENT_READ_FLU_PR]
- Math Facts Fluency: SS [WJ_MATH_FACTS_FLU_SS], PR [WJ_MATH_FACTS_FLU_PR]
- Sentence Writing Fluency: SS [WJ_SENT_WRITE_FLU_SS], PR [WJ_SENT_WRITE_FLU_PR]

[IF_INCLUDE_EXTENDED_BATTERY_START]
**Extended Battery Subtests:**
- Reading Recall: SS [WJ_READ_RECALL_SS], PR [WJ_READ_RECALL_PR]
- Number Matrices: SS [WJ_NUM_MATRICES_SS], PR [WJ_NUM_MATRICES_PR]
- Editing: SS [WJ_EDITING_SS], PR [WJ_EDITING_PR]
- Word Reading Fluency: SS [WJ_WORD_READ_FLU_SS], PR [WJ_WORD_READ_FLU_PR]
- Spelling of Sounds: SS [WJ_SPELL_SOUNDS_SS], PR [WJ_SPELL_SOUNDS_PR]
- Reading Vocabulary: SS [WJ_READ_VOCAB_SS], PR [WJ_READ_VOCAB_PR]
- Science: SS [WJ_SCIENCE_SS], PR [WJ_SCIENCE_PR]
- Social Studies: SS [WJ_SOCIAL_STUDIES_SS], PR [WJ_SOCIAL_STUDIES_PR]
- Humanities: SS [WJ_HUMANITIES_SS], PR [WJ_HUMANITIES_PR]
[IF_INCLUDE_EXTENDED_BATTERY_END]

## Narrative Interpretation of Academic Scores
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
  
  // Enhanced custom template handling
  const activeCustomContent = routeState?.customTemplateContent || draftedCustomContent;
  const activeCustomPlaceholders = routeState?.customTemplatePlaceholders || draftedCustomPlaceholders;
  const activeCustomName = routeState?.customTemplateName || draftedCustomName;
  const isCustomTemplateFlow = selectedTemplateId?.startsWith('custom-') || !!activeCustomContent;
  
  const currentAction = searchParams.get('action');
  
  // Draft key generation
  const getDraftKey = useCallback((): string => {
    if (selectedTemplateId) return `${DRAFT_KEY_PREFIX}${selectedTemplateId}`;
    if (currentAction === 'upload') return `${DRAFT_KEY_PREFIX}action_upload`;
    if (selectedCategoryId) return `${DRAFT_KEY_PREFIX}category_${selectedCategoryId}`;
    return `${DRAFT_KEY_PREFIX}general_create`;
  }, [selectedTemplateId, selectedCategoryId, currentAction]);

  // Dropzone configuration for file upload
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setCurrentStep(2);
      setCurrentSubStep(1);
      console.log('Dropped file:', file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  // Initialize from URL params or route state
  useEffect(() => {
    if (isLoadingTemplates) return;
    
    // Check for existing draft first
    const draftKey = getDraftKey();
    const loadedDraft = loadDraft(draftKey);
    
    if (loadedDraft && !routeState?.customTemplateContent) {
      if (window.confirm('Resume saved draft?')) {
        setFormData(loadedDraft.formData);
        setCurrentStep(loadedDraft.currentStep);
        setCurrentSubStep(loadedDraft.currentSubStep || 1);
        setSelectedCategoryId(loadedDraft.selectedCategoryId || null);
        setSelectedTemplateId(loadedDraft.selectedTemplateId || null);
        
        if (loadedDraft.isCustomFlag) {
          setDraftedCustomName(loadedDraft.customTemplateName);
          setDraftedCustomContent(loadedDraft.customTemplateContent);
          setDraftedCustomPlaceholders(loadedDraft.customTemplatePlaceholders);
        }
        
        // Ensure URL reflects template ID if draft is loaded
        if (loadedDraft.selectedTemplateId && loadedDraft.selectedTemplateId !== searchParams.get('template')) {
          setSearchParams({ template: loadedDraft.selectedTemplateId }, { replace: true });
        }
        
        return; // Exit early to use draft data
      } else {
        clearDraft(draftKey);
      }
    }

    const templateParam = searchParams.get('template');
    
    if (isCustomTemplateFlow) {
      setCurrentStep(2);
      setSelectedTemplateId('custom');
      setSelectedCategoryId('custom');
      
      const customPlaceholders = activeCustomPlaceholders || [];
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
      for (const category of templateCategories) {
        const subTemplate = subTemplates.find(st => 
          st.category_table_id === category.id && st.sub_template_id === templateParam
        );
        
        if (subTemplate) {
          setSelectedTemplateId(subTemplate.sub_template_id);
          setSelectedCategoryId(category.category_id);
          setCurrentStep(2);
          
          const newInitialFormData: FormData = {
            studentName: '',
            dob: '',
            doe: '',
            grade: '',
            examiner: '',
            reasonForReferral: '',
            backgroundInfo: '',
            assessmentInstruments: 'Woodcock-Johnson IV Tests of Achievement (WJ IV ACH)',
            behavioralObservations: '',
            includeExtendedBattery: false,
            narrativeInterpretation: '',
            summaryOfFindings: '',
            recommendations: ''
          };

          if (subTemplate.placeholder_keys) {
            subTemplate.placeholder_keys.forEach((key: string) => {
              const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, (g: string) => g[1].toUpperCase());
              if (!(camelKey in newInitialFormData) || newInitialFormData[camelKey] === undefined) {
                newInitialFormData[camelKey] = '';
              }
            });
          }

          setFormData(prevFormData => ({ ...newInitialFormData, ...prevFormData }));
          break;
        }
      }
    }
  }, [searchParams, routeState, templateCategories, isLoadingTemplates, isCustomTemplateFlow, getDraftKey, activeCustomPlaceholders]);
  
  // Auto-save draft effect
  useEffect(() => {
    if (currentStep === 1) return; // Don't save drafts on step 1
    
    const draftKey = getDraftKey();
    const draftToSave: DraftData = {
      formData,
      selectedTemplateId,
      currentStep,
      currentSubStep,
      selectedCategoryId,
      timestamp: Date.now()
    };
    
    if (isCustomTemplateFlow) {
      draftToSave.isCustomFlag = true;
      draftToSave.customTemplateName = activeCustomName;
      draftToSave.customTemplateContent = activeCustomContent;
      draftToSave.customTemplatePlaceholders = activeCustomPlaceholders;
    }
    
    // Debounce the save operation
    const timeoutId = setTimeout(() => {
      saveDraft(draftKey, draftToSave);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [formData, selectedTemplateId, currentStep, currentSubStep, selectedCategoryId, isCustomTemplateFlow, activeCustomName, activeCustomContent, activeCustomPlaceholders, getDraftKey]);

  // Utility functions for template processing
  const toUpperSnakeCase = (camelCase: string): string => {
    return camelCase.replace(/([A-Z])/g, "_$1").toUpperCase();
  };

  const populateTemplate = (templateContent: string, data: FormData): string => {
    let populatedContent = templateContent;

    // Handle conditional extended battery block
    const extendedStartTag = "[IF_INCLUDE_EXTENDED_BATTERY_START]";
    const extendedEndTag = "[IF_INCLUDE_EXTENDED_BATTERY_END]";
    const startIndex = populatedContent.indexOf(extendedStartTag);
    const endIndex = populatedContent.indexOf(extendedEndTag);

    if (startIndex !== -1 && endIndex !== -1) {
      if (data.includeExtendedBattery) {
        populatedContent = populatedContent.replace(extendedStartTag, "").replace(extendedEndTag, "");
      } else {
        populatedContent = populatedContent.substring(0, startIndex) + populatedContent.substring(endIndex + extendedEndTag.length);
      }
    }
    
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key) && key !== 'includeExtendedBattery') {
        const placeholderKey = toUpperSnakeCase(key);
        const placeholder = `[${placeholderKey}]`;
        const value = String(data[key as keyof FormData] ?? '');
        
        const regex = new RegExp(`\\[${placeholderKey}\\]`, 'g');
        populatedContent = populatedContent.replace(regex, value || '[N/A]');
      }
    }

    // Replace any remaining unfilled placeholders with [N/A]
    populatedContent = populatedContent.replace(/\[[A-Z0-9_]+\]/g, '[N/A]');
    return populatedContent;
  };

  // DOCX generation functionality
  const createDocxDocument = (data: FormData, templateId: string, fullTemplateContent: string): Document => {
    const populatedContent = populateTemplate(fullTemplateContent, data);
    const lines = populatedContent.split('\n');
    const paragraphs: Paragraph[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        paragraphs.push(new Paragraph({ text: '' }));
        continue;
      }
      
      if (trimmedLine.startsWith('# ')) {
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(2),
          heading: HeadingLevel.HEADING_1,
        }));
      } else if (trimmedLine.startsWith('## ')) {
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(3),
          heading: HeadingLevel.HEADING_2,
        }));
      } else if (trimmedLine.startsWith('### ')) {
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(4),
          heading: HeadingLevel.HEADING_3,
        }));
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.substring(2, trimmedLine.length - 2),
              bold: true,
            }),
          ],
        }));
      } else if (trimmedLine.startsWith('- ')) {
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(2),
          bullet: {
            level: 0,
          },
        }));
      } else {
        paragraphs.push(new Paragraph({
          text: trimmedLine,
        }));
      }
    }
    
    return new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });
  };

  const downloadDocxFile = async (filename: string, data: FormData, templateId: string) => {
    try {
      const currentTemplateObject = subTemplates.find(t => t.sub_template_id === templateId);
      if (!currentTemplateObject) {
        alert("Error: Could not find template to generate download.");
        return;
      }
      
      console.log('Creating DOCX document...');
      const doc = createDocxDocument(data, templateId, currentTemplateObject.content);
      
      console.log('Converting to blob...');
      const blob = await Packer.toBlob(doc);
      
      console.log('Saving file...');
      saveAs(blob, filename);
      
      console.log('DOCX file download initiated successfully');
    } catch (error) {
      console.error('Error generating DOCX file:', error);
      alert('Error generating DOCX file. Please try again.');
    }
  };

  // Event handlers
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const generateReport = () => {
    let template = '';
    
    if (isCustomTemplateFlow) {
      template = activeCustomContent || '';
    } else {
      const category = templateCategories.find(c => c.category_id === selectedCategoryId);
      if (category) {
        const subTemplate = subTemplates.find(st => 
          st.category_table_id === category.id && st.sub_template_id === selectedTemplateId
        );
        template = subTemplate?.content || '';
      }
    }
    
    const report = isCustomTemplateFlow 
      ? populateTemplate(template, formData, activeCustomPlaceholders)
      : populateTemplate(template, formData);
    setGeneratedReport(report);
    setCurrentStep(3);
  };

  const handleSaveReport = () => {
    // Clear draft when saving final report
    const draftKey = getDraftKey();
    clearDraft(draftKey);
    
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
      return activeCustomName || 'Custom Template';
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

  const renderFormField = (
    key: string, 
    label: string, 
    type: 'text' | 'textarea' | 'checkbox' | 'date' | 'number' = 'text',
    placeholder?: string
  ) => {
    const value = formData[key] || '';
    
    if (type === 'checkbox') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={key}
            name={key}
            checked={!!value}
            onChange={handleInputChange}
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
            name={key}
            value={value}
            onChange={handleInputChange}
            className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold min-h-[100px]"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={type}
            id={key}
            name={key}
            value={value}
            onChange={handleInputChange}
            className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
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
              
              <div 
                {...getRootProps()} 
                className={`p-10 border-2 border-dashed rounded-md text-center transition-all cursor-pointer bg-bg-secondary hover:bg-opacity-30 
                  ${isDragActive ? 'border-gold ring-2 ring-gold' : 'border-border hover:border-gold'}
                  ${isDragAccept ? 'border-green bg-green bg-opacity-5' : ''}
                  ${isDragReject ? 'border-red-500 bg-red-500 bg-opacity-5' : ''}`}
              >
                <input {...getInputProps()} />
                <UploadCloud 
                  size={48} 
                  className={`mx-auto mb-4 ${
                    isDragAccept ? 'text-green' :
                    isDragReject ? 'text-red-500' :
                    isDragActive ? 'text-gold' : 'text-text-secondary'
                  }`} 
                />
                {isDragReject ? (
                  <p className="font-medium text-red-500 mb-1">File type not accepted</p>
                ) : isDragAccept ? (
                  <p className="font-medium text-green mb-1">Drop to upload template</p>
                ) : isDragActive ? (
                  <p className="font-medium text-gold mb-1">Drop the file here</p>
                ) : (
                  <p className="font-medium text-text-primary mb-1">Drag & drop your template file here</p>
                )}
                <p className="text-sm text-text-secondary mb-4">(.docx, .pdf, or .txt files)</p>
                <button type="button" className="mt-4 btn btn-primary">
                  Or Click to Browse
                </button>
              </div>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-bg-primary border border-border rounded-md">
                  <p className="text-sm font-medium text-text-primary">Selected file: {selectedFile.name}</p>
                  <p className="text-xs text-text-secondary">Type: {selectedFile.type || 'application/octet-stream'}, Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <div className="mt-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedFile(null);
                        setCurrentSubStep(1);
                      }} 
                      className="btn border border-border hover:bg-bg-secondary mr-2"
                    >
                      Clear Selection
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentStep(2);
                        setCurrentSubStep(1);
                      }} 
                      className="btn bg-accent-gold text-black"
                    >
                      Use this File & Continue
                    </button>
                  </div>
                </div>
              )}
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
  if (currentStep === 2 && (selectedTemplateId || isCustomTemplateFlow || selectedFile)) {
    // Specific Multi-Sub-Step UI for 'academic-wjiv'
    if (selectedTemplateId === 'academic-wjiv') {
      return (
        <div className="animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedCategoryId(null);
                setSelectedTemplateId(null);
                setSearchParams({});
                setCurrentSubStep(1);
              }}
              className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Templates
            </button>
            <h1 className="text-2xl font-medium">
              WJ-IV Academic Achievement Report (Part {currentSubStep} of {wjivSubStepsConfig.length})
            </h1>
          </div>

          <div className="card max-w-4xl mx-auto">
            {/* WJIV Sub-step specific content */}
            {currentSubStep === 1 && (
              <div className="p-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[0].title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('studentName', 'Student Name', 'text')}
                  {renderFormField('dob', 'Date of Birth', 'date')}
                  {renderFormField('doe', 'Date of Evaluation', 'date')}
                  {renderFormField('grade', 'Grade Level', 'text')}
                  {renderFormField('examiner', 'Examiner', 'text')}
                </div>
              </div>
            )}

            {currentSubStep === 2 && (
              <div className="p-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[1].title}</h3>
                <div className="space-y-4">
                  {renderFormField('reasonForReferral', 'Reason for Referral', 'textarea')}
                  {renderFormField('backgroundInfo', 'Background Information', 'textarea')}
                  {renderFormField('assessmentInstruments', 'Assessment Instruments Administered', 'textarea')}
                  {renderFormField('behavioralObservations', 'Behavioral Observations', 'textarea')}
                </div>
              </div>
            )}

            {currentSubStep === 3 && (
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

            {currentSubStep === 4 && (
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

            {currentSubStep === 5 && (
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
                    setSelectedCategoryId(null);
                    setSelectedTemplateId(null);
                    setSearchParams({});
                  } else {
                    // Smart back navigation - skip extended battery step if it wasn't included
                    if (currentSubStep === 5 && !formData.includeExtendedBattery) {
                      setCurrentSubStep(4); // Go back to subtests step, not clusters
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
                  // Always go to next step normally - don't skip step 4
                  if (currentSubStep < wjivSubStepsConfig.length) { 
                    setCurrentSubStep(prev => prev + 1);
                  } else {
                    generateReport();
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
      // Fallback for OTHER templates or custom templates or file uploads
      let currentFormTitle = "Report Details";
      let currentPlaceholders: string[] = [];
      
      if (selectedFile) {
        currentFormTitle = `Uploaded File: ${selectedFile.name}`;
        // Placeholder for file parsing - in real implementation, you'd parse the file here
        currentPlaceholders = ['STUDENT_NAME', 'DOB', 'DOE', 'GRADE', 'EXAMINER'];
      } else if (isCustomTemplateFlow && activeCustomPlaceholders) {
        currentFormTitle = activeCustomName || "Custom Report";
        currentPlaceholders = activeCustomPlaceholders;
      } else if (selectedTemplateId) {
        const foundSubTemplate = subTemplates.find((st: SubTemplate) => st.sub_template_id === selectedTemplateId);
        if (foundSubTemplate) {
          currentFormTitle = foundSubTemplate.name;
          currentPlaceholders = foundSubTemplate.placeholder_keys || [];
        }
      }

      return (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {
                setCurrentStep(1); 
                setSelectedTemplateId(null); 
                setSelectedCategoryId(null); 
                setSelectedFile(null);
                setSearchParams({});
              }}
              className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Templates
            </button>
            <h1 className="text-2xl font-medium">Fill: {currentFormTitle}</h1>
          </div>
          
          <div className="card max-w-4xl mx-auto">
            <div className="space-y-4">
              {currentPlaceholders.length > 0 ? 
                currentPlaceholders.map(key => {
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
              <button 
                onClick={() => {
                  setCurrentStep(1); 
                  setSelectedTemplateId(null); 
                  setSelectedCategoryId(null);
                  setSelectedFile(null);
                  setSearchParams({});
                }} 
                className="btn border-border"
              >
                Back to Templates
              </button>
              <button onClick={generateReport} className="btn bg-accent-gold text-black">
                Generate & Review Report
              </button>
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
              <button 
                onClick={async () => {
                  if (selectedTemplateId) {
                    const studentNameSanitized = (formData.studentName || 'Student').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                    const filename = `${studentNameSanitized}_${selectedTemplateId}_Report.docx`;
                    await downloadDocxFile(filename, formData, selectedTemplateId);
                  } else {
                    alert("Error: No template selected for download.");
                  }
                }}
                className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
              >
                <Download size={16} />
                Export DOCX
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
          <div className="border border-border rounded-lg p-6 bg-bg-primary max-h-[60vh] overflow-y-auto">
            {(() => {
              let contentToUse: string | undefined;

              if (selectedFile) {
                // Placeholder for uploaded file template content
                contentToUse = `# UPLOADED TEMPLATE REPORT\n\n## Student Information\nName: [STUDENT_NAME]\nDate of Birth: [DOB]\n\n## Assessment Results\n[This would be populated from the uploaded template file]`;
              } else if (isCustomTemplateFlow && activeCustomContent) {
                contentToUse = activeCustomContent;
              } else if (selectedTemplateId && templateCategories) {
                const category = templateCategories.find(c => 
                  subTemplates.some(st => st.category_table_id === c.id && st.sub_template_id === selectedTemplateId)
                );
                const subTemplate = subTemplates.find(st => 
                  st.category_table_id === category?.id && st.sub_template_id === selectedTemplateId
                );
                contentToUse = subTemplate?.content;
              }

              if (!contentToUse) {
                return <p className="text-text-secondary italic">No template content available for preview.</p>;
              }

              const populatedText = isCustomTemplateFlow 
                ? populateTemplate(contentToUse, formData, activeCustomPlaceholders)
                : populateTemplate(contentToUse, formData);

              if (isPreviewMode) {
                if (isCustomTemplateFlow) {
                  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: populatedText }} />;
                } else {
                  const htmlPreview = markdownToBasicHtml(populatedText);
                  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: htmlPreview }} />;
                }
              } else {
                return (
                  <textarea
                    value={generatedReport || populatedText}
                    onChange={(e) => {
                      setGeneratedReport(e.target.value);
                      // Auto-save when editing
                      const draftKey = getDraftKey();
                      const draftToSave: DraftData = {
                        formData,
                        selectedTemplateId,
                        currentStep,
                        currentSubStep,
                        selectedCategoryId,
                        timestamp: Date.now()
                      };
                      if (isCustomTemplateFlow) {
                        draftToSave.isCustomFlag = true;
                        draftToSave.customTemplateName = activeCustomName;
                        draftToSave.customTemplateContent = activeCustomContent;
                        draftToSave.customTemplatePlaceholders = activeCustomPlaceholders;
                      }
                      setTimeout(() => saveDraft(draftKey, draftToSave), 500);
                    }}
                    className="w-full h-96 p-4 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold font-mono text-sm resize-none"
                    placeholder="Generated report will appear here..."
                  />
                );
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReportPage;