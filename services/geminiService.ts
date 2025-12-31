
import { GoogleGenAI, Type } from "@google/genai";

export async function fetchDailySpiritualMessage() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a short, beautiful spiritual message or quote about Radha Rani and the power of chanting 'Radha' in both Hindi and English. Keep it brief and inspiring.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hindi: { type: Type.STRING },
            english: { type: Type.STRING },
            author: { type: Type.STRING }
          },
          required: ["hindi", "english", "author"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching spiritual message:", error);
    return {
      hindi: "राधा नाम की महिमा अपरंपार है।",
      english: "The glory of Radha's name is boundless.",
      author: "Traditional"
    };
  }
}
