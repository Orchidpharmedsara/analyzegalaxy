// Shared TypeScript types across the app

export interface ScoreEvidence {
  timestamp: number;
  observation: string;
}

export interface Prescription {
  rank: number;
  category: string;
  change: string;
  effort: 'low' | 'medium' | 'high';
  expected_lift: { metric: string; delta: number };
  expected_pds_delta: number;
  rewrite?: any;
}

export interface DropoffPoint {
  timestamp: number;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface HealthClaim {
  timestamp: number;
  claim: string;
  class: 'established' | 'contested' | 'oversimplified' | 'unsupported';
  note: string;
}

export interface PolicyFlag {
  type: string;
  timestamp: number;
  severity: 'low' | 'med' | 'high';
}

export interface PredictedMetricValue {
  value: number;
  range: [number, number];
}

export interface CategoryScore {
  key?: string;
  label_fa?: string;
  score: number;
  confidence?: number;
  evidence?: ScoreEvidence[];
  counterfactual?: string;
  delta_vs_baseline?: number | null;
  predicted_metric?: { metric: string; value: number; range: [number, number] };
  
  // Legacy fields
  category?: string;
  reason?: string;
}

export interface AnalysisResult {
  performancePotential?: number;
  growthPotential?: number;
  experimentValue?: number;
  evidenceConfidence?: number;

  scores?: Record<string, {
    score: number;
    reason: string;
    what_would_be_100: string;
  }>;
  evidence?: {
    observed: string[];
    calculated: string[];
    predicted: string[];
    inferred: string[];
    unknown: string[];
  };
  timeline?: any[];
  strengths?: string[];
  weaknesses?: string[];
  riskPoints?: any[];
  experiments?: any[];

  // Legacy fields
  overallScore?: number;
  overallScoreExplanation?: string;
  videoSummary: string;
  whatWorked: string;
  whyItCouldWorkOnSocial: string;
  narrativeCritique?: string;
  improvementSuggestions?: string[];
}

export interface VideoMetadata {
  duration: number;
  resolution: string;
  fps: number;
  aspectRatio: string;
  fileSize: number;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  authorUsername?: string;
}

export interface DownloadResult {
  filePath: string;
  caption?: string;
  hashtags?: string;
  metadata?: Partial<VideoMetadata>;
}

export type AnalysisStatus =
  | 'idle'
  | 'downloading'
  | 'processing'
  | 'transcribing'
  | 'analyzing'
  | 'generating'
  | 'saving'
  | 'done'
  | 'error';

export interface ProgressEvent {
  status: 'downloading' | 'processing' | 'transcribing' | 'analyzing' | 'generating' | 'saving' | 'done' | 'error';
  message: string;
  analysisId?: string;
  error?: string;
  rawText?: string;
}

export interface VideoRecord {
  id: string;
  sourceType: 'upload' | 'instagram';
  originalUrl?: string | null;
  filePath: string;
  thumbnailPath?: string | null;
  caption?: string | null;
  hashtags?: string | null;
  transcript?: string | null;
  duration?: number | null;
  resolution?: string | null;
  fps?: number | null;
  aspectRatio?: string | null;
  fileSize?: number | null;
  likeCount?: number | null;
  commentCount?: number | null;
  viewCount?: number | null;
  authorUsername?: string | null;
  createdAt: string;
}

export interface AnalysisRecord {
  id: string;
  videoId: string;
  status?: string;

  performancePotential?: number | null;
  growthPotential?: number | null;
  experimentValue?: number | null;
  evidenceConfidence?: number | null;

  scores?: string | null;
  evidence?: string | null;
  timeline?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  riskPoints?: string | null;
  experiments?: string | null;

  // Legacy
  overallScore?: number | null;
  overallScoreExplanation?: string | null;
  categoryScores?: string | null;
  videoSummary?: string | null;
  whatWorked?: string | null;
  whyItCouldWorkOnSocial?: string | null;
  narrativeCritique?: string | null;
  improvementSuggestions?: string | null;
  createdAt: string;
  video: VideoRecord;
}

export interface FeedbackRecord {
  id: string;
  analysisId: string;
  rating: number;
  correction?: string | null;
  createdAt: string;
}
