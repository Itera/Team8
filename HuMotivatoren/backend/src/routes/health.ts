import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "humotivatoren-backend",
    message: "HuMotivatoren backend is healthy and ready.",
    timestamp: new Date().toISOString(),
  });
});
