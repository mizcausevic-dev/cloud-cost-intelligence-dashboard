import { Router } from "express";
import { anomalies } from "../data.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json(anomalies);
});

export default router;
