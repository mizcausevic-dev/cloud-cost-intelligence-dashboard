import { Router } from "express";
import { z } from "zod";
import {
  analyzeAnomaly,
  analyzeCosts,
  analyzeRecommendation,
} from "../services/analysisService.js";

const router = Router();

const analysisSchema = z.object({
  accountName: z.string().min(2),
  service: z.string().min(2),
  monthlyCost: z.number().nonnegative(),
  previousMonthlyCost: z.number().nonnegative(),
  budget: z.number().positive(),
  environment: z.enum(["production", "staging", "development"]),
  utilizationRate: z.number().min(0).max(1),
  costPerCustomer: z.number().nonnegative(),
  costPerDeployment: z.number().nonnegative(),
  costPerThousandRequests: z.number().nonnegative().optional(),
  tagged: z.boolean().optional(),
});

router.post("/analyze/costs", (request, response) => {
  const input = analysisSchema.parse(request.body);
  response.json(analyzeCosts(input));
});

router.post("/analyze/anomaly", (request, response) => {
  const input = analysisSchema.parse(request.body);
  response.json(analyzeAnomaly(input));
});

router.post("/analyze/recommendation", (request, response) => {
  const input = analysisSchema.parse(request.body);
  response.json(analyzeRecommendation(input));
});

export default router;
