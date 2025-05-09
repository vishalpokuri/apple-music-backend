import express from "express";
import { songRequest } from "../controllers/songRequester.js";
import { spotify2ytm } from "../controllers/spotify2ytm.js";
import { lyricsRequester } from "../controllers/lyricsRequester.js";
const router = express.Router();
router.get("/request", songRequest);
router.get("/convert", spotify2ytm);
router.get("/lyrics", lyricsRequester);
export default router;
