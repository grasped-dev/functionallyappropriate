import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  UploadCloud, FileText as FileTextIcon, ArrowRight, ArrowLeft, 
  Download, Save, Eye, EyeOff, CheckCircle, Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useReports, Report } from '../context/ReportContext'; // Ensure Report is exported

// --- INTERFACES ---
interface FormData {
  studentName?: string; dob?: string; doe?: string; grade?: string; examiner?: string;
  reasonForReferral?: string; backgroundInfo?: string; assessmentInstruments?: string; behavioralObservations?: string;
  includeExtendedBattery?: boolean; 
  wj_broad_ss?: string; wj_broad_pr?: string; wj_broad_range?: string;
  wj_reading_ss?: string; wj_reading_pr?: string; wj_reading_range?: string;
  wj_written_ss?: string; wj_written_pr?: string; wj_written_range?: string;
  wj_math_ss?: string; wj_math_pr?: string; wj_math_range?: string;
  wj_letter_word_ss?: string; wj_letter_word_pr?: string;
  wj_applied_problems_ss?: string; wj_applied_problems_pr?: string;
  wj_spelling_ss?: string; wj_spelling_pr?: string;
  wj_passage_comp_ss?: string; wj_passage_comp_pr?: string;
  wj_calculation_ss?: string; wj_calculation_pr?: string;
  wj_writing_samples_ss?: string; wj_writing_samples_pr?: string;
  wj_word_attack_ss?: string; wj_word_attack_pr?: string;
  wj_oral_reading_ss?: string; wj_oral_reading_pr?: string;
  wj_sent_read_flu_ss?: string; wj_sent_read_flu_pr?: string;
  wj_math_facts_flu_ss?: string; wj_math_facts_flu_pr?: string;
  wj_sent_write_flu_ss?: string; wj_sent_write_flu_pr?: string;
  wj_read_recall_ss?: string; wj_read_recall_pr?: string;
  wj_num_matrices_ss?: string; wj_num_matrices_pr?: string;
  wj_editing_ss?: string; wj_editing_pr?: string;
  wj_word_read_flu_ss?: string; wj_word_read_flu_pr?: string;
  wj_spell_sounds_ss?: string; wj_spell_sounds_pr?: string;
  wj_read_vocab_ss?: string; wj_read_vocab_pr?: string;
  wj_science_ss?: string; wj_science_pr?: string;
  wj_social_studies_ss?: string; wj_social_studies_pr?: string;
  wj_humanities_ss?: string; wj_humanities_pr?: string;
  narrativeInterpretation?: string; 
  summaryOfFindings?: string;    
  recommendations?: string;        
  [key: string]: any; 
}

interface DraftData {
  formData: FormData;
  selectedTemplateId: string | null;
  currentStep: number;
  currentSubStep: number; 
  selectedFile?: { name: string; type: string; size: number }; // For uploaded template flow if applicable
  // For custom templates from ReportDrafting.tsx
  isCustomFlag?: boolean;
  customTemplateName?: string;
  customTemplateContent?: string;
  customTemplatePlaceholders?: string[];
  timestamp?: number; // For draft expiry
}

const DRAFT_KEY = 'reportDraft'; // Simplified to one key for now
const DRAFT_EXPIRY_HOURS = 24;


// Helper function to convert basic Markdown-like text to HTML for preview
const markdownToBasicHtml = (markdownText: string): string => {
  if (!markdownText) return '';
  return markdownText
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.substring(4)}</h3>`;
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.substring(3)}</h2>`;
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.substring(2)}</h1>`;
      if (trimmed.startsWith('- ')) return `<ul><li>${trimmed.substring(2)}</li></ul>`; // Basic list, won't nest correctly
      if (trimmed === '') return '<br>';
      const boldedLine = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<p>${boldedLine}</p>`;
    })
    .join('');
};

const toUpperSnakeCase = (keyString: string): string => {
  if (!keyString) return '';
  return keyString.replace(/([A-Z0-9]+)/g, "_$1").replace(/([a-z])([A-Z0-9])/g, '$1_$2').replace(/^_/, "").toUpperCase().replace(/_{2,}/g, '_');
};

// Predefined template data (hardcoded in this component for now)
const fullTemplatesData = [
    {
      id: 'academic-achievement', // This ID must match what ReportDrafting.tsx Link sends
      name: 'Academic Achievement Report (WJIV Focus)',
      description: 'Comprehensive report using Woodcock-Johnson IV structure.',
      content: `# ACADEMIC ACHIEVEMENT REPORT\n\n## Student Information\nName: [STUDENT_NAME]\nDate of Birth: [DOB]\nDate of Evaluation: [DOE]\nGrade: [GRADE]\nExaminer: [EXAMINER]\n\n## Reason for Referral\n[REASON_FOR_REFERRAL]\n\n## Background Information\n[BACKGROUND_INFO]\n\n## Assessment Instruments Administered\n[ASSESSMENT_INSTRUMENTS]\n\n## Behavioral Observations\n[BEHAVIORAL_OBSERVATIONS]\n\n## Test Results & Interpretation\n### Woodcock-Johnson IV Tests of Achievement\n**Clusters:**\n- Broad Achievement: SS [WJ_BROAD_SS], PR [WJ_BROAD_PR], Range [WJ_BROAD_RANGE]\n- Reading: SS [WJ_READING_SS], PR [WJ_READING_PR], Range [WJ_READING_RANGE]\n- Written Language: SS [WJ_WRITTEN_SS], PR [WJ_WRITTEN_PR], Range [WJ_WRITTEN_RANGE]\n- Mathematics: SS [WJ_MATH_SS], PR [WJ_MATH_PR], Range [WJ_MATH_RANGE]\n\n**Standard Battery Subtests:**\n- Letter-Word Identification: SS [WJ_LETTER_WORD_SS], PR [WJ_LETTER_WORD_PR]\n- Applied Problems: SS [WJ_APPLIED_PROBLEMS_SS], PR [WJ_APPLIED_PROBLEMS_PR]\n- Spelling: SS [WJ_SPELLING_SS], PR [WJ_SPELLING_PR]\n- Passage Comprehension: SS [WJ_PASSAGE_COMP_SS], PR [WJ_PASSAGE_COMP_PR]\n- Calculation: SS [WJ_CALCULATION_SS], PR [WJ_CALCULATION_PR]\n- Writing Samples: SS [WJ_WRITING_SAMPLES_SS], PR [WJ_WRITING_SAMPLES_PR]\n- Word Attack: SS [WJ_WORD_ATTACK_SS], PR [WJ_WORD_ATTACK_PR]\n- Oral Reading: SS [WJ_ORAL_READING_SS], PR [WJ_ORAL_READING_PR]\n- Sentence Reading Fluency: SS [WJ_SENT_READ_FLU_SS], PR [WJ_SENT_READ_FLU_PR]\n- Math Facts Fluency: SS [WJ_MATH_FACTS_FLU_SS], PR [WJ_MATH_FACTS_FLU_PR]\n- Sentence Writing Fluency: SS [WJ_SENT_WRITE_FLU_SS], PR [WJ_SENT_WRITE_FLU_PR]\n\n[IF_INCLUDE_EXTENDED_BATTERY_START]\n**Extended Battery Subtests:**\n- Reading Recall: SS [WJ_READ_RECALL_SS], PR [WJ_READ_RECALL_PR]\n- Number Matrices: SS [WJ_NUM_MATRICES_SS], PR [WJ_NUM_MATRICES_PR]\n- Editing: SS [WJ_EDITING_SS], PR [WJ_EDITING_PR]\n- Word Reading Fluency: SS [WJ_WORD_READ_FLU_SS], PR [WJ_WORD_READ_FLU_PR]\n- Spelling of Sounds: SS [WJ_SPELL_SOUNDS_SS], PR [WJ_SPELL_SOUNDS_PR]\n- Reading Vocabulary: SS [WJ_READ_VOCAB_SS], PR [WJ_READ_VOCAB_PR]\n- Science: SS [WJ_SCIENCE_SS], PR [WJ_SCIENCE_PR]\n- Social Studies: SS [WJ_SOCIAL_STUDIES_SS], PR [WJ_SOCIAL_STUDIES_PR]\n- Humanities: SS [WJ_HUMANITIES_SS], PR [WJ_HUMANITIES_PR]\n[IF_INCLUDE_EXTENDED_BATTERY_END]\n\n## Narrative Interpretation of Academic Scores\n[NARRATIVE_INTERPRETATION]\n\n## Summary of Findings\n[SUMMARY_OF_FINDINGS]\n\n## Recommendations\n[RECOMMENDATIONS]`,
      placeholder_keys: ['STUDENT_NAME', 'DOB', 'DOE', 'GRADE', 'EXAMINER', 'REASON_FOR_REFERRAL', 'BACKGROUND_INFO', 'ASSESSMENT_INSTRUMENTS', 'BEHAVIORAL_OBSERVATIONS', 'WJ_BROAD_SS', 'WJ_BROAD_PR', 'WJ_BROAD_RANGE', 'WJ_READING_SS', 'WJ_READING_PR', 'WJ_READING_RANGE', 'WJ_WRITTEN_SS', 'WJ_WRITTEN_PR', 'WJ_WRITTEN_RANGE', 'WJ_MATH_SS', 'WJ_MATH_PR', 'WJ_MATH_RANGE', 'WJ_LETTER_WORD_SS', 'WJ_LETTER_WORD_PR', 'WJ_APPLIED_PROBLEMS_SS', 'WJ_APPLIED_PROBLEMS_PR', 'WJ_SPELLING_SS', 'WJ_SPELLING_PR', 'WJ_PASSAGE_COMP_SS', 'WJ_PASSAGE_COMP_PR', 'WJ_CALCULATION_SS', 'WJ_CALCULATION_PR', 'WJ_WRITING_SAMPLES_SS', 'WJ_WRITING_SAMPLES_PR', 'WJ_WORD_ATTACK_SS', 'WJ_WORD_ATTACK_PR', 'WJ_ORAL_READING_SS', 'WJ_ORAL_READING_PR', 'WJ_SENT_READ_FLU_SS', 'WJ_SENT_READ_FLU_PR', 'WJ_MATH_FACTS_FLU_SS', 'WJ_MATH_FACTS_FLU_PR', 'WJ_SENT_WRITE_FLU_SS', 'WJ_SENT_WRITE_FLU_PR', 'WJ_READ_RECALL_SS', 'WJ_READ_RECALL_PR', 'WJ_NUM_MATRICES_SS', 'WJ_NUM_MATRICES_PR', 'WJ_EDITING_SS', 'WJ_EDITING_PR', 'WJ_WORD_READ_FLU_SS', 'WJ_WORD_READ_FLU_PR', 'WJ_SPELL_SOUNDS_SS', 'WJ_SPELL_SOUNDS_PR', 'WJ_READ_VOCAB_SS', 'WJ_READ_VOCAB_PR', 'WJ_SCIENCE_SS', 'WJ_SCIENCE_PR', 'WJ_SOCIAL_STUDIES_SS', 'WJ_SOCIAL_STUDIES_PR', 'WJ_HUMANITIES_SS', 'WJ_HUMANITIES_PR','NARRATIVE_INTERPRETATION', 'SUMMARY_OF_FINDINGS', 'RECOMMENDATIONS']
    },
    // Add other predefined templates here with their full content and placeholder_keys
    { id: 'cognitive-general', name: 'General Cognitive Profile', description: 'Overview of cognitive functioning.', content: '# COGNITIVE REPORT\nName: [STUDENT_NAME]\nFSIQ: [FSIQ_SCORE]', placeholder_keys: ['STUDENT_NAME', 'DOB', 'FSIQ_SCORE'] },
];

const availableTemplatesForSelection = fullTemplatesData.map(t => ({id: t.id, name: t.name, description: t.description}));

// Config for WJIV form sub-steps (ensure keys match FormData)
const standardSubtestsConfig = [
    { id: 'letter_word', name: '1. Letter-Word Identification' }, { id: 'applied_problems', name: '2. Applied Problems' },
    { id: 'spelling', name: '3. Spelling' }, { id: 'passage_comp', name: '4. Passage Comprehension' },
    { id: 'calculation', name: '5. Calculation' }, { id: 'writing_samples', name: '6. Writing Samples' },
    { id: 'word_attack', name: '7. Word Attack' }, { id: 'oral_reading', name: '8. Oral Reading' },
    { id: 'sent_read_flu', name: '9. Sentence Reading Fluency' }, { id: 'math_facts_flu', name: '10. Math Facts Fluency' },
    { id: 'sent_write_flu', name: '11. Sentence Writing Fluency' }
];
const extendedSubtestsConfig = [
    { id: 'read_recall', name: '12. Reading Recall' }, { id: 'num_matrices', name: '13. Number Matrices' },
    { id: 'editing', name: '14. Editing' }, { id: 'word_read_flu', name: '15. Word Reading Fluency' },
    { id: 'spell_sounds', name: '16. Spelling of Sounds' }, { id: 'read_vocab', name: '17. Reading Vocabulary' },
    { id: 'science', name: '18. Science' }, { id: 'social_studies', name: '19. Social Studies' },
    { id: 'humanities', name: '20. Humanities' }
];
const wjivSubStepsConfig = [
  { title: "Student Information", fields: ['studentName', 'dob', 'doe', 'grade', 'examiner'] },
  { title: "Background & Referral", fields: ['reasonForReferral', 'backgroundInfo', 'assessmentInstruments', 'behavioralObservations'] },
  { title: "WJIV Clusters", fields: ['wj_broad_ss', 'wj_broad_pr', 'wj_broad_range', 'wj_reading_ss', 'wj_reading_pr', 'wj_reading_range', 'wj_written_ss', 'wj_written_pr', 'wj_written_range', 'wj_math_ss', 'wj_math_pr', 'wj_math_range'] },
  { title: "WJIV Standard & Extended Subtests", fields: [ /* Rendered via maps */ ] },
  { title: "Narratives & Recommendations", fields: ['narrativeInterpretation', 'summaryOfFindings', 'recommendations'] }
];


const CreateReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addReport } = useReports();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubStep, setCurrentSubStep] = useState<number>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(searchParams.get('template'));
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // For ?action=upload flow
  const [formData, setFormData] = useState<FormData>({});
  const [generatedReport, setGeneratedReport] = useState<string>(''); // For Step 3 editable preview
  const [isPreviewMode, setIsPreviewMode] = useState(true); // Default to HTML preview in Step 3

  // For custom templates passed via route state from ReportDrafting.tsx
  const routeState = location.state as { 
    customTemplateContent?: string; 
    customTemplatePlaceholders?: string[]; // UPPER_SNAKE_CASE keys
    customTemplateName?: string;
    isCustomFlag?: boolean; // This indicates it's a custom template
  } | null;

  const isEffectivelyCustom = !!routeState?.isCustomFlag && selectedTemplateId?.startsWith('custom-');
  const activeCustomContent = isEffectivelyCustom ? routeState?.customTemplateContent : undefined;
  const activeCustomPlaceholders = isEffectivelyCustom ? routeState?.customTemplatePlaceholders : undefined;
  const activeCustomName = isEffectivelyCustom ? routeState?.customTemplateName : undefined;
  const currentAction = searchParams.get('action');


  // Initialize form data and step based on URL or custom template state
  useEffect(() => {
    const templateParam = searchParams.get('template');
    setSelectedTemplateId(templateParam); // Sync with URL

    let initialFData: FormData = { studentName: '', dob: '', doe: '', grade: '', examiner: '', reasonForReferral: '', backgroundInfo: '', assessmentInstruments: '', behavioralObservations: '', includeExtendedBattery: false, narrativeInterpretation: '', summaryOfFindings: '', recommendations: ''};
    let stepToGo = 1;

    if (isEffectivelyCustom && routeState?.customTemplatePlaceholders) {
        stepToGo = 2;
        (routeState.customTemplatePlaceholders).forEach(key => {
            const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
            initialFData[camelKey] = '';
        });
    } else if (templateParam) {
        const template = fullTemplatesData.find(t => t.id === templateParam);
        if (template && template.placeholder_keys) {
            stepToGo = 2;
            template.placeholder_keys.forEach(key => {
                const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
                initialFData[camelKey] = '';
            });
            if (templateParam === 'academic-achievement') { // Specific to current detailed form
                initialFData.assessmentInstruments = 'Woodcock-Johnson IV Tests of Achievement (WJ IV ACH)\n';
                initialFData.includeExtendedBattery = false;
            }
        } else if (!searchParams.get('action')) { // Template in URL not found, not upload action
            stepToGo = 1; // Go back to selection
            setSelectedTemplateId(null); // Clear invalid template
        }
    } else if (searchParams.get('action') === 'upload') {
        stepToGo = 1; // Stay on step 1 for upload UI
    }

    setCurrentStep(stepToGo);
    if (stepToGo === 2) setCurrentSubStep(1); // Reset sub-step when entering step 2
    
    // Load draft after determining initial setup
    const draftKey = getDraftKey(templateParam, currentAction, isEffectivelyCustom);
    const loadedDraft = loadDraft(draftKey);

    if (loadedDraft) {
        if (window.confirm('You have a saved draft. Resume editing?')) {
            setFormData(loadedDraft.formData);
            setCurrentStep(loadedDraft.currentStep);
            setCurrentSubStep(loadedDraft.currentSubStep || 1);
            setSelectedTemplateId(loadedDraft.selectedTemplateId); // This should re-trigger this effect if needed
            if (loadedDraft.selectedTemplateId && loadedDraft.selectedTemplateId !== templateParam){
                 setSearchParams({template: loadedDraft.selectedTemplateId}, {replace: true});
            }
            if(loadedDraft.isCustomFlag && !routeState){ // If draft is custom but no route state (page refresh)
                // Need to reconstruct custom template info from draft for rendering
                // This is where you might set local states like draftedCustomContent etc. if needed.
                // For now, this means the form will render from formData keys.
                console.log("Resumed custom template draft without route state.");
            }
        } else {
            clearDraft(draftKey);
            if (stepToGo === 2) setFormData(initialFData); // Set fresh form data if draft declined
        }
    } else if (stepToGo === 2) {
        setFormData(initialFData); // No draft, set initial form data for selected template
    }

  }, [searchParams, routeState]); // Removed isEffectivelyCustom from deps as it's derived

  // Auto-save draft
  const getDraftKey = useCallback((currentTplId: string | null, currentAct: string | null, isCustom: boolean): string => {
    if (isCustom && currentTplId) return `${DRAFT_KEY_PREFIX}${currentTplId}`; // custom-TemplateName
    if (currentTplId) return `${DRAFT_KEY_PREFIX}${currentTplId}`; // predefined-template-id
    if (currentAct === 'upload') return `${DRAFT_KEY_PREFIX}action_upload`;
    return `${DRAFT_KEY_PREFIX}general_selection`;
  }, []);

  useEffect(() => {
    if (currentStep === 1 && !selectedTemplateId && !currentAction) return; // Don't save on initial selection screen

    const draftKey = getDraftKey(selectedTemplateId, currentAction, isEffectivelyCustom);
    const hasMeaningfulData = Object.values(formData).some(val => (typeof val === 'string' && val !== '') || (typeof val === 'boolean' && val));

    if (hasMeaningfulData || currentStep > 1 || (currentStep === 1 && currentAction === 'upload' && selectedFile)) {
      const draftData: DraftData = { formData, selectedTemplateId, currentStep, currentSubStep, selectedFile: selectedFile ? { name: selectedFile.name, type: selectedFile.type, size: selectedFile.size } : undefined };
      if (isEffectivelyCustom) {
        draftData.isCustomFlag = true;
        draftData.customTemplateName = routeState?.customTemplateName; // Get from routeState for saving
        draftData.customTemplateContent = routeState?.customTemplateContent;
        draftData.customTemplatePlaceholders = routeState?.customTemplatePlaceholders;
      }
      saveDraft(draftKey, draftData);
    }
  }, [formData, currentStep, currentSubStep, selectedTemplateId, selectedFile, currentAction, isEffectivelyCustom, routeState, getDraftKey]);

  const saveDraft = (key: string, data: DraftData) => { localStorage.setItem(key, JSON.stringify({...data, timestamp: Date.now()})); console.log("Draft saved to", key); };
  const loadDraft = (key: string): DraftData | null => { 
      const d = localStorage.getItem(key); 
      if (!d) return null;
      const draft = JSON.parse(d) as DraftData;
      if(draft.timestamp && (Date.now() - draft.timestamp) / (1000 * 60 * 60) > DRAFT_EXPIRY_HOURS) {
          localStorage.removeItem(key); return null;
      }
      return draft; 
  };
  const clearDraft = (key: string) => { localStorage.removeItem(key); console.log("Draft cleared for", key); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };
  
  const populateTemplate = (templateContent: string, data: FormData, placeholderKeysToUse?: string[]): string => {
    let populatedContent = templateContent;
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
    
    const keysForReplacement = placeholderKeysToUse || Object.keys(data);

    keysForReplacement.forEach(originalKey => {
      // If placeholderKeysToUse is provided, originalKey is already UPPER_SNAKE_CASE
      // Otherwise, formDataKey is camelCase and needs conversion for placeholder matching
      const formDataKey = placeholderKeysToUse ? originalKey.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase()) : originalKey;
      const placeholderTagKey = placeholderKeysToUse ? originalKey : toUpperSnakeCase(originalKey);
      
      if (Object.prototype.hasOwnProperty.call(data, formDataKey) && formDataKey !== 'includeExtendedBattery') {
        const value = String(data[formDataKey as keyof FormData] ?? '');
        const regex = new RegExp(`\\[${placeholderTagKey}\\]`, 'g');
        populatedContent = populatedContent.replace(regex, value || '[N/A]');
      }
    });
    populatedContent = populatedContent.replace(/\[[A-Z0-9_]+\]/g, '[N/A]'); // Clean up remaining
    return populatedContent;
  };
  
  const createDocxDocument = (data: FormData, templateContentToUse: string, isCustomHtmlDoc: boolean, customPlaceholders?: string[]): Document => {
    const populatedReportText = populateTemplate(templateContentToUse, data, isCustomHtmlDoc ? customPlaceholders : undefined);
    const docxParagraphs: Paragraph[] = [];

    if (isCustomHtmlDoc) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = populatedReportText; 
      Array.from(tempDiv.childNodes).forEach(node => {
        if (node.textContent?.trim()) {
          docxParagraphs.push(new Paragraph({ children: [new TextRun(node.textContent)] }));
        }
      });
      if (docxParagraphs.length === 0 && tempDiv.textContent) { 
        docxParagraphs.push(new Paragraph(tempDiv.textContent));
      }
    } else { 
      const lines = populatedReportText.split('\n');
      lines.forEach(line => {
        const trimmedLine = line.trim(); 
        let paragraphChildren: TextRun[] = [];
        if (trimmedLine.startsWith('## ')) { docxParagraphs.push(new Paragraph({ text: trimmedLine.substring(3), heading: HeadingLevel.HEADING_2 })); }
        else if (trimmedLine.startsWith('# ')) { docxParagraphs.push(new Paragraph({ text: trimmedLine.substring(2), heading: HeadingLevel.HEADING_1 })); }
        else if (trimmedLine.startsWith('### ')) { docxParagraphs.push(new Paragraph({ text: trimmedLine.substring(4), heading: HeadingLevel.HEADING_3 })); }
        else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) { paragraphChildren.push(new TextRun({ text: trimmedLine.substring(2, trimmedLine.length - 2), bold: true }));}
        else if (trimmedLine.startsWith('- ')) { docxParagraphs.push(new Paragraph({ text: trimmedLine.substring(2), bullet: { level: 0 } })); }
        else if (trimmedLine) { paragraphChildren.push(new TextRun(trimmedLine)); }
        
        if (paragraphChildren.length > 0 && !(trimmedLine.startsWith('## ') || trimmedLine.startsWith('# ') || trimmedLine.startsWith('### ') || trimmedLine.startsWith('- '))) {
            docxParagraphs.push(new Paragraph({ children: paragraphChildren }));
        } else if (!trimmedLine && lines.indexOf(line) > 0 && lines[lines.indexOf(line)-1]?.trim()){ 
            docxParagraphs.push(new Paragraph({text: ""}));
        }
      });
    }
    return new Document({ sections: [{ properties: {}, children: docxParagraphs }] });
  };

  const downloadDocxFile = async () => {
    let contentToUse: string | undefined;
    let filenameSuffix = 'Report';
    let currentPlaceholdersForDocx = undefined;

    if (isCustomTemplateFlow && activeCustomContent) {
      contentToUse = activeCustomContent;
      filenameSuffix = activeCustomName || 'Custom_Report';
      currentPlaceholdersForDocx = activeCustomPlaceholders;
    } else if (selectedTemplateId && templateCategoriesData) {
      const category = templateCategoriesData.find(c => subTemplatesData.some(st => st.category_table_id === c.id && st.sub_template_id === selectedTemplateId));
      const subTemplate = subTemplatesData.find(st => st.category_table_id === category?.id && st.sub_template_id === selectedTemplateId);
      contentToUse = subTemplate?.content;
      filenameSuffix = subTemplate?.name || selectedTemplateId;
    }

    if (!contentToUse) { alert("Template content not found for DOCX."); return; }
    
    const studentNameSanitized = (formData.studentName || 'Student').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const filename = `${studentNameSanitized}_${filenameSuffix.replace(/\s+/g, '_')}.docx`;
    
    const doc = createDocxDocument(formData, contentToUse, !!isCustomTemplateFlow, currentPlaceholdersForDocx);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  };
  
  const handleFinalizeReport = () => {
    let contentToUse: string | undefined;
    let templateNameToSave: string | undefined;
    let placeholdersForPopulation = undefined;

    if (isCustomTemplateFlow && activeCustomContent) {
        contentToUse = activeCustomContent;
        templateNameToSave = activeCustomName || "Custom Report";
        placeholdersForPopulation = activeCustomPlaceholders;
    } else if (selectedTemplateId && templateCategoriesData) {
        const category = templateCategoriesData.find(c => subTemplatesData.some(st => st.category_table_id === c.id && st.sub_template_id === selectedTemplateId));
        const subTemplate = subTemplatesData.find(st => st.category_table_id === category?.id && st.sub_template_id === selectedTemplateId);
        contentToUse = subTemplate?.content;
        templateNameToSave = subTemplate?.name;
    }

    if (!contentToUse || !templateNameToSave || !formData.studentName) {
      alert("Student name and template selection are required."); return;
    }
    
    const reportText = populateTemplate(contentToUse, formData, placeholdersForPopulation);
    const newReportToAdd: Report = {
      id: Date.now(), name: `${formData.studentName} - ${templateNameToSave}`,
      type: templateNameToSave, date: new Date().toISOString().split('T')[0], status: 'Completed',
      content: reportText, formData: { ...formData }
    };
    addReport(newReportToAdd);
    clearDraft(getDraftKey(selectedTemplateId, selectedCategoryId, currentAction));
    navigate('/reports');
  };

  const renderFormField = (key: string, label: string, type: 'text' | 'textarea' | 'checkbox' | 'date' | 'number' = 'text', placeholder?: string) => {
    const value = formData[key] || (type === 'checkbox' ? false : '');
    
    return ( <div key={key} className="mb-4"> <label htmlFor={key} className="block text-sm font-medium mb-1 text-text-primary capitalize">{label}</label> {type === 'checkbox' ? ( <input type="checkbox" id={key} name={key} checked={!!formData[key]} onChange={handleInputChange} className="h-4 w-4 text-gold border-border rounded focus:ring-gold"/> ) : type === 'textarea' ? ( <textarea name={key} id={key} value={value} onChange={handleInputChange} rows={3} className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold" placeholder={placeholder || `Enter ${label.toLowerCase()}`}/> ) : ( <input type={type} name={key} id={key} value={value} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold" placeholder={placeholder || `Enter ${label.toLowerCase()}`}/> )} </div> );
  };

  // --- RENDER LOGIC ---
  if (isLoadingTemplates && !isCustomTemplateFlow && !searchParams.get('template')) { return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-gold" /> <p className="ml-4">Loading Templates...</p></div>; }
  if (errorLoadingTemplates) { return <div className="p-4 text-red-600">Error: {errorLoadingTemplates}</div>; }
  if (!templateCategoriesData && !isCustomTemplateFlow && currentStep === 1 && !selectedCategoryId && !currentAction) { return <div className="p-4">No templates configured.</div>; }

  // Step 1: Template Selection
  if (currentStep === 1) {
    return (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-medium">Create New Report - Step 1</h1>
          </div>
          <div className="card max-w-5xl mx-auto">
              {currentAction === 'upload' ? (
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">Upload Custom Template File</h2>
                          <button onClick={() => setSearchParams({})} className="btn btn-primary text-sm">Back to Categories</button>
                      </div>
                      <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-md text-center transition-all cursor-pointer bg-bg-secondary ${isDragActive ? 'border-gold ring-2 ring-gold' : 'border-border hover:border-gold'}`}>
                          <input {...getInputProps()} />
                          <UploadCloud size={48} className={`mx-auto mb-4 ${isDragActive ? 'text-gold' : 'text-text-secondary'}`} />
                          <p className="font-medium text-text-primary mb-1">{isDragActive ? "Drop file here..." : "Drag & drop .docx file, or click to select"}</p>
                          {selectedFile && <p className="text-sm text-green-600 mt-2">File selected: {selectedFile.name}</p>}
                      </div>
                      {selectedFile && ( 
                          <div className="mt-4 text-right">
                               <button onClick={() => { setSelectedFile(null); }} className="btn border-border mr-2">Clear File</button>
                               <button onClick={() => { setSelectedTemplateId(`custom-${selectedFile.name}`); setCurrentStep(2); setCurrentSubStep(1);}} className="btn bg-accent-gold text-black">Use This Uploaded Template</button>
                          </div>
                      )}
                  </div>
              ) : !selectedCategoryId ? ( // Show Categories
                  <>
                      <h2 className="text-xl font-medium mb-6 text-center">Choose a Report Category</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {templateCategoriesData.map((category: TemplateCategory) => { // Typed category
                              const IconComponent = category.icon_name ? iconMap[category.icon_name] || FileTextIcon : FileTextIcon;
                              return (
                              <button key={category.id} onClick={() => { setSelectedCategoryId(category.category_id); clearDraft(getDraftKey(null, category.category_id, null)); setSelectedTemplateId(null);}} className="text-left p-4 border border-border rounded-lg hover:border-gold hover:shadow-md transition-all group bg-bg-primary">
                                  <div className="flex items-center gap-3 mb-2"><IconComponent className="text-gold group-hover:scale-105 transition-transform" size={24} /> <h3 className="font-semibold text-md text-text-primary">{category.category_name}</h3></div>
                                  <p className="text-xs text-text-secondary mb-3">{category.category_description}</p>
                                  <div className="mt-auto text-gold text-xs font-medium">View Templates <ArrowRight className="inline w-3 h-3 group-hover:translate-x-1 transition-transform" /></div>
                              </button>
                          );})}
                      </div>
                      <div className="mt-8 pt-4 border-t border-border text-center">
                          <p className="text-text-secondary mb-3">To create a template from your own DOCX file:</p>
                          <button onClick={() => navigate('/reports', {state: {triggerUploadModal: true}})} className="btn border-border hover:border-gold text-gold">Define Custom Template via Report Drafting Page</button>
                      </div>
                  </>
              ) : ( // Show Sub-Templates
                  <>
                      <div className="flex items-center mb-6"><button onClick={() => {setSelectedCategoryId(null); setSelectedTemplateId(null);}} className="btn btn-primary text-sm mr-4"><ArrowLeft size={16} className="inline mr-1"/>Back to Categories</button><h2 className="text-xl font-medium">Choose from: {templateCategoriesData.find(c => c.category_id === selectedCategoryId)?.category_name}</h2></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {subTemplatesData.filter(st => st.category_table_id === templateCategoriesData.find(c => c.category_id === selectedCategoryId)?.id).map((subTemplate: SubTemplate) => ( // Typed subTemplate
                              <button key={subTemplate.id} onClick={() => { setSearchParams({ template: subTemplate.sub_template_id }); /* Let useEffect handle other state updates */ }} className="text-left p-4 border border-border rounded-lg hover:border-gold hover:shadow-md transition-all group bg-bg-primary">
                                  <h4 className="font-semibold text-md text-text-primary mb-1">{subTemplate.name}</h4><p className="text-xs text-text-secondary line-clamp-2">{subTemplate.description}</p>
                                  <div className="mt-3 text-gold text-xs font-medium">Use Template <ArrowRight className="inline w-3 h-3" /></div>
                              </button>
                          ))}
                      </div>
                  </>
              )}
          </div>
        </div>
      );
  }

  // Step 2: Data Input Form
  if (currentStep === 2 && (selectedTemplateId || isCustomTemplateFlow)) {
    let currentFormTitle = "Report Details";
    let placeholdersForCurrentForm: string[] = [];

    if (isCustomTemplateFlow && activeCustomPlaceholders) {
        currentFormTitle = activeCustomName || "Custom Report";
        placeholdersForCurrentForm = activeCustomPlaceholders;
    } else if (selectedTemplateId && templateCategoriesData) {
        const subTemplate = subTemplatesData.find(st => st.sub_template_id === selectedTemplateId);
        if (subTemplate) {
            currentFormTitle = subTemplate.name;
            placeholdersForCurrentForm = subTemplate.placeholder_keys || [];
        }
    }

    if (selectedTemplateId === 'academic-wjiv') {
      return (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => { setCurrentStep(1); setSelectedCategoryId(null); setSelectedTemplateId(null); setSearchParams({}); setCurrentSubStep(1); }} className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"><ArrowLeft size={16} />Back to Templates</button>
            <h1 className="text-2xl font-medium">{currentFormTitle} (Part {currentSubStep} of {wjivSubStepsConfig.length})</h1>
          </div>
          <div className="card max-w-4xl mx-auto">
            {currentSubStep === 1 && ( <div className="p-4"><h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[0].title}</h3><div className="grid md:grid-cols-2 gap-4">{wjivSubStepsConfig[0].fields.map(f => renderFormField(f, f.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()), f.includes('dob')||f.includes('doe') ? 'date':'text'))}</div></div> )}
            {currentSubStep === 2 && ( <div className="p-4"><h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[1].title}</h3><div className="space-y-4">{wjivSubStepsConfig[1].fields.map(f => renderFormField(f, f.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),'textarea'))}</div></div> )}
            {currentSubStep === 3 && ( <div className="p-4"><h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[2].title}</h3><div className="space-y-4">{['broad', 'reading', 'written', 'math'].map(c=><div key={c} className="p-2 border rounded"><h4 className="capitalize font-medium">{c} Achievement</h4><div className="grid sm:grid-cols-3 gap-2">{renderFormField(`wj_${c}_ss`,'SS','number')}{renderFormField(`wj_${c}_pr`,'PR','number')}{renderFormField(`wj_${c}_range`,'Range','text')}</div></div>)}</div></div> )}
            {currentSubStep === 4 && ( <div className="p-4"><h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[3].title}</h3><h4 className="font-medium my-1">Standard Battery</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">{standardSubtestsConfig.map(s=><div key={s.id} className="p-2 border rounded"><h5 className="text-sm">{s.name}</h5><div className="grid grid-cols-2 gap-1">{renderFormField(`wj_${s.id}_ss`,'SS','number')}{renderFormField(`wj_${s.id}_pr`,'PR','number')}</div></div>)}</div>{renderFormField('includeExtendedBattery','Include Extended?','checkbox')}{formData.includeExtendedBattery && <><h4 className="font-medium my-1 mt-3">Extended Battery</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{extendedSubtestsConfig.map(s=><div key={s.id} className="p-2 border rounded"><h5 className="text-sm">{s.name}</h5><div className="grid grid-cols-2 gap-1">{renderFormField(`wj_${s.id}_ss`,'SS','number')}{renderFormField(`wj_${s.id}_pr`,'PR','number')}</div></div>)}</div></>}</div> )}
            {currentSubStep === 5 && ( <div className="p-4"><h3 className="text-lg font-semibold mb-4 text-gold">{wjivSubStepsConfig[4].title}</h3><div className="space-y-4">{wjivSubStepsConfig[4].fields.map(f => renderFormField(f, f.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),'textarea'))}</div></div> )}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <button onClick={() => { if (currentSubStep === 1) { setCurrentStep(1); setSelectedCategoryId(null); setSelectedTemplateId(null); setSearchParams({}); } else { if (currentSubStep === 5 && !formData.includeExtendedBattery) { setCurrentSubStep(3); } else { setCurrentSubStep(prev => Math.max(1, prev - 1)); }}}} className="btn border border-border hover:bg-bg-secondary flex items-center gap-1"><ArrowLeft size={16}/> {currentSubStep === 1 ? 'Back to Templates' : 'Previous Section'}</button>
              <button onClick={() => { if (currentSubStep === 3 && !formData.includeExtendedBattery) { setCurrentSubStep(5); } else if (currentSubStep < wjivSubStepsConfig.length) { setCurrentSubStep(prev => prev + 1); } else { generateReport(); }}} className="btn bg-accent-gold text-black flex items-center gap-1">{currentSubStep === wjivSubStepsConfig.length ? 'Generate & Review Report' : 'Next Section'} <ArrowRight size={16}/></button>
            </div>
          </div>
        </div>
      );
    } else { // Dynamic form for other predefined or custom
      return (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-4 mb-6"><button onClick={() => {setCurrentStep(1); setSelectedTemplateId(null); setSelectedCategoryId(null); setSelectedFile(null); setSearchParams({});}} className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"><ArrowLeft size={16}/>Back to Templates</button><h1 className="text-2xl font-medium">Fill: {currentFormTitle}</h1></div>
          <div className="card max-w-4xl mx-auto"><div className="space-y-4">
            {placeholdersForCurrentForm.length > 0 ? 
              placeholdersForCurrentForm.map(key => {
                const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase());
                const label = formatLabel(key); 
                const type = key.includes('DATE') || key.includes('DOB') ? 'date' : (key.includes('SS') || key.includes('PR') || key.includes('SCORE')) ? 'number' : 'textarea';
                return renderFormField(camelKey, label, type as any, `Enter ${label}`);
              })
              : <div className="text-center py-8"><FileTextIcon className="text-text-secondary opacity-50 mx-auto mb-3" size={36} /><p className="text-text-secondary">{isCustomTemplateFlow ? "This custom template has no defined fields to fill." : "No specific fields defined for this template."} You can proceed to review.</p></div>
            }
          </div>
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border"><button onClick={() => {setCurrentStep(1); setSelectedTemplateId(null); setSelectedCategoryId(null); setSelectedFile(null); setSearchParams({});}} className="btn border-border">Back</button><button onClick={generateReport} className="btn bg-accent-gold text-black">Generate & Review Report</button></div>
          </div>
        </div>
      );
    }
  }

  // Step 3: Review and Save
  if (currentStep === 3) {
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
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="mb-4">
                <label htmlFor="reportName" className="block text-sm font-medium mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  id="reportName"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full p-3 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder={`${formData.studentName || 'Student'} - ${activeCustomName || selectedTemplateId || 'Report'}`}
                />
              </div>

              {showPreview && (
                <div className="border border-border rounded-md p-6 bg-bg-secondary">
                  <h3 className="text-lg font-medium mb-4">Report Preview</h3>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedReport }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="card h-fit">
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={saveReport}
                className="w-full btn bg-accent-gold text-black flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Report
              </button>
              
              <button
                onClick={() => {
                  const blob = new Blob([generatedReport], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${reportName || 'report'}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full btn border border-border hover:bg-bg-secondary flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download HTML
              </button>
              
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full btn border border-border hover:bg-bg-secondary"
              >
                Edit Form Data
              </button>
            </div>

            <div className="mt-6 p-4 bg-bg-secondary rounded-md">
              <h4 className="font-medium mb-2">Report Summary</h4>
              <div className="text-sm space-y-1">
                <div>Template: {activeCustomName || selectedTemplateId}</div>
                <div>Fields Filled: {Object.keys(formData).length}</div>
                <div>Status: Draft</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/reports"
          className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Reports
        </Link>
        <h1 className="text-2xl font-medium">Create Report</h1>
      </div>
      
      <div className="card text-center py-12">
        <FileText className="text-text-secondary mx-auto mb-4" size={64} />
        <h2 className="text-xl font-medium mb-4">Something went wrong</h2>
        <p className="text-text-secondary mb-6">Please try again or go back to reports.</p>
        <Link to="/reports" className="btn bg-accent-gold text-black">
          Back to Reports
        </Link>
      </div>
    </div>
  );
};

export default CreateReportPage;