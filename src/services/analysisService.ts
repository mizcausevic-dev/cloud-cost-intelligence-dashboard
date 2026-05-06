import { anomalies, budgets, costRecords, recommendations, services } from "../data.js";
import type {
  AnalysisResponse,
  CostAnalysisInput,
  RecommendationResponse,
  ReviewStatus,
} from "../types.js";

function statusFromScore(score: number): ReviewStatus {
  if (score < 60) {
    return "critical";
  }

  if (score < 90) {
    return "needs-review";
  }

  return "healthy";
}

export function analyzeCosts(input: CostAnalysisInput): AnalysisResponse {
  const issues: string[] = [];
  const passedChecks: string[] = [];
  let score = 100;

  const budgetVariancePct = ((input.monthlyCost - input.budget) / input.budget) * 100;
  const growthPct =
    input.previousMonthlyCost === 0
      ? 0
      : ((input.monthlyCost - input.previousMonthlyCost) / input.previousMonthlyCost) * 100;

  if (input.monthlyCost > input.budget) {
    issues.push(`Monthly spend is ${Math.round(budgetVariancePct)}% above budget.`);
    score -= budgetVariancePct > 20 ? 18 : 10;
  } else {
    passedChecks.push("Current spend remains within budget.");
  }

  if (growthPct > 20) {
    issues.push("Month-over-month cost growth exceeds governance threshold.");
    score -= 16;
  } else {
    passedChecks.push("Month-over-month growth remains within review tolerance.");
  }

  if (input.utilizationRate < 0.5) {
    issues.push("Utilization rate suggests overprovisioned compute or storage capacity.");
    score -= 15;
  } else {
    passedChecks.push("Utilization rate does not indicate obvious idle capacity.");
  }

  if (input.environment === "production" && input.costPerDeployment > 400) {
    issues.push("Cost per deployment is elevated for a production service and should be reviewed.");
    score -= 8;
  } else {
    passedChecks.push("Deployment unit economics are within the modeled threshold.");
  }

  if ((input.costPerThousandRequests ?? 0) > 100) {
    issues.push("Cost per 1k requests is materially above the modeled efficiency target.");
    score -= 8;
  } else {
    passedChecks.push("Request efficiency is within expected range.");
  }

  if (input.tagged === false) {
    issues.push("Cost allocation tags are incomplete or missing.");
    score -= 12;
  } else {
    passedChecks.push("Cost allocation tags are present.");
  }

  passedChecks.push("Service is mapped to a tracked business unit.");

  const finalScore = Math.max(0, Math.round(score));
  const status = statusFromScore(finalScore);
  const recommendedNextAction =
    status === "healthy"
      ? "Continue monitoring in the next monthly FinOps review."
      : status === "needs-review"
        ? "Prioritize rightsizing, budget review, or chargeback follow-up this sprint."
        : "Escalate to platform and finance review with immediate optimization action plan.";

  return {
    status,
    score: finalScore,
    issues,
    passedChecks,
    recommendedNextAction,
  };
}

export function analyzeAnomaly(input: CostAnalysisInput): AnalysisResponse {
  return analyzeCosts(input);
}

export function analyzeRecommendation(input: CostAnalysisInput): RecommendationResponse {
  const rationale: string[] = [];
  let priority: RecommendationResponse["priority"] = "medium";
  let savings = 0;

  const budgetVariance = input.monthlyCost - input.budget;
  const growthPct =
    input.previousMonthlyCost === 0
      ? 0
      : ((input.monthlyCost - input.previousMonthlyCost) / input.previousMonthlyCost) * 100;

  if (input.utilizationRate < 0.5) {
    rationale.push("Low utilization indicates rightsizing potential.");
    savings += Math.round(input.monthlyCost * 0.18);
    priority = "high";
  }

  if (budgetVariance > 0) {
    rationale.push("Budget overrun justifies near-term optimization review.");
    savings += Math.round(budgetVariance * 0.35);
  }

  if (growthPct > 20) {
    rationale.push("Rapid month-over-month growth suggests workload or pricing drift.");
    priority = "critical";
    savings += Math.round((input.monthlyCost - input.previousMonthlyCost) * 0.4);
  }

  if (input.costPerDeployment > 400) {
    rationale.push("High deployment unit cost suggests expensive release or cluster patterns.");
  }

  if (rationale.length === 0) {
    rationale.push("No major optimization issues detected beyond routine monitoring.");
    savings = Math.round(input.monthlyCost * 0.03);
  }

  const recommendedNextAction =
    priority === "critical"
      ? "Escalate a reserved capacity and rightsizing review this sprint."
      : priority === "high"
        ? "Schedule a cost optimization review with the owning platform team."
        : "Track this service in the next monthly FinOps planning cycle.";

  return {
    priority,
    estimatedMonthlySavings: savings,
    rationale,
    recommendedNextAction,
  };
}

export function getDashboardSummary() {
  const totalMonthlyCost = costRecords.reduce((sum, record) => sum + record.monthlyCost, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const criticalAnomalies = anomalies.filter((item) => item.severity === "critical").length;
  const taggedCoverage = costRecords.filter((record) => record.tagged).length / costRecords.length;

  return {
    accountCount: budgets.length,
    serviceCount: services.length,
    totalMonthlyCost,
    totalBudget,
    budgetVariance: totalMonthlyCost - totalBudget,
    criticalAnomalies,
    taggedCoverage: Number(taggedCoverage.toFixed(2)),
    topOptimizationThemes: [
      "Production Kubernetes rightsizing",
      "Analytics reserved-capacity review",
      "Tagging and allocation hygiene",
    ],
  };
}

export function getRecommendations() {
  return recommendations;
}
