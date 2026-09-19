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
  pds?: number;
  adjusted_pds?: number;
  binding_gate?: string;
  percentile_vs_own_account?: number | null;
  confidence_overall?: number;

  categoryScores: CategoryScore[];
  prescriptions?: Prescription[];
  predicted_dropoffs?: DropoffPoint[];
  predicted_metrics?: Record<string, PredictedMetricValue>;

  health_layer?: {
    claims: HealthClaim[];
    authority_signals: string[];
    fear_opened: boolean;
    fear_resolved: boolean;
    policy_risk_flags: PolicyFlag[];
    disclaimer_present: boolean;
  };
  
  caption_package?: {
    first_line_options: string[];
    full_caption: string;
    search_keywords: string[];
    cta: { type: string; text_fa: string };
    onscreen_text_fixes: { timestamp: number; current: string; suggested: string; reason: string }[];
  };

  what_to_check_in_insights?: string[];

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
  pds?: number | null;
  bindingGate?: string | null;
  bindingGateExplanation?: string | null;
  prescriptions?: Prescription[] | null;
  predictedDropoffs?: DropoffPoint[] | null;
  predictedMetrics?: Record<string, PredictedMetricValue> | null;
  healthClaims?: HealthClaim[] | null;
  policyRiskFlags?: PolicyFlag[] | null;
  fearOpened?: boolean | null;
  fearResolved?: boolean | null;
  captionPackage?: any | null;
  insightsChecklist?: string[] | null;

  // Legacy
  overallScore?: number | null;
  overallScoreExplanation?: string | null;
  categoryScores?: CategoryScore[] | null;
  videoSummary?: string | null;
  whatWorked?: string | null;
  whyItCouldWorkOnSocial?: string | null;
  narrativeCritique?: string | null;
  improvementSuggestions?: string[] | null;
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
