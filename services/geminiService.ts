import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { Course } from "../types";

const apiKey = process.env.API_KEY;

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const generateCurriculum = async (topic: string): Promise<Course[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const prompt = `
    Create a detailed curriculum pathway for the topic: "${topic}".
    Generate approximately 10 to 15 courses.
    Use standard course codes (e.g., CS101, ART200).
    Ensure there is a logical progression with prerequisites (some courses must be prerequisites for others to create a tree structure).
    Return a raw JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Course Code, e.g. CS101" },
              title: { type: Type.STRING, description: "Course Title" },
              prerequisites: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of prerequisite course IDs"
              },
              category: { type: Type.STRING, description: "General category, e.g. 'Core', 'Advanced'" },
              description: { type: Type.STRING, description: "Short description of the course" }
            },
            required: ["id", "title", "prerequisites"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as Course[];
  } catch (error) {
    console.error("Failed to generate curriculum:", error);
    throw error;
  }
};
