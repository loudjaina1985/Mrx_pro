export interface Thesis {
  id: string;
  title: string;
  abstract?: string;
  objectives: string[];
  problemStatement?: string;
  methodology: string;
  literatureReview?: string;
  results: string;
  discussion?: string;
  conclusions: string;
  references: string[];
  keywords: string[];
  language: "fr" | "ar" | "en";
  createdAt: string;
}

export type JuryRole = 'president' | 'examiner' | 'specialist';

export interface JuryMember {
  role: JuryRole;
  name: string;
  title: string;
  specialty: string;
  avatar: string;
  description: string;
  color: string;
}

export interface DefenseSession {
  id: string;
  thesisId: string;
  thesisTitle: string;
  language: "fr" | "ar" | "en";
  questionsCount: number;
  currentQuestionIndex: number;
  currentMemberRole: JuryRole;
  history: Array<{
    role: JuryRole;
    question: string;
    answer: string;
    topic: string;
    evaluationScore: number;
    evaluationFeedback: string;
    idealPoints?: string[];
    ratings?: {
      scientificAccuracy?: number;
      technicalKnowledge?: number;
      communicationSkills?: number;
    }
  }>;
  status: 'not_started' | 'active' | 'deliberating' | 'finished';
  report?: {
    finalScore: number;
    mention: string;
    comments: {
      president: string;
      examiner: string;
      specialist: string;
    };
    breakdown: {
      rigueurScientifique: number;
      techniqueImagerie: number;
      radioprotection: number;
      prestationOrale: number;
      gestionDesQuestions: number;
    };
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  };
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  category: "Radiography" | "CT Scanner" | "MRI" | "Ultrasound" | "Radiation Protection" | "Imaging Physics" | "Patient Safety" | "Protocols";
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSession {
  totalQuestions: number;
  correctAnswers: number;
  completedCategories: { [key: string]: number };
  completedLevels: { [key: string]: number };
}
