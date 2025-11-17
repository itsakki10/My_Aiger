// backend/controllers/aiController.js

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const TASK_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A concise, actionable title for the task.",
    },
    description: {
      type: "string",
      description: "Detailed steps or context for the task.",
    },
    priority: {
      type: "string",
      enum: ["Low", "Medium", "High"],
      description: "The urgency level of the task.",
    },
    dueDate: {
      type: "string",
      format: "date",
      description:
        "The target completion date in 'YYYY-MM-DD' format (e.g., 2025-12-31).",
    },
  },
  required: ["title", "priority"],
};

export const parseTaskFromNaturalLanguage = async (req, res) => {
  const { naturalLanguageInput, currentDate } = req.body;

  if (!naturalLanguageInput) {
    return res
      .status(400)
      .json({ error: "Natural language input is required." });
  }

  try {
    const prompt = `The current date is ${currentDate}. Analyze the following user request and extract the task details. Return the output as a JSON object that strictly adheres to the provided schema. If a due date is implied (e.g., "by tomorrow" or "next week"), calculate the specific date in 'YYYY-MM-DD' format based on today's date (${currentDate}) and include it. If a value is not explicitly mentioned (like description), omit it. User request: "${naturalLanguageInput}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: TASK_SCHEMA,
      },
    });

    const parsedData = JSON.parse(response.text);

    res.status(200).json(parsedData);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    res.status(500).json({ error: "Failed to parse task using AI." });
  }
};

export const generateDescriptionFromTitle = async (req, res) => {
  // Frontend sends the 'title' field in the body
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({
      success: false,
      error: "Task title is required for description generation.",
    });
  }

  try {
    const prompt = `Generate a detailed and professional task description based ONLY on the following task title. The description should include potential subtasks, context, and expected deliverables. Return the output as a JSON object with a single key named 'description'. Title: "${title}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "The detailed task description.",
            },
          },
          required: ["description"],
        },
      },
    });

    const parsedData = JSON.parse(response.text); // Frontend (AddTask.jsx) expects { success: true, parsed: { description: "..." } }

    res.status(200).json({ success: true, parsed: parsedData });
  } catch (error) {
    console.error("AI Description Error:", error); // Send an error response that the frontend can handle
    res.status(500).json({
      success: false,
      message: "AI service failed to generate description.",
    });
  }
};
