import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Fitness Coach Chat Endpoint
  app.post("/api/gemini/coach", async (req, res) => {
    try {
      const { message, context, userContext, chatHistory, conversationHistory, language } = req.body;
      const effectiveContext = userContext || context || {};
      const rawHistory = conversationHistory || chatHistory || [];
      const userLang = language === "hi" ? "Hindi" : "English";
      const ai = getGeminiClient();

      if (!ai) {
        const fallbackReply = userLang === "Hindi"
          ? `नमस्ते! मैं आपका **GymGPT** फिटनेस कोच हूँ।\n\n- **पोषण**: शाकाहारी आहार में पनीर, अंकुरित मूंग, भुना चना, सत्तू, सोया चंक्स, दही और दालों को प्राथमिकता दें ताकि दैनिक प्रोटीन लक्ष्य (1.6g-2g प्रति किग्रा) पूरा हो सके।\n- **प्रोग्रेसिव ओवरलोड**: कम्पाउंड मूवमेंट्स (बेंच प्रेस, स्क्वैट, डेडलिफ्ट) में हर हफ्ते वजन या रेप्स बढ़ाते रहें।\n- **विश्राम**: मांसपेशियों की रिकवरी के लिए 7-8 घंटे की गहरी नींद लें।`
          : `Hello! I am your **GymGPT** AI Coach.\n\n- **Progressive Overload**: Focus on continuous micro-progression in compound movements (Bench Press, Squats, Deadlifts, Overhead Press). Maintain 2-3 minutes of rest between heavy compound sets.\n- **Indian Vegetarian Nutrition**: Target 1.6-2.0g protein per kg bodyweight. Key staple sources include low-fat paneer, Greek/hung curd, sattu, roasted chana, sprouted moong, soy chunks, and whey/pea protein isolate.\n- **Recovery & Hydration**: Drink at least 3-4 liters of water and secure 7-8 hours of sleep for optimum myofibrillar protein synthesis.`;

        return res.status(200).json({
          reply: fallbackReply,
          isFallback: true,
        });
      }

      const systemInstruction = `You are "GymGPT", the world's most capable, motivational, and scientifically grounded AI fitness and nutrition coach.
You specialize in strength training, progressive overload mechanics, biomechanics, 6-day splits (PPL x 2, Arnold Split), and Indian vegetarian diets (Rajasthani specialties like Bajra roti, Missi roti, Dal Baati, Gatte, Panchmel Dal, Chaas, Curd, Sattu, Paneer, Sprouted Moong, Soya).

Primary Language for Response: ${userLang}.
If ${userLang} is Hindi, respond in clear, natural, motivational Hindi (with standard fitness terms in English/Hindi for clarity).
If ${userLang} is English, respond in crisp, structured, engaging English.

Guidelines:
1. Provide actionable, concise advice formatted with clean Markdown (bold keywords, bullet points).
2. For workouts: Emphasize warm-up, set/rep ranges, RPE/RIR (Reps in Reserve), and progressive overload strategies.
3. For nutrition: Calculate or reference macro targets, complete amino acid pairing, and realistic Indian kitchen food items.
4. Keep tone athletic, inspiring, and scientifically accurate.
5. Remind users briefly when appropriate that fitness guidance is educational.

User Context:
${JSON.stringify(effectiveContext, null, 2)}
`;

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(rawHistory)) {
        for (const turn of rawHistory.slice(-8)) {
          const role = turn.role === "assistant" || turn.sender === "assistant" ? "model" : "user";
          const text = turn.content || turn.text || "";
          if (text) {
            contents.push({
              role,
              parts: [{ text }],
            });
          }
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: message || "Give me a high-protein vegetarian meal and training recommendation for today." }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.65,
        },
      });

      return res.json({
        reply: response.text || "GymGPT ready. How can I help you reach your peak fitness today?",
        isFallback: false,
      });
    } catch (error: any) {
      console.error("GymGPT Coach Error:", error);
      return res.status(200).json({
        reply: "GymGPT is momentarily running in offline mode. Prioritize hitting your daily protein target (paneer, curd, roasted chana, pulses) and tracking progressive overload on your working sets!",
        isFallback: true,
      });
    }
  });

  // Natural Language Food Parser
  app.post("/api/gemini/parse-food", async (req, res) => {
    const { text, mealType } = req.body || {};
    try {
      const ai = getGeminiClient();

      if (!ai) {
        // Deterministic fallback for common Indian foods
        return res.status(200).json({
          items: [
            {
              name: "Bajra Roti (2 pcs)",
              quantity: 2,
              unit: "roti",
              calories: 220,
              protein: 6.2,
              carbs: 42,
              fat: 3.4,
              fiber: 6.0,
            },
            {
              name: "Moong Dal (1 bowl)",
              quantity: 1,
              unit: "bowl",
              calories: 180,
              protein: 12.0,
              carbs: 26,
              fat: 3.0,
              fiber: 7.5,
            },
            {
              name: "Fresh Curd / Dahi (150g)",
              quantity: 150,
              unit: "grams",
              calories: 98,
              protein: 5.5,
              carbs: 7.0,
              fat: 4.8,
              fiber: 0,
            },
          ],
          mealType: mealType || "lunch",
          totalCalories: 498,
          totalProtein: 23.7,
          isFallback: true,
        });
      }

      const prompt = `Parse the following natural language food description into a structured JSON list of food items with nutritional estimates for Indian vegetarian foods.
User input: "${text}"
Target Meal: ${mealType || "unspecified"}

Return JSON format strictly:
{
  "items": [
    {
      "name": "string (e.g. Bajra Roti, Moong Dal Tadka, Paneer Bhurji)",
      "quantity": number,
      "unit": "string (e.g. roti, bowl, grams, ml, piece)",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number
    }
  ],
  "mealType": "breakfast" | "lunch" | "dinner" | "snacks" | "pre-workout" | "post-workout",
  "summary": "short explanation"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (error: any) {
      console.error("Parse Food Error:", error);
      return res.status(200).json({
        items: [
          {
            name: "Custom Indian Vegetarian Meal",
            quantity: 1,
            unit: "serving",
            calories: 350,
            protein: 15,
            carbs: 45,
            fat: 8,
            fiber: 5,
          },
        ],
        mealType: mealType || "lunch",
        isFallback: true,
      });
    }
  });

  // Smart Workout Split Generator
  app.post("/api/gemini/generate-split", async (req, res) => {
    try {
      const { goal, experience, daysPerWeek, durationMin, equipment, limitations, priorityMuscles } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          name: `${daysPerWeek || 4}-Day Optimal Hypertrophy Split`,
          rationale: "Optimized for progressive overload, balanced recovery, and muscle hypertrophy without overtaxing joints.",
          days: [
            {
              dayName: "Day 1 - Chest & Triceps (Push)",
              targetMuscles: ["Chest", "Triceps", "Front delts"],
              exercises: [
                { name: "Barbell Bench Press", sets: 4, reps: "8-10", restSec: 120 },
                { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", restSec: 90 },
                { name: "Dumbbell Fly / Cable Fly", sets: 3, reps: "12-15", restSec: 60 },
                { name: "Triceps Pushdown", sets: 4, reps: "12-15", restSec: 60 },
                { name: "Overhead Dumbbell Extension", sets: 3, reps: "10-12", restSec: 60 },
              ],
            },
            {
              dayName: "Day 2 - Back & Biceps (Pull)",
              targetMuscles: ["Lats", "Upper back", "Biceps", "Rear delts"],
              exercises: [
                { name: "Lat Pulldown / Pull-up", sets: 4, reps: "8-10", restSec: 90 },
                { name: "Barbell Row", sets: 4, reps: "8-10", restSec: 90 },
                { name: "Face Pull", sets: 3, reps: "15", restSec: 60 },
                { name: "Barbell Bicep Curl", sets: 4, reps: "10-12", restSec: 60 },
                { name: "Hammer Curl", sets: 3, reps: "12", restSec: 60 },
              ],
            },
            {
              dayName: "Day 3 - Rest / Active Recovery",
              targetMuscles: ["Mobility", "Light cardio"],
              exercises: [],
            },
            {
              dayName: "Day 4 - Legs & Core",
              targetMuscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"],
              exercises: [
                { name: "Barbell Squat", sets: 4, reps: "8-10", restSec: 120 },
                { name: "Romanian Deadlift", sets: 3, reps: "10-12", restSec: 90 },
                { name: "Leg Press", sets: 3, reps: "12-15", restSec: 90 },
                { name: "Standing Calf Raise", sets: 4, reps: "15", restSec: 60 },
                { name: "Hanging Leg Raise", sets: 3, reps: "15", restSec: 45 },
              ],
            },
            {
              dayName: "Day 5 - Shoulders & Arms",
              targetMuscles: ["Side delts", "Rear delts", "Biceps", "Triceps"],
              exercises: [
                { name: "Overhead Dumbbell Press", sets: 4, reps: "8-10", restSec: 90 },
                { name: "Lateral Raise", sets: 4, reps: "12-15", restSec: 60 },
                { name: "Incline Dumbbell Curl", sets: 3, reps: "10-12", restSec: 60 },
                { name: "Close Grip Bench Press / Dips", sets: 3, reps: "10-12", restSec: 90 },
              ],
            },
          ],
          isFallback: true,
        });
      }

      const prompt = `Generate a customized workout split plan based on:
Goal: ${goal || "Hypertrophy / Muscle Building"}
Experience Level: ${experience || "Intermediate"}
Days Available: ${daysPerWeek || 4} days
Workout Duration: ${durationMin || 60} minutes
Equipment: ${equipment || "Gym (Full equipment)"}
Limitations / Injuries: ${limitations || "None"}
Priority Muscles: ${priorityMuscles || "Balanced"}

Return strict JSON format:
{
  "name": "string",
  "rationale": "detailed explanation of why this split suits the user",
  "days": [
    {
      "dayName": "string (e.g. Day 1: Chest & Triceps)",
      "targetMuscles": ["string"],
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string (e.g. 8-10)",
          "restSec": number
        }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (error: any) {
      console.error("Generate Split Error:", error);
      return res.status(500).json({ error: "Failed to generate split" });
    }
  });

  // Post-Workout AI Analysis
  app.post("/api/gemini/workout-analysis", async (req, res) => {
    try {
      const { workoutSession, previousVolume } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          analysis: `Outstanding effort! You completed ${workoutSession?.exercises?.length || 5} exercises with high intensity. Make sure to hydrate with at least 500ml of water and consume a high-protein vegetarian meal (like paneer bhurji, soya chunks, or whey with milk) within 1-2 hours for optimal muscle protein synthesis.`,
          isFallback: true,
        });
      }

      const prompt = `Analyze this completed workout session and provide motivating, scientifically grounded feedback for an Indian vegetarian lifter.
Workout details:
${JSON.stringify(workoutSession, null, 2)}
Previous volume for comparison: ${previousVolume || "N/A"}

Provide:
1. Short congratulatory summary of effort
2. Progressive overload assessment (volume and intensity notes)
3. Muscle recovery advice & vegetarian post-workout meal suggestion (referencing Indian/Rajasthani foods like paneer, dal, sattu, curd, bajra roti, whey).
Keep it under 150 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      return res.json({
        analysis: response.text || "Great session completed! Focus on protein intake and rest.",
        isFallback: false,
      });
    } catch (error: any) {
      console.error("Workout Analysis Error:", error);
      return res.status(200).json({
        analysis: "Workout logged successfully! Your volume was high and form consistency will compound over time. Refuel with protein and electrolytes.",
        isFallback: true,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
