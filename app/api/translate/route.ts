import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a Linux Command Line expert. 
              
              Task: Translate the user's request into a valid bash command.
              
              Rules:
              1. Output ONLY the code. Do not use Markdown (no \`\`\`).
              2. Do not explain the code.
              3. If the request is destructive (like "format pc"), return a command that prints a warning, like: echo "That is dangerous!"
              
              User Request: "${prompt}"`,
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 500, // Increased from 100 to 500 to prevent cut-offs
        temperature: 0.1, // Keep it precise
      },
    });

    const command = response.text?.trim() || "# Error: No command generated";

    return NextResponse.json({ command });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate command" },
      { status: 500 }
    );
  }
}
