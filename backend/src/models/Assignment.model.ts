import mongoose, { Schema, Document } from 'mongoose';

// Interface for individual questions in the generated paper
export interface IQuestion {
  question: string;
  options?: string[]; 
  answer?: string;    
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

// Interface for paper sections in the generated paper
export interface ISection {
  title: string;
  instruction?: string;
  questions: IQuestion[];
}

// Interface for the fully generated question paper
export interface IQuestionPaper {
  sections: ISection[];
}

// Interface for the dynamic question configuration rows 
export interface IQuestionConfig {
  questionType: string;
  noOfQuestions: number;
  marksPerQuestion: number;
}

// Interface for file upload metadata
export interface IUploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string; 
}

// Interface for the Assignment Document
export interface IAssignment extends Document {
  title: string;
  uploadedFile?: IUploadedFile;
  dueDate?: Date;
  questionConfigs: IQuestionConfig[];
  totalQuestions: number;
  totalMarks: number;
  additionalInfo?: string;
  status: 'queued' | 'generating' | 'formatting' | 'completed' | 'failed';
  errorDetails?: string;
  generatedPaper?: IQuestionPaper;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Sub-schemas
const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  options: { type: [String], default: undefined },
  answer: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true },
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String },
  questions: [QuestionSchema],
});

const QuestionPaperSchema = new Schema<IQuestionPaper>({
  sections: [SectionSchema],
});

const QuestionConfigSchema = new Schema<IQuestionConfig>({
  questionType: { type: String, required: true },
  noOfQuestions: { type: Number, required: true, min: 1 },
  marksPerQuestion: { type: Number, required: true, min: 1 },
});

const UploadedFileSchema = new Schema<IUploadedFile>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
});

// Main Assignment Schema
const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    uploadedFile: { type: UploadedFileSchema, default: null },
    dueDate: { type: Date },
    questionConfigs: { type: [QuestionConfigSchema], required: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInfo: { type: String },
    status: {
      type: String,
      enum: ['queued', 'generating', 'formatting', 'completed', 'failed'],
      default: 'queued',
      required: true,
    },
    errorDetails: { type: String },
    generatedPaper: { type: QuestionPaperSchema, default: null },
  },
  {
    timestamps: true, 
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export default Assignment;
