import { Router } from "express";
import { getChaosWeather } from "../services/weather.js";

export const weatherRouter = Router();

weatherRouter.get("/chaos", async (req, res) => {
  try {
    const latitude = req.query.lat ? Number(req.query.lat) : undefined;
    const longitude = req.query.lon ? Number(req.query.lon) : undefined;

    const data = await getChaosWeather({ latitude, longitude });
    res.json(data);
  } catch (error) {
    console.error("Error getting chaos weather:", error);
    res.status(500).json({
      error: "Kunne ikke hente værdata 😅",
      code: "WEATHER_ERROR",
    });
  }
});
