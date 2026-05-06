import { Router } from "express";
import { getRecommendations } from "../services/analysisService.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json(getRecommendations());
});

export default router;
