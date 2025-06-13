import React, { useState } from 'react';
import {
  User, BookOpen, BarChart2, Edit3, Microscope, Settings, ShieldCheck, FileText as IEPFileTextIcon, Target as GoalTargetIcon, Handshake, Lightbulb, Brain, Sparkles, Check, ArrowLeft, ArrowRight, Calendar, Plus, Save, Trash2 // Add more as needed
} from 'lucide-react';


interface Goal {
  id: number;
  area: string;
  description: string;
  baseline: string;
  targetDate: string;
  status: 'draft' | 'active' | 'completed';
  studentName?: string; // Make studentName optional if not every goal object will have it immediately
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}
 <div className="space-y-6"> {/* Main container for the step's content */}
    
    {/* Student Name */}
    <div>
      <label htmlFor="studentName" className="block text-sm font-medium mb-1 text-text-primary">
        Student Name:
      </label>
      <input
        type="text"
        id="studentName"
        value={wizardData.studentName}
        onChange={(e) => setWizardData({ ...wizardData, studentName: e.target.value })}
        className="w-full p-3 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-green transition-colors"
        placeholder="Enter student's full name"
      />
    </div>

    {/* Current Grade Level - Dropdown */}
    <div>
      <label htmlFor="currentGradeLevel" className="block text-sm font-medium mb-1 text-text-primary">
        Current Grade Level:
      </label>
      <select
        id="currentGradeLevel"
        value={wizardData.currentGradeLevel}
        onChange={(e) => setWizardData({ ...wizardData, currentGradeLevel: e.target.value })}
        className="w-full p-3 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-green transition-colors"
      >
        {/* Ensure gradeOptions is defined: const gradeOptions = ['K', '1', '2', '3', '4', '5']; */}
        {gradeOptions.map(grade => (
          <option key={grade} value={grade}>{grade}</option>
        ))}
      </select>
    </div>

    {/* School Name */}
    <div>
      <label htmlFor="schoolName" className="block text-sm font-medium mb-1 text-text-primary">
        School Name (optional):
      </label>
      <input
        type="text"
        id="schoolName"
        value={wizardData.schoolName}
        onChange={(e) => setWizardData({ ...wizardData, schoolName: e.target.value })}
        className="w-full p-3 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-green transition-colors"
        placeholder="Enter school name"
      />
    </div>

    {/* Primary Disability - Free Enter Space */}
    <div>
      <label htmlFor="primaryDisability" className="block text-sm font-medium mb-1 text-text-primary">
        Primary Disability:
      </label>
      <input
        type="text"
        id="primaryDisability"
        value={wizardData.primaryDisability}
        onChange={(e) => setWizardData({ ...wizardData, primaryDisability: e.target.value })}
        className="w-full p-3 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-green transition-colors"
        placeholder="e.g., Autism, Specific Learning Disability"
      />
    </div>

    {/* Secondary Disability - Free Enter Space */}
    <div>
      <label htmlFor="secondaryDisability" className="block text-sm font-medium mb-1 text-text-primary">
        Secondary Disability (optional):
      </label>
      <input
        type="text"
        id="secondaryDisability"
        value={wizardData.secondaryDisability}
        onChange={(e) => setWizardData({ ...wizardData, secondaryDisability: e.target.value })}
        className="w-full p-3 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-green transition-colors"
        placeholder="Enter secondary disability if applicable"
      />
    </div>
    
    {/* English Learner Status - Dropdown */}
    <div>
      <label htmlFor="englishLearnerStatus" className="block text-sm font-medium mb-1 text-text-primary">
        English Learner Status:
      </label>
      <select
        id="englishLearnerStatus"
        value={wizardData.englishLearnerStatus}
        onChange={(e) => setWizardData({ ...wizardData, englishLearnerStatus: e.target.value as WizardData['englishLearnerStatus'] })}
        className="w-full p-3 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-green transition-colors"
      >
        <option value="">Select Status</option>
        <option value="ELL">English Language Learner (ELL)</option>
        <option value="EO">English Only (EO)</option>
        <option value="RFEP">Redesignated Fluent English Proficient (RFEP)</option>
      </select>
    </div>

    {/* Student interests and general information - Textarea */}
    <div>
      <label htmlFor="studentInterestsGeneralInfo" className="block text-sm font-medium mb-1 text-text-primary">
        Student Interests and General Information:
      </label>
      <textarea
        id="studentInterestsGeneralInfo"
        value={wizardData.studentInterestsGeneralInfo}
        onChange={(e) => setWizardData({ ...wizardData, studentInterestsGeneralInfo: e.target.value })}
        className="w-full p-3 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-green transition-colors h-32" // Adjusted height
        placeholder="Describe student's interests, hobbies, strengths, learning preferences, and any other general information helpful for understanding the student..."
      />
    </div>

  </div> // Closing main div for the step's content
);


  // Step 2: Previous IEP Goals
  previousGoalDomain: string; // e.g., 'Operations & Algebraic Thinking'
  previousGoalStandardId: string; // e.g., 'K.OA.A.2'
  previousGoalAnnualGoalText: string;
  previousGoalProgressStatus: 'met' | 'not_met' | 'partially_met' | 'minimal_progress' | 'objectives_met' | 'not_annual_goal' | '';
  previousGoalContinuedNeed: 'yes' | 'no' | '';
  showPreviousObjectives: boolean; // To toggle visibility
  previousObjective1Text: string;
  previousObjective1Status: 'met' | 'not_met' | 'partially_met' | '';
  previousObjective2Text: string;
  previousObjective2Status: 'met' | 'not_met' | 'partially_met' | '';
  previousObjective3Text: string;
  previousObjective3Status: 'met' | 'not_met' | 'partially_met' | '';

  // Step 3: Student Context & Supports
  // studentInterestsGeneralInfo is already defined in Step 1, can be displayed here too
  anecdotalObservationsGE: string; // Progress/performance in GE, CCSS, access
  academicStrengthsGeneralInfo: string;
  areasOfGrowthQualitative: string;
  // individualizedSupports: string; // Covered in Step 6 more specifically

  // Step 4: Student Data (Existing & Baseline Planning)
  benchmarkAssessmentType: 'NWEA' | 'Curriculum-Based' | 'Benchmark' | 'Other' | '';
  benchmarkAssessmentOtherName: string; // If 'Other' is selected
  benchmarkDataManualInput: string; // Or specific fields below
  // NWEA Specific
  nweaRitScore: string;
  nweaPercentilePeers: string;
  nweaGrowthPercentile: string;
  // File upload placeholder - actual file handling state will be separate
  // assessmentFileUploadPlaceholder: any; // Not used directly in wizardData for now

  // Statewide Assessments
  statewideAssessmentType: 'SBAC' | 'CAA' | '';
  statewideAssessmentScores: string; // Placeholder for now

  // ELPAC Scores (conditional on englishLearnerStatus)
  elpacScores: string;

  // AI Recommended Baseline Area (text description for now)
  // aiRecommendedBaselineAreas: string; // This will be an output from AI, not input here

  // Step 5: New Baseline Data Analysis
  // assessmentFileUploadPlaceholderForNewBaseline: any; // Placeholder
  newBaselineDomain: string;
  newBaselineStandardId: string;
  newBaselineResultsQuantitative: string; // e.g., "4 out of 5..."
  newBaselineAdditionalInfoQualitative: string;
  newBaselineSupportsToIncreaseAccess: string;

  // Step 6: Student Accommodations and Supports
  accommodations: string[]; // Store selected accommodations (e.g., ['visual_schedule', 'manipulatives'])
  modifications: string[];  // Store selected modifications
  behaviorNeeds: 'yes' | 'no' | '';
  behaviorSupports: string[]; // Store selected behavior supports
  elSupports: string; // Free text for EL specific supports

  // Step 7: Special Factors
  assistiveTechNeeded: 'yes' | 'no' | '';
  assistiveTechRationale: string;
  blindVisualImpairment: 'yes' | 'no' | '';
  deafHardOfHearing: 'yes' | 'no' | '';
  behaviorImpedingLearning: 'yes' | 'no' | '';
  behaviorInterventionsStrategies: string;

  // Step 8: Present Levels (This will be drafted by AI, then editable by teacher)
  draftPresentLevels: string;

  // Step 9: Goal Proposal (AI drafts, teacher edits)
  draftAnnualGoal: string;
  draftObjective1: string;
  draftObjective2: string;
  draftObjective3: string;

  // Step 10: Related Services
  // This might be an array of service objects for more complex scenarios
  // For now, a simple structure for one service, or plan for an array
  relatedServiceType: 'SAI' | 'BIS' | 'Other' | ''; // Specialized Academic Instruction, Behavior Intervention Services
  relatedServiceOtherName: string;
  relatedServiceDuration: string; // e.g., "250 minutes"
  relatedServiceFrequency: 'weekly' | 'monthly' | 'daily' | '';
  relatedServiceDelivery: 'individual' | 'group' | '';
  relatedServiceLocation: string;
  relatedServiceComments: string;
  relatedServiceStartDate: string; // Date string
  relatedServiceEndDate: string;   // Date string

  // Legacy fields for compatibility
  gradeLevel: string;
  disabilityCategory: string;
  studentDisposition: string;
  mathObservations: string;
  previousGoalText: string;
  previousGoalCriteria: string;
  previousGoalProgress: string;
  previousGoalStrategies: string;
  broadAssessmentSummary: string;
  specificAssessmentNotes: string;
  assessmentData: string;
  goalArea: string;
  currentPerformance: string;
  targetBehavior: string;
  timeframe: string;
  criteria: string;
}

const GoalWriting: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    // Step 1: Student Demographics
    studentName: '',
    currentGradeLevel: 'K',
    schoolName: '',
    primaryDisability: '',
    secondaryDisability: '',
    studentInterestsGeneralInfo: '',
    englishLearnerStatus: '',

    // Step 2: Previous IEP Goals
    previousGoalDomain: '',
    previousGoalStandardId: '',
    previousGoalAnnualGoalText: '',
    previousGoalProgressStatus: '',
    previousGoalContinuedNeed: '',
    showPreviousObjectives: false,
    previousObjective1Text: '',
    previousObjective1Status: '',
    previousObjective2Text: '',
    previousObjective2Status: '',
    previousObjective3Text: '',
    previousObjective3Status: '',

    // Step 3: Student Context & Supports
    anecdotalObservationsGE: '',
    academicStrengthsGeneralInfo: '',
    areasOfGrowthQualitative: '',

    // Step 4: Student Data (Existing & Baseline Planning)
    benchmarkAssessmentType: '',
    benchmarkAssessmentOtherName: '',
    benchmarkDataManualInput: '',
    nweaRitScore: '',
    nweaPercentilePeers: '',
    nweaGrowthPercentile: '',
    statewideAssessmentType: '',
    statewideAssessmentScores: '',
    elpacScores: '',

    // Step 5: New Baseline Data Analysis
    newBaselineDomain: '',
    newBaselineStandardId: '',
    newBaselineResultsQuantitative: '',
    newBaselineAdditionalInfoQualitative: '',
    newBaselineSupportsToIncreaseAccess: '',

    // Step 6: Student Accommodations and Supports
    accommodations: [],
    modifications: [],
    behaviorNeeds: '',
    behaviorSupports: [],
    elSupports: '',

    // Step 7: Special Factors
    assistiveTechNeeded: '',
    assistiveTechRationale: '',
    blindVisualImpairment: '',
    deafHardOfHearing: '',
    behaviorImpedingLearning: '',
    behaviorInterventionsStrategies: '',

    // Step 8: Present Levels
    draftPresentLevels: '',

    // Step 9: Goal Proposal
    draftAnnualGoal: '',
    draftObjective1: '',
    draftObjective2: '',
    draftObjective3: '',

    // Step 10: Related Services
    relatedServiceType: '',
    relatedServiceOtherName: '',
    relatedServiceDuration: '',
    relatedServiceFrequency: '',
    relatedServiceDelivery: '',
    relatedServiceLocation: '',
    relatedServiceComments: '',
    relatedServiceStartDate: '',
    relatedServiceEndDate: '',

    // Legacy fields for compatibility
    gradeLevel: 'K',
    disabilityCategory: '',
    studentDisposition: '',
    mathObservations: '',
    previousGoalText: '',
    previousGoalCriteria: '',
    previousGoalProgress: '',
    previousGoalStrategies: '',
    broadAssessmentSummary: '',
    specificAssessmentNotes: '',
    assessmentData: '',
    goalArea: '',
    currentPerformance: '',
    targetBehavior: '',
    timeframe: '',
    criteria: '',
  });

 const wizardSteps: WizardStep[] = [ // Uses your existing WizardStep interface
  {
    id: 0, // Corresponds to currentStep === 0
    title: 'Student Demographics',
    description: 'Basic information about the student.',
    icon: <User className="text-green" size={24} />,
  },
  {
    id: 1, // Corresponds to currentStep === 1
    title: 'Previous IEP Goals Review',
    description: 'Review progress on prior goals to inform new ones.',
    icon: <BookOpen className="text-green" size={24} />,
  },
  {
    id: 2, // Corresponds to currentStep === 2
    title: 'Student Context & Supports',
    description: 'Gather qualitative information about the student.',
    icon: <Settings className="text-green" size={24} />, // Or Lightbulb
  },
  {
    id: 3, // Corresponds to currentStep === 3
    title: 'Existing Student Data Input',
    description: 'Input data from benchmark, statewide, and other assessments.',
    icon: <BarChart2 className="text-green" size={24} />,
  },
  {
    id: 4, // Corresponds to currentStep === 4
    title: 'New Baseline Data & Analysis',
    description: 'Input results from newly administered baseline assessments.',
    icon: <Microscope className="text-green" size={24} />,
  },
  {
    id: 5, // Corresponds to currentStep === 5
    title: 'Accommodations & Modifications',
    description: 'Define supports for the student.',
    icon: <ShieldCheck className="text-green" size={24} />,
  },
  {
    id: 6, // Corresponds to currentStep === 6
    title: 'Special Factors',
    description: 'Address specific considerations for the student.',
    icon: <Edit3 className="text-green" size={24} />, // Or an AlertTriangle icon
  },
  {
    id: 7, // Corresponds to currentStep === 7
    title: 'Draft Present Levels of Performance',
    description: 'AI will help synthesize data into a PLOP draft.',
    icon: <IEPFileTextIcon className="text-green" size={24} />, // Renamed FileText to avoid conflict
  },
  {
    id: 8, // Corresponds to currentStep === 8
    title: 'Propose IEP Goals & Objectives',
    description: 'AI will recommend goals based on data and desired growth.',
    icon: <GoalTargetIcon className="text-green" size={24} />, // Renamed Target to avoid conflict
  },
  {
    id: 9, // Corresponds to currentStep === 9
    title: 'Related Services',
    description: 'Document any related services the student receives.',
    icon: <Handshake className="text-green" size={24} />,
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
  setWizardData({ // Resetting wizardData to its initial state
    // Step 1: Student Demographics
    studentName: '',
    currentGradeLevel: 'K',
    schoolName: '',
    primaryDisability: '',
    secondaryDisability: '',
    studentInterestsGeneralInfo: '',
    englishLearnerStatus: '',

    // Step 2: Previous IEP Goals
    previousGoalDomain: '',
    previousGoalStandardId: '',
    previousGoalAnnualGoalText: '',
    previousGoalProgressStatus: '',
    previousGoalContinuedNeed: '',
    showPreviousObjectives: false,
    previousObjective1Text: '',
    previousObjective1Status: '',
    previousObjective2Text: '',
    previousObjective2Status: '',
    previousObjective3Text: '',
    previousObjective3Status: '',

    // Step 3: Student Context & Supports
    anecdotalObservationsGE: '',
    academicStrengthsGeneralInfo: '',
    areasOfGrowthQualitative: '',

    // Step 4: Student Data (Existing & Baseline Planning)
    benchmarkAssessmentType: '',
    benchmarkAssessmentOtherName: '',
    benchmarkDataManualInput: '',
    nweaRitScore: '',
    nweaPercentilePeers: '',
    nweaGrowthPercentile: '',
    statewideAssessmentType: '',
    statewideAssessmentScores: '',
    elpacScores: '',

    // Step 5: New Baseline Data Analysis
    newBaselineDomain: '',
    newBaselineStandardId: '',
    newBaselineResultsQuantitative: '',
    newBaselineAdditionalInfoQualitative: '',
    newBaselineSupportsToIncreaseAccess: '',

    // Step 6: Student Accommodations and Supports
    accommodations: [],
    modifications: [],
    behaviorNeeds: '',
    behaviorSupports: [],
    elSupports: '',

    // Step 7: Special Factors
    assistiveTechNeeded: '',
    assistiveTechRationale: '',
    blindVisualImpairment: '',
    deafHardOfHearing: '',
    behaviorImpedingLearning: '',
    behaviorInterventionsStrategies: '',

    // Step 8: Present Levels
    draftPresentLevels: '',

    // Step 9: Goal Proposal
    draftAnnualGoal: '',
    draftObjective1: '',
    draftObjective2: '',
    draftObjective3: '',

    // Step 10: Related Services
    relatedServiceType: '',
    relatedServiceOtherName: '',
    relatedServiceDuration: '',
    relatedServiceFrequency: '',
    relatedServiceDelivery: '',
    relatedServiceLocation: '',
    relatedServiceComments: '',
    relatedServiceStartDate: '',
    relatedServiceEndDate: '',

    // Legacy fields for compatibility
    gradeLevel: 'K',
    disabilityCategory: '',
    studentDisposition: '',
    mathObservations: '',
    previousGoalText: '',
    previousGoalCriteria: '',
    previousGoalProgress: '',
    previousGoalStrategies: '',
    broadAssessmentSummary: '',
    specificAssessmentNotes: '',
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
        <h1 className="text-3xl font-medium">IEP Development Studio</h1>
      </div>
      {/* Hero Section */}
      <div className="card mb-8 bg-gradient-to-br from-green from-opacity-5 to-green to-opacity-10 border-green border-opacity-20">
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green bg-opacity-10 rounded-full">
              <Sparkles className="text-green" size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-medium mb-4">AI-Assisted IEP Development</h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Use our AI-powered assistant to guide you through creating comprehensive, measurable Present Levels, Baselines, and IEP Goals for your students.
          </p>
          <button
            onClick={handleStartWizard}
            className="inline-flex items-center gap-3 px-8 py-4 bg-green text-white rounded-xl font-medium text-lg hover:bg-green hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Brain size={24} />
            Create New Student IEP Goals
            <ArrowRight size={24} />
          </button>
        </div>
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