import React, { useState } from 'react';
import { Target, Plus, Save, Trash2, ArrowRight, ArrowLeft, Check, Sparkles, Brain, FileText, Calendar, Lightbulb } from 'lucide-react';

interface Goal {
  id: number;
  area: string;
  description: string;
  baseline: string;
  targetDate: string;
  status: 'draft' | 'active' | 'completed';
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const GoalWriting: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      area: 'Reading Comprehension',
      description: 'Student will identify the main idea and three supporting details in grade-level text with 80% accuracy in 3 out of 4 trials.',
      baseline: 'Currently identifies main idea with 40% accuracy',
      targetDate: '2025-06-15',
      status: 'active',
    },
    {
      id: 2,
      area: 'Social Skills',
      description: 'Student will initiate appropriate peer interactions during unstructured activities at least 4 times per day for 4 consecutive weeks.',
      baseline: 'Currently initiates interactions 1-2 times per day',
      targetDate: '2025-05-30',
      status: 'active',
    },
  ]);
  
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    // General Student Information
    studentName: '',
    gradeLevel: 'K',
    schoolName: '',
    disabilityCategory: '',
    studentDisposition: '',
    mathObservations: '',
    
    // Previous IEP Goal in Math
    previousGoalText: '',
    previousGoalCriteria: '',
    previousGoalProgress: '',
    previousGoalStrategies: '',
    
    // Existing Assessment Data
    broadAssessmentSummary: '',
    specificAssessmentNotes: '',
    
    // Legacy fields for other steps
    assessmentData: '',
    goalArea: '',
    currentPerformance: '',
    targetBehavior: '',
    timeframe: '',
    criteria: '',
  });
  
  const wizardSteps: WizardStep[] = [
    {
      id: 0,
      title: 'Student Information',
      description: 'Provide general student details, math observations, previous goal progress, and any existing assessment data.',
      icon: <Target className="text-green" size={24} />,
    },
    {
      id: 1,
      title: 'Assessment Data',
      description: 'Share relevant assessment results and observations',
      icon: <Brain className="text-green" size={24} />,
    },
    {
      id: 2,
      title: 'Goal Parameters',
      description: 'Define the specific area and target behavior',
      icon: <FileText className="text-green" size={24} />,
    },
    {
      id: 3,
      title: 'Success Criteria',
      description: 'Set measurable criteria and timeline',
      icon: <Calendar className="text-green" size={24} />,
    },
  ];
  
  const goalAreas = [
    'Reading Comprehension',
    'Written Expression',
    'Math Calculation',
    'Math Problem Solving',
    'Social Skills',
    'Behavior',
    'Communication',
    'Adaptive Skills',
    'Fine Motor',
    'Gross Motor',
  ];

  const gradeOptions = ['K', '1st', '2nd', '3rd', '4th', '5th'];

  const handleStartWizard = () => {
    setShowWizard(true);
    setCurrentStep(0);
    setWizardData({
      // General Student Information
      studentName: '',
      gradeLevel: 'K',
      schoolName: '',
      disabilityCategory: '',
      studentDisposition: '',
      mathObservations: '',
      
      // Previous IEP Goal in Math
      previousGoalText: '',
      previousGoalCriteria: '',
      previousGoalProgress: '',
      previousGoalStrategies: '',
      
      // Existing Assessment Data
      broadAssessmentSummary: '',
      specificAssessmentNotes: '',
      
      // Legacy fields for other steps
      assessmentData: '',
      goalArea: '',
      currentPerformance: '',
      targetBehavior: '',
      timeframe: '',
      criteria: '',
    });
  };

  const handleNextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateGoal = () => {
    // Simulate AI goal generation
    const newGoal: Goal = {
      id: goals.length ? Math.max(...goals.map(g => g.id)) + 1 : 1,
      area: wizardData.goalArea,
      description: `AI-generated goal based on provided data: ${wizardData.targetBehavior} with ${wizardData.criteria} by ${wizardData.timeframe}.`,
      baseline: wizardData.currentPerformance,
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
      status: 'draft',
    };
    
    setGoals([...goals, newGoal]);
    setShowWizard(false);
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return 'bg-green text-white';
      case 'draft': return 'bg-yellow-500 text-black';
      case 'completed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            {/* Section 1: General Student Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-green border-b border-green border-opacity-20 pb-2">
                General Student Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-green">
                    Student Name (or AI for Pseudonym):
                  </label>
                  <input
                    type="text"
                    value={wizardData.studentName}
                    onChange={e => setWizardData({...wizardData, studentName: e.target.value})}
                    className="w-full p-3 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200"
                    placeholder="Enter student name or 'AI' for pseudonym"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-green">
                    Current Grade Level:
                  </label>
                  <select
                    value={wizardData.gradeLevel}
                    onChange={e => setWizardData({...wizardData, gradeLevel: e.target.value})}
                    className="w-full p-3 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200"
                  >
                    {gradeOptions.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-green">
                    School Name (optional):
                  </label>
                  <input
                    type="text"
                    value={wizardData.schoolName}
                    onChange={e => setWizardData({...wizardData, schoolName: e.target.value})}
                    className="w-full p-3 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200"
                    placeholder="Enter school name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-green">
                    Disability Category (for IEP context):
                  </label>
                  <input
                    type="text"
                    value={wizardData.disabilityCategory}
                    onChange={e => setWizardData({...wizardData, disabilityCategory: e.target.value})}
                    className="w-full p-3 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200"
                    placeholder="e.g., Autism, SLD, ID, etc."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-green">
                  Student's general disposition, interests, and helpful classroom supports:
                </label>
                <textarea
                  value={wizardData.studentDisposition}
                  onChange={e => setWizardData({...wizardData, studentDisposition: e.target.value})}
                  className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-24"
                  placeholder="Describe the student's personality, interests, learning preferences, and what supports help them succeed in the classroom..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-green">
                  Anecdotal observations in math class:
                </label>
                <textarea
                  value={wizardData.mathObservations}
                  onChange={e => setWizardData({...wizardData, mathObservations: e.target.value})}
                  className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-24"
                  placeholder="Share specific observations about the student's performance, behavior, and engagement during math instruction..."
                />
              </div>
            </div>

            {/* Section 2: Previous IEP Goal in Math */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-green border-b border-green border-opacity-20 pb-2">
                Previous IEP Goal in Math
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-green">
                  Most recent annual IEP math goal (or copy/paste):
                </label>
                <textarea
                  value={wizardData.previousGoalText}
                  onChange={e => setWizardData({...wizardData, previousGoalText: e.target.value})}
                  className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-32"
                  placeholder="Copy and paste the exact text of the student's most recent math IEP goal, or describe it in detail..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-green">
                    Target mastery criteria for that goal (e.g., 80% accuracy):
                  </label>
                  <input
                    type="text"
                    value={wizardData.previousGoalCriteria}
                    onChange={e => setWizardData({...wizardData, previousGoalCriteria: e.target.value})}
                    className="w-full p-3 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200"
                    placeholder="e.g., 80% accuracy, 4 out of 5 trials"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-green">
                    Performance on last progress report for that goal:
                  </label>
                  <input
                    type="text"
                    value={wizardData.previousGoalProgress}
                    onChange={e => setWizardData({...wizardData, previousGoalProgress: e.target.value})}
                    className="w-full p-3 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200"
                    placeholder="e.g., Met 60% of target, Progressing"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-green">
                  Effective strategies/supports for previous goal:
                </label>
                <textarea
                  value={wizardData.previousGoalStrategies}
                  onChange={e => setWizardData({...wizardData, previousGoalStrategies: e.target.value})}
                  className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-24"
                  placeholder="Describe what teaching strategies, accommodations, or supports were most effective for this student's previous math goal..."
                />
              </div>
            </div>

            {/* Section 3: Existing Assessment Data */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-green border-b border-green border-opacity-20 pb-2">
                Existing Assessment Data
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-green">
                  Summary of broad math assessments (NWEA/MAP, benchmarks):
                </label>
                <textarea
                  value={wizardData.broadAssessmentSummary}
                  onChange={e => setWizardData({...wizardData, broadAssessmentSummary: e.target.value})}
                  className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-24"
                  placeholder="Summarize results from standardized assessments like NWEA/MAP, district benchmarks, or other broad math assessments..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-green">
                  Specific Progress Monitoring / Curriculum-Based Assessments:
                </label>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-2 text-green">
                    Manually Enter Key Assessment Notes/Scores:
                  </label>
                  <textarea
                    value={wizardData.specificAssessmentNotes}
                    onChange={e => setWizardData({...wizardData, specificAssessmentNotes: e.target.value})}
                    className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-32"
                    placeholder="Enter detailed notes from progress monitoring data, curriculum-based assessments, work samples, or other specific math evaluations. Include scores, dates, and observations..."
                  />
                </div>
                <p className="text-xs text-text-secondary italic">
                  Note: File upload functionality for assessment documents will be available in future updates.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-green">
                Assessment Data & Observations
              </label>
              <textarea
                value={wizardData.assessmentData}
                onChange={e => setWizardData({...wizardData, assessmentData: e.target.value})}
                className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-32"
                placeholder="Share relevant assessment results, classroom observations, work samples, or data that will inform goal development..."
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-green">Goal Area</label>
              <select
                value={wizardData.goalArea}
                onChange={e => setWizardData({...wizardData, goalArea: e.target.value})}
                className="w-full p-3 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200"
              >
                <option value="">Select Goal Area</option>
                {goalAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-green">
                Current Performance Level
              </label>
              <textarea
                value={wizardData.currentPerformance}
                onChange={e => setWizardData({...wizardData, currentPerformance: e.target.value})}
                className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-24"
                placeholder="Describe what the student can currently do in this area..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-green">
                Target Behavior/Skill
              </label>
              <textarea
                value={wizardData.targetBehavior}
                onChange={e => setWizardData({...wizardData, targetBehavior: e.target.value})}
                className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-24"
                placeholder="Describe the specific skill or behavior you want the student to achieve..."
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-green">
                Success Criteria
              </label>
              <textarea
                value={wizardData.criteria}
                onChange={e => setWizardData({...wizardData, criteria: e.target.value})}
                className="w-full p-4 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200 h-24"
                placeholder="How will success be measured? (e.g., 80% accuracy, 4 out of 5 trials, etc.)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-green">
                Timeframe
              </label>
              <input
                type="text"
                value={wizardData.timeframe}
                onChange={e => setWizardData({...wizardData, timeframe: e.target.value})}
                className="w-full p-3 border-2 border-green border-opacity-20 rounded-lg bg-bg-primary focus:outline-none focus:border-green focus:border-opacity-60 transition-all duration-200"
                placeholder="When should this goal be achieved? (e.g., by the end of the school year, within 6 months)"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (showWizard) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Wizard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-medium">AI-Assisted Goal Creation</h1>
              <button
                onClick={() => setShowWizard(false)}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-4 mb-6">
              {wizardSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-green text-white border-green' 
                      : 'border-border text-text-secondary'
                  }`}>
                    {index < currentStep ? (
                      <Check size={20} />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                      index < currentStep ? 'bg-green' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Wizard Content */}
          <div className="card">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {wizardSteps[currentStep].icon}
                <h2 className="text-2xl font-medium">{wizardSteps[currentStep].title}</h2>
              </div>
              <p className="text-text-secondary">{wizardSteps[currentStep].description}</p>
            </div>

            <div className="min-h-[300px]">
              {renderWizardStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-border">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 0
                    ? 'text-text-secondary cursor-not-allowed'
                    : 'text-green hover:bg-green hover:bg-opacity-10 border border-green border-opacity-20'
                }`}
              >
                <ArrowLeft size={20} />
                Previous
              </button>

              {currentStep === wizardSteps.length - 1 ? (
                <button
                  onClick={handleGenerateGoal}
                  className="flex items-center gap-2 px-8 py-3 bg-green text-white rounded-lg font-medium hover:bg-green hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Sparkles size={20} />
                  Generate Goal
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-green text-white rounded-lg font-medium hover:bg-green hover:bg-opacity-90 transition-all duration-200"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-medium">Goal Writing</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => {/* Handle manual goal creation */}}
            className="flex items-center gap-2 px-4 py-2 border border-green border-opacity-20 text-green rounded-lg hover:bg-green hover:bg-opacity-10 transition-all duration-200"
          >
            <Plus size={18} />
            Manual Goal
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="card mb-8 bg-gradient-to-br from-green from-opacity-5 to-green to-opacity-10 border-green border-opacity-20">
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green bg-opacity-10 rounded-full">
              <Sparkles className="text-green" size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-medium mb-4">Create Goals with AI Assistance</h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Let our AI help you craft comprehensive, measurable IEP goals based on student data and best practices. 
            Simply provide information about your student, and we'll guide you through the process.
          </p>
          <button
            onClick={handleStartWizard}
            className="inline-flex items-center gap-3 px-8 py-4 bg-green text-white rounded-xl font-medium text-lg hover:bg-green hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Brain size={24} />
            Start New AI-Assisted Goal Process
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
      
      {/* Current Goals */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Target className="text-green" size={24} />
          <h2 className="text-2xl font-medium">Current IEP Goals</h2>
        </div>
        
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="border border-border rounded-xl p-6 hover:border-green hover:border-opacity-40 transition-all duration-200 hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green bg-opacity-10 text-green text-sm rounded-full font-medium">
                      {goal.area}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 hover:bg-bg-secondary rounded-lg transition-colors" 
                      aria-label="Edit goal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button 
                      className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-red-500" 
                      onClick={() => handleDeleteGoal(goal.id)}
                      aria-label="Delete goal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium text-lg mb-2">Goal #{goal.id}</h3>
                  <p className="text-text-secondary leading-relaxed">{goal.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <span className="font-medium text-green">Baseline:</span>
                    <p className="text-sm mt-1">{goal.baseline}</p>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <span className="font-medium text-green">Target Date:</span>
                    <p className="text-sm mt-1">{new Date(goal.targetDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            <Target size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-4">No goals have been created yet</p>
            <button 
              onClick={handleStartWizard}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green text-white rounded-lg font-medium hover:bg-green hover:bg-opacity-90 transition-all duration-200"
            >
              <Sparkles size={20} />
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* SMART Goal Writing Tips Section */}
      <div className="card bg-gradient-to-br from-green from-opacity-5 to-green to-opacity-10 border-green border-opacity-30">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="text-green" size={22} />
          <h2 className="text-2xl font-medium">SMART Goal Writing Tips</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-bg-primary rounded-lg p-5 border border-green border-opacity-20 hover:border-opacity-40 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                S
              </div>
              <h3 className="font-semibold text-green">Specific</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Clearly define what needs to be accomplished. Avoid vague language and be precise about the expected behavior or skill.
            </p>
          </div>

          <div className="bg-bg-primary rounded-lg p-5 border border-green border-opacity-20 hover:border-opacity-40 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                M
              </div>
              <h3 className="font-semibold text-green">Measurable</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              How will you track progress and know when the goal is met? Include specific criteria like percentages or frequency.
            </p>
          </div>

          <div className="bg-bg-primary rounded-lg p-5 border border-green border-opacity-20 hover:border-opacity-40 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                A
              </div>
              <h3 className="font-semibold text-green">Achievable</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Is the goal realistic given the student's current abilities and expected growth? Set challenging but attainable targets.
            </p>
          </div>

          <div className="bg-bg-primary rounded-lg p-5 border border-green border-opacity-20 hover:border-opacity-40 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                R
              </div>
              <h3 className="font-semibold text-green">Relevant</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Does the goal address the student's key needs and align with curriculum expectations and life skills?
            </p>
          </div>

          <div className="bg-bg-primary rounded-lg p-5 border border-green border-opacity-20 hover:border-opacity-40 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                T
              </div>
              <h3 className="font-semibold text-green">Time-bound</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              What is the target date for achieving this goal? Establish clear timelines for assessment and review.
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-bg-primary rounded-lg border border-green border-opacity-20">
          <h3 className="font-semibold text-green mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            Additional Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green rounded-full mt-2 flex-shrink-0"></div>
                <span>Use positive language focusing on what the student will do</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green rounded-full mt-2 flex-shrink-0"></div>
                <span>Include conditions under which the skill will be performed</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green rounded-full mt-2 flex-shrink-0"></div>
                <span>Consider the student's learning style and preferences</span>
              </li>
            </ul>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green rounded-full mt-2 flex-shrink-0"></div>
                <span>Align goals with state standards when appropriate</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green rounded-full mt-2 flex-shrink-0"></div>
                <span>Ensure goals are functional and meaningful to the student</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green rounded-full mt-2 flex-shrink-0"></div>
                <span>Plan for regular progress monitoring and data collection</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalWriting;