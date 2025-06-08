import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, ArrowRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useReports, Report } from '../context/ReportContext';

interface FormData {
  studentName?: string;
  dob?: string;
  doe?: string;
  grade?: string;
  examiner?: string;
  reasonForReferral?: string;
  backgroundInfo?: string;
  assessmentInstruments?: string;
  behavioralObservations?: string;
  includeExtendedBattery?: boolean;
  // Standard Battery Subtests
  wj_letter_word_ss?: string;
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
  narrativeInterpretation?: string;
  summaryOfFindings?: string;
  recommendations?: string;
}

interface DraftData {
  formData: FormData;
  selectedTemplateId: string | null;
  currentStep: number;
  currentSubStep: number;
  selectedFile?: { name: string; type: string; size: number }; // Store minimal file info
}

const CreateReportPage: React.FC = () => {
  const DRAFT_KEY = 'reportDraft';
  
  const [searchParams] = useSearchParams();
  const { addReport } = useReports();
  const navigate = useNavigate();
  const selectedTemplateId = searchParams.get('template');
  const currentAction = searchParams.get('action');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentSubStep, setCurrentSubStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({});
  
  // Template data with full content for preview
  const saveDraft = (data: DraftData) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      console.log("Draft data prepared for saving:", data); // For debugging
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const loadDraft = (): DraftData | null => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        console.log("Draft loaded from localStorage."); // For debugging
        return JSON.parse(draft);
      }
      return null;
    } catch (error) {
      console.error("Error loading draft:", error);
      return null;
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      console.log("Draft cleared from localStorage."); // For debugging
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  };

  const fullTemplatesData = [
    {
      id: 'academic-achievement',
      name: 'Academic Achievement Report',
      description: 'Comprehensive report on student academic skills, often using WJ IV, WIAT, etc.',
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
[RECOMMENDATIONS]`
    },
    {
      id: 'cognitive-processing',
      name: 'Cognitive Processing Report',
      description: 'Details student cognitive abilities, processing strengths, and weaknesses.',
      content: `# COGNITIVE PROCESSING REPORT
## Student Information
Name: [STUDENT_NAME]
Date of Birth: [DOB]
## Overall Scores
FSIQ: [FSIQ_SCORE_PLACEHOLDER] 
## Summary
[SUMMARY_PLACEHOLDER]`
    },
    {
      id: 'speech-language',
      name: 'Speech & Language Report',
      description: 'Assesses various aspects of communication including receptive/expressive language, articulation, fluency, and voice.',
      content: `# SPEECH AND LANGUAGE REPORT
## Student Information
Name: [STUDENT_NAME]
## Articulation
[ARTICULATION_NOTES_PLACEHOLDER]
## Language
[LANGUAGE_NOTES_PLACEHOLDER]
## Summary
[SUMMARY_PLACEHOLDER]`
    }
  ];

  const toUpperSnakeCase = (camelCase: string): string => {
    return camelCase
      .replace(/([A-Z])/g, "_$1")
      .toUpperCase();
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

  const createDocxDocument = (data: FormData, templateId: string, fullTemplateContent: string): Document => {
    // First populate the template with data
    const populatedContent = populateTemplate(fullTemplateContent, data);
    
    // Split content into lines for processing
    const lines = populatedContent.split('\n');
    const paragraphs: Paragraph[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        paragraphs.push(new Paragraph({ text: '' }));
        continue;
      }
      
      // Handle different heading levels
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
        // Handle bold text
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.substring(2, trimmedLine.length - 2),
              bold: true,
            }),
          ],
        }));
      } else if (trimmedLine.startsWith('- ')) {
        // Handle bullet points
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(2),
          bullet: {
            level: 0,
          },
        }));
      } else {
        // Regular paragraph
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
      const currentTemplateObject = fullTemplatesData.find(t => t.id === templateId);
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

  const downloadTextFile = (filename: string, text: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setCurrentStep(1);
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

  // Standard Battery Subtests Configuration
  const standardSubtests = [
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

  const extendedSubtests = [
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };
  
  const availableTemplates = [
    { id: 'academic-achievement', name: 'Academic Achievement Report', description: 'Comprehensive report on student academic skills, often using WJ IV, WIAT, etc.' },
    { id: 'cognitive-processing', name: 'Cognitive Processing Report', description: 'Details student cognitive abilities, processing strengths, and weaknesses.' },
    { id: 'speech-language', name: 'Speech & Language Report', description: 'Assesses various aspects of communication including receptive/expressive language, articulation, fluency, and voice.' },
  ];
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentStep(1); // Reset to step 1 confirmation for the new file
      setCurrentSubStep(1); // Reset sub-step
      console.log('Selected file:', file);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Create New Report</h1>
        <Link to="/reports" className="btn btn-primary">
          Back to Reports
        </Link>
      </div>
      
      <div className="card">
        {currentStep === 1 && (
          currentAction === 'upload' ? (
            <>
              <h2 className="text-xl font-medium mb-4">Upload Your Report Template</h2>
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
            </>
          ) : selectedTemplateId ? (
            <>
              <h2 className="text-xl font-medium mb-4">Selected Template</h2>
              <p className="mb-2">You have selected template ID: {selectedTemplateId}.</p>
              <p className="text-text-secondary">(Next step: Input/Upload Scores - UI coming soon)</p>
              <div className="mt-6 text-right">
                <button 
                  onClick={() => {
                    setCurrentStep(2);
                    setCurrentSubStep(1);
                  }} 
                  className="btn bg-accent-gold text-black"
                >
                  Continue with this Template
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-medium mb-6">Step 1: Choose an Existing Template</h2>
              <div className="space-y-4">
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="w-full text-left p-4 border border-border rounded-md transition-all hover:border-gold hover:bg-gold hover:bg-opacity-10 flex flex-col"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <FileText className="text-gold mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-sm text-text-secondary line-clamp-2">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-auto pt-2">
                      <Link
                        to={`?template=${template.id}`}
                        className="btn-sm bg-accent-gold text-black hover:bg-opacity-90 px-4 py-1.5 text-sm flex items-center gap-1.5"
                        onClick={() => {
                          setSelectedFile(null); 
                        }}
                      >
                        Select this Template
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-text-secondary mb-3">Or, if you have your own template file:</p>
                <Link 
                  to="?action=upload" 
                  className="btn border border-border hover:border-gold text-gold"
                  onClick={() => {
                    setSelectedFile(null);
                  }}
                >
                  Upload a Custom Template File
                </Link>
              </div>
            </>
          )
        )}
        
        {currentStep === 2 && (
          <>
            <h2 className="text-xl font-medium mb-4">Step 2: Input Scores & Narrative</h2>
            <p className="text-text-secondary mb-6">
              {selectedFile ? 
                `You are using the uploaded file: ${selectedFile.name}. (Placeholder for template parsing results and score input fields).` :
              selectedTemplateId ?
                `You are using template ID: ${selectedTemplateId}. (Placeholder for score input fields).` :
                "Error: No template or file selected." 
              }
            </p>
            
            <div className="space-y-6">
              {selectedTemplateId === 'academic-achievement' && (
                <div className="space-y-6">
                  {/* Sub-Step 1: Student Information */}
                  {currentSubStep === 1 && (
                  <div className="p-4 border border-border rounded-md animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-3 text-gold">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="studentName" className="block text-sm font-medium mb-1">Student Name</label>
                        <input
                          type="text"
                          name="studentName"
                          id="studentName"
                          value={formData.studentName || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                      <div>
                        <label htmlFor="dob" className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          id="dob"
                          value={formData.dob || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                      <div>
                        <label htmlFor="doe" className="block text-sm font-medium mb-1">Date of Evaluation</label>
                        <input
                          type="date"
                          name="doe"
                          id="doe"
                          value={formData.doe || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                      <div>
                        <label htmlFor="grade" className="block text-sm font-medium mb-1">Grade</label>
                        <input
                          type="text"
                          name="grade"
                          id="grade"
                          value={formData.grade || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="examiner" className="block text-sm font-medium mb-1">Examiner</label>
                        <input
                          type="text"
                          name="examiner"
                          id="examiner"
                          value={formData.examiner || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Sub-Step 2: WJ IV Clusters */}
                  {currentSubStep === 2 && (
                  <div className="p-4 border border-border rounded-md animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-3 text-gold">Woodcock-Johnson IV - Clusters</h3>
                    <div className="space-y-4">
                      {/* Broad Achievement */}
                      <div className="p-3 border border-border-secondary rounded bg-bg-secondary">
                        <h4 className="font-medium mb-2">Broad Achievement</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label htmlFor="wj_broad_ss" className="block text-xs font-medium mb-1">Standard Score (SS)</label>
                            <input type="number" name="wj_broad_ss" id="wj_broad_ss" value={formData.wj_broad_ss || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                          <div>
                            <label htmlFor="wj_broad_pr" className="block text-xs font-medium mb-1">Percentile Rank (PR)</label>
                            <input type="number" name="wj_broad_pr" id="wj_broad_pr" value={formData.wj_broad_pr || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                          <div>
                            <label htmlFor="wj_broad_range" className="block text-xs font-medium mb-1">Descriptive Range</label>
                            <input type="text" name="wj_broad_range" id="wj_broad_range" value={formData.wj_broad_range || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Reading */}
                      <div className="p-3 border border-border-secondary rounded bg-bg-secondary">
                        <h4 className="font-medium mb-2">Reading</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label htmlFor="wj_reading_ss" className="block text-xs font-medium mb-1">Standard Score (SS)</label>
                            <input type="number" name="wj_reading_ss" id="wj_reading_ss" value={formData.wj_reading_ss || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                          <div>
                            <label htmlFor="wj_reading_pr" className="block text-xs font-medium mb-1">Percentile Rank (PR)</label>
                            <input type="number" name="wj_reading_pr" id="wj_reading_pr" value={formData.wj_reading_pr || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                          <div>
                            <label htmlFor="wj_reading_range" className="block text-xs font-medium mb-1">Descriptive Range</label>
                            <input type="text" name="wj_reading_range" id="wj_reading_range" value={formData.wj_reading_range || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Written Language */}
                      <div className="p-3 border border-border-secondary rounded bg-bg-secondary">
                        <h4 className="font-medium mb-2">Written Language</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label htmlFor="wj_written_ss" className="block text-xs font-medium mb-1">Standard Score (SS)</label>
                            <input type="number" name="wj_written_ss" id="wj_written_ss" value={formData.wj_written_ss || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                          <div>
                            <label htmlFor="wj_written_pr" className="block text-xs font-medium mb-1">Percentile Rank (PR)</label>
                            <input type="number" name="wj_written_pr" id="wj_written_pr" value={formData.wj_written_pr || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                          <div>
                            <label htmlFor="wj_written_range" className="block text-xs font-medium mb-1">Descriptive Range</label>
                            <input type="text" name="wj_written_range" id="wj_written_range" value={formData.wj_written_range || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Mathematics */}
                      <div className="p-3 border border-border-secondary rounded bg-bg-secondary">
                        <h4 className="font-medium mb-2">Mathematics</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label htmlFor="wj_math_ss" className="block text-xs font-medium mb-1">Standard Score (SS)</label>
                            <input type="number" name="wj_math_ss" id="wj_math_ss" value={formData.wj_math_ss || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                          <div>
                            <label htmlFor="wj_math_pr" className="block text-xs font-medium mb-1">Percentile Rank (PR)</label>
                            <input type="number" name="wj_math_pr" id="wj_math_pr" value={formData.wj_math_pr || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                          <div>
                            <label htmlFor="wj_math_range" className="block text-xs font-medium mb-1">Descriptive Range</label>
                            <input type="text" name="wj_math_range" id="wj_math_range" value={formData.wj_math_range || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Sub-Step 3: WJ IV Standard Battery Subtests */}
                  {currentSubStep === 3 && (
                  <div className="p-4 border border-border rounded-md animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-3 text-gold">Woodcock-Johnson IV - Standard Battery Subtests</h3>
                    <div className="space-y-3">
                      {standardSubtests.map(subtest => (
                        <div key={subtest.id} className="p-3 border border-border-secondary rounded bg-bg-secondary">
                          <h4 className="font-medium text-sm mb-2">{subtest.name}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`wj_${subtest.id}_ss`} className="block text-xs font-medium mb-1">Standard Score (SS)</label>
                              <input
                                type="number"
                                name={`wj_${subtest.id}_ss`}
                                id={`wj_${subtest.id}_ss`}
                                value={formData[`wj_${subtest.id}_ss` as keyof FormData] || ''}
                                onChange={handleInputChange}
                                className="w-full p-1.5 border border-border rounded-md bg-bg-primary text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                              />
                            </div>
                            <div>
                              <label htmlFor={`wj_${subtest.id}_pr`} className="block text-xs font-medium mb-1">Percentile Rank (PR)</label>
                              <input
                                type="number"
                                name={`wj_${subtest.id}_pr`}
                                id={`wj_${subtest.id}_pr`}
                                value={formData[`wj_${subtest.id}_pr` as keyof FormData] || ''}
                                onChange={handleInputChange}
                                className="w-full p-1.5 border border-border rounded-md bg-bg-primary text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 mb-4">
                      <label htmlFor="includeExtendedBattery" className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox"
                          name="includeExtendedBattery"
                          id="includeExtendedBattery"
                          checked={formData.includeExtendedBattery || false}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-gold border-border rounded focus:ring-gold"
                        />
                        <span className="ml-2 text-sm font-medium text-text-primary">Include Extended Battery Subtests?</span>
                      </label>
                    </div>
                  </div>
                  )}

                  {/* Sub-Step 4: Extended Battery (if enabled) */}
                  {currentSubStep === 4 && formData.includeExtendedBattery && (
                  <div className="p-4 border border-border rounded-md animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-3 text-gold">Woodcock-Johnson IV - Extended Battery Subtests</h3>
                    <div className="space-y-3">
                      {extendedSubtests.map(subtest => (
                        <div key={subtest.id} className="p-3 border border-border-secondary rounded bg-bg-secondary">
                          <h4 className="font-medium text-sm mb-2">{subtest.name}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`wj_${subtest.id}_ss`} className="block text-xs font-medium mb-1">Standard Score (SS)</label>
                              <input
                                type="number"
                                name={`wj_${subtest.id}_ss`}
                                id={`wj_${subtest.id}_ss`}
                                value={formData[`wj_${subtest.id}_ss` as keyof FormData] || ''}
                                onChange={handleInputChange}
                                className="w-full p-1.5 border border-border rounded-md bg-bg-primary text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                              />
                            </div>
                            <div>
                              <label htmlFor={`wj_${subtest.id}_pr`} className="block text-xs font-medium mb-1">Percentile Rank (PR)</label>
                              <input
                                type="number"
                                name={`wj_${subtest.id}_pr`}
                                id={`wj_${subtest.id}_pr`}
                                value={formData[`wj_${subtest.id}_pr` as keyof FormData] || ''}
                                onChange={handleInputChange}
                                className="w-full p-1.5 border border-border rounded-md bg-bg-primary text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Sub-Step 5: Narrative Sections */}
                  {currentSubStep === 5 && (
                  <div className="p-4 border border-border rounded-md animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-3 text-gold">Narrative Sections</h3>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="reasonForReferral" className="block text-sm font-medium mb-2">Reason for Referral</label>
                        <textarea
                          name="reasonForReferral"
                          id="reasonForReferral"
                          rows={3}
                          value={formData.reasonForReferral || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder="Describe the reason for referral..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="backgroundInfo" className="block text-sm font-medium mb-2">Background Information</label>
                        <textarea
                          name="backgroundInfo"
                          id="backgroundInfo"
                          rows={4}
                          value={formData.backgroundInfo || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder="Provide relevant background information..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="assessmentInstruments" className="block text-sm font-medium mb-2">Assessment Instruments Administered</label>
                        <textarea
                          name="assessmentInstruments"
                          id="assessmentInstruments"
                          rows={3}
                          value={formData.assessmentInstruments || 'Woodcock-Johnson IV Tests of Achievement (WJ IV ACH)\n'}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder="List all assessment instruments used..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="behavioralObservations" className="block text-sm font-medium mb-2">Behavioral Observations</label>
                        <textarea
                          name="behavioralObservations"
                          id="behavioralObservations"
                          rows={4}
                          value={formData.behavioralObservations || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder="Describe observations during assessment..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="narrativeInterpretation" className="block text-sm font-medium mb-2">Narrative Interpretation of Academic Scores</label>
                        <textarea
                          name="narrativeInterpretation"
                          id="narrativeInterpretation"
                          rows={5}
                          value={formData.narrativeInterpretation || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder="Provide interpretation of academic scores..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="summaryOfFindings" className="block text-sm font-medium mb-2">Summary of Findings</label>
                        <textarea
                          name="summaryOfFindings"
                          id="summaryOfFindings"
                          rows={4}
                          value={formData.summaryOfFindings || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder="Summarize key findings from assessment..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="recommendations" className="block text-sm font-medium mb-2">Recommendations</label>
                        <textarea
                          name="recommendations"
                          id="recommendations"
                          rows={4}
                          value={formData.recommendations || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder="Provide academic recommendations..."
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Sub-Step Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
                    <button 
                      onClick={() => {
                        if (currentSubStep === 1) {
                          setCurrentStep(1);
                        } else {
                          if (currentSubStep === 5 && !formData.includeExtendedBattery) {
                            setCurrentSubStep(3);
                          } else {
                            setCurrentSubStep(prev => prev - 1);
                          }
                        }
                      }} 
                      className="btn border border-border hover:bg-bg-secondary"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (currentSubStep === 3 && !formData.includeExtendedBattery) {
                          setCurrentSubStep(5);
                        } else if (currentSubStep < 5) {
                          setCurrentSubStep(prev => prev + 1);
                        } else if (currentSubStep === 5) {
                          setCurrentStep(3);
                          setCurrentSubStep(1);
                        }
                      }}
                      className="btn bg-accent-gold text-black"
                    >
                      {currentSubStep === 5 ? 'Review Report' : 
                       formData.includeExtendedBattery && currentSubStep === 4 ? 'Next: Narrative' :
                       currentSubStep === 3 && !formData.includeExtendedBattery ? 'Next: Narrative' : 'Next'}
                    </button>
                  </div>
                </div>
              )}

              {selectedTemplateId === 'cognitive-processing' && (
                <div className="p-4 border border-border rounded-md">
                  <h3 className="text-lg font-semibold mb-3 text-gold">Cognitive Processing - Score Input</h3>
                  <p className="text-text-secondary">Score input fields for Cognitive Processing reports will go here.</p>
                </div>
              )}

              {selectedTemplateId === 'speech-language' && (
                <div className="p-4 border border-border rounded-md">
                  <h3 className="text-lg font-semibold mb-3 text-gold">Speech & Language - Score Input</h3>
                  <p className="text-text-secondary">Score input fields for Speech & Language reports will go here.</p>
                </div>
              )}

              {!['academic-achievement', 'cognitive-processing', 'speech-language'].includes(selectedTemplateId || '') && selectedFile && (
                <div className="p-4 border border-border rounded-md">
                  <h3 className="text-lg font-semibold mb-3 text-gold">Uploaded File: {selectedFile.name}</h3>
                  <p className="text-text-secondary">Placeholder for displaying parsed template fields and score input for uploaded files.</p>
                </div>
              )}
            </div>
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <h2 className="text-xl font-medium mb-4">Step 3: Review & Finalize Report</h2>
            <p className="text-text-secondary mb-6">
              Review your populated report template below. You can make final edits or generate the final document.
            </p>
            
            <div className="space-y-6">
              <div className="p-4 border border-border rounded-md">
                <h3 className="text-lg font-semibold mb-3 text-gold">Populated Report Preview</h3>
                {(() => {
                  if (!selectedTemplateId) {
                    return <p className="text-red-500">No template selected.</p>;
                  }
                  const currentTemplateObject = fullTemplatesData.find(t => t.id === selectedTemplateId);
                  if (!currentTemplateObject) {
                    return <p className="text-red-500">Error: Template content not found for ID: {selectedTemplateId}</p>;
                  }
                  const reportText = populateTemplate(currentTemplateObject.content, formData);
                  return (
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-bg-primary p-4 border border-border rounded-md max-h-[60vh] overflow-y-auto">
                      {reportText}
                    </pre>
                  );
                })()}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button 
                  onClick={() => {
                    setCurrentStep(2);
                    setCurrentSubStep(5);
                  }} 
                  className="btn border border-border hover:bg-bg-secondary"
                >
                  Back to Edit Data
                </button>
                <div className="flex gap-3">
                  <button className="btn border border-border hover:bg-bg-secondary">
                    Save as Draft
                  </button>
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
                    className="btn bg-accent-teal"
                  >
                    Download Report (.docx)
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedTemplateId && formData.studentName) {
                        const currentTemplateObject = fullTemplatesData.find(t => t.id === selectedTemplateId);
                        if (currentTemplateObject) {
                          const reportText = populateTemplate(currentTemplateObject.content, formData);
                          
                          const newReportToAdd: Report = {
                            // id will be generated by addReport in context
                            id: 0, // Temporary, will be overwritten
                            name: `${formData.studentName} - ${currentTemplateObject.name}`,
                            type: currentTemplateObject.name, // Or selectedTemplateId for a more programmatic type
                            date: new Date().toISOString().split('T')[0], // Today's date
                            status: 'Completed', // Or 'Draft' if you prefer
                            content: reportText,
                            formData: { ...formData } // Store a copy of the form data
                          };
                          
                          addReport(newReportToAdd);
                          navigate('/reports'); // Navigate back to the reports list
                        } else {
                          alert("Error: Could not find template information to save the report.");
                        }
                      } else {
                        alert("Error: Student name and template are required to save the report.");
                      }
                    }}
                    className="btn bg-accent-gold text-black"
                  >
                    Generate Final Report
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateReportPage;