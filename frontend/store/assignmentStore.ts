import { create } from 'zustand';

export interface IQuestion {
  question: string;
  options?: string[];
  answer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface ISection {
  title: string;
  instruction?: string;
  questions: IQuestion[];
}

export interface IQuestionPaper {
  sections: ISection[];
}

export interface IQuestionConfig {
  questionType: string;
  noOfQuestions: number;
  marksPerQuestion: number;
}

export interface IUploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface IAssignment {
  _id: string;
  title: string;
  uploadedFile?: IUploadedFile | null;
  dueDate?: string;
  questionConfigs: IQuestionConfig[];
  totalQuestions: number;
  totalMarks: number;
  additionalInfo?: string;
  status: 'queued' | 'generating' | 'formatting' | 'completed' | 'failed';
  errorDetails?: string;
  generatedPaper?: IQuestionPaper | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAssignmentForm {
  title: string;
  dueDate: string;
  questionConfigs: IQuestionConfig[];
  additionalInfo: string;
  file: File | null;
}

interface AssignmentState {
  // Assignments list
  assignments: IAssignment[];
  isLoadingAssignments: boolean;
  
  // Creation form state
  formStep: number; // 1 = Details Form, 2 = Review & Confirm
  formDraft: IAssignmentForm;
  
  // Submission & socket generation states
  isGenerating: boolean;
  generationProgress: number; // 0 to 100
  generationStatusText: string; // "Queued", "Generating", etc.
  activeGeneratedPaper: IQuestionPaper | null;

  // Actions
  setFormStep: (step: number) => void;
  updateFormDraft: (updates: Partial<IAssignmentForm>) => void;
  resetFormDraft: () => void;
  setAssignments: (assignments: IAssignment[]) => void;
  addAssignment: (assignment: IAssignment) => void;
  deleteAssignment: (id: string) => void;
  setGeneratingState: (isGenerating: boolean, progress: number, statusText: string, paper?: IQuestionPaper | null) => void;
}

const initialFormDraft: IAssignmentForm = {
  title: '',
  dueDate: '',
  questionConfigs: [
    { questionType: 'Multiple Choice Questions', noOfQuestions: 4, marksPerQuestion: 1 }
  ],
  additionalInfo: '',
  file: null,
};

export const useAssignmentStore = create<AssignmentState>((set) => ({
  // Initial states
  assignments: [],
  isLoadingAssignments: false,
  formStep: 1,
  formDraft: initialFormDraft,
  isGenerating: false,
  generationProgress: 0,
  generationStatusText: '',
  activeGeneratedPaper: null,

  // Actions
  setFormStep: (step) => set({ formStep: step }),
  
  updateFormDraft: (updates) => set((state) => ({
    formDraft: { ...state.formDraft, ...updates }
  })),

  resetFormDraft: () => set({
    formDraft: initialFormDraft,
    formStep: 1,
    isGenerating: false,
    generationProgress: 0,
    generationStatusText: '',
    activeGeneratedPaper: null
  }),

  setAssignments: (assignments) => set({ assignments }),
  
  addAssignment: (assignment) => set((state) => ({
    assignments: [assignment, ...state.assignments]
  })),

  deleteAssignment: (id) => set((state) => ({
    assignments: state.assignments.filter((a) => a._id !== id)
  })),

  setGeneratingState: (isGenerating, progress, statusText, paper = null) => set({
    isGenerating,
    generationProgress: progress,
    generationStatusText: statusText,
    activeGeneratedPaper: paper
  }),
}));
