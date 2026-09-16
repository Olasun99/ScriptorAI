import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
async function test() {
  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-pro",
      contents: "Testing",
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}
test();
