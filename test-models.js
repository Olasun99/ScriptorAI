import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const models = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-pro-latest"
];

async function test() {
  for (const m of models) {
    try {
      console.log("Testing " + m);
      const response = await aiClient.models.generateContent({
        model: m,
        contents: "Hi"
      });
      console.log("SUCCESS: " + m);
      return;
    } catch(e) {
      console.log("FAIL: " + m + " - " + e.message);
    }
  }
}
test();
