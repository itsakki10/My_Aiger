import express from "express";
// Ensure both functions are imported
import {
  parseTaskFromNaturalLanguage,
  generateDescriptionFromTitle,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/parse-task", parseTaskFromNaturalLanguage);

// ✅ Add the new route here
router.post("/generate-description", generateDescriptionFromTitle);

export default router;
