import { Router } from "express";
import { accounts } from "../data.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json(accounts);
});

export default router;
