import { Router } from "express";
import { costRecords } from "../data.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json(costRecords);
});

export default router;
