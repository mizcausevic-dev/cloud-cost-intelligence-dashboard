import { Router } from "express";
import { budgets } from "../data.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json(budgets);
});

export default router;
