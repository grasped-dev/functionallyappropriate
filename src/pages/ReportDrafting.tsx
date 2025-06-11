import React, { useState } from 'react';
import { FileText, Copy, Check, Download, Plus, FilePenLine, Sparkles, MessageSquarePlus, Lightbulb, ArrowRight, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useReports } from '../context/ReportContext';
import mammoth from 'mammoth';
import TemplateEditorModal from '../components/modals/TemplateEditorModal';

// Interface for template objects
interface TemplateCategory {
  id: string;
  name: string;
}

// Interface for template objects
interface AppTemplate {
  id: string;
  name: string;
  description: string;
  content: string; // Can be Markdown for predefined, HTML for custom
  isCustom?: boolean; // Flag to distinguish
  placeholderKeys?: string[]; // For custom templates
  categoryId?: string; // NEW: To store the category ID for this template
}

const ReportDrafting: React.FC = () => {
  const { reports } = useReports();
  
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Mock categories based on the database schema
  const availableCategories: TemplateCategory[] = [
    { id: '1', name: 'Academic Reports' },
    { id: '2', name: 'Behavioral Reports' },
    { id: '3', name: 'Speech & Language Reports' },
    { id: '4', name: 'Cognitive Assessments' },
    { id: '5', name: 'Progress Reports' },
    { id: '6', name: 'Custom Templates' }
  ];
  
  const [isTemplateEditorModalOpen, setIsTemplateEditorModalOpen] = useState(false);
  const [newTemplateInitialContent, setNewTemplateInitialContent] = useState(''); // Will store HTML
  const [newTemplateInitialName, setNewTemplateInitialName] = useState('');
  
  // Predefined templates with isCustom flag
  const predefinedTemplates: AppTemplate[] = [
    { 
      id: 'academic-achievement',
      name: 'Academic Achievement Report',
      description: 'Comprehensive report on student academic skills, often using WJ IV, WIAT, etc.',
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
        [ACADEMIC RECOMMENDATIONS]`,
      isCustom: false
    },
    {
      id: 'cognitive-processing',
      name: 'Cognitive Processing Report',
      description: 'Details student cognitive abilities, processing strengths, and weaknesses.',
      content: `# COGNITIVE PROCESSING REPORT

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
        [Name of Cognitive Assessment, e.g., WISC-V, DAS-II, KABC-II]
        [Other cognitive or processing measures]

        ## Behavioral Observations
        [OBSERVATIONS DURING ASSESSMENT]

        ## Test Results & Interpretation
        [Name of Cognitive Assessment]

        Overall/Composite Scores:
        Full Scale IQ (FSIQ) / General Conceptual Ability (GCA): Score [SCORE], PR [PERCENTILE], CI [CONFIDENCE INTERVAL], Range [DESCRIPTIVE RANGE]

        Index/Factor Scores (Examples):
        Verbal Comprehension Index (VCI): Score [SCORE], PR [PERCENTILE]
        Visual Spatial Index (VSI): Score [SCORE], PR [PERCENTILE]
        Fluid Reasoning Index (FRI): Score [SCORE], PR [PERCENTILE]
        Working Memory Index (WMI): Score [SCORE], PR [PERCENTILE]
        Processing Speed Index (PSI): Score [SCORE], PR [PERCENTILE]

        [NARRATIVE INTERPRETATION OF COGNITIVE SCORES AND PROCESSING AREAS]

        ## Summary of Cognitive Strengths and Weaknesses
        [SUMMARY OF KEY COGNITIVE FINDINGS]

        ## Implications for Learning
        [HOW COGNITIVE PROFILE IMPACTS LEARNING]

        ## Recommendations
        [RECOMMENDATIONS BASED ON COGNITIVE PROFILE]`,
      isCustom: false
    },
    {
      id: 'speech-language',
      name: 'Speech & Language Report',
      description: 'Assesses various aspects of communication including receptive/expressive language, articulation, fluency, and voice.',
      content: `# SPEECH AND LANGUAGE EVALUATION REPORT

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
        Standardized Tests (e.g., CELF-5, PLS-5, GFTA-3)
        Informal Measures (Language Sample, Observation, Criterion-Referenced)
        Oral Motor Examination

        ## Behavioral Observations
        [OBSERVATIONS DURING ASSESSMENT]

        ## Assessment Results & Interpretation
        Receptive Language
        [SKILLS ASSESSED, SCORES, INTERPRETATION]

        Expressive Language
        [SKILLS ASSESSED, SCORES, INTERPRETATION]

        Articulation/Phonology
        [SOUNDS IN ERROR, PHONOLOGICAL PROCESSES, INTELLIGIBILITY, SCORES]

        Fluency
        [OBSERVATIONS, STUTTERING CHARACTERISTICS, IMPACT]

        Voice
        [QUALITY, PITCH, LOUDNESS]

        Oral Motor/Feeding (if applicable)
        [FINDINGS]

        ## Summary of Communication Strengths and Needs
        [OVERALL SUMMARY]

        ## Diagnostic Impressions & Eligibility (if applicable)
        [SPEECH/LANGUAGE IMPAIRMENT DIAGNOSIS]

        ## Recommendations
        [THERAPY GOALS, CLASSROOM STRATEGIES, HOME SUGGESTIONS]`,
      isCustom: false
    }
  ];

  // Manage all templates as state
  const [allTemplates, setAllTemplates] = useState<AppTemplate[]>(predefinedTemplates);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => { // Make async
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setNewTemplateInitialContent(result.value); // HTML string
          setNewTemplateInitialName(file.name.replace(/\.docx$/, "")); // Remove .docx extension
          setIsTemplateEditorModalOpen(true);
        } catch (error) {
          console.error("Error converting DOCX to HTML:", error);
          alert("Could not process the DOCX file. It might be corrupted or an unsupported format.");
        }
      } else {
        alert("Only .docx files are currently supported for creating custom templates.");
      }
    }
  }, []); // No dependencies that would cause re-creation, setters are stable
  
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: false
  });
  
  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomTemplate = (name: string, contentHtml: string, placeholderKeys: string[], categoryId: string) => {
    const categoryName = availableCategories.find(c => c.id === categoryId)?.name || 'Unknown';
    const newCustomTemplate: AppTemplate = {
      id: `custom-${Date.now()}-${name.replace(/\s+/g, '_')}`, // More unique ID
      name: name,
      description: `Custom Template (Category: ${categoryName})`,
      content: contentHtml, // This is HTML from Quill
      isCustom: true,
      placeholderKeys: placeholderKeys,
      categoryId: categoryId, // STORE THE CATEGORY ID
    };
    setAllTemplates(prevTemplates => [...prevTemplates, newCustomTemplate]);
    alert(`Template "${name}" saved locally for this session!`);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Report Drafting</h1>
        <Link to="/reports/new" className="btn bg-accent-gold text-black">
          <span className="flex items-center gap-1">
            <Plus size={18} />
            New Report
          </span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-gold" size={22} />
            <h2 className="text-xl font-medium">My Reports</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b border-border hover:bg-bg-secondary">
                    <td className="p-3">{report.name}</td>
                    <td className="p-3">{report.type}</td>
                    <td className="p-3">{new Date(report.date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === 'Completed' ? 'bg-green text-white' :
                        report.status === 'Draft' ? 'bg-gold text-black' :
                        'bg-purple text-white'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-bg-secondary rounded-md transition-colors" aria-label="Edit report">
                          <FilePenLine size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-bg-secondary rounded-md transition-colors" aria-label="Download report">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reports.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              <FileText size={40} className="mx-auto mb-2 opacity-30" />
              <p>No reports have been created yet</p>
              <Link to="/reports/new" className="mt-4 btn bg-accent-gold text-black flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <Plus size={16} />
                  Create First Report
                </span>
              </Link>
            </div>
          )}
          
          {activeTemplate && (
            <div className="mt-6 border border-border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                {(() => {
                  const currentDisplayTemplate = allTemplates.find(t => t.id === activeTemplate);
                  return (
                    <>
                <h3 className="font-medium">
                        {currentDisplayTemplate?.name} Template
                        {currentDisplayTemplate?.isCustom && (
                          <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Custom</span>
                        )}
                </h3>
                <button 
                  className="btn border border-gold text-gold hover:bg-gold hover:bg-opacity-10"
                        onClick={() => handleCopyTemplate(currentDisplayTemplate?.content || '')}
                >
                  <span className="flex items-center gap-1">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </span>
                </button>
                    </>
                  );
                })()}
              </div>
              
              <div className="bg-bg-secondary p-4 rounded-md whitespace-pre-wrap font-mono text-sm overflow-auto max-h-96">
                {(() => {
                  const currentDisplayTemplate = allTemplates.find(t => t.id === activeTemplate);
                  return currentDisplayTemplate?.isCustom ? (
                    <div dangerouslySetInnerHTML={{ __html: currentDisplayTemplate.content }} />
                  ) : (
                    currentDisplayTemplate?.content  // Assumes predefined is Markdown-like text
                  );
                })()}
              </div>
            </div>
          )}
        </div>
        
        <div className="card h-fit">
          <h2 className="text-xl font-medium mb-4">Report Templates</h2>
          <p className="text-text-secondary mb-4">Use these templates to create standardized reports for your students.</p>
          
          <div className="mb-6 p-6 border-2 border-dashed border-border rounded-md hover:border-gold transition-all cursor-pointer bg-bg-secondary hover:bg-opacity-50">
            <div {...getRootProps()} className={`flex flex-col items-center justify-center text-center transition-all
              ${isDragActive ? 'border-gold ring-2 ring-gold' : ''}
              ${isDragAccept ? 'text-green' : ''}
              ${isDragReject ? 'text-red-500' : ''}`}>
              <input {...getInputProps()} />
              <UploadCloud size={32} className="text-text-secondary mb-2" />
              {isDragReject ? (
                <p className="font-medium text-red-500">File type not accepted</p>
              ) : isDragAccept ? (
                <p className="font-medium text-green">Drop to upload template</p>
              ) : isDragActive ? (
                <p className="font-medium text-gold">Drop the file here</p>
              ) : (
                <>
                  <p className="font-medium text-text-primary">Upload Custom Template</p>
                  <p className="text-sm text-text-secondary">Drag & drop or click to browse</p>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {allTemplates.map((template) => (
              <div
                key={template.id}
                className={`w-full text-left p-4 border rounded-md transition-all flex flex-col ${
                  activeTemplate === template.id
                    ? 'border-gold bg-gold bg-opacity-5'
                    : 'border-border hover:border-gold hover:bg-gold hover:bg-opacity-5'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="text-gold" size={20} />
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-lg">{template.name}</h3>
                    {template.isCustom && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Custom</span>
                    )}
                    {template.isCustom && template.categoryId && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                        {availableCategories.find(c => c.id === template.categoryId)?.name || 'Custom'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-text-secondary mt-1 line-clamp-3 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center justify-end gap-2 mt-auto">
                  <button
                    className="btn-sm border border-border text-text-secondary hover:border-gold hover:text-gold px-3 py-1 text-xs"
                    onClick={() => setActiveTemplate(template.id)}
                  >
                    Preview
                  </button>
                  <Link
                    to={`/reports/new?template=${template.id}`}
                    state={template.isCustom ? { 
                      customTemplateContent: template.content, 
                      customTemplatePlaceholders: template.placeholderKeys,
                      customTemplateName: template.name 
                    } : undefined}
                    className="btn-sm bg-accent-gold text-black hover:bg-opacity-90 px-3 py-1 text-xs flex items-center gap-1"
                  >
                    Use Template
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">AI Writing Assistance</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-border rounded-md hover:border-gold hover:bg-gold hover:bg-opacity-5 transition-all">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} />
                  <h3 className="text-sm">Generate Present Levels Description</h3>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Based on assessment data and observations
                </p>
              </button>
              
              <button className="w-full text-left p-3 border border-border rounded-md hover:border-gold hover:bg-opacity-5 transition-all">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus size={16} />
                  <h3 className="text-sm">Expand Goal Progress Notes</h3>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Turn brief notes into detailed progress descriptions
                </p>
              </button>
              
              <button className="w-full text-left p-3 border border-border rounded-md hover:border-gold hover:bg-opacity-5 transition-all">
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} />
                  <h3 className="text-sm">Suggest Intervention Strategies</h3>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Based on student needs and goals
                </p>
              </button>
            </div>
            
            <p className="text-xs text-text-secondary mt-4">
              Note: AI suggestions should always be reviewed and edited by a qualified professional.
            </p>
          </div>
        </div>
      </div>
      
      <TemplateEditorModal
        isOpen={isTemplateEditorModalOpen}
        onClose={() => setIsTemplateEditorModalOpen(false)}
        initialContentHtml={newTemplateInitialContent}
        initialName={newTemplateInitialName}
        onSave={handleSaveCustomTemplate}
        availableCategories={availableCategories}
      />
    </div>
  );
};

export default ReportDrafting;