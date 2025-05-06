import express from "express";
import { songRequest } from "../controllers/songRequester.js";
import { spotify2ytm } from "../controllers/spotify2ytm.js";
const router = express.Router();
router.get("/request", songRequest);
router.get("/convert", spotify2ytm);
export default router;
