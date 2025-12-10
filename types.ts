
export enum FeatureMode {
  ANALYSIS = 'ANALYSIS',
  CHAT = 'CHAT',
  QUICK_TIPS = 'QUICK_TIPS',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE'
}

export interface CareerPath {
  title: string;
  reasoning: string;
  matchScore: number;
  existingStrengths: string[];
  requiredSkills: string[];
}

export interface MissingSkill {
  skill: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  toolsOrTechnologies: string[];
}

export interface SkillGapAnalysis {
  existingSkills: string[];
  missingSkills: MissingSkill[];
}

export interface LearningTask {
  day: string;
  task: string;
  resource: string;
}

export interface WeekPlan {
  goal: string;
  tasks: LearningTask[];
}

export interface InterviewQuestion {
  question: string;
  answerKey: string;
}

export interface PortfolioProject {
  title: string;
  description: string;
  skillsDemonstrated: string[];
  whyItHelps?: string;
}

export interface CareerAnalysisResult {
  summary: string;
  careerPaths: CareerPath[];
  skillGapAnalysis: SkillGapAnalysis;
  learningPlan: {
    week1: WeekPlan;
    week2: WeekPlan;
    week3: WeekPlan;
    week4: WeekPlan;
  };
  interviewPrep: {
    hr: InterviewQuestion[];
    technical: InterviewQuestion[];
    behavioral: InterviewQuestion[];
  };
  resumeTips: string[];
  improvedResumePoints: string[];
  portfolioProjects: PortfolioProject[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}