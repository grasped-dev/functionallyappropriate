import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  UploadCloud, FileText as FileTextIcon, ArrowRight, ArrowLeft, GraduationCap, 
  Brain, MessageSquare, Stethoscope, Users, Download, Eye, EyeOff, Save, Trash2, CheckCircle, Loader2
} from 'lucide-react';
// useDropzone and mammoth are for the custom template editor flow, not directly used in THIS page for predefined template filling
// import { useDropzone } from 'react-dropzone'; 
// import mammoth from 'mammoth'; 
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useReports, Report } from '../context/ReportContext';
import { supabase } from '../lib/supabase';

// --- INTERFACES ---
interface FormData {
  // Common fields for type safety, but form is now more dynamic
  studentName?: string;
  dob?: string; 
  doe?: string;
  // Index signature allows any string key for dynamic placeholders
  [key: string]: any; 
}

interface DraftData {
  formData: FormData;
  selectedTemplateId: string | null;
  currentStep: number;
  currentSubStep: number; // <<<< ADD THIS
  selectedCategoryId?: string | null; 
  selectedFile?: { name: string; type: string; size: number };
}

interface SubTemplate {
  id: string; // Actual sub_template UUID from Supabase
  sub_template_id: string; 
  name: string;
  description: string;
  content: string; 
  placeholder_keys: string[] | null; 
  category_table_id: string; 
}

interface TemplateCategory {
  id: string; // Actual UUID from Supabase
  category_id: string; // Matches DB
  category_name: string; // Matches DB
  category_description: string; // Matches DB
  icon_name?: string; // Matches DB
  subTemplates: SubTemplate[];
}

const DRAFT_KEY_PREFIX = 'reportDraft_';
const toUpperSnakeCase = (camelCaseOrSnakeCase: string): string => {
  if (!camelCaseOrSnakeCase) return '';
  // Simpler conversion: ensure it's all uppercase and words separated by underscores
  // This handles both camelCase and existing snake_case keys from FormData
  return camelCaseOrSnakeCase
    .replace(/([A-Z0-9])/g, "_$1") // Add underscore before capitals/numbers
    .replace(/__/g, '_')        // Replace double underscores
    .replace(/^_/, "")           // Remove leading underscore
    .toUpperCase();
};

// Map icon names to Lucide components
const iconMap: { [key: string]: React.ElementType } = {
  GraduationCap, Brain, MessageSquare, Stethoscope, Users, FileTextIcon
};

const CreateReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addReport } = useReports();
  const navigate = useNavigate();
  const location = useLocation();

  const [templateCategories, setTemplateCategories] = useState<TemplateCategory[] | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [errorLoadingTemplates, setErrorLoadingTemplates] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentSubStep, setCurrentSubStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({ studentName: '', dob: '', doe: '' }); // Minimal default
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  // For custom templates passed via route state from ReportDrafting.tsx
  const routeState = location.state as { 
    customTemplateContent?: string; 
    customTemplatePlaceholders?: string[]; // These are UPPER_SNAKE_CASE from TemplateEditorModal
    customTemplateName?: string;
    isCustomFlag?: boolean; // Explicit flag from ReportDrafting
  } | null;

  const isCustomTemplateFlow = !!routeState?.isCustomFlag && searchParams.get('template')?.startsWith('custom-');
  const customContent = isCustomTemplateFlow ? routeState?.customTemplateContent : undefined;
  const customPlaceholders = isCustomTemplateFlow ? routeState?.customTemplatePlaceholders : undefined;
  const customName = isCustomTemplateFlow ? routeState?.customTemplateName : undefined;
  const initialActionFromUrl = searchParams.get('action');

  // Fetch templates from Supabase
  useEffect(() => {
    const fetchTemplatesAndSubtemplates = async () => {
      setIsLoadingTemplates(true);
      setErrorLoadingTemplates(null);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('template_categories')
          .select('*')
          .order('sort_order');

        if (categoriesError) throw categoriesError;
        if (!categoriesData) throw new Error("No categories found.");

        const categoriesWithSubtemplates = await Promise.all(
          categoriesData.map(async (category) => {
            const { data: subTemplatesData, error: subTemplatesError } = await supabase
              .from('sub_templates')
              .select('*')
              .eq('category_table_id', category.id)
              .order('sort_order');
            
            if (subTemplatesError) throw subTemplatesError;
            return { ...category, subTemplates: subTemplatesData || [] };
          })
        );
        setTemplateCategories(categoriesWithSubtemplates as TemplateCategory[]);
      } catch (err: any) {
        console.error("Error fetching templates:", err);
        setErrorLoadingTemplates(err.message || "Failed to load report templates.");
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplatesAndSubtemplates();
  }, []);

  // Initialize step and selections based on URL and fetched templates
  useEffect(() => {
    if (isLoadingTemplates || !templateCategories) return;

    const templateParam = searchParams.get('template');
    
    if (isCustomTemplateFlow && routeState?.customTemplateName && templateParam === selectedTemplateId) { // templateParam might be custom-xyz
        setSelectedTemplateId(templateParam); // Use the ID from URL if it matches custom flow
        setSelectedCategoryId('custom'); // Special category for custom
        setCurrentStep(2);
        return;
    }

    if (templateParam) {
      let found = false;
      for (const category of templateCategories) {
        if (category.subTemplates.some(st => st.id === templateParam || st.sub_template_id === templateParam)) { // Check both possible id fields
          setSelectedCategoryId(category.category_id);
          setSelectedTemplateId(templateParam);
          setCurrentStep(2);
          found = true;
          // Initialize formData with keys from placeholder_keys if this is a predefined template
          const currentSub = category.subTemplates.find(st => st.id === templateParam || st.sub_template_id === templateParam);
          if (currentSub && currentSub.placeholder_keys) {
            const initialFData: FormData = { studentName: '', dob: '', doe: '' }; // Start with some defaults
            currentSub.placeholder_keys.forEach(key => {
              // Convert UPPER_SNAKE_CASE from DB to camelCase for FormData keys
              const camelKey = key.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase());
              initialFData[camelKey] = '';
            });
            setFormData(initialFData);
          }
          break;
        }
      }
      if (!found && !searchParams.get('action')) { setCurrentStep(1); setSelectedCategoryId(null); setSelectedTemplateId(null); }
    } else if (searchParams.get('action') === 'upload') { // For uploading new template via ReportDrafting page (different flow)
      setCurrentStep(1); 
      setSelectedCategoryId(null);
      setSelectedTemplateId(null);
    } else if (!isCustomTemplateFlow) { // Default to category selection if no params and not custom flow
      setCurrentStep(1);
      setSelectedCategoryId(null);
      setSelectedTemplateId(null);
    }
  }, [searchParams, routeState, templateCategories, isLoadingTemplates, isCustomTemplateFlow, selectedTemplateId]); // Added selectedTemplateId to deps

  // Draft logic
  const getDraftKey = useCallback((): string => {
    if (selectedTemplateId) return `${DRAFT_KEY_PREFIX}${selectedTemplateId}`;
    if (selectedCategoryId) return `${DRAFT_KEY_PREFIX}category_${selectedCategoryId}`;
    return `${DRAFT_KEY_PREFIX}general_create_page`;
  }, [selectedTemplateId, selectedCategoryId]);

  useEffect(() => {
    const draftKey = getDraftKey();
    const loadedDraft = loadDraft(draftKey);
    if (loadedDraft && window.confirm('Resume saved draft?')) {
      setFormData(loadedDraft.formData);
      setCurrentStep(loadedDraft.currentStep);
      // setCurrentSubStep(loadedDraft.currentSubStep); // No sub-steps in this version yet for predefined
      setSelectedCategoryId(loadedDraft.selectedCategoryId || null);
      setSelectedTemplateId(loadedDraft.selectedTemplateId || null);
    }
  }, [getDraftKey]);

  useEffect(() => {
    const draftKey = getDraftKey();
    const hasData = Object.values(formData).some(val => typeof val === 'string' ? val !== '' : val !== false);
    if (hasData || currentStep > 1) {
      const draftData: DraftData = { formData, selectedTemplateId, currentStep, currentSubStep: 1, selectedCategoryId };
      saveDraft(draftKey, draftData);
    }
  }, [formData, currentStep, selectedTemplateId, selectedCategoryId, getDraftKey]);
  
  const saveDraft = (key: string, data: DraftData) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log("Draft saved to key:", key, data); 
    } catch (error) {
      console.error("Error saving draft to key:", key, error);
    }
  };

  const loadDraft = (key: string): DraftData | null => {
    try {
      const draft = localStorage.getItem(key);
      if (draft) {
        console.log("Draft loaded from localStorage for key:", key);
        return JSON.parse(draft);
      }
      return null;
    } catch (error) {
      console.error("Error loading draft from key:", key, error);
      return null;
    }
  };

  const clearDraft = (key: string) => {
    try {
      localStorage.removeItem(key);
      console.log("Draft cleared for key:", key); 
    } catch (error) {
      console.error("Error clearing draft for key:", key, error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const populateTemplate = (templateContent: string, data: FormData, placeholdersToUse?: string[]): string => {
    let populatedContent = templateContent;
    
    const keysToIterate = placeholdersToUse || Object.keys(data);

    keysToIterate.forEach(key => {
      // If placeholdersToUse is provided, key is already UPPER_SNAKE_CASE
      // Otherwise, convert from formData key (camelCase)
      const placeholderKey = placeholdersToUse ? key : toUpperSnakeCase(key);
      const value = String(data[key] ?? ''); // data[key] uses camelCase if iterating Object.keys(data)
      
      const regex = new RegExp(`\\[${placeholderKey}\\]`, 'g');
      populatedContent = populatedContent.replace(regex, value || '[N/A]');
    });
    
    populatedContent = populatedContent.replace(/\[[A-Z0-9_]+\]/g, '[N/A]'); // Clean up remaining
    return populatedContent;
  };
  
  const createDocxDocument = (data: FormData, templateContentToUse: string, isCustom: boolean, placeholdersForCustom?: string[]): Document => {
    const populatedReportText = populateTemplate(templateContentToUse, data, isCustom ? placeholdersForCustom : undefined);
    const docxParagraphs: Paragraph[] = [];

    if (isCustom) { // Custom template content is HTML from Quill
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = populatedReportText;
      // Basic HTML to DOCX Paragraph conversion (can be improved)
      Array.from(tempDiv.childNodes).forEach(node => {
        if (node.textContent?.trim()) {
          // This is very basic, doesn't handle headings, lists from HTML well
          docxParagraphs.push(new Paragraph({ children: [new TextRun(node.textContent)] }));
        }
      });
      if (docxParagraphs.length === 0) docxParagraphs.push(new Paragraph(populatedReportText));

    } else { // Predefined Markdown-like
      const lines = populatedReportText.split('\\n');
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## ')) { docxParagraphs.push(new Paragraph({ text: trimmedLine.substring(3), heading: HeadingLevel.HEADING_2 })); }
        else if (trimmedLine.startsWith('# ')) { docxParagraphs.push(new Paragraph({ text: trimmedLine.substring(2), heading: HeadingLevel.HEADING_1 })); }
        else if (trimmedLine.startsWith('- ')) { docxParagraphs.push(new Paragraph({ text: trimmedLine.substring(2), bullet: { level: 0 } })); }
        else if (trimmedLine) { docxParagraphs.push(new Paragraph({ text: trimmedLine })); }
        else { docxParagraphs.push(new Paragraph({ text: "" }));} 
      });
    }
    return new Document({ sections: [{ properties: {}, children: docxParagraphs }] });
  };

  const downloadDocxFile = async () => {
    let contentToUse: string | undefined;
    let filenameSuffix = 'Report';
    let currentPlaceholders = undefined;

    if (isCustomTemplateFlow && customContent) {
      contentToUse = customContent;
      filenameSuffix = customName || 'Custom_Report';
      currentPlaceholders = customPlaceholders;
    } else if (selectedTemplateId && templateCategories) {
      const category = templateCategories.find(c => c.subTemplates.some(st => st.id === selectedTemplateId || st.sub_template_id === selectedTemplateId));
      const subTemplate = category?.subTemplates.find(st => st.id === selectedTemplateId || st.sub_template_id === selectedTemplateId);
      contentToUse = subTemplate?.content;
      filenameSuffix = subTemplate?.name || selectedTemplateId;
      // For predefined, placeholder_keys are derived from FormData if not explicitly passed
    }

    if (!contentToUse) { alert("Template content not found for DOCX."); return; }
    
    const studentNameSanitized = (formData.studentName || 'Student').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const filename = `${studentNameSanitized}_${filenameSuffix.replace(/\s+/g, '_')}.docx`;
    
    const doc = createDocxDocument(formData, contentToUse, !!isCustomTemplateFlow, currentPlaceholders);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  };
  
  const handleFinalizeReport = () => {
    let contentToUse: string | undefined;
    let templateNameToSave: string | undefined;
    let currentPlaceholdersForPopulation = undefined;

    if (isCustomTemplateFlow && customContent) {
        contentToUse = customContent;
        templateNameToSave = customName || "Custom Report";
        currentPlaceholdersForPopulation = customPlaceholders;
    } else if (selectedTemplateId && templateCategories) {
        const category = templateCategories.find(c => c.subTemplates.some(st => st.id === selectedTemplateId));
        const subTemplate = category?.subTemplates.find(st => st.id === selectedTemplateId);
        contentToUse = subTemplate?.content;
        templateNameToSave = subTemplate?.name;
        // For predefined, populateTemplate will use Object.keys(formData)
    }

    if (!contentToUse || !templateNameToSave || !formData.studentName) {
      alert("Student name and template selection are required."); return;
    }
    
    const reportText = populateTemplate(contentToUse, formData, currentPlaceholdersForPopulation);
    const newReportToAdd: Report = {
      id: Date.now(), name: `${formData.studentName} - ${templateNameToSave}`,
      type: templateNameToSave, date: new Date().toISOString().split('T')[0], status: 'Completed',
      content: reportText, formData: { ...formData }
    };
    addReport(newReportToAdd);
    clearDraft(getDraftKey());
    navigate('/reports');
  };

  // --- RENDER LOGIC ---
  if (isLoadingTemplates && !isCustomTemplateFlow) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
        <p className="ml-4 mt-4 text-lg text-text-secondary">Loading Templates...</p>
      </div>
    );
  }
  if (errorLoadingTemplates) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 text-center">
        <FileTextIcon className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Templates</h2>
        <p className="text-text-secondary mb-4">{errorLoadingTemplates}</p>
        <button onClick={() => window.location.reload()} className="btn bg-red-500 text-white">
          Try Reloading
        </button>
      </div>
    );
  }
  // Check if templateCategories is null or empty, AND it's not a custom template flow,
  // AND we are at step 1, and no category or action is selected yet (to avoid showing this during sub-template view etc.)
  if ((!templateCategories || templateCategories.length === 0) && !isCustomTemplateFlow && currentStep === 1 && !selectedCategoryId && !searchParams.get('action')) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 text-center">
        <FileTextIcon className="h-12 w-12 text-text-secondary opacity-50 mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">No Templates Available</h2>
        <p className="text-text-secondary">It seems there are no report templates configured in the system.</p>
        <p className="text-text-secondary mt-1">Please check the Supabase setup or contact an administrator.</p>
      </div>
    );
  }

  // Step 1: Category or Sub-template selection, or Upload Action
  if (currentStep === 1) {
    // If action=upload from URL (e.g. from ReportDrafting) - this flow needs specific UI if it's for NEW template definition
    if (initialActionFromUrl === 'upload' && !selectedTemplateId) { // Distinguish from CreateReportPage's own upload link
        return (
            <div className="animate-fadeIn card max-w-5xl mx-auto">
                <h2 className="text-xl font-medium mb-4">Custom Template Upload</h2>
                <p className="text-text-secondary">This page is for filling reports. To define a new custom template from a DOCX file, please use the "Upload Custom Template" feature on the main "Report Drafting" page.</p>
                <button onClick={() => navigate('/reports')} className="btn mt-4">Back to Report Drafting</button>
            </div>
        );
    }
    // If a category is selected, show its sub-templates
    else if (selectedCategoryId && !selectedTemplateId) {
      const category = templateCategories!.find(c => c.category_id === selectedCategoryId);
      return (
        <div className="animate-fadeIn card max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => {setSelectedCategoryId(null); clearDraft(getDraftKey());}} className="btn btn-primary text-sm mr-4"><ArrowLeft size={16} className="inline mr-1"/>Back to Categories</button>
            <h2 className="text-xl font-medium">Choose from: {category?.category_name}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category?.subTemplates.map((subTemplate) => (
              <button key={subTemplate.id} onClick={() => { setSelectedTemplateId(subTemplate.id); setCurrentStep(2); clearDraft(getDraftKey());}} className="text-left p-4 border border-border rounded-lg hover:border-gold hover:shadow-md transition-all group bg-bg-primary">
                <h4 className="font-semibold text-md text-text-primary mb-1">{subTemplate.name}</h4>
                <p className="text-xs text-text-secondary line-clamp-2">{subTemplate.description}</p>
                <div className="mt-3 text-gold text-xs font-medium">Use Template <ArrowRight className="inline w-3 h-3" /></div>
              </button>
            ))}
          </div>
        </div>
      );
    } 
    // Default: Show Categories
    else {
      return (
        <div className="animate-fadeIn card max-w-5xl mx-auto">
          <h2 className="text-xl font-medium mb-6 text-center">Step 1: Choose a Report Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateCategories!.map((category) => {
              const IconComponent = category.icon_name ? iconMap[category.icon_name] || FileTextIcon : FileTextIcon;
              return (
                <button key={category.category_id} onClick={() => { setSelectedCategoryId(category.category_id); clearDraft(getDraftKey()); }} className="text-left p-4 border border-border rounded-lg hover:border-gold hover:shadow-md transition-all group bg-bg-primary">
                  <div className="flex items-center gap-3 mb-2"><IconComponent className="text-gold group-hover:scale-105" size={24} /> <h3 className="font-semibold text-md text-text-primary">{category.category_name}</h3></div>
                  <p className="text-xs text-text-secondary mb-3">{category.category_description}</p>
                  <div className="mt-auto text-gold text-xs font-medium">View Templates <ArrowRight className="inline w-3 h-3" /></div>
                </button>
            );})}
          </div>
           <div className="mt-8 pt-4 border-t border-border text-center">
                <p className="text-text-secondary mb-3">To use your own DOCX file as a template:</p>
                <button onClick={() => navigate('/reports', {state: {triggerUpload: true}})} className="btn border-border hover:border-gold text-gold">Upload via Report Drafting Page</button>
            </div>
        </div>
      );
    }
  }

  // Step 2: Data Input Form
  if (currentStep === 2 && (selectedTemplateId || isCustomTemplateFlow)) {
    let fieldsToRender: Array<{key: string, label: string, type?: 'text'|'date'|'textarea'|'number', placeholder?: string}> = [];
    let currentFormName = "Report Details";
    let currentSubTemplateForForm = null;

    if (isCustomTemplateFlow && customPlaceholders) {
        currentFormName = customName || "Custom Report";
        fieldsToRender = customPlaceholders.map(key => ({ 
            key, label: key.replace(/_/g, ' ').toLowerCase(), type: 'textarea',
            placeholder: `Enter ${key.replace(/_/g, ' ').toLowerCase()}`
        }));
    } else if (selectedTemplateId && templateCategories) {
        const category = templateCategories.find(c => c.subTemplates.some(st => st.id === selectedTemplateId || st.sub_template_id === selectedTemplateId));
        currentSubTemplateForForm = category?.subTemplates.find(st => st.id === selectedTemplateId || st.sub_template_id === selectedTemplateId);
        currentFormName = currentSubTemplateForForm?.name || "Report Details";

        if (currentSubTemplateForForm?.placeholder_keys) {
            fieldsToRender = currentSubTemplateForForm.placeholder_keys.map(key => ({
                key: key.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase()), // Convert DB key to camelCase for FormData
                label: key.replace(/_/g, ' ').toLowerCase(),
                // Infer type based on key name (basic example)
                type: key.includes('DATE') ? 'date' : (key.includes('SS') || key.includes('PR') || key.includes('SCORE')) ? 'number' : 'textarea',
                placeholder: `Enter ${key.replace(/_/g, ' ').toLowerCase()}`
            }));
        } else { // Fallback if no placeholder_keys defined for a predefined template
             fieldsToRender = [{ key: 'contentBody', label: 'Main Content', type: 'textarea', placeholder: 'Enter all report content here...' }];
        }
    }
    
    // If it's academic-wjiv, we use the multi-sub-step form
    if (selectedTemplateId === 'academic-wjiv') {
      return (
        <div className="animate-fadeIn card">
          <h2 className="text-xl font-medium mb-6">Fill: {currentFormName} (Sub-step {currentSubStep} of 5)</h2>
          {/* PASTE YOUR FULL MULTI-SUB-STEP ACADEMIC WJIV FORM JSX HERE */}
          {/* It should use currentSubStep to show different sections */}
          {/* And its own Back/Next buttons to control currentSubStep or move to currentStep 3 */}
          <p className="text-center p-10 text-gray-500">
            (Placeholder: Detailed multi-sub-step form for WJIV Academic Report goes here, controlled by `currentSubStep` state)
          </p>
           <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
            <button onClick={() => currentSubStep > 1 ? setCurrentSubStep(s => s - 1) : setCurrentStep(1)} className="btn border-border">
              {currentSubStep === 1 ? 'Back to Templates' : 'Previous Section'}
            </button>
            <button onClick={() => currentSubStep < 5 ? setCurrentSubStep(s => s + 1) : setCurrentStep(3)} className="btn bg-accent-gold text-black">
              {currentSubStep === 5 ? 'Review Report' : 'Next Section'}
            </button>
          </div>
        </div>
      );
    }
    
    // For other predefined templates or custom templates (rendered as flat list of fields)
    return (
      <div className="animate-fadeIn card">
        <h2 className="text-xl font-medium mb-6">Fill: {currentFormName}</h2>
        <div className="space-y-4">
          {fieldsToRender.map(field => (
            <div key={field.key}>
              <label htmlFor={field.key} className="block text-sm font-medium mb-1 text-text-primary capitalize">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea name={field.key} id={field.key} value={formData[field.key] || ''} onChange={handleInputChange} rows={4} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" placeholder={field.placeholder || field.label}/>
              ) : (
                <input type={field.type || 'text'} name={field.key} id={field.key} value={formData[field.key] || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold" placeholder={field.placeholder || field.label}/>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
          <button onClick={() => {setCurrentStep(1); setSelectedTemplateId(null); setSelectedCategoryId(null); setSearchParams({});}} className="btn border-border">Back to Templates</button>
          <button onClick={() => setCurrentStep(3)} className="btn bg-accent-gold text-black">Review Report</button>
        </div>
      </div>
    );
  }

  // Step 3: Review & Finalize
  if (currentStep === 3) {
     let contentToUse: string | undefined;
     let templateNameForDisplay: string | undefined;
     let placeholdersForCustom: string[] | undefined;

     if (isCustomTemplateFlow && customContent) {
         contentToUse = customContent;
         templateNameForDisplay = customName || "Custom Report";
         placeholdersForCustom = customPlaceholders;
     } else if (selectedTemplateId && templateCategories) {
         const category = templateCategories.find(c => c.subTemplates.some(st => st.id === selectedTemplateId || st.sub_template_id === selectedTemplateId));
         const subTemplate = category?.subTemplates.find(st => st.id === selectedTemplateId || st.sub_template_id === selectedTemplateId);
         contentToUse = subTemplate?.content;
         templateNameForDisplay = subTemplate?.name;
         // For predefined, populateTemplate will use Object.keys(formData) against UPPER_SNAKE_CASE placeholders
     }
    return (
        <div className="animate-fadeIn card">
            <h2 className="text-xl font-medium mb-4">Step 3: Review & Finalize Report</h2>
            <div className="mb-6 p-4 border rounded-md bg-bg-secondary"><h3 className="text-lg font-semibold text-gold mb-1">Report Type: {templateNameForDisplay || 'N/A'}</h3><p className="text-sm text-text-secondary">Student: {formData.studentName || 'N/A'}</p></div>
            <div className="mb-4"><h4 className="text-md font-medium mb-2 text-text-primary">Populated Report Preview:</h4>
                <div className="p-3 border border-border rounded-md bg-bg-primary max-h-[50vh] overflow-y-auto text-sm">
                    {contentToUse ? (
                        isCustomTemplateFlow ? 
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: populateTemplate(contentToUse, formData, placeholdersForCustom)}} />
                        : <pre className="whitespace-pre-wrap">{populateTemplate(contentToUse, formData)}</pre>
                    ) : <p className="text-text-secondary italic">No content to preview.</p>}
                </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <button onClick={() => setCurrentStep(2)} className="btn border-border">Back to Edit</button>
                <div className="flex gap-2">
                    <button onClick={() => saveDraft(getDraftKey(), {formData, selectedTemplateId, currentStep, currentSubStep:1, selectedCategoryId})} className="btn border-border">Save Draft</button>
                    <button onClick={downloadDocxFile} className="btn bg-accent-teal">Download DOCX</button>
                    <button onClick={handleFinalizeReport} className="btn bg-accent-gold text-black">Save to My Reports</button>
                </div>
            </div>
        </div>
      );
  }

  return <div className="text-center p-8">Loading or invalid page state...</div>;
};

export default CreateReportPage;