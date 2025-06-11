import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Save, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useReports } from '../context/ReportContext';

const CreateReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { addReport } = useReports();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Custom template state from route
  const routeState = location.state as {
    customTemplateContent?: string;
    customTemplatePlaceholders?: string[];
    customTemplateName?: string;
  } | null;

  // Derived state for custom templates
  const isCustomTemplateFlow = Boolean(routeState?.customTemplateContent);
  const activeCustomContent = routeState?.customTemplateContent || '';
  const activeCustomPlaceholders = routeState?.customTemplatePlaceholders || [];
  const activeCustomName = routeState?.customTemplateName || '';

  // Add formatLabel utility function
  const formatLabel = (key: string): string => {
    if (!key) return '';
    // First, handle potential camelCase by inserting spaces before capitals
    const spacedKey = key.replace(/([A-Z])/g, ' $1');
    // Then, handle snake_case and general formatting
    return spacedKey
      .replace(/_/g, ' ') 
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase()); 
  };

  // Mock template categories and sub-templates (simulating database data)
  const templateCategoriesData = [
    { id: '1', category_id: 'academic', category_name: 'Academic Reports', category_description: 'Academic achievement and cognitive assessments' },
    { id: '2', category_id: 'behavioral', category_name: 'Behavioral Reports', category_description: 'Behavior assessments and interventions' },
    { id: '3', category_id: 'speech', category_name: 'Speech & Language', category_description: 'Communication assessments' },
  ];

  const subTemplatesData = [
    {
      id: '1',
      category_table_id: '1',
      sub_template_id: 'academic-achievement',
      name: 'Academic Achievement Report',
      description: 'Comprehensive academic skills assessment',
      content: 'Academic Achievement Report Template Content...',
      placeholder_keys: ['STUDENT_NAME', 'DATE_OF_BIRTH', 'EVALUATION_DATE', 'GRADE_LEVEL', 'EXAMINER_NAME'],
      is_predefined: true
    },
    {
      id: '2',
      category_table_id: '1',
      sub_template_id: 'academic-wjiv',
      name: 'Woodcock-Johnson IV Academic Report',
      description: 'Detailed WJ-IV assessment report',
      content: 'WJ-IV Academic Report Template Content...',
      placeholder_keys: ['STUDENT_NAME', 'DATE_OF_BIRTH', 'EVALUATION_DATE', 'BROAD_ACHIEVEMENT_SS', 'READING_SS', 'MATH_SS'],
      is_predefined: true
    },
    {
      id: '3',
      category_table_id: '2',
      sub_template_id: 'behavioral-assessment',
      name: 'Behavioral Assessment Report',
      description: 'Comprehensive behavioral evaluation',
      content: 'Behavioral Assessment Template Content...',
      placeholder_keys: ['STUDENT_NAME', 'DATE_OF_BIRTH', 'ASSESSMENT_DATE', 'BEHAVIOR_CONCERNS', 'INTERVENTION_STRATEGIES'],
      is_predefined: true
    },
    {
      id: '4',
      category_table_id: '3',
      sub_template_id: 'speech-language',
      name: 'Speech & Language Evaluation',
      description: 'Communication skills assessment',
      content: 'Speech & Language Template Content...',
      placeholder_keys: ['STUDENT_NAME', 'DATE_OF_BIRTH', 'EVALUATION_DATE', 'RECEPTIVE_LANGUAGE_SCORE', 'EXPRESSIVE_LANGUAGE_SCORE'],
      is_predefined: true
    }
  ];

  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      setSelectedTemplateId(templateParam);
      setCurrentStep(2);
    }
  }, [searchParams]);

  const renderFormField = (key: string, label: string, type: 'text' | 'textarea' | 'date' | 'number' = 'text', placeholder?: string) => {
    const value = formData[key] || '';
    
    const handleChange = (newValue: string) => {
      setFormData(prev => ({ ...prev, [key]: newValue }));
    };

    return (
      <div key={key} className="mb-4">
        <label htmlFor={key} className="block text-sm font-medium mb-1 text-text-secondary">
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            id={key}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full p-3 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold min-h-[100px]"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={type}
            id={key}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full p-3 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  const generateReport = () => {
    let content = '';
    
    if (isCustomTemplateFlow) {
      // For custom templates, replace placeholders with form data
      content = activeCustomContent;
      activeCustomPlaceholders.forEach(placeholderKey => {
        const camelCaseKey = placeholderKey.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase());
        const value = formData[camelCaseKey] || `[${placeholderKey}]`;
        content = content.replace(new RegExp(`\\[${placeholderKey}\\]`, 'g'), value);
      });
    } else if (selectedTemplateId) {
      // For predefined templates, find the template and replace placeholders
      const subTemplate = subTemplatesData.find(st => st.sub_template_id === selectedTemplateId);
      if (subTemplate) {
        content = subTemplate.content;
        if (subTemplate.placeholder_keys) {
          subTemplate.placeholder_keys.forEach(placeholderKey => {
            const camelCaseKey = placeholderKey.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase());
            const value = formData[camelCaseKey] || `[${placeholderKey}]`;
            content = content.replace(new RegExp(`\\[${placeholderKey}\\]`, 'g'), value);
          });
        }
      }
    }
    
    setGeneratedReport(content);
    setCurrentStep(3);
  };

  const saveReport = () => {
    const newReport = {
      id: Date.now(),
      name: reportName || `${formData.studentName || 'Student'} - ${activeCustomName || 'Report'}`,
      type: activeCustomName || selectedTemplateId || 'Custom Report',
      date: new Date().toISOString(),
      status: 'Draft' as const,
      content: generatedReport,
      formData: formData
    };
    
    addReport(newReport);
    alert('Report saved successfully!');
  };

  // Step 1: Template Selection
  if (currentStep === 1) {
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
          <h1 className="text-2xl font-medium">Select Report Template</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateCategoriesData.map(category => {
            const categoryTemplates = subTemplatesData.filter(st => st.category_table_id === category.id);
            
            return (
              <div key={category.id} className="card">
                <h3 className="text-lg font-medium mb-2">{category.category_name}</h3>
                <p className="text-text-secondary text-sm mb-4">{category.category_description}</p>
                
                <div className="space-y-2">
                  {categoryTemplates.map(template => (
                    <button
                      key={template.sub_template_id}
                      onClick={() => {
                        setSelectedTemplateId(template.sub_template_id);
                        setSelectedCategoryId(category.id);
                        setCurrentStep(2);
                        setSearchParams({ template: template.sub_template_id });
                      }}
                      className="w-full text-left p-3 border border-border rounded-md hover:border-gold hover:bg-gold hover:bg-opacity-5 transition-all"
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-text-secondary mt-1">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 2: Form Filling
  if (currentStep === 2 && (selectedTemplateId || isCustomTemplateFlow)) {
    let currentFormTitle = "Report Details";
    let fieldsToRender: Array<{key: string, label: string, type?: 'text'|'date'|'textarea'|'number', placeholder?: string}> = [];

    if (isCustomTemplateFlow) {
      currentFormTitle = activeCustomName || "Custom Report";
      if (activeCustomPlaceholders && activeCustomPlaceholders.length > 0) {
        fieldsToRender = activeCustomPlaceholders.map(placeholderKeyFromModal => ({
          key: placeholderKeyFromModal.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase()),
          label: formatLabel(placeholderKeyFromModal), // USE formatLabel HERE
          type: 'textarea',
          placeholder: `Enter ${formatLabel(placeholderKeyFromModal).toLowerCase()}`
        }));
      } else {
        fieldsToRender = [];
      }
    } else if (selectedTemplateId === 'academic-wjiv') {
      // Special handling for WJ-IV template with detailed form
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
            <h1 className="text-2xl font-medium">Woodcock-Johnson IV Academic Report</h1>
          </div>
          
          <div className="card max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Student Information</h3>
                {renderFormField('studentName', 'Student Name', 'text')}
                {renderFormField('dateOfBirth', 'Date of Birth', 'date')}
                {renderFormField('evaluationDate', 'Evaluation Date', 'date')}
                {renderFormField('gradeLevel', 'Grade Level', 'text')}
                {renderFormField('examinerName', 'Examiner Name', 'text')}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">WJ-IV Scores</h3>
                {renderFormField('broadAchievementSs', 'Broad Achievement SS', 'number')}
                {renderFormField('readingSs', 'Reading SS', 'number')}
                {renderFormField('mathSs', 'Mathematics SS', 'number')}
                {renderFormField('writtenLanguageSs', 'Written Language SS', 'number')}
                {renderFormField('academicSkillsSs', 'Academic Skills SS', 'number')}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              {renderFormField('behavioralObservations', 'Behavioral Observations', 'textarea')}
              {renderFormField('interpretationNotes', 'Score Interpretation', 'textarea')}
              {renderFormField('recommendations', 'Recommendations', 'textarea')}
            </div>
            
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <button 
                onClick={() => {setCurrentStep(1); setSelectedTemplateId(null); setSelectedCategoryId(null); setSearchParams({});}} 
                className="btn border-border"
              >
                Back
              </button>
              <button onClick={generateReport} className="btn bg-accent-gold text-black">
                Generate & Review Report
              </button>
            </div>
          </div>
        </div>
      );
    } else if (selectedTemplateId && templateCategoriesData && subTemplatesData) {
      // For other predefined templates
      const category = templateCategoriesData.find(c => 
        subTemplatesData.some(st => st.category_table_id === c.id && st.sub_template_id === selectedTemplateId)
      );
      const subTemplate = subTemplatesData.find(st => 
        st.category_table_id === category?.id && st.sub_template_id === selectedTemplateId
      );
      
      if (subTemplate) {
        currentFormTitle = subTemplate.name;
        if (subTemplate.placeholder_keys) {
          fieldsToRender = subTemplate.placeholder_keys.map(keyFromDB => ({
            key: keyFromDB.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase()),
            label: formatLabel(keyFromDB), // USE formatLabel HERE
            type: keyFromDB.includes('DATE') || keyFromDB.includes('DOB') ? 'date' : 
                  (keyFromDB.includes('SS') || keyFromDB.includes('PR') || keyFromDB.includes('SCORE')) ? 'number' : 
                  'textarea',
            placeholder: `Enter ${formatLabel(keyFromDB).toLowerCase()}`
          }));
        } else {
          fieldsToRender = [{ key: 'mainContent', label: 'Main Content', type: 'textarea', placeholder: 'Enter all report content here...' }];
        }
      }
    }

    // Render the dynamic form for custom templates or other predefined templates
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
            {fieldsToRender.length > 0 ? 
              fieldsToRender.map(field => (
                renderFormField(field.key, field.label, field.type as any, field.placeholder)
              ))
              : (
                <div className="text-center py-8">
                  <FileText className="text-text-secondary opacity-50 mx-auto mb-3" size={36} />
                  <p className="text-text-secondary">
                    {isCustomTemplateFlow ? "This custom template has no defined fields to fill." : "No specific fields defined for this template."} 
                    You can proceed to review, or go back to add placeholders if this is a custom template being edited.
                  </p>
                </div>
              )
            }
          </div>
          
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <button 
              onClick={() => {setCurrentStep(1); setSelectedTemplateId(null); setSelectedCategoryId(null); setSearchParams({});}} 
              className="btn border-border"
            >
              Back
            </button>
            <button onClick={generateReport} className="btn bg-accent-gold text-black">
              Generate & Review Report
            </button>
          </div>
        </div>
      </div>
    );
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