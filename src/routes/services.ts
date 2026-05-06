import { Router } from "express";
import { services } from "../data.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json(services);
});

export default router;
