export type ReviewStatus = "healthy" | "needs-review" | "critical";
export type RecommendationPriority = "medium" | "high" | "critical";

export interface CloudAccount {
  id: string;
  name: string;
  environment: "production" | "staging" | "development";
  businessUnit: string;
  ownerTeam: string;
  monthlyBudget: number;
  region: string;
}

export interface Service {
  id: string;
  accountId: string;
  name: string;
  category: string;
  environment: "production" | "staging" | "development";
  monthlyCost: number;
  previousMonthlyCost: number;
  utilizationRate: number;
  requestsPerThousand?: number;
}

export interface CostRecord {
  id: string;
  accountId: string;
  serviceId: string;
  month: string;
  monthlyCost: number;
  previousMonthlyCost: number;
  budget: number;
  environment: "production" | "staging" | "development";
  businessUnit: string;
  utilizationRate: number;
  costPerCustomer: number;
  costPerDeployment: number;
  costPerThousandRequests: number;
  tagged: boolean;
}

export interface Budget {
  id: string;
  accountId: string;
  month: string;
  amount: number;
  forecast: number;
  owner: string;
}

export interface Anomaly {
  id: string;
  costRecordId: string;
  type: string;
  severity: RecommendationPriority;
  summary: string;
}

export interface OptimizationRecommendation {
  id: string;
  serviceId: string;
  title: string;
  priority: RecommendationPriority;
  estimatedMonthlySavings: number;
  recommendedAction: string;
}

export interface CostAnalysisInput {
  accountName: string;
  service: string;
  monthlyCost: number;
  previousMonthlyCost: number;
  budget: number;
  environment: "production" | "staging" | "development";
  utilizationRate: number;
  costPerCustomer: number;
  costPerDeployment: number;
  costPerThousandRequests?: number;
  tagged?: boolean;
}

export interface AnalysisResponse {
  status: ReviewStatus;
  score: number;
  issues: string[];
  passedChecks: string[];
  recommendedNextAction: string;
}

export interface RecommendationResponse {
  priority: RecommendationPriority;
  estimatedMonthlySavings: number;
  rationale: string[];
  recommendedNextAction: string;
}
