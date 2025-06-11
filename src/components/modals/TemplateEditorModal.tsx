import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

interface TemplateCategory {
  id: string;
  name: string;
}

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContentHtml: string; // Expecting HTML from Mammoth.js
  initialName?: string;
  onSave: (name: string, contentHtml: string, placeholderKeys: string[], categoryId: string) => void;
  availableCategories: TemplateCategory[];
}

// Utility function to convert text to UPPER_SNAKE_CASE
const toUpperSnakeCase = (text: string): string => {
  return text
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toUpperCase();
};

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  initialContentHtml, 
  initialName = '', 
  onSave,
  availableCategories
}) => {
  const [editorHtml, setEditorHtml] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedCategoryIdForCustom, setSelectedCategoryIdForCustom] = useState<string>('');
  const [definedPlaceholders, setDefinedPlaceholders] = useState<Array<{ name: string; key: string }>>([]);
  const [isDefinePlaceholderModalOpen, setIsDefinePlaceholderModalOpen] = useState(false);
  const [currentPlaceholderName, setCurrentPlaceholderName] = useState('');
  const quillRef = useRef<ReactQuill>(null);
  const placeholderNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEditorHtml(initialContentHtml);
      setTemplateName(initialName);
      setDefinedPlaceholders([]); // Reset placeholders when modal opens
      setCurrentPlaceholderName('');
      if (availableCategories && availableCategories.length > 0) {
        setSelectedCategoryIdForCustom(availableCategories[0].id); // Default to first category
      } else {
        setSelectedCategoryIdForCustom(''); // Or a 'none' option
      }
    }
  }, [isOpen, initialContentHtml, initialName, availableCategories]);

  // Auto-focus the placeholder input when the sub-modal opens
  useEffect(() => {
    if (isDefinePlaceholderModalOpen && placeholderNameInputRef.current) {
      // Timeout helps ensure the element is fully rendered and focusable
      setTimeout(() => {
        placeholderNameInputRef.current?.focus();
      }, 100); // Small delay
    }
  }, [isDefinePlaceholderModalOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    // Ensure a category is selected, or handle default if '' is allowed
    if (!selectedCategoryIdForCustom && availableCategories.length > 0) { 
      alert("Please select a category for the template.");
      return;
    }
    const placeholderKeys = definedPlaceholders.map(p => p.key);
    onSave(templateName, editorHtml, placeholderKeys, selectedCategoryIdForCustom); 
    onClose();
  };

  const handleAddPlaceholderToListAndEditor = () => {
    if (!currentPlaceholderName.trim()) return;

    const placeholderKey = toUpperSnakeCase(currentPlaceholderName.trim());
    if (definedPlaceholders.some(p => p.key === placeholderKey)) {
      alert(`A placeholder with the key "[${placeholderKey}]" already exists. Please choose a different display name.`);
      return;
    }

    const newPlaceholder = { name: currentPlaceholderName.trim(), key: placeholderKey };
    setDefinedPlaceholders(prev => [...prev, newPlaceholder]);

    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true); // Get current selection (or cursor position if no selection)
      const placeholderTag = `[${placeholderKey}]`;
      
      if (range && range.length > 0) {
        // If text is selected, delete it first
        editor.deleteText(range.index, range.length, 'user');
        editor.insertText(range.index, placeholderTag, 'user');
        editor.setSelection(range.index + placeholderTag.length, 0, 'user'); // Move cursor after inserted text
      } else {
        // If no text is selected, insert at cursor (or end of document)
        const positionToInsert = range ? range.index : editor.getLength();
        editor.insertText(positionToInsert, placeholderTag, 'user');
        editor.setSelection(positionToInsert + placeholderTag.length, 0, 'user'); // Move cursor after inserted text
      }
    }

    setCurrentPlaceholderName('');
    setIsDefinePlaceholderModalOpen(false);
  };

  // Basic Quill modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'align': [] }],
      ['link', /* 'image' - add if needed */],
      ['clean']                                         // remove formatting button
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'link', /* 'image' */
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-bg-primary p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-semibold mb-5 text-text-primary">Create/Edit Custom Template</h2>
        
        <div className="mb-4">
          <label htmlFor="customTemplateCategory" className="block text-sm font-medium mb-1 text-text-secondary">
            Assign to Category:
          </label>
          <select
            id="customTemplateCategory"
            value={selectedCategoryIdForCustom}
            onChange={(e) => setSelectedCategoryIdForCustom(e.target.value)}
            className="w-full p-2.5 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold text-text-primary"
          >
            <option value="" disabled>Select a category</option>
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.id}> 
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="customTemplateName" className="block text-sm font-medium mb-1 text-text-secondary">Template Name:</label>
          <input 
            type="text" 
            id="customTemplateName"
            className="w-full p-2.5 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold text-text-primary"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter a name for this template"
          />
        </div>

        {/* NEW WRAPPER for scrollable middle content */}
        <div className="flex-grow overflow-y-auto mb-4 pr-2"> {/* pr-2 for scrollbar space */}
          
          <div className="mb-4 flex-grow min-h-[400px] flex flex-col quill-editor-wrapper"> 
            <label className="block text-sm font-medium mb-1 text-text-secondary">Template Content:</label>
            <ReactQuill 
              ref={quillRef}
              theme="snow" 
              value={editorHtml} 
              onChange={setEditorHtml} 
              modules={modules}
              formats={formats}
              className="flex-grow quill-editor-container"
            />
          </div>

        </div> {/* END OF NEW WRAPPER for scrollable middle content */}

        <div className="mt-auto pt-4 border-t border-border"> {/* Main footer container */}
          
          {/* "Manage Placeholders" section moved here */}
          <div className="mb-4 p-3 border-b border-border"> {/* Added bottom border, removed top */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-md font-semibold text-text-primary">Manage Placeholders</h4>
              <button 
                onClick={() => {
                  setCurrentPlaceholderName(''); // Reset for new placeholder
                  setIsDefinePlaceholderModalOpen(true);
                }}
                className="btn-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
              >
                Add Placeholder
              </button>
            </div>
            {definedPlaceholders.length > 0 ? (
              <ul className="list-disc list-inside pl-1 text-sm text-text-secondary max-h-20 overflow-y-auto"> {/* Reduced max-h-24 to max-h-20 (5rem) */}
                {definedPlaceholders.map(p => (
                  <li key={p.key}><strong>{p.name}</strong> (Key: <code>[{p.key}]</code>)</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-text-secondary italic">No placeholders defined yet. Click "Add Placeholder" to create one and insert it into your template content.</p>
            )}
          </div>

          {/* Original Action Buttons */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn border border-gray-300 hover:bg-gray-100 text-gray-700">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="btn bg-accent-gold text-black"
              disabled={!templateName.trim() || (availableCategories.length > 0 && !selectedCategoryIdForCustom)} // Disable save if no name or no category selected
            >
              Save Template
            </button>
          </div>
        </div>
        
        {isDefinePlaceholderModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-fadeIn"> {/* Higher z-index */}
            <div className="bg-bg-primary p-5 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Define New Placeholder</h3>
              <div>
                <label htmlFor="placeholderNameInput" className="block text-sm font-medium mb-1">Placeholder Display Name:</label>
                <input 
                  ref={placeholderNameInputRef}
                  type="text" 
                  id="placeholderNameInput"
                  className="w-full p-2 border border-border rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                  value={currentPlaceholderName}
                  onChange={(e) => setCurrentPlaceholderName(e.target.value)}
                  placeholder="e.g., Student Full Name"
                />
                <p className="text-xs text-text-secondary mt-1">
                  System Key (auto-generated): <code>[{toUpperSnakeCase(currentPlaceholderName || 'NEW_PLACEHOLDER')}]</code>
                </p>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => setIsDefinePlaceholderModalOpen(false)} className="btn border border-border">Cancel</button>
                <button 
                  onClick={handleAddPlaceholderToListAndEditor}
                  className="btn text-white px-4 py-2 text-sm font-medium rounded-md"
                  style={{ backgroundColor: '#f17103' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#d86502')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f17103')}
                  disabled={!currentPlaceholderName.trim()}
                >
                  Save & Insert Placeholder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateEditorModal;